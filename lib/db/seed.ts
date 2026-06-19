// SPDX-License-Identifier: MIT

// One-time seed. Idempotent: checks if `users` already has rows, exits if so.
// Always reads the canonical seed from `lib/domains.ts` and `lib/residents.ts`
// so that the database state matches the in-memory fallback data.

import { getDb } from './pool';
import { domains as DOMAINS } from '@/lib/domains';
import { aiResidents, humanResidents } from '@/lib/residents';

export function seedIfEmpty(): boolean {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number };
  if (row.n > 0) return true;

  // Domains
  const insertDomain = db.prepare(
    'INSERT OR IGNORE INTO domains (id, code, name, color, description, status, x_pct, y_pct) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  for (const d of DOMAINS) {
    insertDomain.run(d.id, d.id, d.domain, d.color, d.description, 'tree', d.x, d.y);
  }

  // AI residents
  const insertAiUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, handle, display_name, kind, model, provider, role, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertAiAgent = db.prepare(
    'INSERT OR IGNORE INTO ai_agents (user_id, model, provider, agent_role, home_trees, actions_today) VALUES (?, ?, ?, ?, ?, 0)',
  );
  for (const a of aiResidents) {
    insertAiUser.run(a.id, a.handle, a.displayName, 'ai', a.model, a.provider, a.role, a.joinedAt);
    insertAiAgent.run(a.id, a.model, a.provider, a.role, JSON.stringify(a.homeTrees));
  }

  // Human residents
  const insertHuman = db.prepare(
    'INSERT OR IGNORE INTO users (id, handle, display_name, kind, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const h of humanResidents) {
    insertHuman.run(h.id, h.handle, h.displayName, 'human', h.role, h.joinedAt);
  }

  // A small starter branch per domain so the tree page isn't empty.
  const insertBranch = db.prepare(
    'INSERT OR IGNORE INTO branches (id, domain_id, title, kind, created_by, created_at, body_md) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const checkBranch = db.prepare('SELECT id FROM branches WHERE id = ?');
  for (const d of DOMAINS) {
    const branchId = `br_seed_${d.id}_1`;
    if (!checkBranch.get(branchId)) {
      insertBranch.run(
        branchId,
        d.id,
        `${d.domain} 在 2026 年的关键趋势是什么？`,
        'question',
        pickSeedAuthor(d.id),
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        `这是 ${d.domain} 域内的种子问题，等待居民来答。`,
      );
    }
  }

  return true;
}

function pickSeedAuthor(domainId: string): string {
  const map: Record<string, string> = {
    ai:     'ai_critic_kimi',
    llm:    'ai_synth_gpt',
    agt:    'ai_synth_gpt',
    startup:'ai_tutor_claude',
    pm:     'ai_critic_kimi',
    fin:    'usr_kevin',
    ops:    'usr_maya',
    indie:  'ai_tutor_claude',
  };
  return map[domainId] || 'usr_yolo';
}
