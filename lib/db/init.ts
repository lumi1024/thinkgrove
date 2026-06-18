// Idempotent schema initializer for SQLite.

import { getDb } from './pool';
import { seedIfEmpty } from './seed';

let _initInProgress = false;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT    PRIMARY KEY,
  handle        TEXT    NOT NULL UNIQUE,
  display_name  TEXT    NOT NULL,
  kind          TEXT    NOT NULL CHECK(kind IN ('human','ai')),
  model         TEXT    NULL,
  provider      TEXT    NULL,
  role          TEXT    NOT NULL,
  signature     TEXT    NULL,
  joined_at     TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_agents (
  user_id              TEXT    PRIMARY KEY,
  model                TEXT    NOT NULL,
  provider             TEXT    NOT NULL,
  agent_role           TEXT    NOT NULL CHECK(agent_role IN ('oracle','synthesizer','critic','tutor')),
  home_trees           TEXT    NULL,
  rest_until           TEXT    NULL,
  prompt_hash_public   TEXT    NULL,
  actions_today        INTEGER NOT NULL DEFAULT 0,
  last_action_at       TEXT    NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS domains (
  id           TEXT    PRIMARY KEY,
  code         TEXT    NOT NULL UNIQUE,
  name         TEXT    NOT NULL,
  color        TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'tree' CHECK(status IN ('sapling','tree')),
  x_pct        TEXT    NOT NULL DEFAULT '0%',
  y_pct        TEXT    NOT NULL DEFAULT '0%',
  parent_id    TEXT    NULL
);

CREATE TABLE IF NOT EXISTS branches (
  id               TEXT    PRIMARY KEY,
  domain_id        TEXT    NOT NULL,
  parent_branch_id TEXT    NULL,
  title            TEXT    NOT NULL,
  kind             TEXT    NOT NULL DEFAULT 'question' CHECK(kind IN ('question','counter','cite','rebuttal')),
  created_by       TEXT    NOT NULL,
  created_at       TEXT    NOT NULL,
  body_md          TEXT    NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS answers (
  id            TEXT    PRIMARY KEY,
  branch_id     TEXT    NOT NULL,
  body_md       TEXT    NOT NULL,
  citations     TEXT    NULL,
  author_id     TEXT    NOT NULL,
  kind          TEXT    NOT NULL CHECK(kind IN ('human','ai')),
  prompt_hash   TEXT    NULL,
  created_at    TEXT    NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS articles (
  id              TEXT    PRIMARY KEY,
  domain_id       TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  body_md         TEXT    NOT NULL,
  author_id       TEXT    NOT NULL,
  co_authors      TEXT    NULL,
  cited_branches  TEXT    NULL,
  created_at      TEXT    NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS disputes (
  id              TEXT    PRIMARY KEY,
  target_type     TEXT    NOT NULL CHECK(target_type IN ('answer','article')),
  target_id       TEXT    NOT NULL,
  opened_by       TEXT    NOT NULL,
  reason          TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open','ruling','closed')),
  ruling_summary  TEXT    NULL,
  opened_at       TEXT    NOT NULL,
  appeal_until    TEXT    NULL,
  FOREIGN KEY (opened_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS votes (
  id          TEXT    PRIMARY KEY,
  voter_id    TEXT    NOT NULL,
  target_type TEXT    NOT NULL,
  target_id   TEXT    NOT NULL,
  weight      REAL    NOT NULL DEFAULT 1.0,
  ts          TEXT    NOT NULL,
  UNIQUE(voter_id, target_type, target_id),
  FOREIGN KEY (voter_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS citations (
  id          TEXT    PRIMARY KEY,
  from_type   TEXT    NOT NULL CHECK(from_type IN ('answer','article','branch')),
  from_id     TEXT    NOT NULL,
  to_type     TEXT    NOT NULL CHECK(to_type IN ('branch','article','external')),
  to_id       TEXT    NOT NULL,
  relation    TEXT    NOT NULL DEFAULT 'cite' CHECK(relation IN ('cite','dispute','rewrite','adopted')),
  created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS reputation_snapshots (
  user_id            TEXT    NOT NULL,
  week_start         TEXT    NOT NULL,
  cited_count        INTEGER NOT NULL DEFAULT 0,
  gate_accuracy      REAL    NOT NULL DEFAULT 0,
  tenure_days        INTEGER NOT NULL DEFAULT 0,
  cross_domain_cited INTEGER NOT NULL DEFAULT 0,
  reputation         REAL    NOT NULL DEFAULT 0,
  computed_at        TEXT    NOT NULL,
  PRIMARY KEY (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_branches_domain ON branches(domain_id);
CREATE INDEX IF NOT EXISTS idx_branches_author ON branches(created_by);
CREATE INDEX IF NOT EXISTS idx_answers_branch ON answers(branch_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_domain ON articles(domain_id);
CREATE INDEX IF NOT EXISTS idx_disputes_target ON disputes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_citations_from ON citations(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_citations_to ON citations(to_type, to_id);
`;

export function ensureInit(): boolean {
  if (_initInProgress) return true;
  _initInProgress = true;
  try {
    const db = getDb();
    db.exec(SCHEMA);
    seedIfEmpty();
    return true;
  } finally {
    _initInProgress = false;
  }
}
