// SPDX-License-Identifier: MIT

// ThinkGrove · better-sqlite3 database singleton.
//
// better-sqlite3 is synchronous, so there is no pool. We open one
// connection at startup and share it. The singleton is lazy so tests
// and offline-mode code paths don't need a DB at all.

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.KF_DB_PATH || path.join(process.cwd(), 'data', 'forest.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });
    _db = new Database(DB_PATH, { timeout: 5000 });
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// Test-only: reset the singleton so the next getDb() opens a fresh connection.
export function _resetDbForTest(): void {
  closeDb();
}
