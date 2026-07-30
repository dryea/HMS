import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Group, Button, Table, Badge, Stack } from '@mantine/core';
import { IconBuilding, IconCalendar, IconUsers, IconCheck, IconPlus, IconRefresh } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function SuperAdmin() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);

  const load = () => { api.reporting.superAdmin().then(setData).catch(() => {}); };
  useEffect(() => { load(); }, []);

  if (!data) return <Container><Text>Loading...</Text></Container>;

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{ label: 'Super Admin' }]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Overview</Title>
        <Group>
          <Button size="xs" variant="light" leftSection={<IconRefresh size={14} />} onClick={load}>Refresh</Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={() => nav('/admin/events')}>New Event</Button>
        </Group>
      </Group>
      <SimpleGrid cols={{base:2,sm:4}} mb="lg">
        <Card withBorder padding="md" radius="md" ta="center"><IconBuilding size={24} /><Text size="xl" fw={700}>{data.total_hotels}</Text><Text size="xs">Hotels</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center"><IconCalendar size={24} /><Text size="xl" fw={700}>{data.total_events}</Text><Text size="xs">Events</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center"><IconUsers size={24} /><Text size="xl" fw={700}>{data.total_participants}</Text><Text size="xs">Participants</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center" style={{color:'green'}}><IconCheck size={24} /><Text size="xl" fw={700}>{data.active_checkins}</Text><Text size="xs">Checked In</Text></Card>
      </SimpleGrid>

      <Title order={4} mb="sm">All Events</Title>
      <Table>
        <Table.Thead><Table.Tr><Table.Th>Event</Table.Th><Table.Th>Dates</Table.Th><Table.Th>Parts</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {(data.events||[]).map((e:any) => (
            <Table.Tr key={e.id} style={{cursor:'pointer'}} onClick={() => nav('/admin/events/'+e.id)}>
              <Table.Td><Text fw={500}>{e.name}</Text><Badge size="xs">{e.event_code}</Badge></Table.Td>
              <Table.Td><Text size="sm">{e.start_date} to {e.end_date}</Text></Table.Td>
              <Table.Td>{e.participants||0}</Table.Td>
              <Table.Td>{e.rooms||0}</Table.Td>
              <Table.Td><Button size="xs" variant="light" color="blue" onClick={(ev) => { ev.stopPropagation(); nav('/admin/events/'+e.id+'/dashboard'); }}>Dash</Button></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
