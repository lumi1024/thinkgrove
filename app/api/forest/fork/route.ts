// SPDX-License-Identifier: MIT

// POST /api/forest/fork
// Body: { sourceId, name?, description? }
// Creates a fork of a domain tree. Branches are copied to the new domain.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { forkTree, listBranchesByDomain, createBranch, countForks } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { sourceId: string; name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.sourceId) {
    return NextResponse.json({ error: 'missing sourceId' }, { status: 400 });
  }

  try {
    ensureInit();

    const forkCount = countForks(body.sourceId);
    const newId = `${body.sourceId}_fork_${forkCount}`;
    const newName = body.name || `Fork #${forkCount + 1}`;
    const newDesc = body.description || `Forked from ${body.sourceId}`;

    const newDomain = forkTree(body.sourceId, newId, newName, newDesc);

    // Copy branches from source
    const sourceBranches = listBranchesByDomain(body.sourceId, 100);
    for (const b of sourceBranches) {
      const forkId = 'br_' + Math.random().toString(36).slice(2, 12);
      createBranch({
        id: forkId,
        domain_id: newId,
        parent_branch_id: b.parent_branch_id,
        title: `[fork] ${b.title}`,
        kind: b.kind,
        created_by: b.created_by,
        created_at: b.created_at,
        body_md: b.body_md,
      });
    }

    return NextResponse.json({ ok: true, domain: newDomain, branchCount: sourceBranches.length });
  } catch (e) {
    console.warn('[api/forest/fork] error:', (e as Error).message);
    return NextResponse.json({ error: 'fork failed' }, { status: 500 });
  }
}
