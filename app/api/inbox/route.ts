// GET /api/inbox
// Returns inbox columns for the current user: cited, disputed, invited.
// Falls back to empty arrays on DB failure.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listCitationsForUser, listDisputesForUser } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

function getUserIdFromHeader(req: Request): string | null {
  const id = req.headers.get('x-user-id');
  return id && id.startsWith('usr_') ? id : null;
}

export async function GET(req: Request) {
  try {
    ensureInit();
    const userId = getUserIdFromHeader(req);

    let citations: Awaited<ReturnType<typeof listCitationsForUser>> = [];
    let disputes: Awaited<ReturnType<typeof listDisputesForUser>> = [];

    if (userId) {
      citations = listCitationsForUser(userId);
      disputes = listDisputesForUser(userId);
    }

    const cited = citations
      .filter(c => c.relation === 'cite' || c.relation === 'adopted')
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        relation: c.relation,
        fromType: c.from_type,
        fromId: c.from_id,
        toType: c.to_type,
        toId: c.to_id,
        createdAt: c.created_at,
      }));

    const disputed = disputes
      .filter(d => d.status === 'open' || d.status === 'ruling')
      .slice(0, 10)
      .map(d => ({
        id: d.id,
        targetType: d.target_type,
        targetId: d.target_id,
        reason: d.reason,
        status: d.status,
        openedAt: d.opened_at,
      }));

    return NextResponse.json({ cited, disputed, invited: [] });
  } catch {
    return NextResponse.json({ cited: [], disputed: [], invited: [] });
  }
}
