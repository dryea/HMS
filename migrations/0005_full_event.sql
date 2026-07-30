ALTER TABLE events ADD COLUMN logo_url TEXT;
ALTER TABLE events ADD COLUMN banner_color TEXT DEFAULT '#1a1b1e';
ALTER TABLE events ADD COLUMN accent_color TEXT DEFAULT '#4c6ef5';

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL,
  name TEXT NOT NULL, description TEXT, floor TEXT,
  map_image_url TEXT, pin_x INTEGER, pin_y INTEGER,
  hotel_id TEXT, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL,
  title TEXT NOT NULL, description TEXT,
  speaker_name TEXT, speaker_title TEXT,
  location_id TEXT, start_time TEXT NOT NULL,
  end_time TEXT NOT NULL, session_date TEXT NOT NULL,
  track TEXT, max_capacity INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS participant_sessions (
  id TEXT PRIMARY KEY, participant_id TEXT NOT NULL,
  session_id TEXT NOT NULL, attended INTEGER DEFAULT 0,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  UNIQUE(participant_id, session_id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL,
  title TEXT NOT NULL, message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id TEXT PRIMARY KEY, announcement_id TEXT NOT NULL,
  participant_id TEXT NOT NULL, read_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id),
  UNIQUE(announcement_id, participant_id)
);

CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL,
  title TEXT DEFAULT 'Event Feedback', questions TEXT,
  active INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY, survey_id TEXT NOT NULL,
  participant_id TEXT NOT NULL, answers TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (survey_id) REFERENCES surveys(id),
  FOREIGN KEY (participant_id) REFERENCES participants(id),
  UNIQUE(survey_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_event ON sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(event_id, session_date);
CREATE INDEX IF NOT EXISTS idx_locations_event ON locations(event_id);
CREATE INDEX IF NOT EXISTS idx_announcements_event ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_surveys_event ON surveys(event_id);
CREATE INDEX IF NOT EXISTS idx_ps_participant ON participant_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_ps_session ON participant_sessions(session_id);
