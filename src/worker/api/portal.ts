import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.get('/:token', async (c) => {
  const token = c.req.param('token');
  const p = await c.env.DB.prepare(
    'SELECT p.id,p.name,p.phone,p.email,p.company,p.status,p.qr_token,r.room_number,b.label as bed_label,h.name as hotel_name,h.address as hotel_address, e.id as event_id,e.name as event_name,e.description,e.start_date,e.end_date,e.event_code,e.logo_url,e.banner_color,e.accent_color FROM participants p JOIN events e ON e.id=p.event_id LEFT JOIN beds b ON b.id=p.bed_id LEFT JOIN rooms r ON r.id=b.room_id LEFT JOIN hotels h ON h.id=p.hotel_id WHERE p.qr_token=?'
  ).bind(token).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  return c.json({ participant: p });
});

app.get('/:token/sessions', async (c) => {
  const token = c.req.param('token');
  const p = await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(token).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const sessions = await c.env.DB.prepare(
    'SELECT s.*,l.name as location_name, (SELECT id FROM participant_sessions WHERE participant_id=? AND session_id=s.id) as booked FROM sessions s LEFT JOIN locations l ON l.id=s.location_id WHERE s.event_id=? ORDER BY s.session_date,s.start_time'
  ).bind(p.id, p.event_id).all();
  return c.json({ sessions: sessions.results, participant_id: p.id });
});

app.post('/:token/bookmark', async (c) => {
  const { session_id } = await c.req.json();
  const p = await c.env.DB.prepare('SELECT id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const existing = await c.env.DB.prepare('SELECT id FROM participant_sessions WHERE participant_id=? AND session_id=?').bind(p.id, session_id).first();
  if (existing) {
    await c.env.DB.prepare('DELETE FROM participant_sessions WHERE id=?').bind(existing.id).run();
    return c.json({ bookmarked: false });
  }
  await c.env.DB.prepare('INSERT INTO participant_sessions (id,participant_id,session_id) VALUES(?,?,?)').bind(crypto.randomUUID(), p.id, session_id).run();
  return c.json({ bookmarked: true });
});

app.get('/:token/locations', async (c) => {
  const p = await c.env.DB.prepare('SELECT event_id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const { results } = await c.env.DB.prepare(
    'SELECT l.*,h.name as hotel_name FROM locations l LEFT JOIN hotels h ON h.id=l.hotel_id WHERE l.event_id=? ORDER BY l.floor,l.name'
  ).bind(p.event_id).all();
  return c.json(results);
});

app.get('/:token/announcements', async (c) => {
  const p = await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const { results } = await c.env.DB.prepare(
    'SELECT a.*, (SELECT id FROM announcement_reads WHERE announcement_id=a.id AND participant_id=?) as is_read FROM announcements a WHERE a.event_id=? ORDER BY a.created_at DESC'
  ).bind(p.id, p.event_id).all();
  return c.json(results);
});

app.post('/:token/announcements/:aid/read', async (c) => {
  const p = await c.env.DB.prepare('SELECT id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  await c.env.DB.prepare('INSERT OR IGNORE INTO announcement_reads (id,announcement_id,participant_id) VALUES(?,?,?)')
    .bind(crypto.randomUUID(), c.req.param('aid'), p.id).run();
  return c.json({ ok: true });
});

app.get('/:token/survey', async (c) => {
  const p = (await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first()) as any;
  if (!p) return c.json({ error: 'Not found' }, 404);
  const s = (await c.env.DB.prepare('SELECT id,title,questions FROM surveys WHERE event_id=? AND active=1').bind(p.event_id).first()) as any;
  if (!s) return c.json({ survey: null });
  const hasResponded = await c.env.DB.prepare('SELECT id FROM survey_responses WHERE survey_id=? AND participant_id=?').bind(s.id, p.id).first();
  return c.json({ survey: { id: s.id, title: s.title, questions: JSON.parse((s.questions as string)||'[]') }, has_responded: !!hasResponded });
});

app.post('/:token/survey', async (c) => {
  const { answers } = await c.req.json();
  const p = await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const s = await c.env.DB.prepare('SELECT id FROM surveys WHERE event_id=? AND active=1').bind(p.event_id).first();
  if (!s) return c.json({ error: 'No active survey' }, 400);
  await c.env.DB.prepare('INSERT OR REPLACE INTO survey_responses (id,survey_id,participant_id,answers) VALUES(?,?,?,?)')
    .bind(crypto.randomUUID(), s.id, p.id, JSON.stringify(answers)).run();
  return c.json({ ok: true, submitted: true });
});

// Session detail with Q&A and feedback status
app.get('/:token/sessions/:sid', async (c) => {
  const token = c.req.param('token');
  const p = await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(token).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const session = await c.env.DB.prepare(
    'SELECT s.*,l.name as location_name,(SELECT id FROM participant_sessions WHERE participant_id=? AND session_id=s.id) as booked,(SELECT id FROM session_feedback WHERE participant_id=? AND session_id=s.id) as has_feedback FROM sessions s LEFT JOIN locations l ON l.id=s.location_id WHERE s.id=?'
  ).bind(p.id, p.id, c.req.param('sid')).first();
  if (!session) return c.json({ error: 'Not found' }, 404);
  // Q&A count
  const qaCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM session_questions WHERE session_id=? AND hidden=0').bind(c.req.param('sid')).first();
  session.question_count = qaCount?.c||0;
  return c.json(session);
});

// My dietary preference
app.get('/:token/dietary', async (c) => {
  const p = await c.env.DB.prepare('SELECT dietary FROM participants WHERE qr_token=?').bind(c.req.param('token')).first();
  return c.json({ dietary: p?.dietary||'' });
});

app.post('/:token/dietary', async (c) => {
  const { dietary } = await c.req.json();
  await c.env.DB.prepare('UPDATE participants SET dietary=? WHERE qr_token=?').bind(dietary, c.req.param('token')).run();
  return c.json({ ok: true });
});

export { app as portalRoutes };
