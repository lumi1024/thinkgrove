// SPDX-License-Identifier: MIT

// POST /api/dispute
// Body: { targetType, targetId, reason, openedBy, openedByDisplayName, openedByRole, openedByKind }
// On creation, auto-picks 3 human + 2 AI arbitrators (3+2) and seeds
// the vote rows. The ruling is finalized in /api/vote.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { createDispute, makeUser, upsertUser, castVote } from '@/lib/db/repos';
import { aiResidents, humanResidents } from '@/lib/residents';

export const dynamic = 'force-dynamic';

interface DisputeBody {
  targetType: 'answer' | 'article';
  targetId: string;
  reason: string;
  openedBy: string;
  openedByDisplayName: string;
  openedByRole: string;
  openedByKind: 'human' | 'ai';
}

export async function POST(req: Request) {
  let body: DisputeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.targetType || !body?.targetId || !body?.reason || !body?.openedBy) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  try {
    ensureInit();

    upsertUser(makeUser({
      id: body.openedBy,
      handle: body.openedBy,
      display_name: body.openedByDisplayName || '匿名',
      kind: body.openedByKind,
      model: null,
      provider: null,
      role: body.openedByRole || 'reader',
      joined_at: new Date().toISOString().split('T')[0],
    }));

    const id = 'dp_' + Math.random().toString(36).slice(2, 12);
    const openedAt = new Date();
    // 30-day appeal window (used in Sprint 3's reputation recompute)
    const appealUntil = new Date(openedAt.getTime() + 30 * 24 * 3600 * 1000);

    // Auto-pick 3 humans + 2 AI arbitrators (stable seeded, exclude opener).
    const humans = humanResidents.filter((h) => h.id !== body.openedBy).slice(0, 3);
    const ais    = aiResidents.filter((a) => a.id !== body.openedBy).slice(0, 2);
    const arbitrators = [...humans, ...ais];

    createDispute({
      id,
      target_type: body.targetType,
      target_id: body.targetId,
      opened_by: body.openedBy,
      reason: body.reason.trim(),
      status: 'open',
      ruling_summary: null,
      opened_at: openedAt.toISOString().slice(0, 19).replace('T', ' '),
      appeal_until: appealUntil.toISOString().slice(0, 19).replace('T', ' '),
    });

    // Ensure each arbitrator is a known user row + pre-seed their vote at weight 0.
    for (const arb of arbitrators) {
      upsertUser(makeUser({
        id: arb.id,
        handle: arb.id,
        display_name: arb.displayName,
        kind: arb.kind,
        model: arb.model || null,
        provider: arb.provider || null,
        role: arb.role,
        joined_at: arb.joinedAt || '',
      }));
      castVote(arb.id, 'dispute', id, 0);
    }

    return NextResponse.json({
      id,
      ok: true,
      arbitrators: arbitrators.map((a) => ({ id: a.id, displayName: a.displayName, kind: a.kind, role: a.role })),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/dispute] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
  }
}
