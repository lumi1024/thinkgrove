// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const adminAuthMock = vi.hoisted(() => ({
  adminLogin: vi.fn(),
  isAdminConfigured: vi.fn(() => true),
  adminLogout: vi.fn(),
}));

vi.mock('@/lib/admin-auth', () => adminAuthMock);
vi.mock('@/lib/db/init', () => ({ ensureInit: vi.fn(() => true) }));
vi.mock('@/lib/db/pool', () => ({ getDb: vi.fn() }));

import { POST as postLogin } from '@/app/api/admin/login/route';
import { DELETE as deleteLogout } from '@/app/api/admin/logout/route';

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    adminAuthMock.adminLogin.mockReset();
  });

  it('returns 400 for missing adminKey', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postLogin(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 for invalid key', async () => {
    adminAuthMock.adminLogin.mockResolvedValue({ success: false });
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminKey: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postLogin(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('invalid admin key');
  });

  it('returns 200 for valid key', async () => {
    adminAuthMock.adminLogin.mockResolvedValue({ success: true, sessionId: 'adm_abc123' });
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminKey: 'correct-key' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postLogin(req);
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it('returns 503 when admin not configured', async () => {
    adminAuthMock.isAdminConfigured.mockReturnValueOnce(false);
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminKey: 'anything' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await postLogin(req);
    expect(res.status).toBe(503);
  });
});

describe('DELETE /api/admin/logout', () => {
  it('returns 200 and clears cookie', async () => {
    adminAuthMock.adminLogout.mockReturnValue(Promise.resolve(NextResponse.json({ ok: true })));
    const res = await deleteLogout();
    expect(res.status).toBe(200);
    expect(adminAuthMock.adminLogout).toHaveBeenCalledOnce();
  });
});
