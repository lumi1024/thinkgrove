// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

const ensureInit = vi.fn(() => true);
const makeUser = vi.fn((opts) => opts);
const upsertUser = vi.fn();
const createQuestion = vi.fn(() => 'q_new');
const getDomain = vi.fn(() => ({ id: 'ai' }));
const getSubdomain = vi.fn(() => ({ id: 'sub_1' }));
const listQuestionsByDomain = vi.fn(() => [
  {
    id: 'q_1',
    domain_id: 'ai',
    subdomain_id: 'sub_1',
    title: 'Test question',
    body_md: 'Context',
    quality_score: 0.8,
    open: 1,
    canonical: 0,
    source_requirements: null,
    question_type: 'exploratory',
    difficulty: 'intermediate',
    language: 'en',
    visibility: 'public',
    required_source_kinds: null,
    required_source_count: 2,
    required_source_authority_min: 0.7,
    required_answer_format: 'markdown',
    forbidden_phrases: null,
    min_confidence: 0.6,
    max_answer_length: 1200,
    precision: 0.9,
    answerability: 0.8,
    verifiability: 0.7,
    non_redundancy: 0.9,
    scope_fit: 0.8,
    status: 'open',
    labels: ['core'],
    curated_by: 'curator',
    curation_rule_id: 'rule_1',
    schema_version: '1.0.0',
    created_by: 'user-1',
    created_at: '2026-06-24 00:00:00',
    last_activity_at: '2026-06-24 00:00:00',
  },
]);
const listQuestionsBySubdomain = vi.fn(() => []);

vi.mock('@/lib/db/init', () => ({ ensureInit }));
vi.mock('@/lib/db/repos', () => ({
  ensureInit,
  makeUser,
  upsertUser,
  createQuestion,
  getDomain,
  getSubdomain,
  listQuestionsByDomain,
  listQuestionsBySubdomain,
}));

import { GET, POST } from '@/app/api/questions/route';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/questions', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /api/questions', () => {
  it('requires domainId or subdomainId', async () => {
    const res = await GET(new NextRequest('http://localhost/api/questions'));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('domainId or subdomainId is required');
  });

  it('returns question-first question definitions', async () => {
    const res = await GET(new NextRequest('http://localhost/api/questions?domainId=ai'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items[0]).toMatchObject({
      id: 'q_1',
      statement: 'Test question',
      context: 'Context',
      questionType: 'exploratory',
      visibility: 'public',
      qualityScore: 0.8,
      status: 'open',
      requiredSourceCount: 2,
      requiredAnswerFormat: 'markdown',
    });
  });
});

describe('POST /api/questions', () => {
  it('requires statement instead of title', async () => {
    const res = await POST(makeReq({ domainId: 'ai', authorId: 'u1' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('missing fields');
  });

  it('creates a normalized question definition', async () => {
    const res = await POST(makeReq({
      domainId: 'ai',
      subdomainId: 'sub_1',
      statement: 'What is the smallest useful knowledge flow?',
      context: 'Start simple.',
      questionType: 'exploratory',
      visibility: 'internal',
      requiredSourceCount: 1,
      authorId: 'u1',
      authorKind: 'human',
      authorDisplayName: 'Builder',
      authorRole: 'curator',
    }));
    expect(res.status).toBe(200);
    expect((await res.json())).toEqual({ id: 'q_new', ok: true });
    expect(makeUser).toHaveBeenCalledWith({
      id: 'u1',
      handle: 'u1',
      display_name: 'Builder',
      kind: 'human',
      role: 'curator',
      joined_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });
});
