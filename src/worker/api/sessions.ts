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
    'INSERT INTO sessions (id,event_id,title,subtitle,description,short_description,speaker_name,speaker_title,speaker_bio,speaker_photo_url,location_id,start_time,end_time,session_date,track,session_type,max_capacity,banner_image_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(uid(), c.req.param('eid'), b.title, b.subtitle||null, b.description||null, b.short_description||null, b.speaker_name||null, b.speaker_title||null, b.speaker_bio||null, b.speaker_photo_url||null, b.location_id||null, b.start_time, b.end_time, b.session_date, b.track||null, b.session_type||'session', b.max_capacity||null, b.banner_image_url||null).run();
  return c.json({ ok: true });
});

app.put('/:eid/:sid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE sessions SET title=?,subtitle=?,description=?,short_description=?,speaker_name=?,speaker_title=?,speaker_bio=?,speaker_photo_url=?,location_id=?,start_time=?,end_time=?,session_date=?,track=?,session_type=?,max_capacity=?,banner_image_url=? WHERE id=?'
  ).bind(b.title, b.subtitle||null, b.description||null, b.short_description||null, b.speaker_name||null, b.speaker_title||null, b.speaker_bio||null, b.speaker_photo_url||null, b.location_id||null, b.start_time, b.end_time, b.session_date, b.track||null, b.session_type||'session', b.max_capacity||null, b.banner_image_url||null, c.req.param('sid')).run();
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
