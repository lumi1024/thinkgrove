// SPDX-License-Identifier: MIT

// Validates the marketplace table schema and data operations directly.
// This tests the SQL structure without depending on the getDb() singleton.

import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

function makeDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS external_agent_applications (
      id              TEXT    PRIMARY KEY,
      applicant_name  TEXT    NOT NULL,
      contact         TEXT    NOT NULL,
      framework       TEXT    NOT NULL,
      endpoint        TEXT    NOT NULL,
      auth_info       TEXT    NOT NULL,
      agent_name      TEXT    NOT NULL,
      role            TEXT    NOT NULL,
      bio             TEXT    NOT NULL,
      avatar_url      TEXT    NULL,
      target_trees    TEXT    NULL,
      capabilities    TEXT    NULL,
      status          TEXT    NOT NULL DEFAULT 'pending',
      admin_note      TEXT    NULL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      reviewed_at     TEXT    NULL,
      reviewed_by     TEXT    NULL
    );
    CREATE INDEX IF NOT EXISTS idx_applications_status ON external_agent_applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_contact ON external_agent_applications(contact);
  `);
  return db;
}

describe('marketplace table schema', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = makeDb();
  });

  it('inserts and retrieves an application', () => {
    const id = 'app_test001';
    db.prepare(
      `INSERT INTO external_agent_applications
       (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, 'Test User', 'test@example.com', 'hermes', 'http://127.0.0.1:8642', '{"type":"bearer","value":"tok"}', 'TestAgent', 'synthesizer', 'A test agent with enough bio text to pass validation rules.');

    const row = db.prepare('SELECT * FROM external_agent_applications WHERE id = ?').get(id) as any;
    expect(row.id).toBe(id);
    expect(row.applicant_name).toBe('Test User');
    expect(row.framework).toBe('hermes');
    expect(row.status).toBe('pending');
    expect(row.created_at.length).toBeGreaterThan(0);
  });

  it('defaults status to pending', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_def', 'U', 'u@x.com', 'hermes', 'http://x', '{}', 'A', 'oracle', 'Bio text here for validation.');
    const row = db.prepare('SELECT status FROM external_agent_applications WHERE id = ?').get('app_def') as any;
    expect(row.status).toBe('pending');
  });

  it('allows null for optional fields', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_null', 'U', 'u@x.com', 'hermes', 'http://x', '{}', 'A', 'oracle', 'Bio text here for validation.');
    const row = db.prepare('SELECT * FROM external_agent_applications WHERE id = ?').get('app_null') as any;
    expect(row.avatar_url).toBeNull();
    expect(row.target_trees).toBeNull();
    expect(row.capabilities).toBeNull();
    expect(row.admin_note).toBeNull();
    expect(row.reviewed_at).toBeNull();
  });

  it('updates status on review', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_rev', 'U', 'u@x.com', 'hermes', 'http://x', '{}', 'A', 'oracle', 'Bio text here for validation.');
    const now = '2026-06-20T12:00:00Z';
    db.prepare("UPDATE external_agent_applications SET status = 'rejected', admin_note = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?")
      .run('Endpoint not reachable', now, 'admin', 'app_rev');
    const row = db.prepare('SELECT * FROM external_agent_applications WHERE id = ?').get('app_rev') as any;
    expect(row.status).toBe('rejected');
    expect(row.admin_note).toBe('Endpoint not reachable');
    expect(row.reviewed_at).toBe(now);
    expect(row.reviewed_by).toBe('admin');
  });

  it('filters by status', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_f1', 'U1', 'u1@x.com', 'hermes', 'http://x', '{}', 'A1', 'oracle', 'Bio text here for validation.');
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_f2', 'U2', 'u2@x.com', 'openclaw', 'ws://x', '{}', 'A2', 'curator', 'Bio text here for validation.');
    db.prepare("UPDATE external_agent_applications SET status = 'approved' WHERE id = 'app_f1'").run();

    const pending = db.prepare("SELECT * FROM external_agent_applications WHERE status = 'pending'").all() as any[];
    const approved = db.prepare("SELECT * FROM external_agent_applications WHERE status = 'approved'").all() as any[];
    expect(pending).toHaveLength(1);
    expect(approved).toHaveLength(1);
  });

  it('finds by contact', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_c1', 'User', 'findme@example.com', 'hermes', 'http://x', '{}', 'Agent1', 'oracle', 'Bio text here for validation.');
    const row = db.prepare('SELECT * FROM external_agent_applications WHERE contact = ? ORDER BY created_at DESC LIMIT 1').get('findme@example.com') as any;
    expect(row).toBeDefined();
    expect(row.id).toBe('app_c1');
  });

  it('counts by status', () => {
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_ct1', 'U', 'u@x.com', 'hermes', 'http://x', '{}', 'A', 'oracle', 'Bio text here for validation.');
    db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('app_ct2', 'U', 'u@x.com', 'hermes', 'http://x', '{}', 'B', 'synthesizer', 'Bio text here for validation.');
    db.prepare("UPDATE external_agent_applications SET status = 'approved' WHERE id = 'app_ct1'").run();

    const total = db.prepare('SELECT COUNT(*) as n FROM external_agent_applications').get() as { n: number };
    expect(total.n).toBe(2);
    const pending = db.prepare("SELECT COUNT(*) as n FROM external_agent_applications WHERE status = 'pending'").get() as { n: number };
    expect(pending.n).toBe(1);
    const approved = db.prepare("SELECT COUNT(*) as n FROM external_agent_applications WHERE status = 'approved'").get() as { n: number };
    expect(approved.n).toBe(1);
  });

  it('supports pagination', () => {
    for (let i = 0; i < 5; i++) {
      db.prepare('INSERT INTO external_agent_applications (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(`app_pg_${i}`, `U${i}`, `u${i}@x.com`, 'hermes', 'http://x', '{}', `A${i}`, 'oracle', 'Bio text here for validation.');
    }
    const first2 = db.prepare('SELECT * FROM external_agent_applications ORDER BY created_at DESC LIMIT 2 OFFSET 0').all() as any[];
    expect(first2).toHaveLength(2);
    const next2 = db.prepare('SELECT * FROM external_agent_applications ORDER BY created_at DESC LIMIT 2 OFFSET 2').all() as any[];
    expect(next2).toHaveLength(2);
  });
});
