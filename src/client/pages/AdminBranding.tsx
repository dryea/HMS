import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, TextInput, Card, Text, ColorInput, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPalette } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminBranding() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [logo, setLogo] = useState('');
  const [bannerColor, setBannerColor] = useState('#1a1b1e');
  const [accentColor, setAccentColor] = useState('#4c6ef5');

  const load = async () => {
    if (!eventId) return;
    try { const b = await (await fetch('/api/branding/'+eventId)).json(); setLogo(b.logo_url||''); setBannerColor(b.banner_color||'#1a1b1e'); setAccentColor(b.accent_color||'#4c6ef5'); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const save = async () => {
    try {
      await fetch('/api/branding/'+eventId, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ logo_url: logo, banner_color: bannerColor, accent_color: accentColor }) });
      notifications.show({ title: 'Branding updated', color:'green' });
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Branding'}
      ]} />
      <Title order={3} mb="md"><IconPalette size={24} style={{verticalAlign:'middle',marginRight:8}} />Event Branding</Title>
      <Card withBorder padding="lg" radius="md">
        <Stack>
          <TextInput label="Logo URL" value={logo} onChange={e=>setLogo(e.target.value)} placeholder="https://example.com/logo.png" />
          <SimpleGrid cols={2}>
            <ColorInput label="Banner/Header Color" value={bannerColor} onChange={setBannerColor} />
            <ColorInput label="Accent Color" value={accentColor} onChange={setAccentColor} />
          </SimpleGrid>
          <div style={{background:bannerColor,padding:20,borderRadius:8}}>
            <Text c={accentColor} fw={700} size="xl">Preview</Text>
            <Text c="white" size="sm">Participant portal will use these colors</Text>
          </div>
          <Button onClick={save}>Save Branding</Button>
        </Stack>
      </Card>
    </Container>
  );
}
