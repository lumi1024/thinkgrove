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
import { normalizeQuestionDefinition, validateQuestionDefinition } from '@/lib/questions/schema';
import { toDbQuestionPayload } from '@/lib/questions/factory';

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

  return NextResponse.json({
    items: items.map((question) => ({
      id: question.id,
      domainId: question.domain_id,
      subdomainId: question.subdomain_id,
      statement: question.title,
      context: question.body_md,
      questionType: question.question_type,
      difficulty: question.difficulty,
      language: question.language,
      visibility: question.visibility,
      requiredSourceKinds: question.required_source_kinds,
      requiredSourceCount: question.required_source_count,
      requiredSourceAuthorityMin: question.required_source_authority_min,
      requiredAnswerFormat: question.required_answer_format,
      forbiddenPhrases: question.forbidden_phrases,
      minConfidence: question.min_confidence,
      maxAnswerLength: question.max_answer_length,
      qualityScore: question.quality_score,
      precision: question.precision,
      answerability: question.answerability,
      verifiability: question.verifiability,
      nonRedundancy: question.non_redundancy,
      scopeFit: question.scope_fit,
      status: question.status,
      labels: question.labels,
      curatedBy: question.curated_by,
      curationRuleId: question.curation_rule_id,
      schemaVersion: question.schema_version,
      createdBy: question.created_by,
      createdAt: question.created_at,
      lastActivityAt: question.last_activity_at,
    })),
  });
}

export async function POST(req: Request) {
  ensureInit();
  let body: {
    domainId: string;
    subdomainId?: string;
    statement: string;
    context?: string;
    questionType?: 'exploratory' | 'comparison' | 'causal' | 'procedural' | 'factual' | 'normative';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    language?: string;
    visibility?: 'draft' | 'internal' | 'public';
    requiredSourceKinds?: Array<'web' | 'paper' | 'report' | 'internal' | 'external_api'>;
    requiredSourceCount?: number;
    requiredSourceAuthorityMin?: number;
    requiredAnswerFormat?: string;
    forbiddenPhrases?: string[];
    minConfidence?: number;
    maxAnswerLength?: number;
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

  if (!body?.domainId || !body?.statement || !body?.authorId) {
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

    const normalized = normalizeQuestionDefinition({
      statement: body.statement,
      domain_id: body.domainId,
      subdomain_id: body.subdomainId,
      question_type: body.questionType || 'exploratory',
      difficulty: body.difficulty,
      language: body.language,
      visibility: body.visibility || 'draft',
      required_source_kinds: body.requiredSourceKinds,
      required_source_count: body.requiredSourceCount,
      required_source_authority_min: body.requiredSourceAuthorityMin,
      required_answer_format: body.requiredAnswerFormat,
      forbidden_phrases: body.forbiddenPhrases,
      min_confidence: body.minConfidence,
      max_answer_length: body.maxAnswerLength,
      status: 'draft',
      created_by: body.authorId,
    });

    const payload = toDbQuestionPayload(normalized);
    createQuestion(payload);

    return NextResponse.json({ id: payload.id, ok: true });
  } catch (e) {
    console.warn('[api/questions] DB unavailable:', (e as Error).message);
    return NextResponse.json({ error: 'database unavailable — question not persisted' }, { status: 503 });
  }
}
