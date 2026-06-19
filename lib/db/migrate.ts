// SPDX-License-Identifier: MIT

// ThinkGrove · Database migration runner.
// Reads .sql files from lib/db/migrations/ in order, tracks applied
// versions in a schema_migrations table. Idempotent — safe to call
// on every startup.

import fs from 'fs';
import path from 'path';
import { getDb } from './pool';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export function ensureMigrated(): void {
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
    .filter((f) => /^\d{3}_.+\.sql$/.test(f))
    .sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
  }
}
