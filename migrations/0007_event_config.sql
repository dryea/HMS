ALTER TABLE sessions ADD COLUMN subtitle TEXT;
ALTER TABLE sessions ADD COLUMN short_description TEXT;
ALTER TABLE sessions ADD COLUMN speaker_bio TEXT;
ALTER TABLE sessions ADD COLUMN speaker_photo_url TEXT;
ALTER TABLE sessions ADD COLUMN session_type TEXT DEFAULT 'session';
ALTER TABLE sessions ADD COLUMN banner_image_url TEXT;
ALTER TABLE service_types ADD COLUMN event_id TEXT;
ALTER TABLE event_date_services ADD COLUMN menu_items TEXT;
ALTER TABLE participants ADD COLUMN dietary TEXT;

CREATE TABLE IF NOT EXISTS session_questions (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL, question TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0, answered INTEGER DEFAULT 0,
  hidden INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE TABLE IF NOT EXISTS session_feedback (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL, rating INTEGER,
  comment TEXT, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id),
  UNIQUE(session_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_sq_session ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_sf_session ON session_feedback(session_id);
