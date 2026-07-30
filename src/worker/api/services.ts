import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/types', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM service_types ORDER BY sort_order').all();
  return c.json(results);
});

app.get('/:eid/dates', async (c) => {
  const eid = c.req.param('eid');
  const { results } = await c.env.DB.prepare(
    'SELECT eds.*,st.name as service_name,st.icon FROM event_date_services eds JOIN service_types st ON st.id=eds.service_type_id WHERE eds.event_id=? ORDER BY eds.service_date,st.sort_order'
  ).bind(eid).all();
  // Group by date
  const byDate: Record<string, any> = {};
  for (const r of results) {
    if (!byDate[r.service_date]) byDate[r.service_date] = { date: r.service_date, services: [] };
    byDate[r.service_date].services.push(r);
  }
  return c.json(Object.values(byDate));
});

app.post('/:eid/dates', async (c) => {
  const eid = c.req.param('eid');
  const { date, services } = await c.req.json(); // services: [{hotel_id, type_id, start_time, end_time}]
  for (const s of services) {
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO event_date_services (id,event_id,hotel_id,service_date,service_type_id,start_time,end_time) VALUES(?,?,?,?,?,?,?)'
    ).bind(uid(), eid, s.hotel_id, date, s.type_id, s.start_time||null, s.end_time||null).run();
  }
  return c.json({ ok: true });
});

app.delete('/:eid/dates/:dateId', async (c) => {
  await c.env.DB.prepare('DELETE FROM event_date_services WHERE id=?').bind(c.req.param('dateId')).run();
  return c.json({ ok: true });
});

app.post('/:eid/assign', async (c) => {
  const eid = c.req.param('eid');
  const { participant_ids, date, type_id, hotel_id_override } = await c.req.json();
  const eds = await c.env.DB.prepare(
    'SELECT id FROM event_date_services WHERE event_id=? AND service_date=? AND service_type_id=?'
  ).bind(eid, date, type_id).first();
  if (!eds) return c.json({ error: 'No service found' }, 400);
  let count = 0;
  for (const pid of participant_ids) {
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO participant_services (id,participant_id,event_date_service_id,hotel_id) VALUES(?,?,?,?)'
    ).bind(uid(), pid, eds.id, hotel_id_override||null).run();
    count++;
  }
  return c.json({ assigned: count });
});

export { app as serviceRoutes };
