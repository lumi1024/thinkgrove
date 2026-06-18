// Synchronous typed wrappers around better-sqlite3 for each domain table.
//
// better-sqlite3 is synchronous — no async, no pool, no connection release.
// Each function opens a statement and runs it directly. Errors propagate
// to the caller; API routes wrap try/catch and fall back to offline seed.

import { getDb } from './pool';

export interface DbUser {
  id: string;
  handle: string;
  display_name: string;
  kind: 'human' | 'ai';
  model: string | null;
  provider: string | null;
  role: string;
  signature: string | null;
  joined_at: string;
}
export interface DbDomain {
  id: string;
  code: string;
  name: string;
  color: string;
  description: string;
  status: 'sapling' | 'tree';
  x_pct: string;
  y_pct: string;
  parent_id: string | null;
}
export interface DbBranch {
  id: string;
  domain_id: string;
  parent_branch_id: string | null;
  title: string;
  kind: 'question' | 'counter' | 'cite' | 'rebuttal';
  created_by: string;
  created_at: string;
  body_md: string | null;
}
export interface DbAnswer {
  id: string;
  branch_id: string;
  body_md: string;
  citations: string[] | null;
  author_id: string;
  kind: 'human' | 'ai';
  prompt_hash: string | null;
  created_at: string;
}
export interface DbArticle {
  id: string;
  domain_id: string;
  title: string;
  body_md: string;
  author_id: string;
  co_authors: string[] | null;
  cited_branches: string[] | null;
  created_at: string;
}
export interface DbDispute {
  id: string;
  target_type: 'answer' | 'article';
  target_id: string;
  opened_by: string;
  reason: string;
  status: 'open' | 'ruling' | 'closed';
  ruling_summary: string | null;
  opened_at: string;
  appeal_until: string | null;
}
export interface DbVote {
  id: string;
  voter_id: string;
  target_type: string;
  target_id: string;
  weight: number;
  ts: string;
}
export interface DbCitation {
  id: string;
  from_type: string;
  from_id: string;
  to_type: string;
  to_id: string;
  relation: 'cite' | 'dispute' | 'rewrite' | 'adopted';
  created_at: string;
}

const db = getDb();

// ----- domains -----
export function listDomains(): DbDomain[] {
  return db.prepare('SELECT * FROM domains ORDER BY id').all() as DbDomain[];
}

export function getDomain(id: string): DbDomain | null {
  const row = db.prepare('SELECT * FROM domains WHERE id = ? LIMIT 1').get(id) as DbDomain | undefined;
  return row ?? null;
}

export function forkTree(sourceId: string, newId: string, newName: string, newDescription: string): DbDomain {
  const source = getDomain(sourceId);
  if (!source) throw new Error('source domain not found');
  db.prepare(
    `INSERT INTO domains (id, code, name, color, description, status, x_pct, y_pct, parent_id)
     VALUES (?, ?, ?, ?, ?, 'tree', ?, ?, ?)`,
  ).run(newId, newId, newName, source.color, newDescription, source.x_pct, source.y_pct, sourceId);
  return getDomain(newId)!;
}

export function countForks(parentId: string): number {
  const row = db.prepare('SELECT COUNT(*) as n FROM domains WHERE parent_id = ?').get(parentId) as { n: number };
  return row.n;
}

// ----- users -----
export function makeUser(opts: {
  id: string;
  handle: string;
  display_name: string;
  kind: 'human' | 'ai';
  model?: string | null;
  provider?: string | null;
  role: string;
  joined_at: string;
}): DbUser {
  return {
    id: opts.id,
    handle: opts.handle,
    display_name: opts.display_name,
    kind: opts.kind,
    model: opts.model ?? null,
    provider: opts.provider ?? null,
    role: opts.role,
    signature: null,
    joined_at: opts.joined_at,
  };
}

export function getUser(id: string): DbUser | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(id) as DbUser | undefined;
  return row ?? null;
}

export function getUserByHandle(handle: string): DbUser | null {
  const row = db.prepare('SELECT * FROM users WHERE handle = ? LIMIT 1').get(handle) as DbUser | undefined;
  return row ?? null;
}

export function upsertUser(u: DbUser): void {
  db.prepare(
    `INSERT INTO users (id, handle, display_name, kind, model, provider, role, signature, joined_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       role = excluded.role`,
  ).run(u.id, u.handle, u.display_name, u.kind, u.model, u.provider, u.role, u.signature, u.joined_at);
}

// ----- branches -----
export function listBranchesByDomain(domainId: string, limit = 30): DbBranch[] {
  return db.prepare('SELECT * FROM branches WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?').all(domainId, limit) as DbBranch[];
}

export function createBranch(b: DbBranch): void {
  db.prepare(
    `INSERT INTO branches (id, domain_id, parent_branch_id, title, kind, created_by, created_at, body_md)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(b.id, b.domain_id, b.parent_branch_id, b.title, b.kind, b.created_by, b.created_at, b.body_md);
}

export function getBranch(id: string): DbBranch | null {
  const row = db.prepare('SELECT * FROM branches WHERE id = ? LIMIT 1').get(id) as DbBranch | undefined;
  return row ?? null;
}

// ----- answers -----
export function listAnswersByBranch(branchId: string): DbAnswer[] {
  return db.prepare('SELECT * FROM answers WHERE branch_id = ? ORDER BY created_at ASC').all(branchId) as DbAnswer[];
}

export function createAnswer(a: DbAnswer): void {
  db.prepare(
    `INSERT INTO answers (id, branch_id, body_md, citations, author_id, kind, prompt_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(a.id, a.branch_id, a.body_md, JSON.stringify(a.citations ?? []), a.author_id, a.kind, a.prompt_hash, a.created_at);
}

// ----- articles -----
export function listArticlesByDomain(domainId: string, limit = 8): DbArticle[] {
  return db.prepare('SELECT * FROM articles WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?').all(domainId, limit) as DbArticle[];
}

export function listAllBranches(): DbBranch[] {
  return db.prepare('SELECT * FROM branches ORDER BY domain_id, created_at DESC').all() as DbBranch[];
}

export function listAllArticles(): DbArticle[] {
  return db.prepare('SELECT * FROM articles ORDER BY domain_id, created_at DESC').all() as DbArticle[];
}

export function createArticle(a: DbArticle): void {
  db.prepare(
    `INSERT INTO articles (id, domain_id, title, body_md, author_id, co_authors, cited_branches, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(a.id, a.domain_id, a.title, a.body_md, a.author_id, JSON.stringify(a.co_authors ?? []), JSON.stringify(a.cited_branches ?? []), a.created_at);
}

// ----- disputes -----
export function createDispute(d: DbDispute): void {
  db.prepare(
    `INSERT INTO disputes (id, target_type, target_id, opened_by, reason, status, opened_at, appeal_until)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(d.id, d.target_type, d.target_id, d.opened_by, d.reason, d.status, d.opened_at, d.appeal_until);
}

export function getDispute(id: string): DbDispute | null {
  const row = db.prepare('SELECT * FROM disputes WHERE id = ? LIMIT 1').get(id) as DbDispute | undefined;
  return row ?? null;
}

export function updateDisputeRuling(id: string, rulingSummary: string): void {
  db.prepare("UPDATE disputes SET status = 'ruling', ruling_summary = ? WHERE id = ?").run(rulingSummary, id);
}

export function listDisputesForUser(userId: string): DbDispute[] {
  return db.prepare('SELECT * FROM disputes WHERE opened_by = ? ORDER BY opened_at DESC').all(userId) as DbDispute[];
}

// ----- votes -----
export function castVote(
  voterId: string,
  targetType: 'dispute' | 'branch' | 'answer' | 'article',
  targetId: string,
  weight: number,
): void {
  const id = 'v_' + Math.random().toString(36).slice(2, 12);
  db.prepare(
    `INSERT INTO votes (id, voter_id, target_type, target_id, weight, ts)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(voter_id, target_type, target_id) DO UPDATE SET
       weight = excluded.weight,
       ts = excluded.ts`,
  ).run(id, voterId, targetType, targetId, weight);
}

export function listVotesForTarget(targetType: string, targetId: string): DbVote[] {
  return db.prepare('SELECT id, voter_id, target_type, target_id, weight, ts FROM votes WHERE target_type = ? AND target_id = ?').all(targetType, targetId) as DbVote[];
}

// ----- ai_agents -----
export function adoptTree(userId: string, domainId: string): boolean {
  const row = db.prepare('SELECT home_trees FROM ai_agents WHERE user_id = ? LIMIT 1').get(userId) as { home_trees: string | null } | undefined;
  const current: string[] = row?.home_trees ? JSON.parse(row.home_trees) : [];
  if (current.includes(domainId)) return false;
  current.push(domainId);
  db.prepare('UPDATE ai_agents SET home_trees = ? WHERE user_id = ?').run(JSON.stringify(current), userId);
  return true;
}

export function getHomeTrees(userId: string): string[] {
  const row = db.prepare('SELECT home_trees FROM ai_agents WHERE user_id = ? LIMIT 1').get(userId) as { home_trees: string | null } | undefined;
  return row?.home_trees ? JSON.parse(row.home_trees) : [];
}

export function getAgentState(userId: string): {
  actions_today: number;
  last_action_at: string | null;
  rest_until: string | null;
} | null {
  const row = db.prepare('SELECT actions_today, last_action_at, rest_until FROM ai_agents WHERE user_id = ? LIMIT 1').get(userId) as {
    actions_today: number;
    last_action_at: string;
    rest_until: string;
  } | undefined;
  return row
    ? { actions_today: row.actions_today, last_action_at: row.last_action_at ?? null, rest_until: row.rest_until ?? null }
    : null;
}

export function resetAgentDailyIfStale(userId: string, today: string): void {
  db.prepare('UPDATE ai_agents SET actions_today = 0 WHERE user_id = ? AND (last_action_at IS NULL OR DATE(last_action_at) <> ?)').run(userId, today);
}

export function bumpAgentAction(userId: string): { actionsToday: number } {
  const info = db.prepare('UPDATE ai_agents SET actions_today = actions_today + 1, last_action_at = datetime("now") WHERE user_id = ?').run(userId);
  const row = db.prepare('SELECT actions_today FROM ai_agents WHERE user_id = ?').get(userId) as { actions_today: number };
  return { actionsToday: row.actions_today };
}

export function setAgentRest(userId: string, restUntil: Date): void {
  db.prepare('UPDATE ai_agents SET rest_until = ? WHERE user_id = ?').run(restUntil.toISOString(), userId);
}

// ----- citations -----
export function createCitation(
  fromType: 'answer' | 'article' | 'branch',
  fromId: string,
  toType: 'branch' | 'article' | 'external',
  toId: string,
  relation: 'cite' | 'dispute' | 'rewrite' | 'adopted' = 'cite',
): void {
  const id = 'c_' + Math.random().toString(36).slice(2, 12);
  db.prepare(
    `INSERT INTO citations (id, from_type, from_id, to_type, to_id, relation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  ).run(id, fromType, fromId, toType, toId, relation);
}

export function listCitationsForUser(userId: string): DbCitation[] {
  return db
    .prepare(
      `SELECT DISTINCT c.id, c.from_type, c.from_id, c.to_type, c.to_id, c.relation, c.created_at
       FROM citations c
       LEFT JOIN branches b   ON (c.from_type='branch'  AND c.from_id=b.id) OR (c.to_type='branch'  AND c.to_id=b.id)
       LEFT JOIN answers a   ON (c.from_type='answer'  AND c.from_id=a.id) OR (c.to_type='answer'  AND c.to_id=a.id)
       LEFT JOIN articles ar ON (c.from_type='article' AND c.from_id=ar.id) OR (c.to_type='article' AND c.to_id=ar.id)
       WHERE b.created_by = ? OR a.author_id = ? OR ar.author_id = ?
       ORDER BY c.created_at DESC LIMIT 30`,
    )
    .all(userId, userId, userId) as DbCitation[];
}
