// SPDX-License-Identifier: MIT

// GET /api/subdomains?domainId=...
// POST /api/subdomains

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listSubdomains, createSubdomain, getDomain, makeUser, upsertUser } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  ensureInit();
  const url = new URL(req.url);
  const domainId = url.searchParams.get('domainId');

  if (!domainId) {
    return NextResponse.json({ error: 'domainId is required' }, { status: 400 });
  }

  const items = listSubdomains(domainId);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  ensureInit();
  let body: {
    domainId: string;
    code: string;
    name: string;
    description?: string;
    status?: 'sapling' | 'tree';
    position?: string;
    authorId: string;
    authorKind: 'human' | 'ai';
    authorDisplayName: string;
    authorRole: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body?.domainId || !body?.code || !body?.name || !body?.authorId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const domain = getDomain(body.domainId);
  if (!domain) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  try {
    upsertUser(makeUser({
      id: body.authorId,
      handle: body.authorId,
      display_name: body.authorDisplayName || '匿名',
      kind: body.authorKind,
      role: body.authorRole || 'reader',
      joined_at: new Date().toISOString().split('T')[0],
    }));

    const id = 'sub_' + Math.random().toString(36).slice(2, 12);
    createSubdomain({
      id,
      domain_id: body.domainId,
      code: body.code.trim(),
      name: body.name.trim(),
      description: body.description?.trim() || null,
      status: body.status || 'tree',
      position: body.position || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    console.warn('[api/subdomains] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — subdomain not persisted' }, { status: 503 });
  }
}
