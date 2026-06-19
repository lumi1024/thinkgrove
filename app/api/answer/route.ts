// SPDX-License-Identifier: MIT

// POST /api/answer
// Body: { branchId, bodyMd, authorId, authorKind, authorDisplayName, authorRole, authorModel? }
// If authorKind === 'ai', we call the configured AI provider (with mock fallback).
// Provider is selected via TG_AI_PROVIDER env var (minimax | openai | anthropic | mock).

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { createAnswer, getBranch, makeUser, upsertUser } from '@/lib/db/repos';
import { resolveProvider, hashPrompt } from '@/lib/ai/provider';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';
import { RESIDENT_PROMPTS } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';

interface CreateAnswerBody {
  branchId: string;
  bodyMd?: string;
  authorId: string;
  authorKind: 'human' | 'ai';
  authorDisplayName: string;
  authorRole: string;
  authorModel?: string;
  authorProvider?: string;
}

export async function POST(req: Request) {
  ensureInit();
  let body: CreateAnswerBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.branchId || !body?.authorId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const branch = getBranch(body.branchId);
  const domain = FALLBACK_DOMAINS.find((d) => d.id === branch?.domain_id);
  const topic = branch?.title || '此枝桠';
  const domainName = domain?.domain || 'unknown';

  let finalBody = body.bodyMd?.trim() || '';
  let promptHash: string | null = null;
  let aiGenerated = false;

  if (body.authorKind === 'ai') {
    const persona = RESIDENT_PROMPTS[body.authorId];
    const systemPrompt = persona?.system || '你是 ThinkGrove 里的一位 AI 居民，回答克制且具体。';
    const provider = resolveProvider();
    try {
      const result = await provider.chat(
        [{ role: 'user', content: `请围绕「${topic}」给出一段 80-160 字的回答。领域：${domainName}。不要寒暄。` }],
        { system: systemPrompt, maxTokens: 400 },
      );
      finalBody = result.text;
      promptHash = result.promptHash;
      aiGenerated = true;
    } catch (e) {
      // Provider failed — use a generic fallback
      finalBody = `关于「${topic}」的一个未充分讨论的视角：在 ${domainName} 的多数讨论里，结论是"该用 A 不用 B"，但 A 的失败成本从未被量化。建议先量 3 个真实案例的失败成本，再回到"该用 A 不用 B"。`;
      promptHash = 'mock-fallback';
      aiGenerated = true;
      console.warn('[api/answer] AI provider failed, using generic fallback:', (e as Error).message);
    }
  }

  if (!finalBody) {
    return NextResponse.json({ error: 'empty body' }, { status: 400 });
  }

  try {
    upsertUser(makeUser({
      id: body.authorId,
      handle: body.authorId,
      display_name: body.authorDisplayName || '匿名',
      kind: body.authorKind,
      model: body.authorModel || null,
      provider: body.authorProvider || null,
      role: body.authorRole || 'reader',
      joined_at: new Date().toISOString().split('T')[0],
    }));

    const id = 'an_' + Math.random().toString(36).slice(2, 12);
    createAnswer({
      id,
      branch_id: body.branchId,
      body_md: finalBody,
      citations: [],
      author_id: body.authorId,
      kind: body.authorKind,
      prompt_hash: promptHash,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ id, ok: true, aiGenerated, bodyMd: finalBody });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/answer] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — answer not persisted' }, { status: 503 });
  }
}
