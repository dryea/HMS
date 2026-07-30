import { Paper, Group, Text } from '@mantine/core';
import { IconHome, IconBed, IconUsers, IconChartBar, IconCalendar, IconMap, IconBuilding } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

const adminTabs = [
  { label: 'Home', icon: IconHome, path: '/admin' },
  { label: 'Sessions', icon: IconCalendar, path: 'sessions' },
  { label: 'Rooms', icon: IconBed, path: 'rooms' },
  { label: 'People', icon: IconUsers, path: 'participants' },
  { label: 'Services', icon: IconBuilding, path: 'services' },
  { label: 'Locations', icon: IconMap, path: 'locations' },
  { label: 'Dash', icon: IconChartBar, path: 'dashboard' },
];

export default function TabBar({ eventId }: { eventId?: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  const isStaff = loc.pathname.startsWith('/staff');
  const isPortal = loc.pathname.startsWith('/portal');
  if (isStaff || isPortal) return null;

  const current = loc.pathname.split('/').pop() || '';

  return (
    <Paper radius={0} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid var(--mantine-color-dark-4)', overflowX: 'auto' }}>
      <Group justify="space-around" p="xs" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', flexWrap: 'nowrap', minWidth: 'max-content' }}>
        {adminTabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.path === '/admin' ? loc.pathname === '/admin' : current === t.path;
          const canNavigate = eventId || t.path === '/admin';
          return (
            <Group key={t.label} gap={2} align="center" justify="center"
              style={{ flex: '0 0 auto', cursor: canNavigate ? 'pointer' : 'default', opacity: canNavigate ? 1 : 0.4, padding: '0 8px' }}
              onClick={() => { if (canNavigate) nav(t.path === '/admin' ? '/admin' : '/admin/events/' + eventId + '/' + t.path); }}>
              <Icon size={18} color={isActive ? 'var(--mantine-color-blue-5)' : undefined} />
              <Text size="xs" c={isActive ? 'blue' : 'dimmed'} style={{whiteSpace:'nowrap'}}>{t.label}</Text>
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}
