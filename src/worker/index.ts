import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eventRoutes } from './api/events';
import { roomRoutes } from './api/rooms';
import { participantRoutes } from './api/participants';
import { checkinRoutes } from './api/checkin';
import { authRoutes } from './api/auth';
import { qrRoutes } from './api/qr';
import { reportRoutes } from './api/reporting';
import { hotelRoutes } from './api/hotels';
import { childRoutes } from './api/children';

type Bindings = {
  DB: D1Database;
  QR_BUCKET: R2Bucket;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.route('/api/auth', authRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/rooms', roomRoutes);
app.route('/api/participants', participantRoutes);
app.route('/api/checkin', checkinRoutes);
app.route('/api/qr', qrRoutes);
app.route('/api/reporting', reportRoutes);
app.route('/api/hotels', hotelRoutes);
app.route('/api/participants', childRoutes);

app.get('*', async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404) {
    return c.env.ASSETS.fetch(new URL('/index.html', c.req.url).toString());
  }
  return res;
});

export default app;
