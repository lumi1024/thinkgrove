-- 005_subdomains_questions_sources.sql
-- Add subdomain/question/source primitives and extend existing
-- branches/answers/citations/disputes for a Zhihu-like knowledge structure.

-- New tables
CREATE TABLE IF NOT EXISTS subdomains (
  id           TEXT    PRIMARY KEY,
  domain_id    TEXT    NOT NULL,
  code         TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  description  TEXT    NULL,
  status       TEXT    NOT NULL DEFAULT 'tree' CHECK(status IN ('sapling','tree')),
  position     TEXT    NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subdomains_domain_code ON subdomains(domain_id, code);
CREATE INDEX IF NOT EXISTS idx_subdomains_domain ON subdomains(domain_id);

CREATE TABLE IF NOT EXISTS questions (
  id                  TEXT    PRIMARY KEY,
  domain_id           TEXT    NOT NULL,
  subdomain_id        TEXT    NULL,
  title               TEXT    NOT NULL,
  body_md             TEXT    NULL,
  quality_score       REAL    NOT NULL DEFAULT 0,
  open                INTEGER NOT NULL DEFAULT 1,
  canonical           INTEGER NOT NULL DEFAULT 0,
  source_requirements TEXT    NULL,
  created_by          TEXT    NOT NULL,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  last_activity_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_questions_subdomain ON questions(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_questions_open ON questions(open);

CREATE TABLE IF NOT EXISTS sources (
  id                  TEXT    PRIMARY KEY,
  domain_id           TEXT    NOT NULL,
  subdomain_id        TEXT    NULL,
  question_id         TEXT    NULL,
  title               TEXT    NOT NULL,
  url                 TEXT    NOT NULL,
  summary_md          TEXT    NULL,
  source_kind         TEXT    NOT NULL DEFAULT 'web' CHECK(source_kind IN ('web','paper','report','internal','external_api')),
  authority_score     REAL    NOT NULL DEFAULT 0,
  freshness_score     REAL    NOT NULL DEFAULT 0,
  collected_by        TEXT    NOT NULL,
  collection_agent_id TEXT    NULL,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at         TEXT    NULL,
  archived_at         TEXT    NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) ON DELETE SET NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL,
  FOREIGN KEY (collected_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain_id);
CREATE INDEX IF NOT EXISTS idx_sources_subdomain ON sources(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_sources_question ON sources(question_id);
CREATE INDEX IF NOT EXISTS idx_sources_kind ON sources(source_kind);

-- Recreate branches/question and answers/question extensions idempotently.
CREATE TABLE branches_new (
  id               TEXT    PRIMARY KEY,
  domain_id        TEXT    NOT NULL,
  parent_branch_id TEXT    NULL,
  title            TEXT    NOT NULL,
  kind             TEXT    NOT NULL DEFAULT 'question' CHECK(kind IN ('question','counter','cite','rebuttal','meta','source_note')),
  created_by       TEXT    NOT NULL,
  created_at       TEXT    NOT NULL,
  body_md          TEXT    NULL,
  question_id      TEXT    NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO branches_new SELECT id, domain_id, parent_branch_id, title, kind, created_by, created_at, body_md, NULL FROM branches;
DROP TABLE branches;
ALTER TABLE branches_new RENAME TO branches;

CREATE INDEX IF NOT EXISTS idx_branches_domain ON branches(domain_id);
CREATE INDEX IF NOT EXISTS idx_branches_author ON branches(created_by);

CREATE TABLE answers_new (
  id            TEXT    PRIMARY KEY,
  branch_id     TEXT    NOT NULL,
  body_md       TEXT    NOT NULL,
  citations     TEXT    NULL,
  author_id     TEXT    NOT NULL,
  kind          TEXT    NOT NULL CHECK(kind IN ('human','ai')),
  prompt_hash   TEXT    NULL,
  created_at    TEXT    NOT NULL,
  question_id   TEXT    NULL,
  confidence    REAL    NULL,
  source_ids    TEXT    NULL,
  answer_kind   TEXT    NOT NULL DEFAULT 'human' CHECK(answer_kind IN ('human','ai','synthesized')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

INSERT INTO answers_new SELECT id, branch_id, body_md, citations, author_id, kind, prompt_hash, created_at, NULL, NULL, NULL, 'human' FROM answers;
DROP TABLE answers;
ALTER TABLE answers_new RENAME TO answers;

CREATE INDEX IF NOT EXISTS idx_answers_branch ON answers(branch_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);

-- Recreate citations/disputes with expanded target types.
CREATE TABLE citations_new (
  id          TEXT    PRIMARY KEY,
  from_type   TEXT    NOT NULL CHECK(from_type IN ('answer','article','branch','question','source')),
  from_id     TEXT    NOT NULL,
  to_type     TEXT    NOT NULL CHECK(to_type IN ('branch','article','external','source')),
  to_id       TEXT    NOT NULL,
  relation    TEXT    NOT NULL DEFAULT 'cite' CHECK(relation IN ('cite','dispute','rewrite','adopted')),
  created_at  TEXT    NOT NULL
);

INSERT INTO citations_new SELECT id, from_type, from_id, to_type, to_id, relation, created_at FROM citations;
DROP TABLE citations;
ALTER TABLE citations_new RENAME TO citations;

CREATE INDEX IF NOT EXISTS idx_citations_from ON citations(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_citations_to ON citations(to_type, to_id);

CREATE TABLE disputes_new (
  id              TEXT    PRIMARY KEY,
  target_type     TEXT    NOT NULL CHECK(target_type IN ('answer','article','source')),
  target_id       TEXT    NOT NULL,
  opened_by       TEXT    NOT NULL,
  reason          TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open','ruling','closed')),
  ruling_summary  TEXT    NULL,
  opened_at       TEXT    NOT NULL,
  appeal_until    TEXT    NULL,
  FOREIGN KEY (opened_by) REFERENCES users(id)
);

INSERT INTO disputes_new SELECT id, target_type, target_id, opened_by, reason, status, ruling_summary, opened_at, appeal_until FROM disputes;
DROP TABLE disputes;
ALTER TABLE disputes_new RENAME TO disputes;

CREATE INDEX IF NOT EXISTS idx_disputes_target ON disputes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
