// SPDX-License-Identifier: MIT

// GET /api/forest/[id] — single tree detail.
// Returns top-level questions, their sources, latest articles, and contributors for the tree.
// On DB failure, falls back to the offline seed (data/forest.offline.json).

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import {
  listArticlesByDomain,
  listQuestionsByDomain,
  listSourcesByDomain,
} from '@/lib/db/repos';
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
    const articles = listArticlesByDomain(id, 8);
    const questions = listQuestionsByDomain(id, 20);
    const sources = listSourcesByDomain(id, 40);

    return NextResponse.json({
      domain: {
        id: fallback.id,
        name: fallback.domain,
        color: fallback.color,
        description: fallback.description,
      },
      questions: questions.map((question) => ({
        id: question.id,
        statement: question.title,
        context: question.body_md,
        questionType: question.question_type,
        difficulty: question.difficulty,
        visibility: question.visibility,
        qualityScore: question.quality_score,
        status: question.status,
        requiredSourceCount: question.required_source_count,
        requiredAnswerFormat: question.required_answer_format,
        createdBy: question.created_by,
        createdAt: question.created_at,
        lastActivityAt: question.last_activity_at,
      })),
      sources: sources.map((source) => ({
        id: source.id,
        title: source.title,
        url: source.url,
        summaryMd: source.summary_md,
        sourceKind: source.source_kind,
        authorityScore: source.authority_score,
        freshnessScore: source.freshness_score,
        collectedBy: source.collected_by,
        collectionAgentId: source.collection_agent_id,
        createdAt: source.created_at,
        reviewedAt: source.reviewed_at,
        archivedAt: source.archived_at,
      })),
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
    console.warn('[api/forest/[id]] DB unavailable, serving offline seed:', (e as Error).message);

    const questionSummaries = offline.branches
      .filter((b) => b.domainId === id)
      .slice(0, 20)
      .map((b, index) => ({
        id: b.id,
        statement: b.title,
        context: b.bodyMd || null,
        questionType: 'exploratory',
        difficulty: undefined,
        visibility: 'draft',
        qualityScore: 0,
        status: 'draft',
        requiredSourceCount: null,
        requiredAnswerFormat: null,
        createdBy: b.authorId || null,
        createdAt: '2026-06-01',
        lastActivityAt: '2026-06-01',
      }));

    return NextResponse.json({
      domain: {
        id: fallback.id,
        name: fallback.domain,
        color: fallback.color,
        description: fallback.description,
      },
      questions: questionSummaries.length > 0 ? questionSummaries : (topics[fallback.domain] || []).map((t, i) => ({
        id: `${id}_seed_${i}`,
        statement: t,
        context: null,
        questionType: 'exploratory',
        difficulty: undefined,
        visibility: 'draft',
        qualityScore: 0,
        status: 'draft',
        requiredSourceCount: null,
        requiredAnswerFormat: null,
        createdBy: null,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      })),
      sources: [],
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
  const ai = aiResidents.find((r) => (r.homeTrees || []).includes(domainId)) || aiResidents[0];
  const humans = humanResidents.filter((r) => (r.homeTrees || []).includes(domainId)).slice(0, 2);
  return [ai, ...humans].slice(0, 3).map((r) => ({
    id: r.id, displayName: r.displayName, kind: r.kind, role: r.role, state: r.state,
    model: r.model, provider: r.provider,
  }));
}
