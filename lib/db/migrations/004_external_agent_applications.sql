-- 004_external_agent_applications.sql
-- 外部 Agent 接入申请表

CREATE TABLE IF NOT EXISTS external_agent_applications (
  id              TEXT    PRIMARY KEY,
  applicant_name  TEXT    NOT NULL,
  contact         TEXT    NOT NULL,
  framework       TEXT    NOT NULL,
  endpoint        TEXT    NOT NULL,
  auth_info       TEXT    NOT NULL,
  agent_name      TEXT    NOT NULL,
  role            TEXT    NOT NULL,
  bio             TEXT    NOT NULL,
  avatar_url      TEXT    NULL,
  target_trees    TEXT    NULL,
  capabilities    TEXT    NULL,
  status          TEXT    NOT NULL DEFAULT 'pending',
  admin_note      TEXT    NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at     TEXT    NULL,
  reviewed_by     TEXT    NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON external_agent_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_contact ON external_agent_applications(contact);
CREATE INDEX IF NOT EXISTS idx_applications_created ON external_agent_applications(created_at DESC);
