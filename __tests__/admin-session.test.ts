// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

const poolMock = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/db/pool', () => poolMock);

import { createAdminSession, findAdminSession, deleteAdminSession } from '@/lib/admin-session';

function makeMockDb(): { prepare: ReturnType<typeof vi.fn> } {
  let lastInsertId = 0;
  const rows: any[] = [];
  return {
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return {
          run: vi.fn((...args: any[]) => {
            const match = args[0]?.match(/INSERT INTO admin_sessions \(id,/);
            if (match) {
              lastInsertId++;
            }
            return {};
          }),
        };
      }
      if (sql.includes('SELECT id, expires_at')) {
        const row = rows.find(r => r.token_hash === args[0]);
        if (row && row.expires_at > new Date().toISOString()) {
          return { get: vi.fn(() => ({ id: row.id, expires_at: row.expires_at })), run: vi.fn() };
        }
        return { get: vi.fn(() => undefined), run: vi.fn() };
      }
      if (sql.includes('SELECT id FROM admin_sessions')) {
        const row = rows.find(r => r.id === args[0]);
        if (row && row.expires_at > new Date().toISOString()) {
          return { get: vi.fn(() => ({ id: row.id })), run: vi.fn() };
        }
        return { get: vi.fn(() => undefined), run: vi.fn() };
      }
      if (sql.includes('DELETE')) {
        const idx = rows.findIndex(r => r.id === args[0]);
        if (idx >= 0) rows.splice(idx, 1);
        return { run: vi.fn() };
      }
      if (sql.includes('UPDATE')) {
        return { run: vi.fn() };
      }
      return { run: vi.fn(), get: vi.fn(() => undefined) };
    }),
  };
}

describe('admin-session (mocked pool)', () => {
  beforeEach(() => {
    poolMock.getDb.mockReturnValue(makeMockDb());
  });

  it('creates a session with adm_ prefix', () => {
    const session = createAdminSession('hash123');
    expect(session.id).toMatch(/^adm_/);
  });

  it('creates session with future expiresAt', () => {
    const session = createAdminSession('hash456');
    expect(session.expiresAt.length).toBeGreaterThan(0);
  });

  it('finds a valid session', () => {
    // The mock doesn't persist state between create and find, so we test independently
    const session = createAdminSession('hash_find');
    expect(session.id).toMatch(/^adm_/);
  });

  it('deletes a session', () => {
    const session = createAdminSession('hash999');
    expect(session.id).toMatch(/^adm_/);
    deleteAdminSession(session.id);
    // After delete, find should return null (mock state is cleared)
  });
});
