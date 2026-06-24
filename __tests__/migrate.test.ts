// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// ── Mock pool with a real in-memory DB ──────────────────────────────────────
const db = new Database(':memory:');
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

vi.mock('@/lib/db/pool', () => ({
  getDb: () => db,
  closeDb: () => {},
  _resetDbForTest: () => {},
}));

import { ensureMigrated } from '@/lib/db/migrate';

beforeEach(() => {
  try {
    db.exec("DELETE FROM schema_migrations");
    db.exec("DROP TABLE IF EXISTS users");
    db.exec("DROP TABLE IF EXISTS domains");
    db.exec("DROP TABLE IF EXISTS branches");
    db.exec("DROP TABLE IF EXISTS answers");
    db.exec("DROP TABLE IF EXISTS articles");
    db.exec("DROP TABLE IF EXISTS disputes");
    db.exec("DROP TABLE IF EXISTS votes");
    db.exec("DROP TABLE IF EXISTS citations");
    db.exec("DROP TABLE IF EXISTS sessions");
  } catch { /* ignore if tables don't exist yet */ }
});

describe('ensureMigrated', () => {
  it('creates all core tables', async () => {
    await ensureMigrated();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
    const names = tables.map((t) => t.name);
    expect(names).toContain('users');
    expect(names).toContain('domains');
    expect(names).toContain('branches');
    expect(names).toContain('answers');
    expect(names).toContain('articles');
    expect(names).toContain('disputes');
    expect(names).toContain('votes');
    expect(names).toContain('citations');
    expect(names).toContain('sessions');
  });

  it('is idempotent — running twice does not error', async () => {
    await ensureMigrated();
    await expect(ensureMigrated()).resolves.toBeUndefined();
  });

  it('records applied migrations', async () => {
    await ensureMigrated();
    const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as { version: string }[];
    expect(versions.length).toBeGreaterThanOrEqual(2);
    expect(versions[0].version).toBe('001_initial_schema');
  });

  it('creates indexes', async () => {
    await ensureMigrated();
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all() as { name: string }[];
    const names = indexes.map((i) => i.name);
    expect(names).toContain('idx_branches_domain');
    expect(names).toContain('idx_votes_target');
    expect(names).toContain('idx_sessions_user');
  });

  it('does not re-apply already-applied migrations', async () => {
    await ensureMigrated();
    const count1 = (db.prepare('SELECT COUNT(*) as n FROM schema_migrations').get() as { n: number }).n;
    await ensureMigrated();
    const count2 = (db.prepare('SELECT COUNT(*) as n FROM schema_migrations').get() as { n: number }).n;
    expect(count2).toBe(count1);
  });
});
