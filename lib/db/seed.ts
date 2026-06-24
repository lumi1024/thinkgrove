// SPDX-License-Identifier: MIT

// One-time seed. Idempotent: checks if `users` already has rows, exits if so.
// Always reads the canonical seed from `lib/domains.ts` and `lib/residents.ts`
// so that the database state matches the in-memory fallback data.

import { getDb } from './pool';
import { domains as DOMAINS } from '@/lib/domains';
import { aiResidents, humanResidents } from '@/lib/residents';

const SUBDOMAIN_DEFS: Record<string, { code: string; name: string; description: string }[]> = {
  'domain-a': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-b': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-c': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-d': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-e': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-f': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-g': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
  'domain-h': [
    { code: 'foundations', name: 'Foundations', description: 'Core concepts and first principles.' },
    { code: 'applications', name: 'Applications', description: 'Practical use cases and workflows.' },
    { code: 'governance', name: 'Governance', description: 'Quality, disputes, and community rules.' },
  ],
};

type QuestionSeed = {
  title: string;
  bodyMd: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceSummary: string;
};

const QUESTION_SEEDS: Record<string, QuestionSeed[]> = {
  foundations: [
    {
      title: 'What is the smallest useful knowledge flow for this domain?',
      bodyMd: 'Seed question for foundational exploration.',
      sourceTitle: 'ThinkGrove framework contract',
      sourceUrl: 'https://github.com/lumi1024/thinkgrove/blob/main/docs/%E6%A1%86%E6%9E%B6%E5%A5%91%E7%BA%A6.md',
      sourceSummary: 'Framework contract defining domain, subdomain, question, source, branch, answer, dispute, vote, citation, and reputation primitives.',
    },
    {
      title: 'Which concepts belong in this domain versus a neighboring domain?',
      bodyMd: 'Seed question for boundary setting.',
      sourceTitle: 'Framework migration guide',
      sourceUrl: 'https://github.com/lumi1024/thinkgrove/blob/main/docs/%E6%A1%86%E6%9E%B6%E8%BF%81%E7%A7%BB%E6%8C%87%E5%8D%97.md',
      sourceSummary: 'Guidance on keeping framework runtime separate from product narrative and product docs.',
    },
  ],
  applications: [
    {
      title: 'What is a practical first product built on this domain?',
      bodyMd: 'Seed question for applied scenarios.',
      sourceTitle: 'Starter kits',
      sourceUrl: 'https://github.com/lumi1024/thinkgrove/tree/main/starter-kits',
      sourceSummary: 'Minimal runtime examples for domain tree, question/source/answer flow, and AI collaboration.',
    },
  ],
  governance: [
    {
      title: 'How should answer quality and source credibility be governed?',
      bodyMd: 'Seed question for dispute and arbitration design.',
      sourceTitle: 'Community design notes',
      sourceUrl: 'https://github.com/lumi1024/thinkgrove/blob/main/docs/框架契约.md',
      sourceSummary: 'Contract note on disputes, citations, votes, reputation, and auditability.',
    },
  ],
};

export function seedIfEmpty(): boolean {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number };
  if (row.n > 0) return true;

  const insertDomain = db.prepare(
    'INSERT OR IGNORE INTO domains (id, code, name, color, description, status, x_pct, y_pct) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  for (const d of DOMAINS) {
    insertDomain.run(d.id, d.id, d.domain, d.color, d.description, 'tree', d.x_pct, d.y_pct);
  }

  const insertAiUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, handle, display_name, kind, model, provider, role, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertAiAgent = db.prepare(
    'INSERT OR IGNORE INTO ai_agents (user_id, model, provider, agent_role, home_trees, actions_today, last_action_at) VALUES (?, ?, ?, ?, ?, 0, NULL)',
  );
  for (const a of aiResidents) {
    insertAiUser.run(a.id, a.handle, a.displayName, 'ai', a.model, a.provider, a.role, a.joinedAt);
    insertAiAgent.run(a.id, a.model, a.provider, a.role, JSON.stringify(a.homeTrees || []));
  }

  const insertHuman = db.prepare(
    'INSERT OR IGNORE INTO users (id, handle, display_name, kind, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const h of humanResidents) {
    insertHuman.run(h.id, h.handle, h.displayName, 'human', h.role, h.joinedAt);
  }

  const insertSubdomain = db.prepare(
    'INSERT OR IGNORE INTO subdomains (id, domain_id, code, name, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertQuestion = db.prepare(
    'INSERT OR IGNORE INTO questions (id, domain_id, subdomain_id, title, body_md, quality_score, open, canonical, source_requirements, created_by, created_at, last_activity_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertSource = db.prepare(
    'INSERT OR IGNORE INTO sources (id, domain_id, subdomain_id, question_id, title, url, summary_md, source_kind, authority_score, freshness_score, collected_by, collection_agent_id, created_at, reviewed_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)',
  );
  const insertBranch = db.prepare(
    'INSERT OR IGNORE INTO branches (id, domain_id, parent_branch_id, title, kind, created_by, created_at, body_md, question_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const checkBranch = db.prepare('SELECT id FROM branches WHERE id = ?');

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  for (const d of DOMAINS) {
    const subdomainDefs = SUBDOMAIN_DEFS[d.id] || [];
    const subdomainMap = new Map<string, string>();
    for (let index = 0; index < subdomainDefs.length; index += 1) {
      const def = subdomainDefs[index];
      const subdomainId = `sub_${d.id}_${def.code}`;
      subdomainMap.set(def.code, subdomainId);
      insertSubdomain.run(subdomainId, d.id, def.code, def.name, def.description, 'tree', now);
    }

    const questionSeeds = subdomainDefs.flatMap((def) => QUESTION_SEEDS[def.code] || []);
    const questionMap = new Map<string, string>();
    for (let index = 0; index < questionSeeds.length; index += 1) {
      const seed = questionSeeds[index];
      const questionId = `q_${d.id}_${index + 1}`;
      const subdomainId = subdomainDefs[index] ? subdomainMap.get(subdomainDefs[index].code) || null : null;
      questionMap.set(seed.title, questionId);
      insertQuestion.run(
        questionId,
        d.id,
        subdomainId,
        seed.title,
        seed.bodyMd,
        0,
        1,
        0,
        null,
        pickSeedAuthor(d.id),
        now,
        now,
      );
      insertSource.run(
        `src_${d.id}_${index + 1}`,
        d.id,
        subdomainId,
        questionId,
        seed.sourceTitle,
        seed.sourceUrl,
        seed.sourceSummary,
        'web',
        0,
        0,
        pickSeedAuthor(d.id),
        null,
        now,
      );
    }

    for (let index = 0; index < questionSeeds.length; index += 1) {
      const seed = questionSeeds[index];
      const branchId = `br_${d.id}_${index + 1}`;
      if (!checkBranch.get(branchId)) {
        const questionId = questionMap.get(seed.title) || null;
        insertBranch.run(
          branchId,
          d.id,
          null,
          seed.title,
          'question',
          pickSeedAuthor(d.id),
          now,
          seed.bodyMd,
          questionId,
        );
      }
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
