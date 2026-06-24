// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

function freshDb(): Database.Database {
  return new Database(':memory:');
}

function runMigrations(db: Database.Database): void {
  const migrationsDir = join(__dirname, '..', 'lib', 'db', 'migrations');
  const files = require('fs')
    .readdirSync(migrationsDir)
    .filter((file: string) => /^\d{3}_.+\.sql$/.test(file))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }
}

describe('knowledge model migration', () => {
  it('adds subdomain/question/source tables and new columns', () => {
    const db = freshDb();
    runMigrations(db);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
    const names = tables.map((table) => table.name);
    expect(names).toContain('subdomains');
    expect(names).toContain('questions');
    expect(names).toContain('sources');

    const branchesCols = db.prepare('PRAGMA table_info(branches)').all() as { name: string }[];
    expect(branchesCols.map((col) => col.name)).toContain('question_id');

    const answersCols = db.prepare('PRAGMA table_info(answers)').all() as { name: string }[];
    expect(answersCols.map((col) => col.name)).toEqual(
      expect.arrayContaining(['question_id', 'confidence', 'source_ids', 'answer_kind']),
    );

    const citationsCols = db.prepare('PRAGMA table_info(citations)').all() as { name: string }[];
    expect(citationsCols.map((col) => col.name)).toEqual(
      expect.arrayContaining(['from_type', 'to_type']),
    );

    const disputesCols = db.prepare('PRAGMA table_info(disputes)').all() as { name: string }[];
    expect(disputesCols.map((col) => col.name)).toEqual(
      expect.arrayContaining(['target_type']),
    );
  });

  it('allows source citations and source disputes', () => {
    const db = freshDb();
    runMigrations(db);

    db.prepare(
      `INSERT INTO users (id, handle, display_name, kind, role, joined_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run('u1', 'u1', 'User', 'human', 'reader', '2026-01-01');
    db.prepare(
      `INSERT INTO domains (id, code, name, color, description, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run('ai', 'ai', 'AI', '#0ea5e9', 'Models', 'tree');
    db.prepare('INSERT INTO subdomains (id, domain_id, code, name) VALUES (?, ?, ?, ?)').run('sub_1', 'ai', 'llm', 'LLM');
    db.prepare('INSERT INTO questions (id, domain_id, title, created_by) VALUES (?, ?, ?, ?)').run('q_1', 'ai', 'What is LLM?', 'u1');
    db.prepare('INSERT INTO sources (id, domain_id, question_id, title, url, collected_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run('src_1', 'ai', 'q_1', 'Source', 'https://example.com', 'u1', '2026-01-01');

    const insertCitation = db.prepare('INSERT INTO citations (id, from_type, from_id, to_type, to_id, relation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertCitation.run('c_1', 'answer', 'an_1', 'source', 'src_1', 'cite', '2026-01-01');

    const insertDispute = db.prepare('INSERT INTO disputes (id, target_type, target_id, opened_by, reason, opened_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertDispute.run('d_1', 'source', 'src_1', 'u1', 'stale', '2026-01-01');

    expect((db.prepare("SELECT COUNT(*) AS n FROM citations WHERE to_type = 'source'").get() as { n: number }).n).toBe(1);
    expect((db.prepare("SELECT COUNT(*) AS n FROM disputes WHERE target_type = 'source'").get() as { n: number }).n).toBe(1);
  });
});
