import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';
import { IconDoorExit, IconHome, IconBed, IconUsers, IconChartBar, IconCalendar, IconBuilding, IconSun, IconMoon, IconLanguage } from '@tabler/icons-react';
import { useI18n } from '../hooks/useI18n';
import { api } from '../api/client';
import Breadcrumbs from './Breadcrumbs';

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { t, toggleLang } = useI18n();

  const parts = loc.pathname.split('/');
  const eventIdx = parts.indexOf('events');
  const eventId = eventIdx > 0 && eventIdx + 1 < parts.length ? parts[eventIdx + 1] : undefined;

  const [eventName, setEventName] = useState('');
  useEffect(() => {
    if (eventId) {
      api.events.get(eventId)
        .then((e: any) => setEventName(e.name))
        .catch(() => {});
    } else {
      setEventName('');
    }
  }, [eventId]);

  const isStaff = loc.pathname.startsWith('/staff');
  if (isStaff) return <Outlet />;

  const tabs = [
    { label: t('home'), icon: IconHome, path: '/admin' },
    { label: t('sessions'), icon: IconCalendar, path: eventId ? '/admin/events/' + eventId + '/sessions' : null },
    { label: t('rooms'), icon: IconBed, path: eventId ? '/admin/events/' + eventId + '/rooms' : null },
    { label: t('people'), icon: IconUsers, path: eventId ? '/admin/events/' + eventId + '/participants' : null },
    { label: t('services'), icon: IconBuilding, path: eventId ? '/admin/events/' + eventId + '/services' : null },
    { label: t('dash'), icon: IconChartBar, path: eventId ? '/admin/events/' + eventId + '/dashboard' : null },
  ];

  const crumbs: { label: string; href?: string }[] = [];
  if (loc.pathname !== '/admin') {
    crumbs.push({ label: 'Super Admin', href: '/admin' });
  }
  if (eventId) {
    crumbs.push({ label: eventName || 'Event', href: '/admin/events/' + eventId });
    if (parts.includes('rooms')) {
      crumbs.push({ label: 'Rooms' });
    } else if (parts.includes('participants')) {
      crumbs.push({ label: 'Participants' });
    } else if (parts.includes('dashboard')) {
      crumbs.push({ label: 'Dashboard' });
    } else if (parts.includes('sessions')) {
      crumbs.push({ label: 'Sessions' });
    } else if (parts.includes('services')) {
      crumbs.push({ label: 'Services' });
    } else if (parts.includes('schedule')) {
      crumbs.push({ label: 'Schedule' });
    } else if (parts.includes('program')) {
      crumbs.push({ label: 'Program' });
    } else if (parts.includes('nametags')) {
      crumbs.push({ label: 'Name Tags' });
    } else if (parts.includes('configure')) {
      crumbs.push({ label: 'Configure' });
    } else if (parts.includes('activity')) {
      crumbs.push({ label: 'Activity' });
    }
  } else if (parts.includes('events') && loc.pathname === '/admin/events') {
    crumbs.push({ label: 'Events' });
  }

  return (
    <div style={{ background: 'var(--md-background)', minHeight: '100vh', paddingBottom: 96 }}>
      <header className="md3-top-app-bar">
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: 1 }} onClick={() => nav('/admin')}>
          <span className="md3-title-large" style={{ color: 'var(--md-on-surface)' }}>SummitStay</span>
        </div>
        <button className="md3-btn-text" onClick={toggleLang} style={{ minWidth: 40, padding: 8 }} title="Language">
          <IconLanguage size={20} />
        </button>
        <button className="md3-btn-text" onClick={toggleColorScheme} style={{ minWidth: 40, padding: 8 }} title="Toggle theme">
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </button>
        <button className="md3-btn-text" onClick={() => nav('/')} style={{ minWidth: 40, padding: 8 }}>
          <IconDoorExit size={20} />
        </button>
      </header>

      <main style={{ maxWidth: 840, margin: '0 auto', padding: '16px 16px 0 16px' }}>
        {crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
        <Outlet context={{ eventId }} />
      </main>

      <nav className="md3-nav-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.path === '/admin' ? loc.pathname === '/admin' : (tab.path && loc.pathname.startsWith(tab.path));
          return (
            <button key={tab.label} className="md3-nav-item" data-active={active || undefined}
              onClick={() => tab.path && nav(tab.path)}
              disabled={!tab.path}
              style={{ opacity: tab.path ? 1 : 0.4 }}>
              <Icon size={24} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
