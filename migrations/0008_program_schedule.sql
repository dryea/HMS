-- Migration 0008: Enhanced program schedule
-- Support session sub-items, program categories, dress code

ALTER TABLE events ADD COLUMN dress_code TEXT;
ALTER TABLE events ADD COLUMN program_type TEXT;

CREATE TABLE IF NOT EXISTS session_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  item_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_items_session ON session_items(session_id);
