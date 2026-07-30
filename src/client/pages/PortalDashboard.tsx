import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Stack, Center, Image, Button, Group, Badge, Card, SimpleGrid, ActionIcon, Tooltip } from '@mantine/core';
import { IconQrcode, IconCalendar, IconMap, IconBell, IconClipboardCheck, IconDownload, IconPhone, IconBrandWhatsapp, IconBuilding, IconBed } from '@tabler/icons-react';

export default function PortalDashboard() {
  const { token } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) fetch('/api/portal/'+token).then(r=>r.json()).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <Container><Text>Loading...</Text></Container>;

  const p = data.participant;
  const bc = p.banner_color || '#1a1b1e';
  const ac = p.accent_color || '#4c6ef5';

  return (
    <Container size="sm" py="md">
      <Paper radius="lg" style={{background:bc,color:'white',padding:20,marginBottom:16}}>
        <Title order={3}>{p.event_name}</Title>
        <Text size="sm" opacity={0.8}>{p.event_date}</Text>
      </Paper>

      <Card withBorder padding="lg" radius="md" mb="md">
        <Stack align="center" gap="md">
          <Title order={4}>{p.name}</Title>
          <Paper withBorder p="md" radius="md">
            <Image src={'/api/qr/'+token} w={200} h={200} alt="QR Code" />
          </Paper>
          <Text size="sm" c="dimmed">Show this QR for check-in and meals</Text>
          <Group>
            <Button size="sm" variant="light" leftSection={<IconDownload size={14} />} component="a" href={'/api/qr/'+token+'/image'} download>Download QR</Button>
            {p.phone && (
              <Group gap={4}>
                <Tooltip label="SMS"><ActionIcon variant="filled" color="blue" component="a" href={'sms:'+p.phone+'?body=My%20QR%3A%20'+window.location.href}><IconPhone size={16} /></ActionIcon></Tooltip>
                <Tooltip label="WhatsApp"><ActionIcon variant="filled" color="green" component="a" href={'https://wa.me/'+p.phone.replace(/[^0-9]/g,'')+'?text=My%20QR%3A%20'+encodeURIComponent(window.location.href)} target="_blank"><IconBrandWhatsapp size={16} /></ActionIcon></Tooltip>
              </Group>
            )}
          </Group>
        </Stack>
      </Card>

      {p.hotel_name && (
        <Card withBorder padding="sm" radius="md" mb="sm">
          <Group><IconBuilding size={18} /><Text fw={500}>{p.hotel_name}</Text></Group>
          <Text size="sm" c="dimmed">{p.hotel_address}</Text>
          <Group mt={4}><IconBed size={14} /><Text size="sm">Room {p.room_number} / {p.bed_label}</Text></Group>
          <Badge mt={4} color={p.status==='checked_in'?'green':p.status==='arrived'?'yellow':'gray'}>{p.status}</Badge>
        </Card>
      )}

      <SimpleGrid cols={2} mb="md">
        <Card withBorder padding="md" radius="md" ta="center" style={{cursor:'pointer'}} onClick={() => nav('schedule')}>
          <IconCalendar size={28} style={{color:ac}} /><Text size="sm" mt={4}>Schedule</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center" style={{cursor:'pointer'}} onClick={() => nav('locations')}>
          <IconMap size={28} style={{color:ac}} /><Text size="sm" mt={4}>Locations</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center" style={{cursor:'pointer'}} onClick={() => nav('announcements')}>
          <IconBell size={28} style={{color:ac}} /><Text size="sm" mt={4}>Updates</Text>
        </Card>
        <Card withBorder padding="md" radius="md" ta="center" style={{cursor:'pointer'}} onClick={() => nav('survey')}>
          <IconClipboardCheck size={28} style={{color:ac}} /><Text size="sm" mt={4}>Feedback</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
