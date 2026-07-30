import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Stack, Card, Group, Badge, TextInput, Paper, SimpleGrid, Center, Tabs, Table, ActionIcon, Tooltip, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCamera, IconCheck, IconSearch, IconRefresh, IconBuilding, IconBed, IconDoorExit, IconHistory, IconClipboardCheck } from '@tabler/icons-react';
import { api } from '../api/client';

declare class Html5Qrcode {
  constructor(id: string);
  start(camera: any, config: any, onSuccess: (text: string) => void, onFailure?: () => void): Promise<void>;
  stop(): Promise<void>;
}

export default function StaffDashboard() {
  const nav = useNavigate();
  const session = JSON.parse(sessionStorage.getItem('staff_session') || 'null');
  const [dash, setDash] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tab, setTab] = useState<string | null>('overview');
  const [scanMode, setScanMode] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [scanner, setScanner] = useState<any>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const event = session?.event;
  const hotel = session?.hotel;

  const load = async () => {
    if (!event?.id || !hotel?.id) return;
    try { setDash(await api.reporting.dashboardByHotel(event.id, hotel.id)); } catch {}
    try { setRooms(await api.rooms.listByHotel(event.id, hotel.id)); } catch {}
    try { setHistory(await api.checkin.list(event.id)); } catch {}
  };
  useEffect(() => { if (!session) nav('/'); load(); }, []);

  const startScanner = useCallback(async () => {
    try {
      const { Html5Qrcode: H5Q } = await import('html5-qrcode');
      const s = new H5Q('qr-reader');
      await s.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await s.stop(); setScanMode(false);
          const token = decodedText.split('token=')[1]?.split('&')[0] || decodedText;
          doCheckin(token);
        });
      setScanner(s); setScanMode(true);
    } catch { notifications.show({ title: 'Camera Error', message: 'Use manual entry instead', color: 'red' }); }
  }, [event, hotel]);

  const stopScanner = async () => {
    if (scanner) { try { await scanner.stop(); } catch {} setScanner(null); }
    setScanMode(false);
  };

  const doCheckin = async (token: string) => {
    try {
      const res = await api.checkin.scan(token, 'Staff', hotel?.id);
      setResult(res);
      setHistory(prev => [{ participant: res.participant, status: res.status, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
      notifications.show({ title: res.participant||'Checked in', message: 'Status: '+res.status, color: 'green' });
      load();
    } catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
  };

  if (!event || !hotel) return <Container><Text>Not logged in</Text></Container>;

  const recentCheckins = history.slice(0, 10);

  return (
    <Container size="sm" py="md" pb={80}>
      <Group mb="md" justify="space-between">
        <Group><IconBuilding size={24} /><Stack gap={0}><Title order={3}>{hotel.name}</Title><Text size="sm" c="dimmed">{event.name} · {event.code}</Text></Stack></Group>
        <ActionIcon variant="subtle" color="red" onClick={() => { sessionStorage.removeItem('staff_session'); nav('/'); }}><IconDoorExit size={20} /></ActionIcon>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List grow mb="md">
          <Tabs.Tab value="overview" leftSection={<IconBuilding size={16} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="scan" leftSection={<IconCamera size={16} />}>Scan</Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          {dash && <SimpleGrid cols={{base:2,sm:4}} mb="md">
            <Card withBorder padding="sm" radius="md" ta="center"><Text size="xl" fw={700}>{dash.beds_total||0}</Text><Text size="xs">Total Beds</Text></Card>
            <Card withBorder padding="sm" radius="md" ta="center"><Text size="xl" fw={700} c="green">{dash.beds_vacant||0}</Text><Text size="xs">Vacant</Text></Card>
            <Card withBorder padding="sm" radius="md" ta="center"><Text size="xl" fw={700} c="red">{dash.beds_occupied||0}</Text><Text size="xs">Occupied</Text></Card>
            <Card withBorder padding="sm" radius="md" ta="center"><Text size="xl" fw={700} c="blue">{dash.total||0}</Text><Text size="xs">Participants</Text></Card>
          </SimpleGrid>}
          <Title order={5} mb="sm">Room Occupancy</Title>
          {rooms.map((room: any) => (
            <Card key={room.id} withBorder mb="xs" padding="xs" radius="sm">
              <Group mb={4}><Text size="sm" fw={500}>Room {room.room_number}</Text>{room.wing&&<Badge size="xs">{room.wing}</Badge>}</Group>
              <div className="bed-grid">
                {(room.beds||[]).map((bed: any) => (
                  <Paper key={bed.id} p={4} withBorder radius="sm"
                    className={'bed-card '+(bed.is_occupied?'occupied':'vacant')+(bed.pid&&bed.participant_name?' arrived':'')}>
                    <Text size="xs" fw={500}>{bed.label}</Text>
                    <Text size="xs" c={bed.is_occupied?'red':'green'}>{bed.is_occupied?bed.participant_name||'Occupied':'Vacant'}</Text>
                  </Paper>
                ))}
              </div>
            </Card>
          ))}
          <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={load} fullWidth mt="md">Refresh Stats</Button>
        </Tabs.Panel>

        <Tabs.Panel value="scan">
          {!scanMode ? (
            <Stack>
              <Button size="xl" leftSection={<IconCamera size={24} />} onClick={startScanner} fullWidth>Scan QR Code</Button>
              <Paper p="md" withBorder>
                <Text size="sm" mb="xs">Or enter token manually:</Text>
                <Group><TextInput placeholder="Paste QR token" value={manualToken} onChange={e=>setManualToken(e.target.value)} style={{flex:1}} /><Button onClick={() => doCheckin(manualToken)}><IconSearch size={16} /></Button></Group>
              </Paper>
            </Stack>
          ) : (
            <Stack>
              <div id="qr-reader" ref={scannerRef} style={{width:'100%',maxWidth:400}} />
              <Text size="sm" ta="center" c="dimmed">Point camera at participant QR code</Text>
              <Button color="red" onClick={stopScanner}>Stop Camera</Button>
            </Stack>
          )}
          {result && (
            <Card withBorder mt="md" padding="lg" radius="md">
              <Center><IconCheck size={48} color="green" /></Center>
              <Title order={4} ta="center">{result.participant}</Title>
              <Badge size="lg" color="green" ta="center">{result.status}</Badge>
            </Card>
          )}
          {recentCheckins.length > 0 && (
            <Card withBorder mt="md" padding="sm" radius="md">
              <Title order={6} mb="xs">Recent Check-ins</Title>
              {recentCheckins.map((c: any, i: number) => (
                <Group key={i} mb={2}><IconCheck size={14} color="green" /><Text size="xs">{c.participant} → {c.status}</Text><Text size="xs" c="dimmed">{c.time||''}</Text></Group>
              ))}
            </Card>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <Table>
            <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Status</Table.Th><Table.Th>Room</Table.Th><Table.Th>Time</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {history.slice(0, 50).map((c: any, i: number) => (
                <Table.Tr key={i}>
                  <Table.Td><Text size="sm">{c.participant_name||c.participant}</Text></Table.Td>
                  <Table.Td><Badge size="sm" color={c.status==='checked_in'?'green':c.status==='arrived'?'yellow':'gray'}>{c.status}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{c.room_number||'-'}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{c.checked_at||c.time||''}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
