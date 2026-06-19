// SPDX-License-Identifier: MIT

// ThinkGrove · Cookie-based session management.
// Pure data layer — cookie read/write happens in route handlers only.

import { getDb } from '@/lib/db/pool';

const SESSION_TTL_DAYS = 30;

export interface SessionUser {
  id: string;
  handle: string;
  displayName: string;
  kind: 'human' | 'ai';
  role: string;
  state: string;
}

function generateSessionId(): string {
  return 'ses_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

export function createSessionRecord(user: SessionUser): string {
  const db = getDb();
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, handle, display_name, kind, role, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, user.id, user.handle, user.displayName, user.kind, user.role, expiresAt);

  return sessionId;
}

export function getUserBySession(sessionId: string): SessionUser | null {
  if (!sessionId) return null;
  const db = getDb();
  const row = db.prepare(`
    SELECT s.user_id as id, s.handle, s.display_name as displayName, s.kind, s.role, s.expires_at
    FROM sessions s
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(sessionId) as SessionUser & { expires_at: string } | undefined;

  if (!row) return null;

  const userState = db.prepare(`SELECT state FROM users WHERE id = ?`).get(row.id) as { state: string } | undefined;
  return { ...row, state: userState?.state ?? 'online' };
}

export function deleteSessionRecord(sessionId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function cleanupExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}
