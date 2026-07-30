import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/:pid/children', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM participant_children WHERE participant_id=? ORDER BY name')
    .bind(c.req.param('pid')).all();
  return c.json(results);
});

app.post('/:pid/children', async (c) => {
  const { name, age } = await c.req.json();
  await c.env.DB.prepare('INSERT INTO participant_children (id,participant_id,name,age) VALUES(?,?,?,?)')
    .bind(uid(), c.req.param('pid'), name, age||null).run();
  return c.json({ ok: true });
});

app.put('/children/:cid', async (c) => {
  const { name, age } = await c.req.json();
  await c.env.DB.prepare('UPDATE participant_children SET name=?,age=? WHERE id=?')
    .bind(name, age||null, c.req.param('cid')).run();
  return c.json({ ok: true });
});

app.delete('/children/:cid', async (c) => {
  await c.env.DB.prepare('DELETE FROM participant_children WHERE id=?').bind(c.req.param('cid')).run();
  return c.json({ ok: true });
});

export { app as childRoutes };
