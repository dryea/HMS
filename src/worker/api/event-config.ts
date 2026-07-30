import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database; QR_BUCKET: R2Bucket } }>();
function uid() { return crypto.randomUUID(); }

// Image upload
app.post('/upload/:type/:id', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) return c.json({ error: 'No file' }, 400);
  const type = c.req.param('type');
  const id = c.req.param('id');
  const ext = file.name.split('.').pop() || 'png';
  const key = `${type}/${id}.${ext}`;
  await c.env.QR_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return c.json({ url: key });
});

// Custom service types (per event)
app.post('/service-types', async (c) => {
  const { event_id, name, icon } = await c.req.json();
  await c.env.DB.prepare('INSERT INTO service_types (id,name,icon,sort_order,event_id) VALUES(?,?,?,?,?)')
    .bind(uid(), name, icon||'custom', 99, event_id).run();
  return c.json({ ok: true });
});

app.get('/service-types/:eid', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM service_types WHERE event_id IS NULL OR event_id=? ORDER BY sort_order"
  ).bind(c.req.param('eid')).all();
  return c.json(results);
});

// Menu items for a service
app.put('/services/:eid/:dateId/menu', async (c) => {
  const { menu_items } = await c.req.json();
  await c.env.DB.prepare('UPDATE event_date_services SET menu_items=? WHERE id=?')
    .bind(JSON.stringify(menu_items||[]), c.req.param('dateId')).run();
  return c.json({ ok: true });
});

// Dietary preferences
app.put('/participants/:pid/dietary', async (c) => {
  const { dietary } = await c.req.json();
  await c.env.DB.prepare('UPDATE participants SET dietary=? WHERE id=?').bind(dietary, c.req.param('pid')).run();
  return c.json({ ok: true });
});

// Session Q&A
app.get('/sessions/:eid/:sid/questions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT sq.*, p.name as participant_name FROM session_questions sq JOIN participants p ON p.id=sq.participant_id WHERE sq.session_id=? AND sq.hidden=0 ORDER BY sq.upvotes DESC, sq.created_at DESC'
  ).bind(c.req.param('sid')).all();
  return c.json(results);
});

app.post('/sessions/:eid/:sid/questions', async (c) => {
  const { participant_id, question } = await c.req.json();
  await c.env.DB.prepare('INSERT INTO session_questions (id,session_id,participant_id,question) VALUES(?,?,?,?)')
    .bind(uid(), c.req.param('sid'), participant_id, question).run();
  return c.json({ ok: true });
});

app.post('/sessions/:eid/:sid/questions/:qid/upvote', async (c) => {
  await c.env.DB.prepare('UPDATE session_questions SET upvotes=upvotes+1 WHERE id=?').bind(c.req.param('qid')).run();
  return c.json({ ok: true });
});

app.post('/sessions/:eid/:sid/questions/:qid/answer', async (c) => {
  await c.env.DB.prepare('UPDATE session_questions SET answered=1 WHERE id=?').bind(c.req.param('qid')).run();
  return c.json({ ok: true });
});

app.post('/sessions/:eid/:sid/questions/:qid/hide', async (c) => {
  const q = await c.env.DB.prepare('SELECT hidden FROM session_questions WHERE id=?').bind(c.req.param('qid')).first();
  await c.env.DB.prepare('UPDATE session_questions SET hidden=? WHERE id=?').bind(q?.hidden?0:1, c.req.param('qid')).run();
  return c.json({ ok: true });
});

// Session feedback
app.get('/sessions/:eid/:sid/feedback', async (c) => {
  const stats = await c.env.DB.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total, SUM(CASE WHEN rating>=4 THEN 1 ELSE 0 END) as positive FROM session_feedback WHERE session_id=?').bind(c.req.param('sid')).first();
  const { results } = await c.env.DB.prepare('SELECT sf.*, p.name as participant_name FROM session_feedback sf JOIN participants p ON p.id=sf.participant_id WHERE sf.session_id=? ORDER BY sf.created_at DESC').bind(c.req.param('sid')).all();
  return c.json({ stats, feedbacks: results });
});

app.post('/sessions/:eid/:sid/feedback', async (c) => {
  const { participant_id, rating, comment } = await c.req.json();
  await c.env.DB.prepare('INSERT OR REPLACE INTO session_feedback (id,session_id,participant_id,rating,comment) VALUES(?,?,?,?,?)')
    .bind(uid(), c.req.param('sid'), participant_id, rating||null, comment||null).run();
  return c.json({ ok: true });
});

export { app as eventConfigRoutes };
