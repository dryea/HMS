import { Hono } from 'hono';
import QRCode from 'qrcode/lib/server';

const app = new Hono<{ Bindings: { DB: D1Database; QR_BUCKET: R2Bucket } }>();

function baseUrl(url: string): string {
  const u = new URL(url);
  return u.origin;
}

app.get('/:token', async (c) => {
  const token = c.req.param('token');
  const p = await c.env.DB.prepare(
    'SELECT p.id,p.name,p.event_id,e.name as event_name,e.event_code FROM participants p JOIN events e ON e.id=p.event_id WHERE p.qr_token=?'
  ).bind(token).first();
  if (!p) return c.json({ error: 'Not found' }, 404);
  const origin = baseUrl(c.req.url);
  const checkinUrl = origin + '/staff/' + p.event_code + '?token=' + token;
  const qrDataUrl = await QRCode.toDataURL(checkinUrl, { width: 400, margin: 2 });
  return c.json({ participant: p, qr_data_url: qrDataUrl, checkin_url: checkinUrl });
});

app.get('/:token/image', async (c) => {
  const token = c.req.param('token');
  const p = await c.env.DB.prepare('SELECT qr_r2_key FROM participants WHERE qr_token=?').bind(token).first();
  let image: ArrayBuffer | null = null;
  if (p?.qr_r2_key) {
    const obj = await c.env.QR_BUCKET.get(p.qr_r2_key);
    if (obj) image = await obj.arrayBuffer();
  }
  if (!image) {
    const origin = baseUrl(c.req.url);
    image = await QRCode.toBuffer(origin + '/api/qr/' + token, { width: 400, margin: 2 });
  }
  return c.newResponse(image, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public,max-age=3600' } });
});

app.post('/generate/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const { results: parts } = await c.env.DB.prepare('SELECT id,qr_token FROM participants WHERE event_id=?').bind(eid).all();
  const ev = await c.env.DB.prepare('SELECT event_code FROM events WHERE id=?').bind(eid).first();
  const origin = baseUrl(c.req.url);
  for (const p of parts) {
    const url = origin + '/staff/' + ev.event_code + '?token=' + p.qr_token;
    const buf = await QRCode.toBuffer(url, { width: 400, margin: 2 });
    const key = 'qr/' + eid + '/' + p.id + '.png';
    await c.env.QR_BUCKET.put(key, buf, { httpMetadata: { contentType: 'image/png' } });
    await c.env.DB.prepare('UPDATE participants SET qr_r2_key=? WHERE id=?').bind(key, p.id).run();
  }
  return c.json({ count: parts.length });
});

export { app as qrRoutes };
