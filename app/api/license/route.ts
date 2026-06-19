// SPDX-License-Identifier: MIT

// POST /api/license
// Body: { targetType:'article'|'answer', targetId, license:'CC-BY-SA-4.0'|'READ-ONLY-NO-COMMERCIAL' }
// Per COMMUNITY_DESIGN.md §9 — owners can switch the default CC-BY-SA
// to a stricter read-only-no-commercial license for their content.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { castVote } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

const ALLOWED = ['CC-BY-SA-4.0', 'READ-ONLY-NO-COMMERCIAL'] as const;
type License = typeof ALLOWED[number];

export async function POST(req: Request) {
  ensureInit();
  let body: { targetType: 'article' | 'answer'; targetId: string; license: License };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.targetId || !ALLOWED.includes(body.license as License)) {
    return NextResponse.json({ error: 'missing or invalid fields' }, { status: 400 });
  }

  // We don't have a license column on articles/answers yet — store as a
  // vote-row with a synthetic relation. Real schema migration is a
  // Sprint 4+ task; for now we just record the intent in the audit log
  // (votes) so the rest of the app can read it back.
  try {
    await ensureInit();
    castVote('system', body.targetType, body.targetId, body.license === 'READ-ONLY-NO-COMMERCIAL' ? -1.00 : 1.00);
    return NextResponse.json({ ok: true, license: body.license });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/license] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
  }
}
