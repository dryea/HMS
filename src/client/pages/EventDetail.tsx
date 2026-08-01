import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconBuilding, IconCopy, IconArrowRight, IconCalendar, IconMap, IconBell, IconClipboardCheck, IconPalette, IconBuildingStore, IconSettings, IconDoor, IconUsers, IconQrcode, IconBed } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>({});

  const load = async () => {
    if (!id) return;
    try { setEvent(await api.events.get(id)); } catch {}
    try { setStats(await api.events.stats(id)); } catch {}
  };
  useEffect(() => { load(); }, [id]);

  if (!event) return <div className="page-container"><p>Loading...</p></div>;

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); notifications.show({ title: 'Copied: ' + code, color: 'blue' }); };
  const openStaff = (code: string) => { window.open('/staff/' + code, '_blank'); };

  const sections = [
    { icon: IconCalendar, label: 'Program', path: 'program' },
    { icon: IconCalendar, label: 'Schedule', path: 'schedule' },
    { icon: IconCalendar, label: 'Sessions', path: 'sessions' },
    { icon: IconMap, label: 'Locations', path: 'locations' },
    { icon: IconBuildingStore, label: 'Services', path: 'services' },
    { icon: IconDoor, label: 'Rooms', path: 'rooms' },
    { icon: IconUsers, label: 'Participants', path: 'participants' },
    { icon: IconUsers, label: 'Name Tags', path: 'nametags' },
    { icon: IconBell, label: 'Activity Log', path: 'activity' },
    { icon: IconQrcode, label: 'Dashboard', path: 'dashboard' },
    { icon: IconBell, label: 'Announcements', path: 'announcements' },
    { icon: IconClipboardCheck, label: 'Survey', path: 'survey' },
    { icon: IconPalette, label: 'Branding', path: 'branding' },
    { icon: IconSettings, label: 'Config', path: 'configure' },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="md3-headline-small m-0">{event.name}</h1>
          <p className="md3-body-medium m-0 mt-4" style={{ color: 'var(--md-on-surface-variant)' }}>{event.description} · {event.start_date} to {event.end_date}</p>
        </div>
        <span className="md3-badge">{event.event_code}</span>
      </div>

      <div className="stat-grid">
        <div className="md3-card stat-card p-16" style={{cursor:'pointer'}} onClick={() => nav('dashboard')}>
          <div className="stat-value">{stats.total||0}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="md3-card stat-card p-16" style={{cursor:'pointer'}} onClick={() => nav('rooms')}>
          <div className="stat-value">{stats.allocated||0}</div>
          <div className="stat-label">Allocated</div>
        </div>
        <div className="md3-card stat-card p-16" style={{cursor:'pointer'}} onClick={() => nav('participants')}>
          <div className="stat-value">{stats.checked_in||0}</div>
          <div className="stat-label">Checked In</div>
        </div>
        <div className="md3-card stat-card p-16">
          <div className="stat-value">{stats.arrived||0}</div>
          <div className="stat-label">Arrived</div>
        </div>
      </div>

      <h2 className="md3-title-medium m-0 mb-12">Hotels</h2>
      {event.hotels?.map((h: any) => (
        <div key={h.id} className="md3-card p-16 mb-12">
          <div className="flex items-center gap-12 mb-8">
            <IconBuilding size={20} style={{ color: 'var(--md-primary)' }} />
            <span className="md3-title-medium m-0">{h.name}</span>
            <span className="md3-body-small" style={{ color: 'var(--md-on-surface-variant)' }}>{h.address}</span>
          </div>
          <div className="flex items-center gap-8 mb-12">
            {h.staff_code && (
              <>
                <span className="md3-chip" style={{cursor:'pointer',background:'var(--md-primary-container)',borderColor:'transparent'}} onClick={() => openStaff(h.staff_code)}>
                  Staff: {h.staff_code}
                </span>
                <button className="md3-btn-text" style={{height:32,minWidth:32,padding:'0 8px'}} onClick={() => copyCode(h.staff_code)} title="Copy"><IconCopy size={14} /></button>
              </>
            )}
          </div>
          <div className="flex gap-8">
            <button className="md3-btn-outlined" style={{height:32,padding:'0 16px'}} onClick={() => nav('hotels/' + h.id + '/rooms')}>Rooms</button>
            <button className="md3-btn-outlined" style={{height:32,padding:'0 16px'}} onClick={() => nav('hotels/' + h.id + '/participants')}>Participants</button>
          </div>
        </div>
      ))}

      <h2 className="md3-title-medium m-0 mb-12 mt-24">Quick Links</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.path} className="md3-card p-16" style={{cursor:'pointer', textAlign:'center'}} onClick={() => nav(s.path)}>
              <Icon size={24} style={{ color: 'var(--md-primary)', marginBottom: 8 }} />
              <div className="md3-label-medium">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
