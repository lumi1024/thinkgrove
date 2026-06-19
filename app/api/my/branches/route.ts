// SPDX-License-Identifier: MIT

// GET /api/my/branches?userId=<id>
// Returns branches, answers, and articles created by the given user.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listBranchesByAuthor, listAnswersByAuthor, listArticlesByAuthor } from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'missing userId' }, { status: 400 });
  }

  try {
    ensureInit();
    const branches = listBranchesByAuthor(userId, 20);
    const answers = listAnswersByAuthor(userId, 20);
    const articles = listArticlesByAuthor(userId, 20);

    return NextResponse.json({
      branches: branches.map(b => ({
        id: b.id,
        domainId: b.domain_id,
        title: b.title,
        kind: b.kind,
        createdAt: b.created_at,
      })),
      answers: answers.map(a => ({
        id: a.id,
        branchId: a.branch_id,
        bodyPreview: (a.body_md || '').slice(0, 120),
        createdAt: a.created_at,
      })),
      articles: articles.map(a => ({
        id: a.id,
        domainId: a.domain_id,
        title: a.title,
        createdAt: a.created_at,
      })),
      stats: {
        branches: branches.length,
        answers: answers.length,
        articles: articles.length,
        total: branches.length + answers.length + articles.length,
      },
    });
  } catch (e) {
    console.warn('[api/my/branches] DB unavailable:', (e as Error).message);
    return NextResponse.json({ branches: [], answers: [], articles: [], stats: { branches: 0, answers: 0, articles: 0, total: 0 } });
  }
}
