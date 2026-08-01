import { Hono } from 'hono';
// @ts-ignore
import QRCode from 'qrcode/lib/server';
import JSZip from 'jszip';

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
  const p = (await c.env.DB.prepare('SELECT qr_r2_key FROM participants WHERE qr_token=?').bind(token).first()) as any;
  let image: ArrayBuffer | null = null;
  if (p?.qr_r2_key) {
    const obj = await c.env.QR_BUCKET.get(p.qr_r2_key as string);
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
  const ev = (await c.env.DB.prepare('SELECT event_code FROM events WHERE id=?').bind(eid).first()) as any;
  const origin = baseUrl(c.req.url);
  for (const p of parts as any[]) {
    const url = origin + '/staff/' + ev.event_code + '?token=' + p.qr_token;
    const buf = await QRCode.toBuffer(url, { width: 400, margin: 2 });
    const key = 'qr/' + eid + '/' + p.id + '.png';
    await c.env.QR_BUCKET.put(key, buf, { httpMetadata: { contentType: 'image/png' } });
    await c.env.DB.prepare('UPDATE participants SET qr_r2_key=? WHERE id=?').bind(key, p.id).run();
  }
  return c.json({ count: parts.length });
});

// Download all participant QR codes as a ZIP
app.get('/download-all/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const ev = (await c.env.DB.prepare('SELECT event_code FROM events WHERE id=?').bind(eid).first()) as any;
  const { results: parts } = await c.env.DB.prepare(
    'SELECT p.id,p.name,p.qr_token,r.room_number FROM participants p LEFT JOIN beds b ON b.id=p.bed_id LEFT JOIN rooms r ON r.id=b.room_id WHERE p.event_id=? ORDER BY p.name'
  ).bind(eid).all();
  const origin = baseUrl(c.req.url);
  const zip = new JSZip();
  for (const p of parts as any[]) {
    const url = origin + '/staff/' + ev.event_code + '?token=' + p.qr_token;
    const buf = await QRCode.toBuffer(url, { width: 400, margin: 2 });
    const safeName = p.name.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 30);
    const roomSuffix = p.room_number ? '_' + p.room_number : '';
    zip.file(safeName + roomSuffix + '.png', buf);
  }
  const zipBlob = await zip.generateAsync({ type: 'uint8array' });
  return c.newResponse(zipBlob as any, {
    headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename=qrcodes.zip' }
  });
});

export { app as qrRoutes };
