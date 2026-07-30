import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Group, Button, Table, Badge, Stack, Skeleton } from '@mantine/core';
import { IconBuilding, IconCalendar, IconUsers, IconCheck, IconPlus, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';
import AnimatedCounter from '../components/AnimatedCounter';
import EmptyState from '../components/EmptyState';

const MotionCard = motion.create(Card);

export default function SuperAdmin() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.reporting.superAdmin().then(setData).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  if (loading) return (
    <Container pb={70}><Breadcrumbs items={[{label:'Super Admin'}]} /><Title order={3} mb="md"><Skeleton height={28} width={200} /></Title>
      <SimpleGrid cols={{base:2,sm:4}} mb="lg">
        {[1,2,3,4].map(i => <Skeleton key={i} height={100} radius="md" />)}
      </SimpleGrid>
      <Skeleton height={200} radius="md" />
    </Container>
  );

  if (!data || !data.total_events) return (
    <Container pb={70}>
      <Breadcrumbs items={[{label:'Super Admin'}]} />
      <EmptyState icon={<IconCalendar size={64} />} title="No events yet"
        description="Create your first event to start managing hotels, rooms, and participants."
        actionLabel="Create Event" onAction={() => nav('/admin/events')} />
    </Container>
  );

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
        {[
          { icon: IconBuilding, value: data.total_hotels, label: 'Hotels', color: 'blue' },
          { icon: IconCalendar, value: data.total_events, label: 'Events', color: 'grape' },
          { icon: IconUsers, value: data.total_participants, label: 'Participants', color: 'teal' },
          { icon: IconCheck, value: data.active_checkins, label: 'Checked In', color: 'green' },
        ].map((item, i) => (
          <MotionCard key={item.label} withBorder padding="md" radius="md" ta="center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <item.icon size={24} />
            <AnimatedCounter value={item.value} />
            <Text size="xs" c="dimmed">{item.label}</Text>
          </MotionCard>
        ))}
      </SimpleGrid>

      <Title order={4} mb="sm">All Events</Title>
      <div className="table-scroll">
      <Table>
        <Table.Thead><Table.Tr><Table.Th className="sticky-col">Event</Table.Th><Table.Th>Dates</Table.Th><Table.Th>Parts</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {(data.events||[]).map((e:any) => (
            <Table.Tr key={e.id} style={{cursor:'pointer'}} onClick={() => nav('/admin/events/'+e.id)}>
              <Table.Td className="sticky-col"><Text fw={500}>{e.name}</Text><Badge size="xs">{e.event_code}</Badge></Table.Td>
              <Table.Td><Text size="sm">{e.start_date} to {e.end_date}</Text></Table.Td>
              <Table.Td>{e.participants||0}</Table.Td>
              <Table.Td>{e.rooms||0}</Table.Td>
              <Table.Td><Button size="xs" variant="light" color="blue" onClick={(ev) => { ev.stopPropagation(); nav('/admin/events/'+e.id+'/dashboard'); }}>Dash</Button></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </div>
    </Container>
  );
}
