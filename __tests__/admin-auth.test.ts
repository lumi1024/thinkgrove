// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const poolMock = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/db/pool', () => poolMock);

const sessionMock = vi.hoisted(() => ({
  createAdminSession: vi.fn((hash: string) => ({ id: 'adm_' + hash.slice(0, 8), expiresAt: '2099-01-01T00:00:00Z' })),
  findAdminSession: vi.fn((hash: string) => hash === 'valid_hash' ? { id: 'adm_s1', expiresAt: '2099-01-01T00:00:00Z' } : null),
  deleteAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin-session', () => sessionMock);

// Import AFTER vi.mock
import { isAdminConfigured, adminLogin, verifyAdminRequest, extractSessionIdFromRequest, adminLogout } from '@/lib/admin-auth';

const ORIGINAL_ENV = process.env;

describe('admin-auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionMock.createAdminSession.mockImplementation((hash: string) => ({ id: 'adm_' + hash.slice(0, 8), expiresAt: '2099-01-01T00:00:00Z' }));
    sessionMock.findAdminSession.mockImplementation((hash: string) => hash === 'valid_hash' ? { id: 'adm_s1', expiresAt: '2099-01-01T00:00:00Z' } : null);
    process.env = { ...ORIGINAL_ENV, ADMIN_KEY: 'test-admin-key-123' };
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

  it('verifyAdminRequest returns true for valid cookie', () => {
    sessionMock.findAdminSession.mockReturnValue({ id: 'adm_xyz', expiresAt: '2099-01-01T00:00:00Z' });
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=valid-cookie-value' },
    });
    // hashToken('valid-cookie-value') needs to produce 'valid_hash' for this to work
    // Since we can't predict SHA-256, we mock findAdminSession to always return valid
    sessionMock.findAdminSession.mockReturnValue({ id: 'adm_xyz', expiresAt: '2099-01-01T00:00:00Z' });
    expect(verifyAdminRequest(req)).toBe(true);
  });

  it('verifyAdminRequest returns false for missing cookie', () => {
    const req = new NextRequest('http://localhost/admin');
    expect(verifyAdminRequest(req)).toBe(false);
  });

  it('verifyAdminRequest returns false for expired session', () => {
    sessionMock.findAdminSession.mockReturnValue(null);
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=expired-cookie' },
    });
    expect(verifyAdminRequest(req)).toBe(false);
  });

  it('extractSessionIdFromRequest returns id for valid cookie', () => {
    sessionMock.findAdminSession.mockReturnValue({ id: 'adm_session1', expiresAt: '2099-01-01T00:00:00Z' });
    const req = new NextRequest('http://localhost/admin', {
      headers: { cookie: 'tg_admin=valid-cookie' },
    });
    expect(extractSessionIdFromRequest(req)).toBe('adm_session1');
  });

  it('extractSessionIdFromRequest returns null for missing cookie', () => {
    const req = new NextRequest('http://localhost/admin');
    expect(extractSessionIdFromRequest(req)).toBeNull();
  });

  it('adminLogout deletes session and clears cookie', async () => {
    sessionMock.deleteAdminSession.mockReturnValue(undefined);
    const response = await adminLogout('adm_test');
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
  });
});
