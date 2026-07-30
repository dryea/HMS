import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();
function uid() { return crypto.randomUUID(); }

app.post('/', async (c) => {
  const b = await c.req.json();
  const id = uid();
  await c.env.DB.prepare('INSERT INTO hotels (id,name,address,contact_person,contact_phone) VALUES(?,?,?,?,?)')
    .bind(id, b.name, b.address, b.contact_person, b.contact_phone).run();
  return c.json({ id });
});

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM hotels ORDER BY name').all();
  return c.json(results);
});

app.get('/:id', async (c) => {
  const hotel = await c.env.DB.prepare('SELECT * FROM hotels WHERE id=?').bind(c.req.param('id')).first();
  if (!hotel) return c.json({ error: 'Not found' }, 404);
  return c.json(hotel);
});

export { app as hotelRoutes };
