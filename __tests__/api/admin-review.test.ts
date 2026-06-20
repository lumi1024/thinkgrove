// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const initMock = vi.hoisted(() => ({
  ensureInit: vi.fn(() => true),
}));

const marketplaceMock = vi.hoisted(() => ({
  listApplications: vi.fn(() => []),
  countApplications: vi.fn(() => 0),
  getApplication: vi.fn(),
  reviewApplication: vi.fn(),
}));

const adminAuthMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(() => ({ ok: true })),
}));

const loaderMock = vi.hoisted(() => ({
  loadAgentsFromYaml: vi.fn(() => []),
}));

const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => ''),
  writeFileSync: vi.fn(),
}));

vi.mock('@/lib/db/init', () => initMock);
vi.mock('@/lib/db/repos/marketplace', () => marketplaceMock);
vi.mock('@/lib/admin-auth', () => adminAuthMock);
vi.mock('@/lib/config/loader', () => loaderMock);
vi.mock('fs', () => ({
  default: { existsSync: fsMock.existsSync, readFileSync: fsMock.readFileSync, writeFileSync: fsMock.writeFileSync },
  existsSync: fsMock.existsSync,
  readFileSync: fsMock.readFileSync,
  writeFileSync: fsMock.writeFileSync,
}));

import { GET as getList } from '@/app/api/admin/applications/route';
import { GET as getDetail } from '@/app/api/admin/applications/[id]/route';
import { POST as postReview } from '@/app/api/admin/review/route';

describe('GET /api/admin/applications', () => {
  beforeEach(() => {
    marketplaceMock.listApplications.mockClear();
    marketplaceMock.countApplications.mockClear();
    adminAuthMock.requireAdmin.mockReturnValue({ ok: true });
  });

  it('returns empty list by default', async () => {
    marketplaceMock.listApplications.mockReturnValue([]);
    marketplaceMock.countApplications.mockReturnValue(0);
    const req = new NextRequest('http://localhost/api/admin/applications');
    const res = await getList(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.applications).toHaveLength(0);
    expect(json.counts).toBeDefined();
  });

  it('filters by status', async () => {
    marketplaceMock.listApplications.mockReturnValue([{ id: 'app_1', status: 'pending', agent_name: 'Test', framework: 'hermes', created_at: '2026-06-20T00:00:00Z' }]);
    marketplaceMock.countApplications.mockReturnValue(1);
    const req = new NextRequest('http://localhost/api/admin/applications?status=pending');
    const res = await getList(req);
    expect(res.status).toBe(200);
    expect(marketplaceMock.listApplications).toHaveBeenCalledWith('pending', 50);
  });

  it('limits results to 100 max', async () => {
    marketplaceMock.listApplications.mockReturnValue([]);
    const req = new NextRequest('http://localhost/api/admin/applications?limit=200');
    await getList(req);
    expect(marketplaceMock.listApplications).toHaveBeenCalledWith(undefined, 100);
  });
});

describe('GET /api/admin/applications/:id', () => {
  beforeEach(() => {
    adminAuthMock.requireAdmin.mockReturnValue({ ok: true });
  });

  it('returns 404 for missing application', async () => {
    marketplaceMock.getApplication.mockReturnValue(null);
    const res = await getDetail(new NextRequest('http://localhost/api/admin/applications/app_999'), { params: Promise.resolve({ id: 'app_999' }) });
    expect(res.status).toBe(404);
  });

  it('returns application detail', async () => {
    marketplaceMock.getApplication.mockReturnValue({
      id: 'app_001', status: 'pending', agent_name: 'Test', bio: 'bio',
      applicant_name: '', contact: '', framework: '', endpoint: '', auth_info: '',
      role: '', avatar_url: null, target_trees: null, capabilities: null,
      admin_note: null, created_at: '', reviewed_at: null, reviewed_by: null,
    });
    const res = await getDetail(new NextRequest('http://localhost/api/admin/applications/app_001'), { params: Promise.resolve({ id: 'app_001' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.application.agent_name).toBe('Test');
  });

  it('returns 401 when not authorized', async () => {
    adminAuthMock.requireAdmin.mockReturnValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    });
    const res = await getDetail(new NextRequest('http://localhost/api/admin/applications/app_001'), { params: Promise.resolve({ id: 'app_001' }) });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/review', () => {
  beforeEach(() => {
    marketplaceMock.getApplication.mockClear();
    marketplaceMock.reviewApplication.mockClear();
    loaderMock.loadAgentsFromYaml.mockClear();
    adminAuthMock.requireAdmin.mockReturnValue({ ok: true });
    fsMock.writeFileSync.mockClear();
    fsMock.existsSync.mockClear();
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: 'bad',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid action', async () => {
    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'app_1', action: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing application', async () => {
    marketplaceMock.getApplication.mockReturnValue(null);
    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'app_1', action: 'approve' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 for already-reviewed application', async () => {
    marketplaceMock.getApplication.mockReturnValue({
      id: 'app_1', status: 'approved', agent_name: 'T',
      applicant_name: '', contact: '', framework: '', endpoint: '', auth_info: '',
      role: '', bio: '', avatar_url: null, target_trees: null, capabilities: null,
      admin_note: null, created_at: '', reviewed_at: null, reviewed_by: null,
    });
    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'app_1', action: 'approve' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(400);
  });

  it('approves a pending application', async () => {
    marketplaceMock.getApplication.mockReturnValue({
      id: 'app_1', status: 'pending', agent_name: 'TestAgent',
      applicant_name: '', contact: '', framework: 'hermes', endpoint: 'http://x',
      auth_info: '{}', role: 'oracle', bio: 'bio text',
      avatar_url: null, target_trees: '["ai"]', capabilities: '["answer"]',
      admin_note: null, created_at: '', reviewed_at: null, reviewed_by: null,
    });
    marketplaceMock.reviewApplication.mockReturnValue({
      id: 'app_1', status: 'approved', agent_name: 'TestAgent',
      applicant_name: '', contact: '', framework: 'hermes', endpoint: 'http://x',
      auth_info: '{}', role: 'oracle', bio: 'bio text',
      avatar_url: null, target_trees: '["ai"]', capabilities: '["answer"]',
      admin_note: null, created_at: '', reviewed_at: '2026-06-20T00:00:00Z', reviewed_by: 'admin',
    });
    loaderMock.loadAgentsFromYaml.mockReturnValue([]);

    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'app_1', action: 'approve' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.application.status).toBe('approved');
  });

  it('rejects with admin note', async () => {
    marketplaceMock.getApplication.mockReturnValue({
      id: 'app_1', status: 'pending', agent_name: 'TestAgent',
      applicant_name: '', contact: '', framework: 'hermes', endpoint: 'http://x',
      auth_info: '{}', role: 'oracle', bio: 'bio text',
      avatar_url: null, target_trees: null, capabilities: null,
      admin_note: null, created_at: '', reviewed_at: null, reviewed_by: null,
    });
    marketplaceMock.reviewApplication.mockReturnValue({
      id: 'app_1', status: 'rejected', agent_name: 'TestAgent',
      applicant_name: '', contact: '', framework: 'hermes', endpoint: 'http://x',
      auth_info: '{}', role: 'oracle', bio: 'bio text',
      avatar_url: null, target_trees: null, capabilities: null,
      admin_note: 'Endpoint unreachable', created_at: '', reviewed_at: '2026-06-20T00:00:00Z', reviewed_by: 'admin',
    });

    const req = new NextRequest('http://localhost/api/admin/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'app_1', action: 'reject', adminNote: 'Endpoint unreachable' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postReview(req);
    expect(res.status).toBe(200);
    expect(marketplaceMock.reviewApplication).toHaveBeenCalledWith('app_1', 'rejected', 'Endpoint unreachable');
  });
});
