import { Paper, Group, Text } from '@mantine/core';
import { IconHome, IconBed, IconUsers, IconChartBar, IconBuilding } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

const adminTabs = [
  { label: 'Home', icon: IconHome, path: '/admin' },
  { label: 'Rooms', icon: IconBed, path: 'rooms' },
  { label: 'People', icon: IconUsers, path: 'participants' },
  { label: 'Dashboard', icon: IconChartBar, path: 'dashboard' },
  { label: 'Services', icon: IconBuilding, path: 'services' },
];

export default function TabBar({ eventId }: { eventId?: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  const isStaff = loc.pathname.startsWith('/staff');
  if (isStaff) return null;

  const current = loc.pathname.split('/').pop() || '';

  return (
    <Paper radius={0} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: '1px solid var(--mantine-color-dark-4)' }}>
      <Group justify="space-around" p="xs" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        {adminTabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.path === current || (t.path === 'rooms' && current === 'rooms') || (t.path === 'participants' && current === 'participants')
            || (t.path === 'dashboard' && current === 'dashboard') || (t.path === 'services' && current === 'services')
            || (t.path === '/admin' && loc.pathname === '/admin');
          const canNavigate = eventId || t.path === '/admin';
          return (
            <Group key={t.label} gap={2} align="center" justify="center"
              style={{ flex: 1, cursor: canNavigate ? 'pointer' : 'default', opacity: canNavigate ? 1 : 0.4 }}
              onClick={() => { if (canNavigate) nav(t.path === '/admin' ? '/admin' : '/admin/events/' + eventId + '/' + t.path); }}>
              <Icon size={20} color={isActive ? 'var(--mantine-color-blue-5)' : undefined} />
              <Text size="xs" c={isActive ? 'blue' : 'dimmed'}>{t.label}</Text>
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}
