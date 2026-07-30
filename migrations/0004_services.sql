CREATE TABLE IF NOT EXISTS service_types (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE,
  icon TEXT, sort_order INTEGER DEFAULT 0
);
INSERT OR IGNORE INTO service_types VALUES
  ('st_stay','Stay','bed',1),
  ('st_breakfast','Breakfast','coffee',2),
  ('st_lunch','Lunch','fork',3),
  ('st_dinner','Dinner','moon',4);
CREATE TABLE IF NOT EXISTS event_date_services (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL,
  hotel_id TEXT NOT NULL, service_date TEXT NOT NULL,
  service_type_id TEXT NOT NULL, start_time TEXT, end_time TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id),
  UNIQUE(event_id,hotel_id,service_date,service_type_id)
);
CREATE TABLE IF NOT EXISTS participant_services (
  id TEXT PRIMARY KEY, participant_id TEXT NOT NULL,
  event_date_service_id TEXT NOT NULL,
  hotel_id TEXT NOT NULL, status TEXT DEFAULT 'pending',
  child_id TEXT, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (event_date_service_id) REFERENCES event_date_services(id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  UNIQUE(participant_id,event_date_service_id)
);
CREATE TABLE IF NOT EXISTS service_attendance (
  id TEXT PRIMARY KEY, participant_service_id TEXT NOT NULL,
  attended INTEGER DEFAULT 0, marked_by TEXT,
  marked_at TEXT, notes TEXT,
  FOREIGN KEY (participant_service_id) REFERENCES participant_services(id)
);
CREATE TABLE IF NOT EXISTS participant_children (
  id TEXT PRIMARY KEY, participant_id TEXT NOT NULL,
  name TEXT NOT NULL, age INTEGER,
  notes TEXT, created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eds_event ON event_date_services(event_id);
CREATE INDEX IF NOT EXISTS idx_eds_hotel_date ON event_date_services(hotel_id,service_date);
CREATE INDEX IF NOT EXISTS idx_ps_participant ON participant_services(participant_id);
CREATE INDEX IF NOT EXISTS idx_ps_service ON participant_services(event_date_service_id);
CREATE INDEX IF NOT EXISTS idx_sa_service ON service_attendance(participant_service_id);
CREATE INDEX IF NOT EXISTS idx_child_parent ON participant_children(participant_id);
