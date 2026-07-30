import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Group, Button, RingProgress, Stack, Badge, Table, Skeleton } from '@mantine/core';
import { IconDownload, IconQrcode, IconRefresh, IconBuilding, IconBed, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';
import AnimatedCounter from '../components/AnimatedCounter';
import StatusDot from '../components/StatusDot';

const MotionCard = motion.create(Card);

export default function Dashboard() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [dash, setDash] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [qrDone, setQrDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if(!eventId) return;
    setLoading(true);
    try { setDash(await api.reporting.dashboard(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [eventId]);

  if(loading) return (
    <Container pb={70}><Skeleton height={20} width={300} mb="md" />
      <SimpleGrid cols={{base:2,sm:4}} mb="md">{[1,2,3,4].map(i=><Skeleton key={i} height={80} radius="md" />)}</SimpleGrid>
      <Skeleton height={120} radius="md" mb="md" /><Skeleton height={200} radius="md" />
    </Container>
  );

  if(!dash) return null;

  const pct = dash.beds_total ? Math.round((dash.beds_occupied/dash.beds_total)*100) : 0;

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Dashboard'}]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Dashboard</Title>
        <Group>
          <Button size="xs" variant="light" color="grape" leftSection={<IconBed size={14}/>} onClick={()=>nav('../rooms')}>Rooms</Button>
          <Button size="xs" variant="light" color="teal" leftSection={<IconUsers size={14}/>} onClick={()=>nav('../participants')}>People</Button>
          <Button size="xs" variant="light" leftSection={<IconRefresh size={14}/>} onClick={load}>Refresh</Button>
          <Button size="xs" variant="light" leftSection={<IconDownload size={14}/>} component="a" href={'/api/reporting/export/'+eventId} target="_blank">CSV</Button>
          <Button size="xs" variant="light" color="green" leftSection={<IconDownload size={14}/>} component="a" href={'/api/reporting/pdf/'+eventId} target="_blank">PDF</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{base:2,sm:4}} mb="md">
        {[
          { value: dash.total, label: 'Participants', color: 'blue' },
          { value: dash.rooms, label: 'Rooms', color: 'grape' },
          { value: dash.beds_total, label: 'Total Beds', color: 'teal' },
          { value: dash.beds_occupied, label: 'Occupied', color: 'green' },
        ].map((item,i) => (
          <MotionCard key={item.label} withBorder padding="md" radius="md" ta="center" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
            <AnimatedCounter value={item.value} />
            <Text size="xs" c="dimmed">{item.label}</Text>
          </MotionCard>
        ))}
      </SimpleGrid>

      <MotionCard withBorder padding="lg" radius="md" mb="md" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>
        <Group>
          <RingProgress sections={[{value:pct,color:'blue'}]} size={80} thickness={10} label={<Text ta="center" size="sm" fw={700}>{pct}%</Text>} />
          <Stack gap={4}>
            <Text fw={600}>Occupancy</Text>
            <Group gap={4}>{(dash.by_status||[]).map((s:any) => <Badge key={s.status} size="sm">{s.status}: {s.count}</Badge>)}</Group>
          </Stack>
        </Group>
      </MotionCard>

      {(dash.hotels||[]).length > 0 && (
        <MotionCard withBorder padding="lg" radius="md" mb="md" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>
          <Title order={5} mb="sm">Per Hotel Breakdown</Title>
          <div className="table-scroll">
          <Table>
            <Table.Thead><Table.Tr><Table.Th className="sticky-col">Hotel</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Beds</Table.Th><Table.Th>Occupied</Table.Th><Table.Th>Parts</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {(dash.hotels||[]).map((h:any) => (
                <Table.Tr key={h.id} style={{cursor:'pointer'}} onClick={()=>nav('../hotels/'+h.id+'/rooms')}>
                  <Table.Td className="sticky-col"><Group><IconBuilding size={14}/><Text size="sm">{h.name}</Text></Group></Table.Td>
                  <Table.Td>{h.rooms||0}</Table.Td><Table.Td>{h.beds||0}</Table.Td><Table.Td>{h.occupied||0}</Table.Td><Table.Td>{h.participants||0}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </div>
        </MotionCard>
      )}

      <MotionCard withBorder padding="lg" radius="md" mb="md" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
        <Title order={5} mb="sm">QR Codes</Title>
        <Button leftSection={<IconQrcode size={16}/>} onClick={async()=>{try{const r=await api.qr.generate(eventId);setQrDone(true);notifications.show({title:'QR Generated '+r.count+' codes',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}} color={qrDone?'green':'blue'}>{qrDone?'QR Generated':'Generate All QR Codes'}</Button>
      </MotionCard>
    </Container>
  );
}
