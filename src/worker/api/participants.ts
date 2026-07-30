import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }
function n(v: any) { return v ?? null; }

app.get('/event/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, r.room_number, r.hotel_id, b.label as bed_label, h.name as hotel_name
     FROM participants p
     LEFT JOIN beds b ON b.id = p.bed_id
     LEFT JOIN rooms r ON r.id = b.room_id
     LEFT JOIN hotels h ON h.id = p.hotel_id
     WHERE p.event_id = ? ORDER BY p.name`
  ).bind(eid).all();
  return c.json(results);
});

app.get('/event/:eventId/hotel/:hotelId', async (c) => {
  const eid = c.req.param('eventId');
  const hid = c.req.param('hotelId');
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, r.room_number, b.label as bed_label, h.name as hotel_name
     FROM participants p
     LEFT JOIN beds b ON b.id = p.bed_id
     LEFT JOIN rooms r ON r.id = b.room_id
     JOIN hotels h ON h.id = p.hotel_id
     WHERE p.event_id = ? AND (p.hotel_id = ? OR p.hotel_id IS NULL)
     ORDER BY p.name`
  ).bind(eid, hid).all();
  return c.json(results);
});

app.post('/', async (c) => {
  const b = await c.req.json();
  const id = uid();
  const token = uid().replace(/-/g, '').slice(0, 16);
  await c.env.DB.prepare(
    `INSERT INTO participants (id,event_id,hotel_id,ein,name,phone,email,company,department,qr_token,status)
     VALUES(?,?,?,?,?,?,?,?,?,?,'allocated')`
  ).bind(id, b.event_id, n(b.hotel_id), n(b.ein), b.name, n(b.phone), n(b.email), n(b.company), n(b.department), token).run();
  return c.json({ id, qr_token: token });
});

app.post('/bulk', async (c) => {
  const { event_id, hotel_id, participants } = await c.req.json();
  const created = [];
  for (const p of participants) {
    const id = uid();
    const token = uid().replace(/-/g, '').slice(0, 16);
    await c.env.DB.prepare(
      `INSERT INTO participants (id,event_id,hotel_id,ein,name,phone,email,company,department,qr_token,status)
       VALUES(?,?,?,?,?,?,?,?,?,?,'allocated')`
    ).bind(id, event_id, n(hotel_id||p.hotel_id), n(p.ein), p.name, n(p.phone), n(p.email), n(p.company), n(p.department), token).run();
    created.push({ id, name: p.name, qr_token: token });
  }
  return c.json({ count: created.length, participants: created });
});

app.put('/:id/assign-bed', async (c) => {
  const id = c.req.param('id');
  const { bed_id } = await c.req.json();
  const bed = await c.env.DB.prepare('SELECT room_id FROM beds WHERE id=?').bind(bed_id).first();
  const room = await c.env.DB.prepare('SELECT hotel_id FROM rooms WHERE id=?').bind(bed?.room_id).first();
  const now = new Date().toISOString();
  const date = now.split('T')[0];
  const time = now.split('T')[1].split('.')[0];
  await c.env.DB.prepare('UPDATE participants SET bed_id=?, hotel_id=?, allocated_date=?, allocated_time=?, version=version+1 WHERE id=?').bind(bed_id, room?.hotel_id||null, date, time, id).run();
  await c.env.DB.prepare('UPDATE beds SET is_occupied=1 WHERE id=?').bind(bed_id).run();
  return c.json({ ok: true });
});

app.put('/:id/unassign-bed', async (c) => {
  const id = c.req.param('id');
  const p = await c.env.DB.prepare('SELECT bed_id FROM participants WHERE id=?').bind(id).first();
  if (p?.bed_id) {
    await c.env.DB.prepare('UPDATE beds SET is_occupied=0 WHERE id=?').bind(p.bed_id).run();
  }
  await c.env.DB.prepare('UPDATE participants SET bed_id=NULL, hotel_id=NULL, version=version+1 WHERE id=?').bind(id).run();
  return c.json({ ok: true });
});

app.delete('/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM participants WHERE id=?').bind(c.req.param('id')).run();
  return c.json({ ok: true });
});

export { app as participantRoutes };
