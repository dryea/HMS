import { Hono } from 'hono';
const app = new Hono<{ Bindings: { DB: D1Database; QR_BUCKET: R2Bucket } }>();

app.get('/:eid', async (c) => {
  const e = await c.env.DB.prepare('SELECT logo_url,banner_color,accent_color FROM events WHERE id=?').bind(c.req.param('eid')).first();
  return c.json(e || {});
});

app.put('/:eid', async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare('UPDATE events SET logo_url=?,banner_color=?,accent_color=? WHERE id=?')
    .bind(b.logo_url||null, b.banner_color||'#1a1b1e', b.accent_color||'#4c6ef5', c.req.param('eid')).run();
  return c.json({ ok: true });
});

app.post('/:eid/logo', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) return c.json({ error: 'No file' }, 400);
  const key = 'branding/' + c.req.param('eid') + '/logo.png';
  await c.env.QR_BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  await c.env.DB.prepare('UPDATE events SET logo_url=? WHERE id=?').bind(key, c.req.param('eid')).run();
  return c.json({ url: key });
});

export { app as brandingRoutes };
