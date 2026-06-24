// SPDX-License-Identifier: MIT

import { getDb } from '../pool';

export interface DbSubdomain {
  id: string;
  domain_id: string;
  code: string;
  name: string;
  description: string | null;
  status: 'sapling' | 'tree';
  position: string | null;
  created_at: string;
}

export function listSubdomains(domainId: string): DbSubdomain[] {
  return getDb().prepare('SELECT * FROM subdomains WHERE domain_id = ? ORDER BY code').all(domainId) as DbSubdomain[];
}

export function getSubdomain(id: string): DbSubdomain | null {
  const row = getDb().prepare('SELECT * FROM subdomains WHERE id = ? LIMIT 1').get(id) as DbSubdomain | undefined;
  return row ?? null;
}

export function getSubdomainByCode(domainId: string, code: string): DbSubdomain | null {
  const row = getDb().prepare('SELECT * FROM subdomains WHERE domain_id = ? AND code = ? LIMIT 1').get(domainId, code) as DbSubdomain | undefined;
  return row ?? null;
}

export function createSubdomain(subdomain: DbSubdomain): void {
  getDb().prepare(
    `INSERT OR IGNORE INTO subdomains (id, domain_id, code, name, description, status, position, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    subdomain.id,
    subdomain.domain_id,
    subdomain.code,
    subdomain.name,
    subdomain.description,
    subdomain.status,
    subdomain.position,
    subdomain.created_at,
  );
}

export function updateSubdomain(id: string, updates: Partial<DbSubdomain>): void {
  const allowed = ['name', 'description', 'status', 'position'] as const;
  const sets: string[] = [];
  const values: any[] = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (!sets.length) return;
  values.push(id);
  getDb().prepare(`UPDATE subdomains SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}
