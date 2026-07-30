import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, Modal, TextInput, Textarea, Card, Text, Badge, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconBell } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminAnnouncements() {
  const { id: eventId } = useParams();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [opened, {open,close}] = useDisclosure(false);
  const [form, setForm] = useState({ title:'', message:'', priority:'normal' });

  const load = async () => {
    if (!eventId) return;
    try { setAnnouncements(await (await fetch('/api/announcements/'+eventId)).json()); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const send = async () => {
    try {
      await fetch('/api/announcements/'+eventId, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      notifications.show({ title: 'Announcement sent', color:'green' }); close(); setForm({title:'',message:'',priority:'normal'}); load();
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Announcements'}
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Announcements</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>New Broadcast</Button>
      </Group>
      {announcements.map((a:any) => (
        <Card key={a.id} withBorder mb="sm" padding="sm" radius="md">
          <Group mb={4}><IconBell size={16} /><Text fw={500}>{a.title}</Text><Badge size="sm" color={a.priority==='high'?'red':'blue'}>{a.priority}</Badge><Text size="xs" c="dimmed">{a.read_count||0} reads</Text></Group>
          <Text size="sm">{a.message}</Text>
          <Text size="xs" c="dimmed" mt={4}>{a.created_at}</Text>
        </Card>
      ))}
      <Modal opened={opened} onClose={close} title="New Announcement" fullScreen>
        <Stack>
          <TextInput label="Title" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <Textarea label="Message" required minRows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
          <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            <option value="normal">Normal</option>
            <option value="high">High Priority</option>
          </select>
          <Button onClick={send}>Send to All Participants</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
