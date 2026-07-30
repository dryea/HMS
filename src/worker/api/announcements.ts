import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.get('/:eid', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT *, (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id=a.id) as read_count FROM announcements a WHERE event_id=? ORDER BY created_at DESC')
    .bind(c.req.param('eid')).all();
  return c.json(results);
});

app.post('/:eid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare('INSERT INTO announcements (id,event_id,title,message,priority) VALUES(?,?,?,?,?)')
    .bind(uid(), c.req.param('eid'), b.title, b.message, b.priority||'normal').run();
  return c.json({ ok: true });
});

app.delete('/:eid/:aid', async (c) => {
  await c.env.DB.prepare('DELETE FROM announcement_reads WHERE announcement_id=?').bind(c.req.param('aid')).run();
  await c.env.DB.prepare('DELETE FROM announcements WHERE id=?').bind(c.req.param('aid')).run();
  return c.json({ ok: true });
});

export { app as announcementRoutes };
