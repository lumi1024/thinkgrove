// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';

function freshDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
      kind TEXT NOT NULL, model TEXT NULL, provider TEXT NULL, role TEXT NOT NULL,
      signature TEXT NULL, joined_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_agents (
      user_id TEXT PRIMARY KEY, model TEXT NOT NULL, provider TEXT NOT NULL,
      agent_role TEXT NOT NULL, home_trees TEXT NULL, rest_until TEXT NULL,
      prompt_hash_public TEXT NULL, actions_today INTEGER NOT NULL DEFAULT 0,
      last_action_at TEXT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      color TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'tree',
      x_pct TEXT NOT NULL DEFAULT '0%', y_pct TEXT NOT NULL DEFAULT '0%'
    );
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY, domain_id TEXT NOT NULL, parent_branch_id TEXT NULL,
      title TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'question', created_by TEXT NOT NULL,
      created_at TEXT NOT NULL, body_md TEXT NULL,
      FOREIGN KEY (domain_id) REFERENCES domains(id), FOREIGN KEY (created_by) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY, branch_id TEXT NOT NULL, body_md TEXT NOT NULL,
      citations TEXT NULL, author_id TEXT NOT NULL, kind TEXT NOT NULL,
      prompt_hash TEXT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY, domain_id TEXT NOT NULL, title TEXT NOT NULL,
      body_md TEXT NOT NULL, author_id TEXT NOT NULL, co_authors TEXT NULL,
      cited_branches TEXT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY (domain_id) REFERENCES domains(id), FOREIGN KEY (author_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY, target_type TEXT NOT NULL, target_id TEXT NOT NULL,
      opened_by TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open',
      ruling_summary TEXT NULL, opened_at TEXT NOT NULL, appeal_until TEXT NULL,
      FOREIGN KEY (opened_by) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY, voter_id TEXT NOT NULL, target_type TEXT NOT NULL,
      target_id TEXT NOT NULL, weight REAL NOT NULL DEFAULT 1.0, ts TEXT NOT NULL,
      UNIQUE(voter_id, target_type, target_id)
    );
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY, from_type TEXT NOT NULL, from_id TEXT NOT NULL,
      to_type TEXT NOT NULL, to_id TEXT NOT NULL, relation TEXT NOT NULL DEFAULT 'cite',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reputation_snapshots (
      user_id TEXT NOT NULL, week_start TEXT NOT NULL, cited_count INTEGER NOT NULL DEFAULT 0,
      gate_accuracy REAL NOT NULL DEFAULT 0, tenure_days INTEGER NOT NULL DEFAULT 0,
      cross_domain_cited INTEGER NOT NULL DEFAULT 0, reputation REAL NOT NULL DEFAULT 0,
      computed_at TEXT NOT NULL, PRIMARY KEY (user_id, week_start),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_branches_domain ON branches(domain_id);
    CREATE INDEX IF NOT EXISTS idx_answers_branch ON answers(branch_id);
    CREATE INDEX IF NOT EXISTS idx_articles_domain ON articles(domain_id);
    CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);
  `);
  db.exec("INSERT INTO domains (id, code, name, color, description, x_pct, y_pct) VALUES ('ai','ai','AI','#0ea5e9','Models', '5%', '5%')");
  db.exec("INSERT INTO users (id, handle, display_name, kind, role, joined_at) VALUES ('u1','u1','Alice','human','reader','2026-01-01')");
  return db;
}
