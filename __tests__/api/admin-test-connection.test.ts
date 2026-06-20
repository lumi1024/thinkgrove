// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const adminAuthMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(() => ({ ok: true })),
}));

const resolverMock = vi.hoisted(() => ({
  ExternalAgentResolver: vi.fn(),
}));

vi.mock('@/lib/admin-auth', () => adminAuthMock);
vi.mock('@/lib/external-agents/resolver', () => resolverMock);

import { POST as postTestConnection } from '@/app/api/admin/test-connection/route';

describe('POST /api/admin/test-connection', () => {
  beforeEach(() => {
    resolverMock.ExternalAgentResolver.mockClear();
    adminAuthMock.requireAdmin.mockReturnValue({ ok: true });
  });

  it('returns 400 for missing fields', async () => {
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authorized', async () => {
    adminAuthMock.requireAdmin.mockReturnValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
    });
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'http://x', framework: 'hermes' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(401);
  });

  it('returns reachable false when adapter creation fails', async () => {
    resolverMock.ExternalAgentResolver.mockImplementation(() => ({
      resolve: () => null,
    }));
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'http://127.0.0.1:8642', framework: 'hermes' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reachable).toBe(false);
    expect(json.error).toBe('无法创建适配器');
  });

  it('tests connection via adapter healthCheck', async () => {
    const mockAdapter = {
      healthCheck: vi.fn(() => Promise.resolve(true)),
      dispose: vi.fn(),
    };
    resolverMock.ExternalAgentResolver.mockImplementation(() => ({
      resolve: () => mockAdapter,
    }));
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'http://127.0.0.1:8642', framework: 'hermes' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reachable).toBe(true);
    expect(json.latency).toBeDefined();
    expect(typeof json.latency).toBe('number');
    expect(mockAdapter.dispose).toHaveBeenCalled();
  });

  it('returns reachable false on healthCheck failure', async () => {
    const mockAdapter = {
      healthCheck: vi.fn(() => Promise.resolve(false)),
      dispose: vi.fn(),
    };
    resolverMock.ExternalAgentResolver.mockImplementation(() => ({
      resolve: () => mockAdapter,
    }));
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'http://127.0.0.1:8642', framework: 'hermes' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reachable).toBe(false);
    expect(json.error).toBe('连接失败');
    expect(mockAdapter.dispose).toHaveBeenCalled();
  });

  it('handles adapter exception gracefully', async () => {
    resolverMock.ExternalAgentResolver.mockImplementation(() => ({
      resolve: () => ({
        healthCheck: vi.fn(() => Promise.reject(new Error('connection refused'))),
        dispose: vi.fn(),
      }),
    }));
    const req = new NextRequest('http://localhost/api/admin/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'http://127.0.0.1:8642', framework: 'hermes' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postTestConnection(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reachable).toBe(false);
    expect(json.error).toBe('connection refused');
  });
});
