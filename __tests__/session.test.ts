// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

// ── In-memory DB ────────────────────────────────────────────────────────────
const db = new Database(':memory:');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, handle TEXT NOT NULL, display_name TEXT NOT NULL,
    kind TEXT NOT NULL, model TEXT NULL, provider TEXT NULL, role TEXT NOT NULL,
    signature TEXT NULL, joined_at TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'online'
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, handle TEXT NOT NULL,
    display_name TEXT NOT NULL, kind TEXT NOT NULL, role TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')), expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function seedUser(id: string): void {
  db.prepare(`INSERT OR REPLACE INTO users (id, handle, display_name, kind, role, joined_at, state)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, `u_${id}`, `User ${id}`, 'human', 'reader', '2026-01-01', 'online');
}

// ── Mock pool BEFORE importing session module ───────────────────────────────
vi.mock('@/lib/db/pool', () => ({
  getDb: () => db,
  closeDb: () => {},
  _resetDbForTest: () => {},
}));

import { createSessionRecord, getUserBySession, deleteSessionRecord, cleanupExpiredSessions } from '@/lib/auth/session';

beforeEach(() => {
  db.exec("DELETE FROM sessions");
});

describe('createSessionRecord', () => {
  beforeEach(() => { seedUser('usr_a'); });

  it('generates a session id with ses_ prefix', () => {
    const sid = createSessionRecord({
      id: 'usr_a', handle: 'u_a', displayName: 'User A', kind: 'human', role: 'reader', state: 'online',
    });
    expect(sid).toMatch(/^ses_[a-z0-9]+$/);
    expect(sid.length).toBeGreaterThan(10);
  });

  it('stores the session with correct fields', () => {
    const sid = createSessionRecord({
      id: 'usr_a', handle: 'u_a', displayName: 'User A', kind: 'human', role: 'reader', state: 'online',
    });
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid) as any;
    expect(row.user_id).toBe('usr_a');
    expect(row.handle).toBe('u_a');
    expect(row.kind).toBe('human');
  });
});

describe('getUserBySession', () => {
  beforeEach(() => { seedUser('usr_b'); });

  it('returns the user for a valid session', () => {
    const sid = createSessionRecord({
      id: 'usr_b', handle: 'u_b', displayName: 'User B', kind: 'human', role: 'reader', state: 'online',
    });
    const user = getUserBySession(sid);
    expect(user).not.toBeNull();
    expect(user!.id).toBe('usr_b');
    expect(user!.handle).toBe('u_b');
  });

  it('returns null for empty id', () => {
    expect(getUserBySession('')).toBeNull();
  });

  it('returns null for unknown session', () => {
    expect(getUserBySession('ses_unknown')).toBeNull();
  });

  it('returns null for expired session', () => {
    const sid = createSessionRecord({
      id: 'usr_b', handle: 'u_b', displayName: 'User B', kind: 'human', role: 'reader', state: 'online',
    });
    db.prepare("UPDATE sessions SET expires_at = '2000-01-01' WHERE id = ?").run(sid);
    expect(getUserBySession(sid)).toBeNull();
  });
});

describe('deleteSessionRecord', () => {
  beforeEach(() => { seedUser('usr_c'); });

  it('removes the session', () => {
    const sid = createSessionRecord({
      id: 'usr_c', handle: 'u_c', displayName: 'User C', kind: 'human', role: 'reader', state: 'online',
    });
    deleteSessionRecord(sid);
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid) as any | undefined;
    expect(row).toBeUndefined();
  });

  it('is a no-op for missing id', () => {
    expect(() => deleteSessionRecord('ses_missing')).not.toThrow();
  });
});

describe('cleanupExpiredSessions', () => {
  beforeEach(() => {
    seedUser('usr_d');
    seedUser('usr_e');
  });

  it('keeps valid, removes expired', () => {
    const validSid = createSessionRecord({
      id: 'usr_d', handle: 'u_d', displayName: 'User D', kind: 'human', role: 'reader', state: 'online',
    });
    const expiredSid = createSessionRecord({
      id: 'usr_e', handle: 'u_e', displayName: 'User E', kind: 'human', role: 'reader', state: 'online',
    });
    db.prepare("UPDATE sessions SET expires_at = '2000-01-01' WHERE id = ?").run(expiredSid);
    cleanupExpiredSessions();
    expect(db.prepare('SELECT id FROM sessions WHERE id = ?').get(validSid)).toBeDefined();
    expect(db.prepare('SELECT id FROM sessions WHERE id = ?').get(expiredSid)).toBeUndefined();
  });
});

describe('session id uniqueness', () => {
  it('generates 100 unique ids', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const uid = `u_uniq_${i}`;
      seedUser(uid);
      ids.add(createSessionRecord({
        id: uid, handle: `u_${i}`, displayName: `U${i}`, kind: 'human', role: 'reader', state: 'online',
      }));
    }
    expect(ids.size).toBe(100);
  });
});
