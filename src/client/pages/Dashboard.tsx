import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Group, Button, RingProgress, Stack, Badge, Table } from '@mantine/core';
import { IconDownload, IconQrcode, IconRefresh, IconBuilding, IconBed, IconUsers } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Dashboard() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [dash, setDash] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [qrDone, setQrDone] = useState(false);

  const load = async () => {
    if (!eventId) return;
    try { setDash(await api.reporting.dashboard(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const genQr = async () => {
    if (!eventId) return;
    try { const r = await api.qr.generate(eventId); setQrDone(true); notifications.show({title:'QR Generated '+r.count+' codes',color:'green'}); }
    catch (e: any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
  };

  if (!dash) return <Container><Text>Loading...</Text></Container>;

  const pct = dash.beds_total ? Math.round((dash.beds_occupied/dash.beds_total)*100) : 0;

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || '', href: '/admin/events/' + eventId },
        { label: 'Dashboard' }
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Dashboard</Title>
        <Group>
          <Button size="xs" variant="light" color="grape" leftSection={<IconBed size={14} />} onClick={() => nav('../rooms')}>Rooms</Button>
          <Button size="xs" variant="light" color="teal" leftSection={<IconUsers size={14} />} onClick={() => nav('../participants')}>People</Button>
          <Button size="xs" variant="light" leftSection={<IconRefresh size={14} />} onClick={load}>Refresh</Button>
          <Button size="xs" variant="light" leftSection={<IconDownload size={14} />} component="a" href={'/api/reporting/export/'+eventId} target="_blank">CSV</Button>
          <Button size="xs" variant="light" color="green" leftSection={<IconDownload size={14} />} component="a" href={'/api/reporting/pdf/'+eventId} target="_blank">PDF</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{base:2,sm:4}} mb="md">
        <Card withBorder padding="md" radius="md" ta="center"><Text size="xl" fw={700}>{dash.total}</Text><Text size="xs" c="dimmed">Participants</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center"><Text size="xl" fw={700}>{dash.rooms}</Text><Text size="xs" c="dimmed">Rooms</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center"><Text size="xl" fw={700}>{dash.beds_total}</Text><Text size="xs" c="dimmed">Total Beds</Text></Card>
        <Card withBorder padding="md" radius="md" ta="center"><Text size="xl" fw={700}>{dash.beds_occupied}</Text><Text size="xs" c="dimmed">Occupied</Text></Card>
      </SimpleGrid>

      <Card withBorder padding="lg" radius="md" mb="md">
        <Group>
          <RingProgress sections={[{value:pct,color:'blue'}]} size={80} thickness={10} label={<Text ta="center" size="sm" fw={700}>{pct}%</Text>} />
          <Stack gap={4}>
            <Text fw={600}>Occupancy</Text>
            <Group gap={4}>{(dash.by_status||[]).map((s:any) => <Badge key={s.status} size="sm">{s.status}: {s.count}</Badge>)}</Group>
          </Stack>
        </Group>
      </Card>

      {(dash.hotels||[]).length > 0 && (
        <Card withBorder padding="lg" radius="md" mb="md">
          <Title order={5} mb="sm">Per Hotel Breakdown</Title>
          <div style={{overflowX:'auto'}}>
          <Table>
            <Table.Thead><Table.Tr><Table.Th>Hotel</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Beds</Table.Th><Table.Th>Occupied</Table.Th><Table.Th>Parts</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {(dash.hotels||[]).map((h:any) => (
                <Table.Tr key={h.id} style={{cursor:'pointer'}} onClick={() => nav('../hotels/'+h.id+'/rooms')}>
                  <Table.Td><Group><IconBuilding size={14} /><Text size="sm">{h.name}</Text></Group></Table.Td>
                  <Table.Td>{h.rooms||0}</Table.Td><Table.Td>{h.beds||0}</Table.Td><Table.Td>{h.occupied||0}</Table.Td><Table.Td>{h.participants||0}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </div>
        </Card>
      )}

      <Card withBorder padding="lg" radius="md" mb="md">
        <Title order={5} mb="sm">QR Codes</Title>
        <Button leftSection={<IconQrcode size={16} />} onClick={genQr} color={qrDone?'green':'blue'}>{qrDone ? 'QR Generated' : 'Generate All QR Codes'}</Button>
      </Card>
    </Container>
  );
}
