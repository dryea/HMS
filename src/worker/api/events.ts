import { Hono } from 'hono';
import { logAudit } from './system';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }
function n(v: any) { return v ?? null; }
function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
  for (const e of results) {
    const { results: hotels } = await c.env.DB.prepare(
      'SELECT h.id,h.name,h.address FROM event_hotels eh JOIN hotels h ON h.id=eh.hotel_id WHERE eh.event_id=?'
    ).bind(e.id).all();
    e.hotels = hotels;
  }
  return c.json(results);
});

app.post('/', async (c) => {
  const b = await c.req.json();
  const id = uid();
  const code = b.event_code || id.slice(0, 8);
  const hotelIds = b.hotel_ids || (b.hotel_id ? [b.hotel_id] : []);
  const primaryHotel = hotelIds[0] || null;
  await c.env.DB.prepare(
    'INSERT INTO events (id,hotel_id,name,description,start_date,end_date,event_code,dress_code,program_type) VALUES(?,?,?,?,?,?,?,?,?)'
  ).bind(id, primaryHotel, b.name, n(b.description), b.start_date, b.end_date, code, n(b.dress_code), n(b.program_type)).run();
  for (const hid of hotelIds) {
    const ehid = uid();
    await c.env.DB.prepare('INSERT INTO event_hotels (id,event_id,hotel_id) VALUES(?,?,?)').bind(ehid, id, hid).run();
    // Auto-generate staff code
    const hotel = (await c.env.DB.prepare('SELECT name FROM hotels WHERE id=?').bind(hid).first()) as any;
    if (hotel) {
      const scode = code + '-' + slug(hotel.name);
      await c.env.DB.prepare('UPDATE event_hotels SET code=? WHERE id=?').bind(scode, ehid).run();
    }
  }
  return c.json({ id });
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const event = await c.env.DB.prepare('SELECT * FROM events WHERE id=?').bind(id).first();
  if (!event) return c.json({ error: 'Not found' }, 404);
  const { results: hotels } = await c.env.DB.prepare(
    'SELECT h.*, eh.code as staff_code FROM event_hotels eh JOIN hotels h ON h.id=eh.hotel_id WHERE eh.event_id=?'
  ).bind(id).all();
  event.hotels = hotels;
  return c.json(event);
});

app.put('/:id', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare('UPDATE events SET name=?,description=?,start_date=?,end_date=?,is_active=?,dress_code=?,program_type=? WHERE id=?')
    .bind(b.name, n(b.description), b.start_date, b.end_date, b.is_active??1, n(b.dress_code), n(b.program_type), c.req.param('id')).run();
  return c.json({ ok: true });
});

app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const ev = await c.env.DB.prepare('SELECT name FROM events WHERE id=?').bind(id).first();
  await c.env.DB.prepare('DELETE FROM checkins WHERE event_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM participants WHERE event_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM beds WHERE room_id IN (SELECT id FROM rooms WHERE event_id=?)').bind(id).run();
  await c.env.DB.prepare('DELETE FROM rooms WHERE event_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM event_hotels WHERE event_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM events WHERE id=?').bind(id).run();
  await logAudit(c.env.DB, id, 'delete', 'event', id, { name: ev?.name });
  return c.json({ ok: true });
});

app.get('/:id/stats', async (c) => {
  const id = c.req.param('id');
  const total = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE event_id=?").bind(id).first();
  const checked = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE event_id=? AND status='checked_in'").bind(id).first();
  const arrived = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE event_id=? AND status='arrived'").bind(id).first();
  const allocated = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE event_id=? AND status='allocated'").bind(id).first();
  const departed = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE event_id=? AND status='departed'").bind(id).first();
  return c.json({ total: total?.c||0, checked_in: checked?.c||0, arrived: arrived?.c||0, allocated: allocated?.c||0, departed: departed?.c||0 });
});

// Update staff code for event-hotel pair
app.put('/:id/hotels/:hotelId/code', async (c) => {
  const { code } = await c.req.json();
  await c.env.DB.prepare('UPDATE event_hotels SET code=? WHERE event_id=? AND hotel_id=?')
    .bind(code, c.req.param('id'), c.req.param('hotelId')).run();
  return c.json({ ok: true });
});

// Deduplicate event_hotels - keep one, delete rest
app.delete('/:id/hotels/:hotelId/dedup', async (c) => {
  const eid = c.req.param('id');
  const hid = c.req.param('hotelId');
  await c.env.DB.prepare('DELETE FROM event_hotels WHERE event_id=? AND hotel_id=?').bind(eid, hid).run();
  const ehid = uid();
  await c.env.DB.prepare('INSERT INTO event_hotels (id,event_id,hotel_id) VALUES(?,?,?)').bind(ehid, eid, hid).run();
  const ev = (await c.env.DB.prepare('SELECT event_code FROM events WHERE id=?').bind(eid).first()) as any;
  const hotel = (await c.env.DB.prepare('SELECT name FROM hotels WHERE id=?').bind(hid).first()) as any;
  if (ev && hotel) {
    const scode = ev.event_code + '-' + hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await c.env.DB.prepare('UPDATE event_hotels SET code=? WHERE id=?').bind(scode, ehid).run();
  }
  return c.json({ ok: true });
});

export { app as eventRoutes };
