import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/event/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, p.name as participant_name, r.room_number, b.label as bed_label, h.name as hotel_name
     FROM checkins c
     JOIN participants p ON p.id=c.participant_id
     LEFT JOIN beds b ON b.id=p.bed_id
     LEFT JOIN rooms r ON r.id=b.room_id
     LEFT JOIN hotels h ON h.id=c.hotel_id
     WHERE c.event_id=? ORDER BY c.checked_at DESC`
  ).bind(eid).all();
  return c.json(results);
});

app.post('/scan', async (c) => {
  const { qr_token, checked_by, hotel_id, expected_version } = await c.req.json();
  const participant = await c.env.DB.prepare(
    'SELECT p.id, p.event_id, p.name, p.status, p.hotel_id, p.version, e.end_date FROM participants p JOIN events e ON e.id=p.event_id WHERE p.qr_token=?'
  ).bind(qr_token).first();
  if (!participant) return c.json({ error: 'Invalid QR' }, 404);
  // QR expiry check
  if (participant.end_date && new Date(participant.end_date) < new Date()) {
    return c.json({ error: 'QR expired — event ended' }, 400);
  }
  // Hotel validation
  if (hotel_id && participant.hotel_id && participant.hotel_id !== hotel_id) {
    return c.json({ error: 'Participant not assigned to this hotel' }, 403);
  }
  if (participant.status === 'departed') return c.json({ error: 'Already departed' }, 400);
  // Optimistic locking
  if (expected_version && participant.version !== expected_version) {
    return c.json({ error: 'Concurrent scan detected — please retry', current_version: participant.version }, 409);
  }
  const now = new Date().toISOString();
  let newStatus = participant.status;
  if (newStatus === 'allocated') newStatus = 'arrived';
  else if (newStatus === 'arrived') newStatus = 'checked_in';
  else if (newStatus === 'checked_in') newStatus = 'departed';
  await c.env.DB.prepare('UPDATE participants SET status=?, version=version+1 WHERE id=? AND version=?')
    .bind(newStatus, participant.id, participant.version).run();
  const cid = uid();
  await c.env.DB.prepare(
    'INSERT INTO checkins (id,participant_id,event_id,status,checked_by,checked_at,hotel_id) VALUES(?,?,?,?,?,?,?)'
  ).bind(cid, participant.id, participant.event_id, newStatus, checked_by||'staff', now, hotel_id||null).run();
  return c.json({ participant: participant.name, status: newStatus, version: participant.version + 1 });
});

app.post('/manual', async (c) => {
  const { participant_id, status, checked_by, notes, hotel_id } = await c.req.json();
  const now = new Date().toISOString();
  const p = await c.env.DB.prepare('SELECT event_id, hotel_id FROM participants WHERE id=?').bind(participant_id).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  if (hotel_id && p.hotel_id && p.hotel_id !== hotel_id) {
    return c.json({ error: 'Hotel mismatch' }, 403);
  }
  await c.env.DB.prepare('UPDATE participants SET status=?, version=version+1 WHERE id=?').bind(status, participant_id).run();
  await c.env.DB.prepare(
    'INSERT INTO checkins (id,participant_id,event_id,status,checked_by,checked_at,notes,hotel_id) VALUES(?,?,?,?,?,?,?,?)'
  ).bind(uid(), participant_id, p.event_id, status, checked_by, now, notes||null, hotel_id||null).run();
  return c.json({ ok: true });
});

export { app as checkinRoutes };
