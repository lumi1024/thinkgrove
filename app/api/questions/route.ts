// SPDX-License-Identifier: MIT

// GET /api/questions?domainId=...&subdomainId=...
// POST /api/questions

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import {
  listQuestionsByDomain,
  listQuestionsBySubdomain,
  createQuestion,
  getDomain,
  getSubdomain,
  makeUser,
  upsertUser,
} from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  ensureInit();
  const url = new URL(req.url);
  const domainId = url.searchParams.get('domainId');
  const subdomainId = url.searchParams.get('subdomainId');

  if (!domainId && !subdomainId) {
    return NextResponse.json({ error: 'domainId or subdomainId is required' }, { status: 400 });
  }

  const domain = domainId ? getDomain(domainId) : null;
  if (domainId && !domain) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  const subdomain = subdomainId ? getSubdomain(subdomainId) : null;
  if (subdomainId && !subdomain) {
    return NextResponse.json({ error: 'subdomain not found' }, { status: 404 });
  }

  const items = subdomainId
    ? listQuestionsBySubdomain(subdomainId)
    : listQuestionsByDomain(domainId as string);

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  ensureInit();
  let body: {
    domainId: string;
    subdomainId?: string;
    title: string;
    bodyMd?: string;
    sourceRequirements?: string;
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

  if (!body?.domainId || !body?.title || !body?.authorId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const domain = getDomain(body.domainId);
  if (!domain) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  if (body.subdomainId) {
    const subdomain = getSubdomain(body.subdomainId);
    if (!subdomain) {
      return NextResponse.json({ error: 'subdomain not found' }, { status: 404 });
    }
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

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const id = 'q_' + Math.random().toString(36).slice(2, 12);
    createQuestion({
      id,
      domain_id: body.domainId,
      subdomain_id: body.subdomainId || null,
      title: body.title.trim(),
      body_md: body.bodyMd?.trim() || null,
      quality_score: 0,
      open: 1,
      canonical: 0,
      source_requirements: body.sourceRequirements?.trim() || null,
      created_by: body.authorId,
      created_at: now,
      last_activity_at: now,
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    console.warn('[api/questions] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — question not persisted' }, { status: 503 });
  }
}
