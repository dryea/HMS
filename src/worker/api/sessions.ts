import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/:eid', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT s.*,l.name as location_name FROM sessions s LEFT JOIN locations l ON l.id=s.location_id WHERE s.event_id=? ORDER BY s.session_date,s.start_time'
  ).bind(c.req.param('eid')).all();
  return c.json(results);
});

app.post('/:eid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare(
    'INSERT INTO sessions (id,event_id,title,description,speaker_name,speaker_title,location_id,start_time,end_time,session_date,track,max_capacity) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(uid(), c.req.param('eid'), b.title, b.description||null, b.speaker_name||null, b.speaker_title||null, b.location_id||null, b.start_time, b.end_time, b.session_date, b.track||null, b.max_capacity||null).run();
  return c.json({ ok: true });
});

app.put('/:eid/:sid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE sessions SET title=?,description=?,speaker_name=?,speaker_title=?,location_id=?,start_time=?,end_time=?,session_date=?,track=?,max_capacity=? WHERE id=?'
  ).bind(b.title, b.description||null, b.speaker_name||null, b.speaker_title||null, b.location_id||null, b.start_time, b.end_time, b.session_date, b.track||null, b.max_capacity||null, c.req.param('sid')).run();
  return c.json({ ok: true });
});

app.delete('/:eid/:sid', async (c) => {
  await c.env.DB.prepare('DELETE FROM participant_sessions WHERE session_id=?').bind(c.req.param('sid')).run();
  await c.env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(c.req.param('sid')).run();
  return c.json({ ok: true });
});

app.get('/:eid/participants/:sid', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT p.id,p.name,p.phone,p.company,ps.attended FROM participants p JOIN participant_sessions ps ON ps.participant_id=p.id WHERE ps.session_id=? ORDER BY p.name'
  ).bind(c.req.param('sid')).all();
  return c.json(results);
});

app.post('/:eid/bookmark', async (c) => {
  const { participant_id, session_id } = await c.req.json();
  const existing = await c.env.DB.prepare('SELECT id FROM participant_sessions WHERE participant_id=? AND session_id=?').bind(participant_id, session_id).first();
  if (existing) {
    await c.env.DB.prepare('DELETE FROM participant_sessions WHERE id=?').bind(existing.id).run();
    return c.json({ bookmarked: false });
  }
  await c.env.DB.prepare('INSERT INTO participant_sessions (id,participant_id,session_id) VALUES(?,?,?)').bind(uid(), participant_id, session_id).run();
  return c.json({ bookmarked: true });
});

export { app as sessionRoutes };
