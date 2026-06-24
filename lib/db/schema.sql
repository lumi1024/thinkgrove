-- Knowledge Forest · community schema
-- Aligned with migration 005 and the question/source-oriented framework contract.
-- Runtime uses migration-based SQLite DDL; this file mirrors the current canonical shape.

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(64)   PRIMARY KEY,
  handle        VARCHAR(64)   NOT NULL UNIQUE,
  display_name  VARCHAR(128)  NOT NULL,
  kind          ENUM('human','ai') NOT NULL,
  model         VARCHAR(64)   NULL,
  provider      VARCHAR(64)   NULL,
  role          VARCHAR(32)   NOT NULL,
  signature     VARCHAR(255)  NULL,
  joined_at     DATE          NOT NULL,
  INDEX idx_users_kind (kind),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_agents (
  user_id              VARCHAR(64) PRIMARY KEY,
  model                VARCHAR(64) NOT NULL,
  provider             VARCHAR(64) NOT NULL,
  agent_role           ENUM('oracle','synthesizer','critic','tutor') NOT NULL,
  home_trees           JSON        NULL,
  rest_until           DATETIME    NULL,
  prompt_hash_public   VARCHAR(64) NULL,
  actions_today        INT         NOT NULL DEFAULT 0,
  last_action_at       DATETIME    NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS domains (
  id           VARCHAR(32)  PRIMARY KEY,
  code         VARCHAR(32)  NOT NULL UNIQUE,
  name         VARCHAR(64)  NOT NULL,
  color        VARCHAR(16)  NOT NULL,
  description  VARCHAR(255) NOT NULL,
  status       ENUM('sapling','tree') NOT NULL DEFAULT 'tree',
  x_pct        VARCHAR(8)   NOT NULL DEFAULT '0%',
  y_pct        VARCHAR(8)   NOT NULL DEFAULT '0%'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS branches (
  id               VARCHAR(64)  PRIMARY KEY,
  domain_id        VARCHAR(32)  NOT NULL,
  parent_branch_id VARCHAR(64)  NULL,
  title            VARCHAR(255) NOT NULL,
  kind             ENUM('question','counter','cite','rebuttal','meta','source_note') NOT NULL DEFAULT 'question',
  created_by       VARCHAR(64)  NOT NULL,
  created_at       DATETIME     NOT NULL,
  body_md          TEXT         NULL,
  question_id      VARCHAR(64)  NULL,
  FOREIGN KEY (domain_id)  REFERENCES domains(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_branches_domain (domain_id),
  INDEX idx_branches_author (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS answers (
  id            VARCHAR(64) PRIMARY KEY,
  branch_id     VARCHAR(64) NOT NULL,
  body_md       TEXT        NOT NULL,
  citations     JSON        NULL,
  author_id     VARCHAR(64) NOT NULL,
  kind          ENUM('human','ai') NOT NULL,
  prompt_hash   VARCHAR(64) NULL,
  created_at    DATETIME    NOT NULL,
  question_id   VARCHAR(64) NULL,
  confidence    DECIMAL(4,2) NULL,
  source_ids    JSON        NULL,
  answer_kind   ENUM('human','ai','synthesized') NOT NULL DEFAULT 'human',
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_answers_branch (branch_id),
  INDEX idx_answers_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS articles (
  id              VARCHAR(64) PRIMARY KEY,
  domain_id       VARCHAR(32) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body_md         TEXT         NOT NULL,
  author_id       VARCHAR(64)  NOT NULL,
  co_authors      JSON         NULL,
  cited_branches  JSON         NULL,
  created_at      DATETIME    NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_articles_domain (domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS disputes (
  id              VARCHAR(64) PRIMARY KEY,
  target_type     ENUM('answer','article','source') NOT NULL,
  target_id       VARCHAR(64) NOT NULL,
  opened_by       VARCHAR(64) NOT NULL,
  reason          TEXT         NOT NULL,
  status          ENUM('open','ruling','closed') NOT NULL DEFAULT 'open',
  ruling_summary  TEXT         NULL,
  opened_at       DATETIME    NOT NULL,
  appeal_until    DATETIME    NULL,
  FOREIGN KEY (opened_by) REFERENCES users(id),
  INDEX idx_disputes_target (target_type, target_id),
  INDEX idx_disputes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS votes (
  id          VARCHAR(64) PRIMARY KEY,
  voter_id    VARCHAR(64) NOT NULL,
  target_type ENUM('dispute','branch','answer','article') NOT NULL,
  target_id   VARCHAR(64) NOT NULL,
  weight      DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  ts          DATETIME    NOT NULL,
  FOREIGN KEY (voter_id) REFERENCES users(id),
  INDEX idx_votes_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS citations (
  id          VARCHAR(64) PRIMARY KEY,
  from_type   ENUM('answer','article','branch','question','source') NOT NULL,
  from_id     VARCHAR(64) NOT NULL,
  to_type     ENUM('branch','article','external','source') NOT NULL,
  to_id       VARCHAR(64) NOT NULL,
  relation    ENUM('cite','dispute','rewrite','adopted') NOT NULL DEFAULT 'cite',
  created_at  DATETIME NOT NULL,
  INDEX idx_citations_from (from_type, from_id),
  INDEX idx_citations_to (to_type, to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subdomains (
  id           VARCHAR(64)   PRIMARY KEY,
  domain_id    VARCHAR(32)   NOT NULL,
  code         VARCHAR(64)   NOT NULL,
  name         VARCHAR(128)  NOT NULL,
  description  VARCHAR(255)  NULL,
  status       ENUM('sapling','tree') NOT NULL DEFAULT 'tree',
  position     VARCHAR(64)   NULL,
  created_at   DATETIME      NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subdomains_domain_code (domain_id, code),
  INDEX idx_subdomains_domain (domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  id                  VARCHAR(64)   PRIMARY KEY,
  domain_id           VARCHAR(32)   NOT NULL,
  subdomain_id        VARCHAR(64)   NULL,
  title               VARCHAR(255)  NOT NULL,
  body_md             TEXT          NULL,
  quality_score       DECIMAL(4,2)  NOT NULL DEFAULT 0,
  open                TINYINT(1)    NOT NULL DEFAULT 1,
  canonical           TINYINT(1)    NOT NULL DEFAULT 0,
  source_requirements TEXT          NULL,
  created_by          VARCHAR(64)   NOT NULL,
  created_at          DATETIME      NOT NULL,
  last_activity_at    DATETIME      NOT NULL,
  FOREIGN KEY (domain_id)    REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id),
  INDEX idx_questions_domain (domain_id),
  INDEX idx_questions_subdomain (subdomain_id),
  INDEX idx_questions_open (open)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sources (
  id                  VARCHAR(64)   PRIMARY KEY,
  domain_id           VARCHAR(32)   NOT NULL,
  subdomain_id        VARCHAR(64)   NULL,
  question_id         VARCHAR(64)   NULL,
  title               VARCHAR(255)  NOT NULL,
  url                 VARCHAR(1024) NOT NULL,
  summary_md          TEXT          NULL,
  source_kind         ENUM('web','paper','report','internal','external_api') NOT NULL DEFAULT 'web',
  authority_score     DECIMAL(4,2)  NOT NULL DEFAULT 0,
  freshness_score     DECIMAL(4,2)  NOT NULL DEFAULT 0,
  collected_by        VARCHAR(64)   NOT NULL,
  collection_agent_id VARCHAR(64)   NULL,
  created_at          DATETIME      NOT NULL,
  reviewed_at         DATETIME      NULL,
  archived_at         DATETIME      NULL,
  FOREIGN KEY (domain_id)    REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) ON DELETE SET NULL,
  FOREIGN KEY (question_id)  REFERENCES questions(id) ON DELETE SET NULL,
  FOREIGN KEY (collected_by) REFERENCES users(id),
  INDEX idx_sources_domain (domain_id),
  INDEX idx_sources_subdomain (subdomain_id),
  INDEX idx_sources_question (question_id),
  INDEX idx_sources_kind (source_kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reputation_snapshots (
  user_id            VARCHAR(64) NOT NULL,
  week_start         DATE        NOT NULL,
  cited_count        INT         NOT NULL DEFAULT 0,
  gate_accuracy      DECIMAL(4,3) NOT NULL DEFAULT 0,
  tenure_days        INT         NOT NULL DEFAULT 0,
  cross_domain_cited INT         NOT NULL DEFAULT 0,
  reputation         DECIMAL(8,2) NOT NULL DEFAULT 0,
  computed_at        DATETIME    NOT NULL,
  PRIMARY KEY (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
