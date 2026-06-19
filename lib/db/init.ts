// SPDX-License-Identifier: MIT

// ThinkGrove · Idempotent schema initializer for SQLite.
// Delegates DDL to lib/db/migrate.ts (migration-based schema management).
// Seed data is loaded after migrations complete.

import { ensureMigrated } from './migrate';
import { seedIfEmpty } from './seed';

export function ensureInit(): boolean {
  ensureMigrated();
  seedIfEmpty();
  return true;
}
