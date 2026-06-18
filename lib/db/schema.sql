-- Knowledge Forest · community schema
-- Aligned with COMMUNITY_DESIGN.md §7.1
-- Charset: utf8mb4 to support Chinese names and emoji.

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
  kind             ENUM('question','counter','cite','rebuttal') NOT NULL DEFAULT 'question',
  created_by       VARCHAR(64)  NOT NULL,
  created_at       DATETIME     NOT NULL,
  -- Optional Markdown body for richer branches.
  body_md          TEXT         NULL,
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
  created_at      DATETIME     NOT NULL,
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_articles_domain (domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS disputes (
  id              VARCHAR(64) PRIMARY KEY,
  target_type     ENUM('answer','article') NOT NULL,
  target_id       VARCHAR(64) NOT NULL,
  opened_by       VARCHAR(64) NOT NULL,
  reason          TEXT         NOT NULL,
  status          ENUM('open','ruling','closed') NOT NULL DEFAULT 'open',
  ruling_summary  TEXT         NULL,
  opened_at       DATETIME     NOT NULL,
  -- 30-day appeal window for reputation recompute
  appeal_until    DATETIME     NULL,
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
  from_type   ENUM('answer','article','branch') NOT NULL,
  from_id     VARCHAR(64) NOT NULL,
  to_type     ENUM('branch','article','external') NOT NULL,
  to_id       VARCHAR(64) NOT NULL,
  relation    ENUM('cite','dispute','rewrite','adopted') NOT NULL DEFAULT 'cite',
  created_at  DATETIME NOT NULL,
  INDEX idx_citations_from (from_type, from_id),
  INDEX idx_citations_to (to_type, to_id)
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
