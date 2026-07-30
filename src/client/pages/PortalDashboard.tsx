import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Stack, Center, Image, Button, Group, Badge, Card, SimpleGrid, ActionIcon, Tooltip, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { IconQrcode, IconCalendar, IconMap, IconBell, IconClipboardCheck, IconDownload, IconPhone, IconBrandWhatsapp, IconBuilding, IconBed, IconShare, IconClock } from '@tabler/icons-react';

const MotionCard = motion.create(Card);

export default function PortalDashboard() {
  const { token } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [countdown, setCountdown] = useState('');
  const [shareOpened, {open:openShare,close:closeShare}] = useDisclosure(false);

  useEffect(() => {
    if(token) fetch('/api/portal/'+token).then(r=>r.json()).then(setData).catch(()=>{});
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if(!data?.participant) return;
    const end = new Date(data.participant.start_date).getTime();
    const update = () => {
      const diff = end - Date.now();
      if(diff <= 0) { setCountdown('Event started!'); return; }
      const d = Math.floor(diff/(1000*60*60*24));
      const h = Math.floor((diff/(1000*60*60))%24);
      setCountdown(`${d}d ${h}h until event starts`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [data]);

  if(!data) return <Container><Text>Loading...</Text></Container>;

  const p = data.participant;

  return (
    <Container size="sm" py="md">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <Paper radius="lg" style={{background:`linear-gradient(135deg, ${p.banner_color||'#1a1b1e'} 0%, ${p.accent_color||'#4c6ef5'} 100%)`,color:'white',padding:20,marginBottom:16}}>
          <Title order={3}>{p.event_name}</Title>
          <Text size="sm" opacity={0.9}>{p.start_date} to {p.end_date}</Text>
          {countdown && <Text size="xs" mt={4} opacity={0.8}><IconClock size={12} style={{verticalAlign:'middle',marginRight:4}} />{countdown}</Text>}
        </Paper>
      </motion.div>

      <MotionCard withBorder padding="lg" radius="md" mb="md" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.1}}>
        <Stack align="center" gap="md">
          <Title order={4}>{p.name}</Title>
          <Paper withBorder p="md" radius="md" style={{background:`linear-gradient(135deg, ${p.accent_color||'#4c6ef5'}22, transparent)`}}>
            <Image src={'/api/qr/'+token+'/image'} w={200} h={200} alt="QR Code" />
          </Paper>
          <Group>
            <Button size="sm" leftSection={<IconDownload size={14}/>} component="a" href={'/api/qr/'+token+'/image'} download>Download QR</Button>
            <Button size="sm" variant="light" leftSection={<IconShare size={14}/>} onClick={openShare}>Share</Button>
          </Group>
        </Stack>
      </MotionCard>

      {p.hotel_name && (
        <MotionCard withBorder padding="sm" radius="md" mb="sm" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>
          <Group><IconBuilding size={18}/><Text fw={500}>{p.hotel_name}</Text></Group>
          <Text size="sm" c="dimmed">{p.hotel_address}</Text>
          <Group mt={4}><IconBed size={14}/><Text size="sm">Room {p.room_number} / {p.bed_label}</Text></Group>
          <Badge mt={4} color={p.status==='checked_in'?'green':p.status==='arrived'?'yellow':'gray'}>{p.status}</Badge>
        </MotionCard>
      )}

      <SimpleGrid cols={2} mb="md">
        {[
          { icon: IconCalendar, label: 'Schedule', path: 'schedule', color: p.accent_color },
          { icon: IconMap, label: 'Locations', path: 'locations', color: p.accent_color },
          { icon: IconBell, label: 'Updates', path: 'announcements', color: p.accent_color },
          { icon: IconClipboardCheck, label: 'Feedback', path: 'survey', color: p.accent_color },
        ].map((item,i) => (
          <MotionCard key={item.label} withBorder padding="md" radius="md" ta="center" style={{cursor:'pointer'}}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.1}}
            onClick={()=>nav(item.path)}>
            <item.icon size={28} style={{color:item.color||'var(--mantine-color-blue-5)'}} />
            <Text size="sm" mt={4}>{item.label}</Text>
          </MotionCard>
        ))}
      </SimpleGrid>

      <Modal opened={shareOpened} onClose={closeShare} title="Share QR" centered>
        <Stack>
          <Button leftSection={<IconBrandWhatsapp size={16}/>} color="green" component="a" href={'https://wa.me/'+(p.phone||'').replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(window.location.href)} target="_blank">WhatsApp</Button>
          <Button leftSection={<IconPhone size={16}/>} color="blue" component="a" href={'sms:'+p.phone+'?body='+encodeURIComponent(window.location.href)}>SMS</Button>
          <Button leftSection={<IconDownload size={16}/>} variant="light" component="a" href={'/api/qr/'+token+'/image'} download>Save to Photos</Button>
          <Button leftSection={<IconShare size={16}/>} variant="light" onClick={()=>{navigator.clipboard.writeText(window.location.href);closeShare();}}>Copy Link</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
