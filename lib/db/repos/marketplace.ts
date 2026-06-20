// SPDX-License-Identifier: MIT

import { getDb } from '@/lib/db/pool';

export interface DbApplication {
  id: string;
  applicant_name: string;
  contact: string;
  framework: string;
  endpoint: string;
  auth_info: string;
  agent_name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  target_trees: string | null;
  capabilities: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function createApplication(a: {
  id: string;
  applicant_name: string;
  contact: string;
  framework: string;
  endpoint: string;
  auth_info: string;
  agent_name: string;
  role: string;
  bio: string;
  avatar_url?: string | null;
  target_trees?: string | null;
  capabilities?: string | null;
}): DbApplication {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO external_agent_applications
     (id, applicant_name, contact, framework, endpoint, auth_info, agent_name, role, bio, avatar_url, target_trees, capabilities, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(a.id, a.applicant_name, a.contact, a.framework, a.endpoint, a.auth_info, a.agent_name, a.role, a.bio,
    a.avatar_url ?? null, a.target_trees ?? null, a.capabilities ?? null, now);
  return getApplication(a.id)!;
}

export function getApplication(id: string): DbApplication | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM external_agent_applications WHERE id = ? LIMIT 1').get(id) as DbApplication | undefined;
  return row ?? null;
}

export function listApplications(status?: string, limit = 50, offset = 0): DbApplication[] {
  const db = getDb();
  if (status) {
    return db.prepare('SELECT * FROM external_agent_applications WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(status, limit, offset) as DbApplication[];
  }
  return db.prepare('SELECT * FROM external_agent_applications ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as DbApplication[];
}

export function getApplicationByContact(contact: string): DbApplication | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM external_agent_applications WHERE contact = ? ORDER BY created_at DESC LIMIT 1').get(contact) as DbApplication | undefined;
  return row ?? null;
}

export function countApplications(status?: string): number {
  const db = getDb();
  if (status) {
    const row = db.prepare('SELECT COUNT(*) as n FROM external_agent_applications WHERE status = ?').get(status) as { n: number };
    return row.n;
  }
  const row = db.prepare('SELECT COUNT(*) as n FROM external_agent_applications').get() as { n: number };
  return row.n;
}

export function reviewApplication(id: string, status: 'approved' | 'rejected', adminNote: string | null): DbApplication | null {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE external_agent_applications SET status = ?, admin_note = ?, reviewed_at = ?, reviewed_by = 'admin' WHERE id = ?`,
  ).run(status, adminNote, now, id);
  return getApplication(id);
}
