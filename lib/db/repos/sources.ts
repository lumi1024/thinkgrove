// SPDX-License-Identifier: MIT

import { getDb } from '../pool';

export interface DbSource {
  id: string;
  domain_id: string;
  subdomain_id: string | null;
  question_id: string | null;
  title: string;
  url: string;
  summary_md: string | null;
  source_kind: 'web' | 'paper' | 'report' | 'internal' | 'external_api';
  authority_score: number;
  freshness_score: number;
  collected_by: string;
  collection_agent_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  archived_at: string | null;
}

export function createSource(source: DbSource): void {
  getDb().prepare(
    `INSERT INTO sources (id, domain_id, subdomain_id, question_id, title, url, summary_md, source_kind, authority_score, freshness_score, collected_by, collection_agent_id, created_at, reviewed_at, archived_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    source.id,
    source.domain_id,
    source.subdomain_id,
    source.question_id,
    source.title,
    source.url,
    source.summary_md,
    source.source_kind,
    source.authority_score,
    source.freshness_score,
    source.collected_by,
    source.collection_agent_id,
    source.created_at,
    source.reviewed_at,
    source.archived_at,
  );
}

export function getSource(id: string): DbSource | null {
  const row = getDb().prepare('SELECT * FROM sources WHERE id = ? LIMIT 1').get(id) as DbSource | undefined;
  return row ?? null;
}

export function listSourcesByQuestion(questionId: string): DbSource[] {
  return getDb().prepare('SELECT * FROM sources WHERE question_id = ? ORDER BY created_at DESC').all(questionId) as DbSource[];
}

export function listSourcesByDomain(domainId: string, limit = 50): DbSource[] {
  return getDb().prepare('SELECT * FROM sources WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?').all(domainId, limit) as DbSource[];
}

export function updateSource(id: string, updates: Partial<DbSource>): void {
  const allowed = ['title', 'url', 'summary_md', 'source_kind', 'authority_score', 'freshness_score', 'reviewed_at', 'archived_at'] as const;
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
  getDb().prepare(`UPDATE sources SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}
