// SPDX-License-Identifier: MIT

// POST /api/branch
// Body: { domainId, title, kind?, parentBranchId?, authorId, authorKind, bodyMd?, questionId? }
// Creates a new branch in the database. The client is expected to have
// already called /api/u to upsert the author identity.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { createBranch, makeUser, upsertUser } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

interface CreateBranchBody {
  domainId: string;
  title: string;
  kind?: 'question' | 'counter' | 'cite' | 'rebuttal' | 'meta' | 'source_note';
  parentBranchId?: string | null;
  authorId: string;
  authorKind: 'human' | 'ai';
  authorDisplayName: string;
  authorRole: string;
  authorModel?: string;
  authorProvider?: string;
  bodyMd?: string;
  questionId?: string | null;
}

export async function POST(req: Request) {
  ensureInit();
  let body: CreateBranchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.domainId || !body?.title || !body?.authorId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
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

    const id = 'br_' + Math.random().toString(36).slice(2, 12);
    createBranch({
      id,
      domain_id: body.domainId,
      parent_branch_id: body.parentBranchId || null,
      title: body.title.trim(),
      kind: body.kind || 'question',
      created_by: body.authorId,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      body_md: body.bodyMd || null,
      question_id: body.questionId || null,
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    console.warn('[api/branch] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — branch not persisted' }, { status: 503 });
  }
}
