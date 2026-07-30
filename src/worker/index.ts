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
import { sessionRoutes } from './api/sessions';
import { locationRoutes } from './api/locations';
import { announcementRoutes } from './api/announcements';
import { surveyRoutes } from './api/surveys';
import { brandingRoutes } from './api/branding';
import { portalRoutes } from './api/portal';
import { serviceRoutes } from './api/services';
import { reportExtRoutes } from './api/reporting-ext';
import { eventConfigRoutes } from './api/event-config';

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
app.route('/api/sessions', sessionRoutes);
app.route('/api/locations', locationRoutes);
app.route('/api/announcements', announcementRoutes);
app.route('/api/surveys', surveyRoutes);
app.route('/api/branding', brandingRoutes);
app.route('/api/portal', portalRoutes);
app.route('/api/services', serviceRoutes);
app.route('/api/reporting-ext', reportExtRoutes);
app.route('/api/event-config', eventConfigRoutes);

app.get('*', async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404) {
    return c.env.ASSETS.fetch(new URL('/index.html', c.req.url).toString());
  }
  return res;
});

export default app;
