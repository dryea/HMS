import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, SimpleGrid, Card, Group, Button, Stack, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconBed, IconUsers, IconDoor, IconQrcode, IconBuilding, IconCopy, IconArrowRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

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

  if (!event) return <Container><Text>Loading...</Text></Container>;

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); notifications.show({ title: 'Copied: ' + code, color: 'blue' }); };
  const openStaff = (code: string) => { window.open('/staff/' + code, '_blank'); };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event.name }
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>{event.name}</Title>
        <Group gap={4}>
          <Button size="xs" variant="light" color="blue" onClick={() => nav('/admin/events/' + id + '/dashboard')}>Dashboard</Button>
          <Button size="xs" variant="light" color="grape" onClick={() => nav('/admin/events/' + id + '/rooms')}>Rooms</Button>
          <Button size="xs" variant="light" color="teal" onClick={() => nav('/admin/events/' + id + '/participants')}>Participants</Button>
        </Group>
      </Group>
      <Text c="dimmed" size="sm">{event.description}</Text>
      <Text size="xs" c="dimmed">{event.start_date} to {event.end_date}</Text>
      <Badge mt="xs">{event.event_code}</Badge>

      <SimpleGrid cols={{ base: 2, sm: 4 }} mt="lg">
        <Card withBorder padding="md" radius="md" ta="center" onClick={() => nav('dashboard')}>
          <Text size="xl">{stats.total||0}</Text><Text size="sm">Total</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center" onClick={() => nav('rooms')}>
          <IconDoor size={24} /><Text size="xl">{stats.allocated||0}</Text><Text size="sm">Allocated</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center" onClick={() => nav('participants')}>
          <IconUsers size={24} /><Text size="xl">{stats.checked_in||0}</Text><Text size="sm">Checked In</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center">
          <IconBed size={24} /><Text size="xl">{stats.arrived||0}</Text><Text size="sm">Arrived</Text>
        </Card>
      </SimpleGrid>

      {event.hotels?.map((h: any) => (
        <Card key={h.id} withBorder mt="sm" padding="sm" radius="md">
          <Group><IconBuilding size={18} /><Text fw={500}>{h.name}</Text></Group>
          <Text size="xs" c="dimmed">{h.address}</Text>
          <Group mt={4}>
            {h.staff_code && (
              <>
                <Badge size="sm" color="green" style={{cursor:'pointer'}} onClick={() => openStaff(h.staff_code)}>
                  Staff: {h.staff_code}
                </Badge>
                <Tooltip label="Copy staff code">
                  <ActionIcon size="xs" variant="subtle" onClick={() => copyCode(h.staff_code)}><IconCopy size={12} /></ActionIcon>
                </Tooltip>
                <Tooltip label="Open staff login">
                  <ActionIcon size="xs" variant="subtle" onClick={() => openStaff(h.staff_code)}><IconArrowRight size={12} /></ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
          <Group mt="sm">
            <Button size="xs" variant="light" color="grape" onClick={() => nav('hotels/' + h.id + '/rooms')}>Rooms</Button>
            <Button size="xs" variant="light" color="teal" onClick={() => nav('hotels/' + h.id + '/participants')}>Participants</Button>
          </Group>
        </Card>
      ))}

      <Stack mt="lg">
        <Button leftSection={<IconDoor size={20} />} onClick={() => nav('rooms')} fullWidth variant="light">All Rooms & Beds</Button>
        <Button leftSection={<IconUsers size={20} />} onClick={() => nav('participants')} fullWidth variant="light">All Participants</Button>
        <Button leftSection={<IconQrcode size={20} />} onClick={() => nav('dashboard')} fullWidth variant="light">Dashboard & QR</Button>
      </Stack>
    </Container>
  );
}
