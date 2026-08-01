-- Migration 0009: Consolidate RBC/BMC event into BES2083
-- Target event: ed6115ad-f174-4e3c-9b95-dee2f046b990 (Business Excellence Summit 2083)
-- Source event: 6eeda243-f7e7-416d-a2ec-760309009ab4 (RBC/BMC)

-- 1. Add Landmark hotel to BES2083 event_hotels (with staff code)
INSERT OR IGNORE INTO event_hotels (id, event_id, hotel_id, code)
SELECT hex(randomblob(16)), 'ed6115ad-f174-4e3c-9b95-dee2f046b990', hotel_id,
       'BES2083-' || lower(replace(hotel_id, '-', ''))
FROM event_hotels
WHERE event_id = '6eeda243-f7e7-416d-a2ec-760309009ab4'
  AND hotel_id NOT IN (SELECT hotel_id FROM event_hotels WHERE event_id = 'ed6115ad-f174-4e3c-9b95-dee2f046b990');

-- 2. Move all rooms (beds come along via room_id FK)
UPDATE rooms SET event_id = 'ed6115ad-f174-4e3c-9b95-dee2f046b990'
WHERE event_id = '6eeda243-f7e7-416d-a2ec-760309009ab4';

-- 3. Move all participants
UPDATE participants SET event_id = 'ed6115ad-f174-4e3c-9b95-dee2f046b990'
WHERE event_id = '6eeda243-f7e7-416d-a2ec-760309009ab4';

-- 4. Move checkins
UPDATE checkins SET event_id = 'ed6115ad-f174-4e3c-9b95-dee2f046b990'
WHERE event_id = '6eeda243-f7e7-416d-a2ec-760309009ab4';
