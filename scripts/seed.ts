// SPDX-License-Identifier: MIT

// Standalone seed script.
// Usage: npx tsx scripts/seed.ts
// Creates and populates the SQLite database from canonical YAML config.

import { seedIfEmpty } from '../lib/db/seed';
import { ensureMigrated } from '../lib/db/migrate';

function main() {
  console.log('[seed] Running migrations...');
  ensureMigrated();
  console.log('[seed] Seeding data...');
  const result = seedIfEmpty();
  if (result) {
    console.log('[seed] Done. Database is ready at data/forest.db');
  } else {
    console.log('[seed] Failed.');
    process.exit(1);
  }
}

main();
