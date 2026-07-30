import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/:eid', async (c) => {
  const s = await c.env.DB.prepare('SELECT * FROM surveys WHERE event_id=?').bind(c.req.param('eid')).first();
  return c.json(s || {});
});

app.post('/:eid', async (c) => {
  const b = await c.req.json();
  const existing = await c.env.DB.prepare('SELECT id FROM surveys WHERE event_id=?').bind(c.req.param('eid')).first();
  if (existing) {
    await c.env.DB.prepare('UPDATE surveys SET title=?,questions=?,active=? WHERE id=?').bind(b.title||'Event Feedback', JSON.stringify(b.questions||[]), b.active?1:0, existing.id).run();
    return c.json({ ok: true });
  }
  await c.env.DB.prepare('INSERT INTO surveys (id,event_id,title,questions,active) VALUES(?,?,?,?,?)')
    .bind(uid(), c.req.param('eid'), b.title||'Event Feedback', JSON.stringify(b.questions||[]), b.active?1:0).run();
  return c.json({ ok: true });
});

app.post('/:eid/response', async (c) => {
  const { participant_id, answers } = await c.req.json();
  const s = await c.env.DB.prepare('SELECT id FROM surveys WHERE event_id=? AND active=1').bind(c.req.param('eid')).first();
  if (!s) return c.json({ error: 'No active survey' }, 400);
  await c.env.DB.prepare('INSERT OR REPLACE INTO survey_responses (id,survey_id,participant_id,answers) VALUES(?,?,?,?)')
    .bind(uid(), s.id, participant_id, JSON.stringify(answers)).run();
  return c.json({ ok: true, submitted: true });
});

app.get('/:eid/responses', async (c) => {
  const s = await c.env.DB.prepare('SELECT id,questions FROM surveys WHERE event_id=?').bind(c.req.param('eid')).first();
  if (!s) return c.json({ responses: [], analytics: {} });
  const { results } = await c.env.DB.prepare(
    'SELECT r.*,p.name as participant_name FROM survey_responses r JOIN participants p ON p.id=r.participant_id WHERE r.survey_id=? ORDER BY r.submitted_at'
  ).bind(s.id).all();
  // Build analytics
  const questions = JSON.parse(s.questions||'[]');
  const analytics: any = {};
  for (const q of questions) {
    const counts: Record<string, number> = {};
    if (q.type === 'rating') {
      for (let i = 1; i <= 5; i++) counts[String(i)] = 0;
    }
    for (const r of results) {
      const ans = JSON.parse(r.answers||'{}');
      const val = ans[q.id];
      if (val) { counts[String(val)] = (counts[String(val)]||0) + 1; }
    }
    analytics[q.id] = { question: q.question, type: q.type, counts };
  }
  return c.json({ responses: results, analytics, total: results.length });
});

export { app as surveyRoutes };
