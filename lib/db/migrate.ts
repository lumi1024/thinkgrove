// SPDX-License-Identifier: MIT

// ThinkGrove · Database migration runner.
// Reads .sql and .ts migration helpers from lib/db/migrations/ in order,
// tracks applied versions in a schema_migrations table. Idempotent — safe to
// call on every startup.

import fs from 'fs';
import path from 'path';
import { getDb } from './pool';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export async function ensureMigrated(): Promise<void> {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r: any) => r.version),
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{3}_.+\.(sql|ts)$/.test(f))
    .sort();

  const TEMP_TABLES = new Set(['questions_new', 'branches_new', 'answers_new', 'citations_new', 'disputes_new']);

  for (const file of files) {
    const version = file.replace(/\.sql$/, '').replace(/\.ts$/, '');
    if (applied.has(version)) continue;

    const migrationPath = path.join(MIGRATIONS_DIR, file);
    try {
      if (file.endsWith('.sql')) {
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        db.exec(sql);
      } else {
        await import(migrationPath).then((module) => module.default(db));
      }
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
    } catch (error) {
      db.exec("DELETE FROM schema_migrations WHERE version = ?").run(version);
      for (const table of TEMP_TABLES) {
        try { db.exec(`DROP TABLE IF EXISTS ${table}`); } catch { /* ignore cleanup errors */ }
      }
      try { db.exec(`DROP INDEX IF EXISTS idx_questions_domain`); } catch { /* ignore cleanup errors */ }
      try { db.exec(`DROP INDEX IF EXISTS idx_questions_subdomain`); } catch { /* ignore cleanup errors */ }
      try { db.exec(`DROP INDEX IF EXISTS idx_questions_open`); } catch { /* ignore cleanup errors */ }
      try { db.exec(`DROP INDEX IF EXISTS idx_questions_status`); } catch { /* ignore cleanup errors */ }
      throw error;
    }
  }
}
