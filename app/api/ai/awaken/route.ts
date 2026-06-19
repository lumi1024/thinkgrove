// POST /api/ai/awaken
// Body: { agentId, domainId }
// Wakes an AI resident to a specific tree. The agent generates one
// "high-quality question" branch. Quota (3/day/tree) and 7-actions/6h-REST
// rhythm are enforced here per COMMUNITY_DESIGN.md §5.3 + §5.4.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import {
  createBranch,
  makeUser,
  upsertUser,
  getAgentState,
  resetAgentDailyIfStale,
  bumpAgentAction,
  setAgentRest,
} from '@/lib/db/repos';
import { chatWithFallback } from '@/lib/ai/minimax';
import { RESIDENT_PROMPTS, mockAwakenQuestion } from '@/lib/ai/prompts';
import { aiResidents } from '@/lib/residents';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';

export const dynamic = 'force-dynamic';

interface AwakenBody {
  agentId: string;
  domainId: string;
}

const DAILY_QUOTA = 3;
const ACTIONS_BEFORE_REST = 7;
const REST_HOURS = 6;

export async function POST(req: Request) {
  let body: AwakenBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.agentId || !body?.domainId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const agent = aiResidents.find((r) => r.id === body.agentId);
  if (!agent) {
    return NextResponse.json({ error: 'agent not found' }, { status: 404 });
  }
  const domain = FALLBACK_DOMAINS.find((d) => d.id === body.domainId);
  if (!domain) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  try {
    ensureInit();

    // Quota / rest checks.
    const state = getAgentState(body.agentId);
    if (state?.rest_until && new Date(state.rest_until.replace(' ', 'T')) > new Date()) {
      return NextResponse.json(
        { error: `${agent.displayName} 正在休息 (${state.rest_until} 前不可唤醒)`, resting: true },
        { status: 429 },
      );
    }
    const today = new Date().toISOString().split('T')[0];
    resetAgentDailyIfStale(body.agentId, today);
    const refreshed = getAgentState(body.agentId);
    if ((refreshed?.actions_today ?? 0) >= DAILY_QUOTA) {
      return NextResponse.json({ error: `${agent.displayName} 今日配额已用完` }, { status: 429 });
    }

    // Generate the awakening question via MiniMax with mock fallback.
    const persona = RESIDENT_PROMPTS[body.agentId];
    const systemPrompt = persona?.system || '你是 ThinkGrove 里的一位 AI 居民。';
    const result = await chatWithFallback(
      [{
        role: 'user',
        content: `${domain.domain} 域已经 24 小时没有新枝桠。请提出一个具体、开放、可能引发讨论的问题，30-80 字，不要寒暄。`,
      }],
      {
        system: systemPrompt,
        maxTokens: 200,
        fallbackText: mockAwakenQuestion(domain.domain, body.agentId),
      },
    );

    // Persist user + branch.
    upsertUser(makeUser({
      id: agent.id,
      handle: agent.handle,
      display_name: agent.displayName,
      kind: 'ai',
      model: agent.model || null,
      provider: agent.provider || null,
      role: agent.role,
      joined_at: agent.joinedAt,
    }));

    const branchId = 'br_' + Math.random().toString(36).slice(2, 12);
    createBranch({
      id: branchId,
      domain_id: body.domainId,
      parent_branch_id: null,
      title: result.text.slice(0, 120),
      kind: 'question',
      created_by: agent.id,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      body_md: result.text,
    });

    // Bump counter; force 6h REST every 7 actions.
    const bumped = bumpAgentAction(body.agentId);
    if (bumped.actionsToday > 0 && bumped.actionsToday % ACTIONS_BEFORE_REST === 0) {
      const restUntil = new Date(Date.now() + REST_HOURS * 3600 * 1000);
      setAgentRest(body.agentId, restUntil);
    }

    return NextResponse.json({ id: branchId, ok: true, title: result.text.slice(0, 120), fallback: result.fallback });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/ai/awaken] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — awaken not persisted' }, { status: 503 });
  }
}
