// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the DB layer.
const reposMock = vi.hoisted(() => ({
  ensureInit: vi.fn(() => true),
  makeUser: vi.fn((opts) => opts),
  upsertUser: vi.fn(),
  createBranch: vi.fn(() => 'br_abc123'),
  createAnswer: vi.fn(() => 'an_abc123'),
  createArticle: vi.fn(() => 'ar_abc123'),
  createDispute: vi.fn(() => 'dp_abc123'),
  castVote: vi.fn(),
  listVotesForTarget: vi.fn(() => []),
  updateDisputeRuling: vi.fn(),
  getBranch: vi.fn(() => ({ domain_id: 'ai', title: 'test' })),
  listArticlesByDomain: vi.fn(() => []),
  listDomains: vi.fn(() => []),
  listAllBranches: vi.fn(() => []),
  listAllArticles: vi.fn(() => []),
  getAgentState: vi.fn(() => null),
  resetAgentDailyIfStale: vi.fn(),
  bumpAgentAction: vi.fn(() => ({ actionsToday: 1 })),
  setAgentRest: vi.fn(),
  getUserByHandle: vi.fn(() => null),
  listDisputesForUser: vi.fn(() => []),
  listCitationsForUser: vi.fn(() => []),
}));

vi.mock('@/lib/db/init', () => reposMock);
vi.mock('@/lib/db/repos', () => reposMock);

// Mock residents for awaken route.
const residentsMock = vi.hoisted(() => ({
  aiResidents: [
    { id: 'ai_critic_kimi', handle: 'critic-kimi', displayName: 'Critic-Kimi', kind: 'ai', model: 'Kimi K2', provider: 'Moonshot', role: 'critic', homeTrees: ['ai'], joinedAt: '2026-01-18' },
  ],
  humanResidents: [],
}));
vi.mock('@/lib/residents', () => residentsMock);

// Mock domains for awaken route.
vi.mock('@/lib/domains', () => ({
  domains: [{ id: 'ai', domain: 'AI', color: '#0ea5e9', description: 'Models', x: '5%', y: '5%' }],
}));

// Mock AI provider — tests should not make real network calls.
const mockChatResult = { text: 'mock q?', model: 'mock', promptHash: 'ph_test', fallback: true };
vi.mock('@/lib/ai/provider', () => ({
  resolveProvider: () => ({
    chat: vi.fn(() => Promise.resolve(mockChatResult)),
  }),
  hashPrompt: vi.fn(() => 'ph_test'),
}));

import { POST as postBranch } from '@/app/api/branch/route';
import { POST as postAnswer } from '@/app/api/answer/route';
import { POST as postArticle } from '@/app/api/article/route';
import { POST as postDispute } from '@/app/api/dispute/route';
import { POST as postVote } from '@/app/api/vote/route';
import { POST as postAwaken } from '@/app/api/ai/awaken/route';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/branch', () => {
  it('returns 400 for missing fields', async () => {
    const res = await postBranch(makeReq({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('missing fields');
  });

  it('creates branch and returns id', async () => {
    const res = await postBranch(makeReq({
      domainId: 'ai', title: 'Test?', authorId: 'u1', authorKind: 'human',
      authorDisplayName: 'Alice', authorRole: 'reader',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toMatch(/^br_/);
    expect(data.ok).toBe(true);
  });
});

describe('POST /api/answer', () => {
  it('returns 400 for missing branchId', async () => {
    const res = await postAnswer(makeReq({ authorId: 'u1', authorKind: 'human' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty bodyMd', async () => {
    const res = await postAnswer(makeReq({
      branchId: 'br1', bodyMd: '', authorId: 'u1', authorKind: 'human',
      authorDisplayName: 'A', authorRole: 'reader',
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('empty body');
  });
});

describe('POST /api/article', () => {
  it('returns 400 for missing fields', async () => {
    const res = await postArticle(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('creates article', async () => {
    const res = await postArticle(makeReq({
      domainId: 'ai', title: 'Test', bodyMd: 'content', authorId: 'u1',
      authorKind: 'human', authorDisplayName: 'A', authorRole: 'reader',
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});

describe('POST /api/dispute', () => {
  it('returns 400 for missing fields', async () => {
    const res = await postDispute(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('creates dispute and returns arbitrators', async () => {
    const res = await postDispute(makeReq({
      targetType: 'answer', targetId: 'an1', reason: 'bad answer', openedBy: 'u1',
      openedByDisplayName: 'Alice', openedByRole: 'reader', openedByKind: 'human',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toMatch(/^dp_/);
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.arbitrators)).toBe(true);
  });
});

describe('POST /api/vote', () => {
  it('rejects invalid weight', async () => {
    const res = await postVote(makeReq({ voterId: 'u1', targetId: 'd1', weight: 5 }));
    expect(res.status).toBe(400);
  });

  it('tallies votes and detects majority', async () => {
    reposMock.listVotesForTarget.mockReturnValue([
      { id: 'v1', voter_id: 'u1', target_type: 'dispute', target_id: 'd1', weight: 1, ts: '' },
      { id: 'v2', voter_id: 'u2', target_type: 'dispute', target_id: 'd1', weight: 1, ts: '' },
    ]);
    const res = await postVote(makeReq({ voterId: 'u3', targetId: 'd1', weight: 1 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sustain).toBe(2);
    expect(data.ruling).toBeNull();
  });

  it('triggers ruling at 3 votes', async () => {
    reposMock.listVotesForTarget.mockReturnValue([
      { id: 'v1', voter_id: 'u1', target_type: 'dispute', target_id: 'd1', weight: 1, ts: '' },
      { id: 'v2', voter_id: 'u2', target_type: 'dispute', target_id: 'd1', weight: 1, ts: '' },
      { id: 'v3', voter_id: 'u3', target_type: 'dispute', target_id: 'd1', weight: 1, ts: '' },
    ]);
    const res = await postVote(makeReq({ voterId: 'u4', targetId: 'd1', weight: 1 }));
    expect(res.status).toBe(200);
    expect((await res.json()).ruling).toBe('sustained');
  });
});

describe('POST /api/ai/awaken', () => {
  it('returns 404 for unknown agent', async () => {
    const res = await postAwaken(makeReq({ agentId: 'nonexistent', domainId: 'ai' }));
    expect(res.status).toBe(404);
  });

  it('returns 404 for unknown domain', async () => {
    const res = await postAwaken(makeReq({ agentId: 'ai_critic_kimi', domainId: 'nonexistent' }));
    expect(res.status).toBe(404);
  });

  it('awakens agent and returns branch id', async () => {
    reposMock.getAgentState.mockReturnValue(null);
    const res = await postAwaken(makeReq({ agentId: 'ai_critic_kimi', domainId: 'ai' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toMatch(/^br_/);
    expect(data.ok).toBe(true);
  });
});
