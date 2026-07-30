ALTER TABLE event_hotels ADD COLUMN code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_hotels_code ON event_hotels(code);
ALTER TABLE rooms ADD COLUMN wing TEXT;
ALTER TABLE rooms ADD COLUMN status TEXT DEFAULT 'ready';
ALTER TABLE checkins ADD COLUMN hotel_id TEXT;
ALTER TABLE participants ADD COLUMN version INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_checkins_hotel ON checkins(hotel_id);
CREATE INDEX IF NOT EXISTS idx_participants_hotel ON participants(hotel_id);
