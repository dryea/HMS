const BASE = '';

async function req(path: string, opts?: RequestInit): Promise<any> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error || 'API Error');
  }
  return res.json();
}

export const api = {
  events: {
    list: () => req('/api/events'),
    get: (id: string) => req('/api/events/' + id),
    create: (d: any) => req('/api/events', { method: 'POST', body: JSON.stringify(d) }),
    update: (id: string, d: any) => req('/api/events/' + id, { method: 'PUT', body: JSON.stringify(d) }),
    delete: (id: string) => req('/api/events/' + id, { method: 'DELETE' }),
    stats: (id: string) => req('/api/events/' + id + '/stats'),
  },
  rooms: {
    list: (eid: string) => req('/api/rooms/event/' + eid),
    listByHotel: (eid: string, hid: string) => req('/api/rooms/event/' + eid + '/hotel/' + hid),
    generate: (d: any) => req('/api/rooms/generate', { method: 'POST', body: JSON.stringify(d) }),
    delete: (id: string) => req('/api/rooms/' + id, { method: 'DELETE' }),
    updateStatus: (id: string, status: string) => req('/api/rooms/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  participants: {
    list: (eid: string) => req('/api/participants/event/' + eid),
    listByHotel: (eid: string, hid: string) => req('/api/participants/event/' + eid + '/hotel/' + hid),
    create: (d: any) => req('/api/participants', { method: 'POST', body: JSON.stringify(d) }),
    bulk: (d: any) => req('/api/participants/bulk', { method: 'POST', body: JSON.stringify(d) }),
    assignBed: (id: string, bed_id: string) => req('/api/participants/' + id + '/assign-bed', { method: 'PUT', body: JSON.stringify({ bed_id }) }),
    unassignBed: (id: string) => req('/api/participants/' + id + '/unassign-bed', { method: 'PUT' }),
    delete: (id: string) => req('/api/participants/' + id, { method: 'DELETE' }),
  },
  checkin: {
    list: (eid: string) => req('/api/checkin/event/' + eid),
    scan: (qr_token: string, checked_by?: string, hotel_id?: string, expected_version?: number) =>
      req('/api/checkin/scan', { method: 'POST', body: JSON.stringify({ qr_token, checked_by, hotel_id, expected_version }) }),
    manual: (d: any) => req('/api/checkin/manual', { method: 'POST', body: JSON.stringify(d) }),
  },
  qr: {
    get: (token: string) => req('/api/qr/' + token),
    generate: (eid: string) => req('/api/qr/generate/' + eid, { method: 'POST' }),
  },
  auth: {
    staff: (code: string) => req('/api/auth/staff', { method: 'POST', body: JSON.stringify({ code }) }),
    admin: (password: string) => req('/api/auth/admin', { method: 'POST', body: JSON.stringify({ password }) }),
  },
  reporting: {
    dashboard: (eid: string) => req('/api/reporting/dashboard/' + eid),
    dashboardByHotel: (eid: string, hid: string) => req('/api/reporting/dashboard/' + eid + '/hotel/' + hid),
    superAdmin: () => req('/api/reporting/super-admin'),
  },
  services: {
    listDates: (eid: string) => req('/api/services/' + eid + '/dates'),
    getParticipants: (eid: string, edsId: string) => req('/api/services/' + eid + '/participants/' + edsId),
    markAttendance: (eid: string, d: any) => req('/api/services/' + eid + '/attendance', { method: 'POST', body: JSON.stringify(d) }),
    scanAttendance: (eid: string, d: any) => req('/api/services/' + eid + '/attendance/scan', { method: 'POST', body: JSON.stringify(d) }),
    markBulk: (eid: string, d: any) => req('/api/services/' + eid + '/attendance/bulk', { method: 'POST', body: JSON.stringify(d) }),
  },
};
