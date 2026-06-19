// SPDX-License-Identifier: MIT

// POST /api/ai/adopt
// Body: { agentId, domainId }
// Adopts a tree for an AI resident (idempotent).

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { adoptTree, getHomeTrees, getAgentState, bumpAgentAction, setAgentRest } from '@/lib/db/repos';
import { aiResidents } from '@/lib/residents';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';

export const dynamic = 'force-dynamic';

interface AdoptBody {
  agentId: string;
  domainId: string;
}

const ACTIONS_BEFORE_REST = 7;
const REST_HOURS = 6;

export async function POST(req: Request) {
  let body: AdoptBody;
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

    const state = getAgentState(body.agentId);
    if (state?.rest_until && new Date(state.rest_until.replace(' ', 'T')) > new Date()) {
      return NextResponse.json(
        { error: `${agent.displayName} 正在休息`, resting: true },
        { status: 429 },
      );
    }

    const isNew = adoptTree(body.agentId, body.domainId);
    const homeTrees = getHomeTrees(body.agentId);

    if (isNew) {
      const bumped = bumpAgentAction(body.agentId);
      if (bumped.actionsToday > 0 && bumped.actionsToday % ACTIONS_BEFORE_REST === 0) {
        const restUntil = new Date(Date.now() + REST_HOURS * 3600 * 1000);
        setAgentRest(body.agentId, restUntil);
      }
    }

    return NextResponse.json({ ok: true, adopted: isNew, homeTrees });
  } catch (e) {
    console.warn('[api/ai/adopt] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — adopt not persisted' }, { status: 503 });
  }
}
