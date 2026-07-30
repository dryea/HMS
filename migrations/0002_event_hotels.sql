CREATE TABLE IF NOT EXISTS event_hotels (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  hotel_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
CREATE INDEX IF NOT EXISTS idx_event_hotels_event ON event_hotels(event_id);
CREATE INDEX IF NOT EXISTS idx_event_hotels_hotel ON event_hotels(hotel_id);

INSERT OR IGNORE INTO event_hotels (id,event_id,hotel_id)
  SELECT hex(randomblob(16)), id, hotel_id FROM events WHERE hotel_id IS NOT NULL;

ALTER TABLE rooms ADD COLUMN hotel_id TEXT;
ALTER TABLE participants ADD COLUMN hotel_id TEXT;
