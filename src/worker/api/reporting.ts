import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.get('/dashboard/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const stats = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as count FROM participants WHERE event_id=? GROUP BY status"
  ).bind(eid).all();
  const total = await c.env.DB.prepare('SELECT COUNT(*) as c FROM participants WHERE event_id=?').bind(eid).first();
  const rooms = await c.env.DB.prepare('SELECT COUNT(*) as c FROM rooms WHERE event_id=?').bind(eid).first();
  const beds = await c.env.DB.prepare(
    'SELECT COUNT(*) as total, SUM(is_occupied) as occupied, SUM(CASE WHEN is_occupied=0 THEN 1 ELSE 0 END) as vacant FROM beds WHERE room_id IN (SELECT id FROM rooms WHERE event_id=?)'
  ).bind(eid).first();
  // Per-hotel breakdown
  const { results: hotels } = await c.env.DB.prepare(
    `SELECT h.id, h.name, 
            COUNT(DISTINCT r.id) as rooms,
            COUNT(DISTINCT b.id) as beds,
            SUM(b.is_occupied) as occupied,
            (SELECT COUNT(*) FROM participants WHERE event_id=? AND hotel_id=h.id) as participants
     FROM hotels h
     LEFT JOIN rooms r ON r.hotel_id=h.id AND r.event_id=?
     LEFT JOIN beds b ON b.room_id=r.id
     JOIN event_hotels eh ON eh.hotel_id=h.id AND eh.event_id=?
     GROUP BY h.id`
  ).bind(eid, eid, eid).all();
  return c.json({
    total: total?.c||0, rooms: rooms?.c||0,
    beds_total: beds?.total||0, beds_occupied: beds?.occupied||0, beds_vacant: beds?.vacant||0,
    by_status: stats.results, hotels: hotels
  });
});

app.get('/dashboard/:eventId/hotel/:hotelId', async (c) => {
  const eid = c.req.param('eventId');
  const hid = c.req.param('hotelId');
  const stats = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as count FROM participants WHERE event_id=? AND hotel_id=? GROUP BY status"
  ).bind(eid, hid).all();
  const total = await c.env.DB.prepare('SELECT COUNT(*) as c FROM participants WHERE event_id=? AND hotel_id=?').bind(eid, hid).first();
  const rooms = await c.env.DB.prepare('SELECT COUNT(*) as c FROM rooms WHERE event_id=? AND hotel_id=?').bind(eid, hid).first();
  const beds = await c.env.DB.prepare(
    'SELECT COUNT(*) as total, SUM(is_occupied) as occupied, SUM(CASE WHEN is_occupied=0 THEN 1 ELSE 0 END) as vacant FROM beds WHERE room_id IN (SELECT id FROM rooms WHERE event_id=? AND hotel_id=?)'
  ).bind(eid, hid).first();
  return c.json({
    total: total?.c||0, rooms: rooms?.c||0,
    beds_total: beds?.total||0, beds_occupied: beds?.occupied||0, beds_vacant: beds?.vacant||0,
    by_status: stats.results
  });
});

app.get('/super-admin', async (c) => {
  const totalEvents = await c.env.DB.prepare('SELECT COUNT(*) as c FROM events').first();
  const totalParticipants = await c.env.DB.prepare('SELECT COUNT(*) as c FROM participants').first();
  const totalHotels = await c.env.DB.prepare('SELECT COUNT(*) as c FROM hotels').first();
  const activeCheckins = await c.env.DB.prepare("SELECT COUNT(*) as c FROM participants WHERE status='checked_in'").first();
  const { results: eventSummaries } = await c.env.DB.prepare(
    `SELECT e.id, e.name, e.event_code, e.start_date, e.end_date,
            (SELECT COUNT(*) FROM participants WHERE event_id=e.id) as participants,
            (SELECT COUNT(*) FROM rooms WHERE event_id=e.id) as rooms
     FROM events e ORDER BY e.created_at DESC`
  ).all();
  return c.json({
    total_events: totalEvents?.c||0, total_participants: totalParticipants?.c||0,
    total_hotels: totalHotels?.c||0, active_checkins: activeCheckins?.c||0,
    events: eventSummaries
  });
});

app.get('/export/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const { results } = await c.env.DB.prepare(
    `SELECT p.ein, p.name, p.phone, p.email, p.company, p.department,
            h.name as hotel_name, r.room_number, b.label as bed_label, p.status, p.qr_token
     FROM participants p
     LEFT JOIN hotels h ON h.id=p.hotel_id
     LEFT JOIN beds b ON b.id=p.bed_id
     LEFT JOIN rooms r ON r.id=b.room_id
     WHERE p.event_id=? ORDER BY h.name, r.room_number, b.label`
  ).bind(eid).all();
  const headers = 'EIN,Name,Phone,Email,Company,Department,Hotel,Room,Bed,Status,QR Token\n';
  const rows = results.map((r: any) =>
    '"'+[r.ein||'',r.name,r.phone||'',r.email||'',r.company||'',r.department||'',r.hotel_name||'',r.room_number||'',r.bed_label||'',r.status,r.qr_token||''].join('","')+'"'
  ).join('\n');
  return c.newResponse(headers+rows, { headers: {'Content-Type':'text/csv','Content-Disposition':'attachment;filename=participants.csv','Cache-Control':'no-cache'} });
});

app.get('/pdf/:eventId', async (c) => {
  const eid = c.req.param('eventId');
  const ev = await c.env.DB.prepare('SELECT * FROM events WHERE id=?').bind(eid).first();
  if (!ev) return c.json({ error: 'Not found' }, 404);
  const { results: hotels } = await c.env.DB.prepare(
    'SELECT h.* FROM event_hotels eh JOIN hotels h ON h.id=eh.hotel_id WHERE eh.event_id=?'
  ).bind(eid).all();
  const parts = await c.env.DB.prepare(
    'SELECT p.name,p.phone,p.company,p.status,h.name as hotel_name,r.room_number,b.label as bed_label FROM participants p LEFT JOIN hotels h ON h.id=p.hotel_id LEFT JOIN beds b ON b.id=p.bed_id LEFT JOIN rooms r ON r.id=b.room_id WHERE p.event_id=? ORDER BY h.name,p.name'
  ).bind(eid).all();
  let tableRows = parts.results.map((p:any) =>
    `<tr><td>${p.name}</td><td>${p.phone||'-'}</td><td>${p.hotel_name||'-'}</td><td>${p.room_number||'-'}/${p.bed_label||'-'}</td><td>${p.status}</td></tr>`
  ).join('');
  const stats = await c.env.DB.prepare("SELECT status,COUNT(*) as c FROM participants WHERE event_id=? GROUP BY status").bind(eid).all();
  let statsHtml = (stats.results||[]).map((s:any) => `<span style="margin:0 8px"><strong>${s.status}:</strong> ${s.count}</span>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${ev.name} - Report</title><style>
    body{font-family:sans-serif;padding:20px;color:#333}
    h1{color:#1a1b1e;border-bottom:2px solid #4c6ef5;padding-bottom:8px}
    .stats{display:flex;gap:16px;margin:16px 0;padding:12px;background:#f5f5f5;border-radius:8px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}
    th{background:#4c6ef5;color:white}
    tr:nth-child(even){background:#f9f9f9}
    .hotel-section{margin:20px 0}
    .hotel-section h3{color:#4c6ef5}
    @media print{body{padding:0}.stats{break-inside:avoid}}
  </style></head><body>
    <h1>${ev.name}</h1>
    <p>${ev.start_date} to ${ev.end_date} &mdash; Code: ${ev.event_code}</p>
    <div class="stats">${statsHtml}</div>
    ${hotels.map((h:any)=>`<div class="hotel-section"><h3>${h.name}</h3><p>${h.address}</p></div>`).join('')}
    <table><thead><tr><th>Name</th><th>Phone</th><th>Hotel</th><th>Room/Bed</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
    <p style="margin-top:24px;font-size:12px;color:#999;text-align:center">Generated by HMS &mdash; ${new Date().toLocaleDateString()}</p>
  </body></html>`;
  return c.newResponse(html, { headers: {'Content-Type':'text/html','Cache-Control':'no-cache'} });
});

app.get('/csv-template', async (c) => {
  const csv = 'ein,name,phone,email,company,department,children\n1992,John Doe,+9779800000001,john@company.com,Acme Corp,Sales,"Aarav(3);Neha(5)"';
  return c.newResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=participants_template.csv', 'Cache-Control': 'no-cache' } });
});

export { app as reportRoutes };