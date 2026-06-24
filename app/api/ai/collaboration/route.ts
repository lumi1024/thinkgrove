// SPDX-License-Identifier: MIT

// POST /api/ai/collaboration/run
// Body: { role, context, actorId? }

import { NextResponse } from 'next/server';
import { runCollaboration } from '@/lib/ai/collaboration';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    role: 'collector' | 'oracle' | 'synthesizer' | 'critic' | 'tutor' | 'arbitrator';
    context: {
      action: string;
      domain?: string;
      topic: string;
      questionId?: string;
      sourceId?: string;
      sourceIds?: string[];
      systemPrompt?: string;
      maxTokens?: number;
      metadata?: Record<string, string>;
    };
    actorId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body?.role || !body?.context?.action || !body?.context?.topic) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  try {
    const result = await runCollaboration(body.role, body.context, body.actorId);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.warn('[api/ai/collaboration] unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'collaboration unavailable' }, { status: 503 });
  }
}
