// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

function freshDb(): Database.Database {
  return new Database(':memory:');
}

describe('init schema', () => {
  it('creates all tables and indexes', () => {
    const db = freshDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
        kind TEXT NOT NULL, model TEXT NULL, provider TEXT NULL, role TEXT NOT NULL,
        signature TEXT NULL, joined_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY, voter_id TEXT NOT NULL, target_type TEXT NOT NULL,
        target_id TEXT NOT NULL, weight REAL NOT NULL DEFAULT 1.0, ts TEXT NOT NULL,
        UNIQUE(voter_id, target_type, target_id)
      );
    `);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const names = tables.map((t) => t.name);
    expect(names).toContain('users');
    expect(names).toContain('votes');
  });

  it('enforces UNIQUE(voter_id, target_type, target_id)', () => {
    const db = freshDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE);
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY, voter_id TEXT NOT NULL, target_type TEXT NOT NULL,
        target_id TEXT NOT NULL, weight REAL, ts TEXT NOT NULL,
        UNIQUE(voter_id, target_type, target_id)
      );
    `);
    db.prepare('INSERT INTO users VALUES (?, ?)').run('u1', 'h1');
    db.prepare('INSERT INTO votes VALUES (?, ?, ?, ?, ?, ?)').run('v1', 'u1', 'dispute', 'd1', 1, '2026-01-01');
    expect(() =>
      db.prepare('INSERT INTO votes VALUES (?, ?, ?, ?, ?, ?)').run('v2', 'u1', 'dispute', 'd1', -1, '2026-01-01'),
    ).toThrow();
  });
});

describe('upsertUser + castVote', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = freshDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
        kind TEXT NOT NULL, model TEXT NULL, provider TEXT NULL, role TEXT NOT NULL,
        signature TEXT NULL, joined_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY, voter_id TEXT NOT NULL, target_type TEXT NOT NULL,
        target_id TEXT NOT NULL, weight REAL NOT NULL DEFAULT 1.0, ts TEXT NOT NULL,
        UNIQUE(voter_id, target_type, target_id)
      );
    `);
  });

  it('inserts a new user', () => {
    db.prepare(
      `INSERT INTO users (id, handle, display_name, kind, model, provider, role, signature, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run('u1', 'h1', 'Alice', 'human', null, null, 'reader', null, '2026-01-01');
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get('u1') as Record<string, unknown>;
    expect(row.display_name).toBe('Alice');
    expect(row.model).toBeNull();
  });

  it('upserts user on duplicate id', () => {
    db.prepare(
      `INSERT INTO users (id, handle, display_name, kind, model, provider, role, signature, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, role = excluded.role`,
    ).run('u1', 'h1', 'Alice', 'human', null, null, 'reader', null, '2026-01-01');
    db.prepare(
      `INSERT INTO users (id, handle, display_name, kind, model, provider, role, signature, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, role = excluded.role`,
    ).run('u1', 'h1', 'Alice v2', 'human', null, null, 'writer', null, '2026-01-01');
    const row = db.prepare('SELECT display_name, role FROM users WHERE id = ?').get('u1') as Record<string, unknown>;
    expect(row.display_name).toBe('Alice v2');
    expect(row.role).toBe('writer');
  });

  it('castVote inserts, then upserts on repeat', () => {
    const insert = db.prepare(
      `INSERT INTO votes (id, voter_id, target_type, target_id, weight, ts)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(voter_id, target_type, target_id) DO UPDATE SET weight = excluded.weight, ts = excluded.ts`,
    );
    insert.run('v1', 'u1', 'dispute', 'd1', 1);
    expect((db.prepare('SELECT COUNT(*) AS n FROM votes').get() as { n: number }).n).toBe(1);
    insert.run('v2', 'u1', 'dispute', 'd1', -1);
    expect((db.prepare('SELECT COUNT(*) AS n FROM votes').get() as { n: number }).n).toBe(1);
    expect((db.prepare('SELECT weight FROM votes').get() as { weight: number }).weight).toBe(-1);
  });

  it('allows voting on different targets', () => {
    const insert = db.prepare(
      `INSERT INTO votes (id, voter_id, target_type, target_id, weight, ts)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(voter_id, target_type, target_id) DO UPDATE SET weight = excluded.weight, ts = excluded.ts`,
    );
    insert.run('v1', 'u1', 'dispute', 'd1', 1);
    insert.run('v2', 'u1', 'dispute', 'd2', 1);
    expect((db.prepare('SELECT COUNT(*) AS n FROM votes').get() as { n: number }).n).toBe(2);
  });
});
