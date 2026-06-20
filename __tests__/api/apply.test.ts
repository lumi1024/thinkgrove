// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const initMock = vi.hoisted(() => ({
  ensureInit: vi.fn(() => true),
}));

const marketplaceMock = vi.hoisted(() => ({
  createApplication: vi.fn(),
  getApplicationByContact: vi.fn(),
}));

vi.mock('@/lib/db/init', () => initMock);
vi.mock('@/lib/db/repos/marketplace', () => marketplaceMock);

import { POST, GET } from '@/app/api/apply/route';

describe('POST /api/apply', () => {
  beforeEach(() => {
    marketplaceMock.createApplication.mockClear();
    marketplaceMock.createApplication.mockReturnValue({
      id: 'app_test123', status: 'pending', created_at: '2026-06-20T00:00:00Z',
      applicant_name: '', contact: '', framework: '', endpoint: '', auth_info: '',
      role: '', bio: '', avatar_url: null, target_trees: null, capabilities: null,
      admin_note: null, reviewed_at: null, reviewed_by: null,
    });
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/apply', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing required fields', async () => {
    const req = new NextRequest('http://localhost/api/apply', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toBeDefined();
  });

  it('validates framework field', async () => {
    const req = new NextRequest('http://localhost/api/apply', {
      method: 'POST',
      body: JSON.stringify({
        applicant_name: 'Test', contact: 'test@x.com', framework: 'invalid',
        endpoint: 'http://x', auth_info: 'tok', agent_name: 'T', role: 'oracle',
        bio: 'A test agent bio that is long enough to pass the minimum character count requirement.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).fields.framework).toBeDefined();
  });

  it('validates bio length', async () => {
    const req = new NextRequest('http://localhost/api/apply', {
      method: 'POST',
      body: JSON.stringify({
        applicant_name: 'Test', contact: 'test@x.com', framework: 'hermes',
        endpoint: 'http://x', auth_info: 'tok', agent_name: 'TA', role: 'oracle',
        bio: 'short',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates application with valid data', async () => {
    const req = new NextRequest('http://localhost/api/apply', {
      method: 'POST',
      body: JSON.stringify({
        applicant_name: 'Valid User', contact: 'valid@example.com', framework: 'hermes',
        endpoint: 'http://127.0.0.1:8642', auth_info: 'bearer-token-123',
        agent_name: 'MyAgent', role: 'synthesizer',
        bio: 'A capable synthesizer that combines ideas from different domains into coherent insights and innovative solutions for complex problems.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.id).toMatch(/^app_/);
    expect(marketplaceMock.createApplication).toHaveBeenCalledOnce();
  });
});

describe('GET /api/apply', () => {
  beforeEach(() => {
    marketplaceMock.getApplicationByContact.mockClear();
  });

  it('requires contact param', async () => {
    const req = new NextRequest('http://localhost/api/apply');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns application by contact', async () => {
    marketplaceMock.getApplicationByContact.mockReturnValue({
      id: 'app_001', agent_name: 'TestAgent', status: 'pending', created_at: '2026-06-20T10:00:00Z',
      applicant_name: '', contact: '', framework: '', endpoint: '', auth_info: '',
      role: '', bio: '', avatar_url: null, target_trees: null, capabilities: null,
      admin_note: null, reviewed_at: null, reviewed_by: null,
    });
    const req = new NextRequest('http://localhost/api/apply?contact=test@example.com');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.found).toBe(true);
    expect(json.application.agent_name).toBe('TestAgent');
  });

  it('returns 404 when not found', async () => {
    marketplaceMock.getApplicationByContact.mockReturnValue(null);
    const req = new NextRequest('http://localhost/api/apply?contact=none@example.com');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });
});
