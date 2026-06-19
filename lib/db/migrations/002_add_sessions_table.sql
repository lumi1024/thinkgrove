-- 002_add_sessions_table.sql
-- Add cookie-based session support for multi-user auth.
-- Migration: 002

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  handle      TEXT    NOT NULL,
  display_name TEXT  NOT NULL,
  kind        TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
