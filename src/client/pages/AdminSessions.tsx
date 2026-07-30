import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Table, Stack, Modal, TextInput, Textarea, Text, Badge, ActionIcon, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconCalendar } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminSessions() {
  const { id: eventId } = useParams();
  const [sessions, setSessions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [opened, {open,close}] = useDisclosure(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ title:'', description:'', speaker_name:'', speaker_title:'', location_id:'', session_date:'', start_time:'', end_time:'', track:'', max_capacity:'' });

  const load = async () => {
    if (!eventId) return;
    try { setSessions(await (await fetch('/api/sessions/'+eventId)).json()); } catch {}
    try { setLocations(await (await fetch('/api/locations/'+eventId)).json()); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const save = async () => {
    try {
      const body = { ...form, max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null };
      if (editId) {
        await fetch('/api/sessions/'+eventId+'/'+editId, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      } else {
        await fetch('/api/sessions/'+eventId, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      }
      notifications.show({ title: editId ? 'Updated' : 'Created', color:'green' }); close(); setEditId(null); load();
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Sessions'}
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Program Sessions</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditId(null); setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:'',start_time:'',end_time:'',track:'',max_capacity:''}); open(); }}>Add Session</Button>
      </Group>
      <Table>
        <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Time</Table.Th><Table.Th>Title</Table.Th><Table.Th>Speaker</Table.Th><Table.Th>Location</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {sessions.map((s:any) => (
            <Table.Tr key={s.id}>
              <Table.Td><Text size="sm">{s.session_date}</Text></Table.Td>
              <Table.Td><Text size="sm">{s.start_time}-{s.end_time}</Text></Table.Td>
              <Table.Td><Text fw={500}>{s.title}</Text>{s.track&&<Badge size="xs" ml={4}>{s.track}</Badge>}</Table.Td>
              <Table.Td><Text size="sm">{s.speaker_name||'-'}</Text></Table.Td>
              <Table.Td><Text size="sm">{s.location_name||'-'}</Text></Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <ActionIcon size="sm" variant="subtle" onClick={() => { setEditId(s.id); setForm({title:s.title,description:s.description||'',speaker_name:s.speaker_name||'',speaker_title:s.speaker_title||'',location_id:s.location_id||'',session_date:s.session_date,start_time:s.start_time,end_time:s.end_time,track:s.track||'',max_capacity:String(s.max_capacity||'')}); open(); }}><IconEdit size={14} /></ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { if(confirm('Delete?')){ await fetch('/api/sessions/'+eventId+'/'+s.id,{method:'DELETE'}); load(); }}}><IconTrash size={14} /></ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Session':'Add Session'} fullScreen>
        <Stack>
          <TextInput label="Title" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <TextInput label="Speaker Name" value={form.speaker_name} onChange={e=>setForm({...form,speaker_name:e.target.value})} />
          <TextInput label="Speaker Title" value={form.speaker_title} onChange={e=>setForm({...form,speaker_title:e.target.value})} />
          <Select label="Location" data={locations.map((l:any)=>({value:l.id,label:l.name}))} value={form.location_id} onChange={v=>setForm({...form,location_id:v||''})} searchable clearable />
          <TextInput label="Date" type="date" required value={form.session_date} onChange={e=>setForm({...form,session_date:e.target.value})} />
          <TextInput label="Start Time" type="time" required value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} />
          <TextInput label="End Time" type="time" required value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} />
          <TextInput label="Track/Category" value={form.track} onChange={e=>setForm({...form,track:e.target.value})} />
          <TextInput label="Max Capacity" type="number" value={form.max_capacity} onChange={e=>setForm({...form,max_capacity:e.target.value})} />
          <Button onClick={save}>{editId?'Update':'Create'}</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
