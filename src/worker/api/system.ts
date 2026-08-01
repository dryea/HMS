import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

export async function logAudit(env: D1Database, eventId: string | null, action: string, entityType: string, entityId: string | null, details: any, actor = 'admin') {
  try {
    await env.prepare(
      'INSERT INTO audit_logs (id,event_id,action,entity_type,entity_id,details,actor) VALUES(?,?,?,?,?,?,?)'
    ).bind(uid(), eventId, action, entityType, entityId, details ? JSON.stringify(details) : null, actor).run();
  } catch {}
}

// GET /api/system/audit?event_id=X
app.get('/audit', async (c) => {
  const eventId = c.req.query('event_id');
  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: string[] = [];
  if (eventId) { sql += ' AND event_id=?'; params.push(eventId); }
  sql += ' ORDER BY created_at DESC LIMIT 200';
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results);
});

// POST /api/system/error — frontend error logging
app.post('/error', async (c) => {
  const { message, stack, url } = await c.req.json();
  try {
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (id,event_id,action,entity_type,entity_id,details,actor) VALUES(?,?,?,?,?,?,?)'
    ).bind(uid(), null, 'error', 'frontend', null, JSON.stringify({ message, stack: stack?.slice(0, 500), url }), 'client').run();
  } catch {}
  return c.json({ ok: true });
});

// POST /api/system/push/subscribe — participant subscribes for push notifications
app.post('/push/subscribe', async (c) => {
  const { endpoint, keys, token } = await c.req.json();
  const p = await c.env.DB.prepare('SELECT id,event_id FROM participants WHERE qr_token=?').bind(token).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  await c.env.DB.prepare(
    'INSERT OR REPLACE INTO push_subscriptions (id,participant_id,event_id,endpoint,keys) VALUES(?,?,?,?,?)'
  ).bind(uid(), p.id, p.event_id, endpoint, keys ? JSON.stringify(keys) : null).run();
  return c.json({ ok: true });
});

// GET /api/system/push/subscriptions?event_id=X
app.get('/push/subscriptions', async (c) => {
  const eventId = c.req.query('event_id');
  let sql = 'SELECT id,participant_id,event_id,endpoint FROM push_subscriptions WHERE 1=1';
  const params: string[] = [];
  if (eventId) { sql += ' AND event_id=?'; params.push(eventId); }
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results);
});

// POST /api/system/push/broadcast — send push notification to all subscribed
app.post('/push/broadcast', async (c) => {
  const { event_id, title, message } = await c.req.json();
  const { results } = await c.env.DB.prepare('SELECT * FROM push_subscriptions WHERE event_id=?').bind(event_id).all();
  // Note: actual Web Push sending requires VAPID keys + web-push library.
  // For now log the broadcast as an announcement and audit entry.
  await logAudit(c.env.DB, event_id, 'push_broadcast', 'notification', null, { title, message, recipients: results.length });
  // Also create an announcement record so it appears in portal
  await c.env.DB.prepare('INSERT INTO announcements (id,event_id,title,message,priority) VALUES(?,?,?,?,?)')
    .bind(uid(), event_id, title, message, 'normal').run();
  return c.json({ queued: results.length });
});

export { app as systemRoutes };
