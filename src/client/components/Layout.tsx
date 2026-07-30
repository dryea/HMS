import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Group, Title, Text, ActionIcon } from '@mantine/core';
import { IconDoorExit } from '@tabler/icons-react';
import TabBar from './TabBar';
import ThemeProvider from './ThemeProvider';

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();

  // Extract eventId from path if present
  const parts = loc.pathname.split('/');
  const eventIdx = parts.indexOf('events');
  const eventId = eventIdx > 0 && eventIdx + 1 < parts.length ? parts[eventIdx + 1] : undefined;

  return (
    <AppShell header={{ height: 56 }} padding="md" pb={70} style={{ background: '#EBB8B6' }}>
      <AppShell.Header style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group style={{ cursor: 'pointer' }} onClick={() => nav('/admin')}>
            <Title order={4} style={{ fontFamily: 'Playfair Display, serif', color: '#23262A' }}>HMS</Title>
          </Group>
          <Group>
            <Text size="sm" c="#717680">Admin</Text>
            <ActionIcon variant="subtle" color="dark" onClick={() => nav('/')}>
              <IconDoorExit size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <ThemeProvider eventId={eventId}>
          <Outlet context={{ eventId }} />
        </ThemeProvider>
      </AppShell.Main>
      <TabBar eventId={eventId} />
    </AppShell>
  );
}
