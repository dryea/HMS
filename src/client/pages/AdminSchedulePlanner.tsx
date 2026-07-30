import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Card, Text, Badge, Stack, SegmentedControl, SimpleGrid, Table, ActionIcon, Modal, TextInput, Textarea, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconPlus, IconCalendar, IconClock, IconMapPin, IconUser, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminSchedulePlanner() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [activeDate, setActiveDate] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [opened, {open,close}] = useDisclosure(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ title:'', description:'', speaker_name:'', speaker_title:'', location_id:'', session_date:'', start_time:'', end_time:'', track:'' });

  const load = async () => {
    if (!eventId) return;
    try {
      const ev = await (await fetch('/api/events/'+eventId)).json();
      setEvent(ev);
      // Generate date range
      const start = new Date(ev.start_date);
      const end = new Date(ev.end_date);
      const ds: string[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        ds.push(d.toISOString().split('T')[0]);
      }
      setDates(ds);
      if (!activeDate && ds.length) setActiveDate(ds[0]);
    } catch {}
    try { setSessions(await (await fetch('/api/sessions/'+eventId)).json()); } catch {}
    try { setLocations(await (await fetch('/api/locations/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const daySessions = sessions.filter((s:any) => s.session_date === activeDate).sort((a:any,b:any) => a.start_time.localeCompare(b.start_time));

  const save = async () => {
    try {
      if (editId) {
        await fetch('/api/sessions/'+eventId+'/'+editId, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      } else {
        await fetch('/api/sessions/'+eventId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      }
      notifications.show({title:editId?'Updated':'Created',color:'green'}); close(); setEditId(null); load();
    } catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
  };

  return (
    <Container pb={70} size="lg">
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Schedule Planner'}
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Schedule Planner</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => {setEditId(null);setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:activeDate,start_time:'',end_time:'',track:''});open();}}>Add Session</Button>
      </Group>

      {dates.length > 1 && (
        <SegmentedControl fullWidth mb="md" value={activeDate} onChange={setActiveDate}
          data={dates.map(d => ({value:d,label:new Date(d).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}))} />
      )}

      {daySessions.length === 0 ? (
        <Card withBorder padding="xl" radius="md" ta="center">
          <IconCalendar size={48} style={{opacity:0.3}} />
          <Text mt="md" fw={500}>No sessions for {activeDate}</Text>
          <Text size="sm" c="dimmed">Add a session to start building your program schedule</Text>
          <Button mt="md" variant="light" onClick={() => {setEditId(null);setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:activeDate,start_time:'',end_time:'',track:''});open();}}>Add First Session</Button>
        </Card>
      ) : (
        <Stack>
          {daySessions.map((s:any) => (
            <Card key={s.id} withBorder padding="sm" radius="md">
              <Group justify="space-between">
                <Stack gap={2} style={{flex:1}}>
                  <Group gap={4}>
                    <Badge size="sm" variant="light" color="blue"><IconClock size={10} style={{verticalAlign:'middle',marginRight:2}} />{s.start_time}-{s.end_time}</Badge>
                    {s.track && <Badge size="sm" variant="light">{s.track}</Badge>}
                  </Group>
                  <Text fw={600} size="lg">{s.title}</Text>
                  {s.description && <Text size="sm" c="dimmed">{s.description}</Text>}
                  <Group gap="md" mt={4}>
                    {s.speaker_name && <Text size="xs"><IconUser size={12} style={{verticalAlign:'middle',marginRight:4}} />{s.speaker_name}</Text>}
                    {s.location_name && <Text size="xs"><IconMapPin size={12} style={{verticalAlign:'middle',marginRight:4}} />{s.location_name}</Text>}
                  </Group>
                </Stack>
                <Group gap={4}>
                  <ActionIcon size="sm" variant="subtle" onClick={() => {setEditId(s.id);setForm({title:s.title,description:s.description||'',speaker_name:s.speaker_name||'',speaker_title:s.speaker_title||'',location_id:s.location_id||'',session_date:s.session_date,start_time:s.start_time,end_time:s.end_time,track:s.track||''});open();}}><IconEdit size={14} /></ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={async()=>{if(confirm('Delete?')){await fetch('/api/sessions/'+eventId+'/'+s.id,{method:'DELETE'});load();}}}><IconTrash size={14} /></ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

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
          <Button onClick={save}>{editId?'Update Session':'Create Session'}</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
