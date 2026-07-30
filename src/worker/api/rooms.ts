import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/event/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const rooms = await c.env.DB.prepare(
    'SELECT r.*, rt.name as room_type_name, h.name as hotel_name FROM rooms r LEFT JOIN room_types rt ON rt.id=r.room_type_id LEFT JOIN hotels h ON h.id=r.hotel_id WHERE r.event_id=? ORDER BY r.hotel_id, r.wing, r.floor, r.room_number'
  ).bind(eid).all();
  const beds = await c.env.DB.prepare(
    'SELECT b.*, p.name as participant_name, p.id as pid FROM beds b LEFT JOIN participants p ON p.bed_id=b.id WHERE b.room_id IN (SELECT id FROM rooms WHERE event_id=?) ORDER BY b.label'
  ).bind(eid).all();
  const bedMap: Record<string, any[]> = {};
  for (const b of beds.results) {
    if (!bedMap[b.room_id]) bedMap[b.room_id] = [];
    bedMap[b.room_id].push(b);
  }
  return c.json(rooms.results.map((r: any) => ({ ...r, beds: bedMap[r.id] || [] })));
});

app.get('/event/:eventId/hotel/:hotelId', async (c) => {
  const eid = c.req.param('eventId');
  const hid = c.req.param('hotelId');
  const rooms = await c.env.DB.prepare(
    'SELECT r.*, rt.name as room_type_name FROM rooms r LEFT JOIN room_types rt ON rt.id=r.room_type_id WHERE r.event_id=? AND r.hotel_id=? ORDER BY r.wing, r.floor, r.room_number'
  ).bind(eid, hid).all();
  const beds = await c.env.DB.prepare(
    'SELECT b.*, p.name as participant_name, p.id as pid FROM beds b LEFT JOIN participants p ON p.bed_id=b.id WHERE b.room_id IN (SELECT id FROM rooms WHERE event_id=? AND hotel_id=?) ORDER BY b.label'
  ).bind(eid, hid).all();
  const bedMap: Record<string, any[]> = {};
  for (const b of beds.results) {
    if (!bedMap[b.room_id]) bedMap[b.room_id] = [];
    bedMap[b.room_id].push(b);
  }
  return c.json(rooms.results.map((r: any) => ({ ...r, beds: bedMap[r.id] || [] })));
});

app.post('/generate', async (c) => {
  const { event_id, hotel_id, floors, rooms_per_floor, room_prefix, beds_per_room, wing } = await c.req.json();
  const hid = hotel_id || null;
  const created = [];
  for (let f = 1; f <= floors; f++) {
    for (let r = 1; r <= rooms_per_floor; r++) {
      const rid = uid();
      const rnum = room_prefix + f + String(r).padStart(2, '0');
      await c.env.DB.prepare('INSERT INTO rooms (id,event_id,room_number,floor,hotel_id,wing,status) VALUES(?,?,?,?,?,?,?)')
        .bind(rid, event_id, rnum, String(f), hid, wing||null, 'ready').run();
      for (let b = 1; b <= beds_per_room; b++) {
        await c.env.DB.prepare('INSERT INTO beds (id,room_id,label,bed_type) VALUES(?,?,?,?)')
          .bind(uid(), rid, 'Bed ' + b, b === 1 ? 'double' : 'single').run();
      }
      created.push(rnum);
    }
  }
  return c.json({ created: created.length });
});

app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE participants SET bed_id=NULL,status=? WHERE bed_id IN (SELECT id FROM beds WHERE room_id=?)').bind('allocated', id).run();
  await c.env.DB.prepare('DELETE FROM beds WHERE room_id=?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(id).run();
  return c.json({ ok: true });
});

app.put('/:id/status', async (c) => {
  const { status } = await c.req.json();
  await c.env.DB.prepare('UPDATE rooms SET status=? WHERE id=?').bind(status, c.req.param('id')).run();
  return c.json({ ok: true });
});

export { app as roomRoutes };
