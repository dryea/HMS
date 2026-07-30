-- HMS Schema v1
CREATE TABLE IF NOT EXISTS hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  event_code TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE IF NOT EXISTS room_types (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 2,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  room_type_id TEXT,
  room_number TEXT NOT NULL,
  floor TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

CREATE TABLE IF NOT EXISTS beds (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  label TEXT NOT NULL,
  bed_type TEXT DEFAULT 'single',
  is_occupied INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  bed_id TEXT,
  ein TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  department TEXT,
  qr_token TEXT UNIQUE,
  qr_r2_key TEXT,
  status TEXT DEFAULT 'allocated',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (bed_id) REFERENCES beds(id)
);

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  checked_by TEXT,
  checked_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX idx_events_hotel ON events(hotel_id);
CREATE INDEX idx_participants_event ON participants(event_id);
CREATE INDEX idx_participants_qr ON participants(qr_token);
CREATE INDEX idx_checkins_participant ON checkins(participant_id);
CREATE INDEX idx_beds_room ON beds(room_id);
