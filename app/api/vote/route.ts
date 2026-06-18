// POST /api/vote
// Body: { voterId, targetId, weight }
// weight is +1 (sustain) or -1 (overturn). The ruling is finalized
// when a 3-vote majority forms on either side.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { castVote, listVotesForTarget, updateDisputeRuling } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

interface VoteBody {
  voterId: string;
  targetId: string;        // dispute id
  weight: number;          // +1 sustain, -1 overturn
}

export async function POST(req: Request) {
  let body: VoteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.voterId || !body?.targetId || ![1, -1].includes(body.weight)) {
    return NextResponse.json({ error: 'missing or invalid fields' }, { status: 400 });
  }

  try {
    ensureInit();
    castVote(body.voterId, 'dispute', body.targetId, body.weight);

    // Tally + check majority.
    const tally = listVotesForTarget('dispute', body.targetId);
    let sustain = 0, overturn = 0;
    for (const r of tally) {
      if (r.weight > 0) sustain++;
      else if (r.weight < 0) overturn++;
    }

    let ruling: 'sustained' | 'overturned' | null = null;
    if (sustain >= 3) ruling = 'sustained';
    else if (overturn >= 3) ruling = 'overturned';

    if (ruling) {
      updateDisputeRuling(body.targetId, ruling === 'sustained' ? '原结论维持' : '原结论被推翻');
    }

    return NextResponse.json({ ok: true, sustain, overturn, ruling });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/vote] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
  }
}
