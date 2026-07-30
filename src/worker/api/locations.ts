import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database; QR_BUCKET: R2Bucket } }>();
function uid() { return crypto.randomUUID(); }

app.get('/:eid', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT l.*,h.name as hotel_name FROM locations l LEFT JOIN hotels h ON h.id=l.hotel_id WHERE l.event_id=? ORDER BY l.floor,l.name'
  ).bind(c.req.param('eid')).all();
  return c.json(results);
});

app.post('/:eid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare(
    'INSERT INTO locations (id,event_id,name,description,floor,hotel_id) VALUES(?,?,?,?,?,?)'
  ).bind(uid(), c.req.param('eid'), b.name, b.description||null, b.floor||null, b.hotel_id||null).run();
  return c.json({ ok: true });
});

app.put('/:eid/:lid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE locations SET name=?,description=?,floor=?,map_image_url=?,pin_x=?,pin_y=?,hotel_id=? WHERE id=?'
  ).bind(b.name, b.description||null, b.floor||null, b.map_image_url||null, b.pin_x||null, b.pin_y||null, b.hotel_id||null, c.req.param('lid')).run();
  return c.json({ ok: true });
});

app.delete('/:eid/:lid', async (c) => {
  await c.env.DB.prepare('DELETE FROM sessions WHERE location_id=?').bind(c.req.param('lid')).run();
  await c.env.DB.prepare('DELETE FROM locations WHERE id=?').bind(c.req.param('lid')).run();
  return c.json({ ok: true });
});

app.post('/:eid/:lid/map', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) return c.json({ error: 'No file' }, 400);
  const key = 'maps/' + c.req.param('eid') + '/' + c.req.param('lid') + '.png';
  await c.env.QR_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  await c.env.DB.prepare('UPDATE locations SET map_image_url=? WHERE id=?').bind(key, c.req.param('lid')).run();
  return c.json({ url: key });
});

export { app as locationRoutes };
