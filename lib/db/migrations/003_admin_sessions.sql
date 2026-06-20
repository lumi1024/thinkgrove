-- 003_admin_sessions.sql
-- 管理员会话表，支持 httpOnly cookie 认证

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          TEXT    PRIMARY KEY,
  token_hash  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT    NOT NULL,
  last_used   TEXT    NOT NULL DEFAULT (datetime('now'))
);
