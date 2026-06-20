// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const sessionMock = vi.hoisted(() => ({
  createAdminSession: vi.fn((tokenHash: string) => ({ id: 'adm_' + tokenHash.slice(0, 8), expiresAt: '2099-01-01T00:00:00Z' })),
  findAdminSession: vi.fn(() => null),
  deleteAdminSession: vi.fn(),
}));

const poolMock = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/admin-session', () => sessionMock);
vi.mock('@/lib/db/pool', () => poolMock);

// Import AFTER vi.mock so mocks are in place
import { isAdminConfigured, adminLogin, adminLogout, extractSessionId, requireAdmin } from '@/lib/admin-auth';

const ORIGINAL_ENV = process.env;

describe('admin-auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ADMIN_KEY = 'test-admin-key-123';
    sessionMock.createAdminSession.mockImplementation((h: string) => ({ id: 'adm_' + h.slice(0, 8), expiresAt: '2099-01-01T00:00:00Z' }));
    sessionMock.findAdminSession.mockReturnValue(null);
    poolMock.getDb.mockReturnValue({
      prepare: vi.fn(() => ({ get: vi.fn(() => undefined), run: vi.fn() })),
    });
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('isAdminConfigured returns false when ADMIN_KEY is empty', () => {
    process.env.ADMIN_KEY = '';
    expect(isAdminConfigured()).toBe(false);
  });

  it('isAdminConfigured returns true when ADMIN_KEY is set', () => {
    expect(isAdminConfigured()).toBe(true);
  });

  it('adminLogin rejects wrong key', async () => {
    const result = await adminLogin('wrong-key');
    expect(result.success).toBe(false);
    expect(sessionMock.createAdminSession).not.toHaveBeenCalled();
  });

  it('adminLogin accepts correct key and creates session', async () => {
    sessionMock.createAdminSession.mockReturnValue({ id: 'adm_abc123', expiresAt: '2099-01-01T00:00:00Z' });
    const result = await adminLogin('test-admin-key-123');
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('adm_abc123');
    expect(sessionMock.createAdminSession).toHaveBeenCalledOnce();
  });

  it('adminLogin returns false when ADMIN_KEY is not configured', async () => {
    process.env.ADMIN_KEY = '';
    const result = await adminLogin('anything');
    expect(result.success).toBe(false);
    expect(sessionMock.createAdminSession).not.toHaveBeenCalled();
  });

  it('extractSessionId returns cookie value', () => {
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=session_id_123' },
    });
    expect(extractSessionId(req)).toBe('session_id_123');
  });

  it('extractSessionId returns null for missing cookie', () => {
    const req = new NextRequest('http://localhost/admin');
    expect(extractSessionId(req)).toBeNull();
  });

  it('requireAdmin returns ok:true for valid session', () => {
    poolMock.getDb.mockReturnValue({
      prepare: vi.fn(() => ({ get: vi.fn(() => ({ id: 'adm_xyz' })), run: vi.fn() })),
    });
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=valid-session-id' },
    });
    const result = requireAdmin(req);
    expect(result.ok).toBe(true);
    expect(result.sessionId).toBe('adm_xyz');
  });

  it('requireAdmin returns 401 for missing cookie', () => {
    const req = new NextRequest('http://localhost/admin');
    const result = requireAdmin(req);
    expect(result.ok).toBe(false);
    expect(result.response?.status).toBe(401);
  });

  it('requireAdmin returns 401 for expired session', () => {
    poolMock.getDb.mockReturnValue({
      prepare: vi.fn(() => ({ get: vi.fn(() => undefined), run: vi.fn() })),
    });
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=expired-id' },
    });
    const result = requireAdmin(req);
    expect(result.ok).toBe(false);
    expect(result.response?.status).toBe(401);
  });

  it('adminLogout deletes session and clears cookie', async () => {
    sessionMock.deleteAdminSession.mockReturnValue(undefined);
    const response = await adminLogout('adm_test');
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
  });
});
