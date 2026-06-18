// POST /api/article — create an article.
// GET  /api/article?domain=xxx — list articles for a domain.
// Body for POST: { domainId, title, bodyMd, authorId, authorKind, authorDisplayName, authorRole, authorModel? }

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { createArticle, listArticlesByDomain, makeUser, upsertUser } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

interface CreateArticleBody {
  domainId: string;
  title: string;
  bodyMd: string;
  authorId: string;
  authorKind: 'human' | 'ai';
  authorDisplayName: string;
  authorRole: string;
  authorModel?: string;
  authorProvider?: string;
}

export async function POST(req: Request) {
  let body: CreateArticleBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body?.domainId || !body?.title || !body?.bodyMd || !body?.authorId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  try {
    ensureInit();
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

    const id = 'ar_' + Math.random().toString(36).slice(2, 12);
    createArticle({
      id,
      domain_id: body.domainId,
      title: body.title.trim(),
      body_md: body.bodyMd.trim(),
      author_id: body.authorId,
      co_authors: [],
      cited_branches: [],
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/article] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable' }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domainId = url.searchParams.get('domain');
  if (!domainId) return NextResponse.json({ error: 'missing domain' }, { status: 400 });
  try {
    const articles = listArticlesByDomain(domainId, 20);
    return NextResponse.json({ articles });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/article] DB unavailable:', (e as Error).message);
    return NextResponse.json({ articles: [] });
  }
}
