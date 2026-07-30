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

// Get participants for a specific service with attendance status
app.get('/:eid/participants/:edsId', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ps.id as ps_id, p.id, p.name, p.phone, p.hotel_id, sa.attended, sa.marked_at
     FROM participant_services ps
     JOIN participants p ON p.id=ps.participant_id
     LEFT JOIN service_attendance sa ON sa.participant_service_id=ps.id
     WHERE ps.event_date_service_id=?
     ORDER BY p.name`
  ).bind(c.req.param('edsId')).all();
  return c.json(results);
});

// Mark individual attendance for a service
app.post('/:eid/attendance', async (c) => {
  const { participant_service_id, attended } = await c.req.json();
  const existing = await c.env.DB.prepare('SELECT id FROM service_attendance WHERE participant_service_id=?').bind(participant_service_id).first();
  if (existing) {
    await c.env.DB.prepare('UPDATE service_attendance SET attended=?, marked_at=datetime(?) WHERE id=?').bind(attended?1:0, new Date().toISOString(), existing.id).run();
  } else {
    await c.env.DB.prepare('INSERT INTO service_attendance (id,participant_service_id,attended,marked_at) VALUES(?,?,?,?)')
      .bind(uid(), participant_service_id, attended?1:0, new Date().toISOString()).run();
  }
  return c.json({ ok: true });
});

// Mark all participants for a service as present
app.post('/:eid/attendance/bulk', async (c) => {
  const { event_date_service_id } = await c.req.json();
  const { results } = await c.env.DB.prepare('SELECT id as ps_id FROM participant_services WHERE event_date_service_id=?').bind(event_date_service_id).all();
  for (const ps of results) {
    const existing = await c.env.DB.prepare('SELECT id FROM service_attendance WHERE participant_service_id=?').bind(ps.ps_id).first();
    if (existing) {
      await c.env.DB.prepare('UPDATE service_attendance SET attended=1, marked_at=datetime(?) WHERE id=?').bind(new Date().toISOString(), existing.id).run();
    } else {
      await c.env.DB.prepare('INSERT INTO service_attendance (id,participant_service_id,attended,marked_at) VALUES(?,?,?,?)')
        .bind(uid(), ps.ps_id, 1, new Date().toISOString()).run();
    }
  }
  return c.json({ marked: results.length });
});

export { app as serviceRoutes };
