// GET /api/forest/[id] — single tree detail.
// Returns the full branch list, latest articles, and contributors for the tree.
// On DB failure, falls back to the offline seed (data/forest.offline.json).

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listBranchesByDomain, listArticlesByDomain, listAnswersByBranch } from '@/lib/db/repos';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';
import { aiResidents, humanResidents } from '@/lib/residents';
import { topics } from '@/lib/topics';
import offline from '@/data/forest.offline.json';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const fallback = FALLBACK_DOMAINS.find((d) => d.id === id);
  if (!fallback) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  try {
    ensureInit();
    const realBranches = listBranchesByDomain(id, 30);
    const articles = listArticlesByDomain(id, 8);

    const branches = realBranches.length > 0
      ? realBranches.map((b) => {
          const author = authorOf(b.created_by);
          const answers = listAnswersByBranch(b.id);
          return {
            id: b.id,
            title: b.title,
            kind: b.kind,
            author: author ? { id: author.id, name: author.displayName, kind: author.kind, role: author.role } : null,
            answerCount: answers.length,
            createdAt: b.created_at,
          };
        })
      : (topics[fallback.domain] || []).map((t, i) => ({
          id: `${id}_seed_${i}`,
          title: t,
          kind: 'question',
          author: null,
          answerCount: 0,
          createdAt: new Date().toISOString(),
        }));

    return NextResponse.json({
      domain: {
        id: fallback.id,
        name: fallback.domain,
        color: fallback.color,
        description: fallback.description,
      },
      branches,
      articles: articles.map((a) => {
        const author = authorOf(a.author_id);
        return {
          id: a.id,
          title: a.title,
          bodyMd: a.body_md,
          author: author ? { id: author.id, name: author.displayName, kind: author.kind, role: author.role } : null,
          createdAt: a.created_at,
        };
      }),
      residents: topResidentsFor(id),
      source: 'db',
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api/forest/[id]] DB unavailable, serving offline seed:', (e as Error).message);

    // Offline seed for this domain
    const branches = offline.branches
      .filter((b) => b.domainId === id)
      .map((b) => ({
        id: b.id,
        title: b.title,
        kind: 'question' as const,
        author: b.authorId ? (() => {
          const a = authorOf(b.authorId);
          return a ? { id: a.id, name: a.displayName, kind: a.kind, role: a.role } : null;
        })() : null,
        answerCount: 0,
        createdAt: '2026-06-01',
      }));

    return NextResponse.json({
      domain: {
        id: fallback.id,
        name: fallback.domain,
        color: fallback.color,
        description: fallback.description,
      },
      branches: branches.length > 0 ? branches : (topics[fallback.domain] || []).map((t, i) => ({
        id: `${id}_seed_${i}`,
        title: t,
        kind: 'question' as const,
        author: null,
        answerCount: 0,
        createdAt: new Date().toISOString(),
      })),
      articles: [],
      residents: topResidentsFor(id),
      source: 'offline',
    });
  }
}

function authorOf(id: string) {
  return aiResidents.find((r) => r.id === id) || humanResidents.find((r) => r.id === id) || null;
}

function topResidentsFor(domainId: string) {
  const ai = aiResidents.find((r) => r.homeTrees.includes(domainId)) || aiResidents[0];
  const humans = humanResidents.filter((r) => r.homeTrees.includes(domainId)).slice(0, 2);
  return [ai, ...humans].slice(0, 3).map((r) => ({
    id: r.id, displayName: r.displayName, kind: r.kind, role: r.role, state: r.state,
    model: r.model, provider: r.provider,
  }));
}
