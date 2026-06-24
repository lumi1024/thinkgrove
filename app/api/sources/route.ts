// SPDX-License-Identifier: MIT

// GET /api/sources?questionId=...&domainId=...
// POST /api/sources

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import {
  listSourcesByQuestion,
  listSourcesByDomain,
  createSource,
  getDomain,
  getQuestion,
  getSubdomain,
  makeUser,
  upsertUser,
} from '@/lib/db/repos';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  ensureInit();
  const url = new URL(req.url);
  const questionId = url.searchParams.get('questionId');
  const domainId = url.searchParams.get('domainId');

  if (!questionId && !domainId) {
    return NextResponse.json({ error: 'questionId or domainId is required' }, { status: 400 });
  }

  if (questionId) {
    const question = getQuestion(questionId);
    if (!question) {
      return NextResponse.json({ error: 'question not found' }, { status: 404 });
    }
    const items = listSourcesByQuestion(questionId);
    return NextResponse.json({ items });
  }

  const domain = getDomain(domainId as string);
  if (!domain) {
    return NextResponse.json({ error: 'domain not found' }, { status: 404 });
  }

  const items = listSourcesByDomain(domainId as string);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  ensureInit();
  let body: {
    domainId: string;
    subdomainId?: string;
    questionId?: string;
    title: string;
    url: string;
    summaryMd?: string;
    sourceKind?: 'web' | 'paper' | 'report' | 'internal' | 'external_api';
    authorityScore?: number;
    freshnessScore?: number;
    collectedBy: string;
    collectionAgentId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body?.domainId || !body?.title || !body?.url || !body?.collectedBy) {
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

  if (body.questionId) {
    const question = getQuestion(body.questionId);
    if (!question) {
      return NextResponse.json({ error: 'question not found' }, { status: 404 });
    }
  }

  try {
    upsertUser(makeUser({
      id: body.collectedBy,
      handle: body.collectedBy,
      display_name: body.collectedBy,
      kind: 'human',
      role: 'reader',
      joined_at: new Date().toISOString().split('T')[0],
    }));

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const id = 'src_' + Math.random().toString(36).slice(2, 12);
    createSource({
      id,
      domain_id: body.domainId,
      subdomain_id: body.subdomainId || null,
      question_id: body.questionId || null,
      title: body.title.trim(),
      url: body.url.trim(),
      summary_md: body.summaryMd?.trim() || null,
      source_kind: body.sourceKind || 'web',
      authority_score: body.authorityScore ?? 0,
      freshness_score: body.freshnessScore ?? 0,
      collected_by: body.collectedBy,
      collection_agent_id: body.collectionAgentId || null,
      created_at: now,
      reviewed_at: null,
      archived_at: null,
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    console.warn('[api/sources] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — source not persisted' }, { status: 503 });
  }
}
