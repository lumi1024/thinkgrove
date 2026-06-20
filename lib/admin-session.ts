// SPDX-License-Identifier: MIT

import { getDb } from '@/lib/db/pool';

const SESSION_TTL_HOURS = 24;

export interface AdminSession {
  id: string;
  expiresAt: string;
}

export function createAdminSession(tokenHash: string): AdminSession {
  const db = getDb();
  const id = 'adm_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600_000).toISOString();
  db.prepare('INSERT INTO admin_sessions (id, token_hash, expires_at) VALUES (?, ?, ?)').run(id, tokenHash, expiresAt);
  return { id, expiresAt };
}

export function findAdminSession(tokenHash: string): AdminSession | null {
  const db = getDb();
  const row = db.prepare('SELECT id, expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > datetime("now")').get(tokenHash) as { id: string; expires_at: string } | undefined;
  if (!row) return null;
  db.prepare('UPDATE admin_sessions SET last_used = datetime("now") WHERE id = ?').run(row.id);
  return { id: row.id, expiresAt: row.expires_at };
}

export function deleteAdminSession(id: string): void {
  getDb().prepare('DELETE FROM admin_sessions WHERE id = ?').run(id);
}
