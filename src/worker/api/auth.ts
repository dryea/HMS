import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database; ADMIN_PASSWORD: string } }>();
function uid() { return crypto.randomUUID(); }

app.post('/staff', async (c) => {
  const { code } = await c.req.json();
  if (!code) return c.json({ error: 'Staff code required' }, 400);
  const row = await c.env.DB.prepare(
    `SELECT eh.event_id, eh.hotel_id, e.name as event_name, e.event_code, e.start_date, e.end_date,
            h.name as hotel_name, h.address as hotel_address
     FROM event_hotels eh
     JOIN events e ON e.id = eh.event_id
     JOIN hotels h ON h.id = eh.hotel_id
     WHERE LOWER(eh.code) = LOWER(?) AND e.is_active = 1`
  ).bind(code).first();
  if (!row) return c.json({ error: 'Invalid staff code' }, 401);
  return c.json({ token: uid(), event: { id: row.event_id, name: row.event_name, code: row.event_code, start_date: row.start_date, end_date: row.end_date }, hotel: { id: row.hotel_id, name: row.hotel_name, address: row.hotel_address } });
});

app.post('/admin', async (c) => {
  const { password } = await c.req.json();
  if (password !== c.env.ADMIN_PASSWORD) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ token: uid(), role: 'admin' });
});

export { app as authRoutes };
