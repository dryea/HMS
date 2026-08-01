import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuilding, IconCalendar, IconUsers, IconCheck, IconPlus, IconRefresh } from '@tabler/icons-react';
import { api } from '../api/client';
import { Skeleton } from '@mantine/core';

export default function SuperAdmin() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.reporting.superAdmin().then(setData).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="page-container">
      <div className="stat-grid">
        {[1,2,3,4].map(i => <Skeleton key={i} height={96} radius={16} />)}
      </div>
    </div>
  );

  if (!data || !data.total_events) return (
    <div className="page-container">
      <div className="md3-card p-24" style={{ textAlign: 'center' }}>
        <IconCalendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h2 className="md3-title-large m-0 mb-8">No events yet</h2>
        <p className="md3-body-medium m-0 mb-16" style={{ color: 'var(--md-on-surface-variant)' }}>Create your first event to get started.</p>
        <button className="md3-btn" onClick={() => nav('/admin/events')}>Create Event</button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-24">
        <h1 className="md3-headline-small m-0">Overview</h1>
        <div className="flex gap-8">
          <button className="md3-btn-text" onClick={load}><IconRefresh size={18} /> Refresh</button>
          <button className="md3-btn" onClick={() => nav('/admin/events')}><IconPlus size={18} /> New Event</button>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { icon: IconBuilding, value: data.total_hotels, label: 'Hotels' },
          { icon: IconCalendar, value: data.total_events, label: 'Events' },
          { icon: IconUsers, value: data.total_participants, label: 'Participants' },
          { icon: IconCheck, value: data.active_checkins, label: 'Checked In' },
        ].map((item) => (
          <div key={item.label} className="md3-card stat-card p-20">
            <item.icon size={24} style={{ color: 'var(--md-primary)', marginBottom: 8 }} />
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <h2 className="md3-title-large m-0 mb-16">All Events</h2>

      <div className="flex flex-col gap-12">
        {(data.events||[]).map((e:any) => (
          <div key={e.id} className="md3-card p-16" style={{ cursor: 'pointer' }} onClick={() => nav('/admin/events/'+e.id)}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-12">
                <IconCalendar size={20} style={{ color: 'var(--md-primary)' }} />
                <h3 className="md3-title-medium m-0">{e.name}</h3>
                <span className="md3-badge">{e.event_code}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="md3-body-small" style={{ color: 'var(--md-on-surface-variant)' }}>{e.start_date} to {e.end_date}</span>
              </div>
            </div>
            <div className="flex gap-24">
              <span className="md3-body-small" style={{ color: 'var(--md-on-surface-variant)' }}><IconUsers size={14} style={{verticalAlign:'middle',marginRight:4}} />{e.participants||0} participants</span>
              <span className="md3-body-small" style={{ color: 'var(--md-on-surface-variant)' }}><IconBuilding size={14} style={{verticalAlign:'middle',marginRight:4}} />{e.rooms||0} rooms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
