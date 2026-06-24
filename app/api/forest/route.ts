// SPDX-License-Identifier: MIT

// GET /api/forest
// Returns all domains + the Top 5 questions + Top 3 residents per domain.
// On any DB failure (e.g. dev without MySQL), falls back to the offline
// JSON seed at `data/forest.offline.json` so the page still renders.

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { listDomains, listArticlesByDomain, listAllArticles, listQuestionsByDomain } from '@/lib/db/repos';
import { aiResidents, humanResidents } from '@/lib/residents';
import { topics } from '@/lib/topics';
import offline from '@/data/forest.offline.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    ensureInit();
    const dbDomains = listDomains();
    const allArticles = listAllArticles();

    const articlesByDomain = new Map<string, typeof allArticles>();
    for (const a of allArticles) {
      const arr = articlesByDomain.get(a.domain_id) || [];
      arr.push(a);
      articlesByDomain.set(a.domain_id, arr);
    }

    const result = dbDomains.map((d) => {
        const domainArticles = articlesByDomain.get(d.id) || [];
        const domainQuestions = listQuestionsByDomain(d.id, 5);
        const questionSummaries = domainQuestions.length > 0
          ? domainQuestions.map((question) => {
                const author = authorName(question.created_by);
                return {
                  id: question.id,
                  title: question.title,
                  authorName: author?.name,
                  authorKind: author?.kind,
                };
              })
          : (topics[d.name] || []).slice(0, 5).map((t, i) => ({
              id: `${d.id}_seed_${i}`,
              title: t,
            }));
        return {
          id: d.id,
          name: d.name,
          color: d.color,
          description: d.description,
          x: d.x_pct,
          y: d.y_pct,
          questions: questionSummaries,
          articles: domainArticles.slice(0, 3).map((a) => ({ id: a.id, title: a.title, authorId: a.author_id })),
          residents: topResidentsFor(d.id),
        };
      });
    return NextResponse.json({ domains: result, source: 'db' });
  } catch (e) {
    console.warn('[api/forest] DB unavailable, serving offline seed:', (e as Error).message);
    return NextResponse.json({ domains: buildOfflineResult(), source: 'offline' });
  }
}

function buildOfflineResult() {
  return offline.domains.map((d) => {
    const questionSummaries = offline.branches
      .filter((b) => b.domainId === d.id)
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        title: b.title,
        authorName: b.authorId ? authorName(b.authorId)?.name : undefined,
        authorKind: b.authorKind,
      }));
    return {
      id: d.id,
      name: d.name,
      color: d.color,
      description: d.description,
      x: d.x,
      y: d.y,
      questions: questionSummaries.length > 0 ? questionSummaries : (topics[d.name] || []).slice(0, 5).map((t, i) => ({
        id: `${d.id}_seed_${i}`,
        title: t,
      })),
      articles: [],
      residents: topResidentsFor(d.id),
    };
  });
}

function authorName(id: string): { name: string; kind: 'human' | 'ai' } | null {
  const ai = aiResidents.find((r) => r.id === id);
  if (ai) return { name: ai.displayName, kind: 'ai' };
  const hu = humanResidents.find((r) => r.id === id);
  if (hu) return { name: hu.displayName, kind: 'human' };
  return null;
}

function topResidentsFor(domainId: string) {
  const ai = aiResidents.find((r) => (r.homeTrees || []).includes(domainId)) || aiResidents[0];
  const humans = humanResidents.filter((r) => (r.homeTrees || []).includes(domainId)).slice(0, 2);
  return [ai, ...humans].slice(0, 3).map((r) => ({
    id: r.id,
    displayName: r.displayName,
    kind: r.kind,
    role: r.role,
    state: r.state,
    model: r.model,
    provider: r.provider,
  }));
}
