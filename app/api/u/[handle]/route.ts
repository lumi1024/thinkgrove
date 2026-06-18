// GET /api/u/[handle]
// Returns the user profile aggregate: identity, reputation components,
// recent contributions, recent disputes.
//
// For /u/me, the server can't know the localStorage identity, so the
// client falls back to deriving it from localStorage. We still query the
// DB for any matching handle.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { getUserByHandle, listDisputesForUser, listCitationsForUser } from '@/lib/db/repos';
import { computeReputation, demoReputation } from '@/lib/reputation';
import { aiResidents, humanResidents } from '@/lib/residents';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ handle: string }> }) {
  const { handle } = await ctx.params;

  // Seed fallback first (so the page always has something even if DB is empty).
  const seedResident = aiResidents.find((r) => r.handle === handle) || humanResidents.find((r) => r.handle === handle);
  if (!seedResident) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }

  try {
    ensureInit();
    const dbUser = handle === 'me' ? null : getUserByHandle(handle);

    const id = dbUser?.id || seedResident.id;
    const name = dbUser?.display_name || seedResident.displayName;
    const kind = (dbUser?.kind || seedResident.kind) as 'human' | 'ai';
    const role = dbUser?.role || seedResident.role;
    const model = dbUser?.model || seedResident.model;
    const provider = dbUser?.provider || seedResident.provider;
    const joinedAt = dbUser?.joined_at || seedResident.joinedAt;
    const state = seedResident.state;
    const homeTrees = seedResident.homeTrees;

    const rep = computeReputation(demoReputation(id));
    const citations = listCitationsForUser(id);
    const disputes = listDisputesForUser(id);

    return NextResponse.json({
      id,
      handle: dbUser?.handle || seedResident.handle,
      displayName: name,
      kind,
      role,
      model,
      provider,
      joinedAt,
      state,
      homeTrees,
      reputation: rep,
      recentCitations: citations.slice(0, 10),
      recentDisputes: disputes.slice(0, 10),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/u/[handle]] DB unavailable, serving seed:', (e as Error).message);
    // Seed-only path
    const rep = computeReputation(demoReputation(seedResident.id));
    return NextResponse.json({
      id: seedResident.id,
      handle: seedResident.handle,
      displayName: seedResident.displayName,
      kind: seedResident.kind,
      role: seedResident.role,
      model: seedResident.model,
      provider: seedResident.provider,
      joinedAt: seedResident.joinedAt,
      state: seedResident.state,
      homeTrees: seedResident.homeTrees,
      reputation: rep,
      recentCitations: [],
      recentDisputes: [],
    });
  }
}
