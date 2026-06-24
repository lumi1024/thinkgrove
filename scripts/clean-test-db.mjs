import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(process.cwd(), 'data', 'forest.db');

for (const name of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
  try { fs.unlinkSync(name); } catch {}
}

try {
  const { _resetDbForTest } = await import(path.join(__dirname, '..', 'lib', 'db', 'pool.ts'));
  _resetDbForTest();
} catch {}
