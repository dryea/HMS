import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Group, Title, Text, ActionIcon } from '@mantine/core';
import { IconDoorExit } from '@tabler/icons-react';
import TabBar from './TabBar';

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();

  // Extract eventId from path if present
  const parts = loc.pathname.split('/');
  const eventIdx = parts.indexOf('events');
  const eventId = eventIdx > 0 && eventIdx + 1 < parts.length ? parts[eventIdx + 1] : undefined;

  return (
    <AppShell header={{ height: 56 }} padding="md" pb={70}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group style={{ cursor: 'pointer' }} onClick={() => nav('/admin')}>
            <Title order={4}>HMS</Title>
          </Group>
          <Group>
            <Text size="sm" c="dimmed">Admin</Text>
            <ActionIcon variant="subtle" color="red" onClick={() => nav('/')}>
              <IconDoorExit size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet context={{ eventId }} />
      </AppShell.Main>
      <TabBar eventId={eventId} />
    </AppShell>
  );
}
