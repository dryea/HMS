import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Table, Stack, Modal, TextInput, Textarea, Text, Badge, ActionIcon, Select, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconMap } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminLocations() {
  const { id: eventId } = useParams();
  const [locations, setLocations] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [opened, {open,close}] = useDisclosure(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ name:'', description:'', floor:'', hotel_id:'', pin_x:0, pin_y:0 });

  const load = async () => {
    if (!eventId) return;
    try { setLocations(await (await fetch('/api/locations/'+eventId)).json()); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const save = async () => {
    try {
      const body = { ...form, pin_x: form.pin_x || null, pin_y: form.pin_y || null };
      if (editId) {
        await fetch('/api/locations/'+eventId+'/'+editId, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      } else {
        await fetch('/api/locations/'+eventId, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      }
      notifications.show({ title: editId?'Updated':'Created', color:'green' }); close(); setEditId(null); load();
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Locations'}
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Locations & Venues</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditId(null); setForm({name:'',description:'',floor:'',hotel_id:'',pin_x:0,pin_y:0}); open(); }}>Add Location</Button>
      </Group>
      <Table>
        <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Floor</Table.Th><Table.Th>Hotel</Table.Th><Table.Th>Map Pin</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {locations.map((l:any) => (
            <Table.Tr key={l.id}>
              <Table.Td><Text fw={500}>{l.name}</Text><Text size="xs" c="dimmed">{l.description||''}</Text></Table.Td>
              <Table.Td><Badge size="sm">{l.floor||'-'}</Badge></Table.Td>
              <Table.Td><Text size="sm">{l.hotel_name||'-'}</Text></Table.Td>
              <Table.Td><Text size="xs">{l.pin_x!=null?`(${l.pin_x},${l.pin_y})`:'Not set'}</Text></Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <ActionIcon size="sm" variant="subtle" onClick={() => { setEditId(l.id); setForm({name:l.name,description:l.description||'',floor:l.floor||'',hotel_id:l.hotel_id||'',pin_x:l.pin_x||0,pin_y:l.pin_y||0}); open(); }}><IconEdit size={14} /></ActionIcon>
                  <ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { if(confirm('Delete?')){ await fetch('/api/locations/'+eventId+'/'+l.id,{method:'DELETE'}); load(); }}}><IconTrash size={14} /></ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Location':'Add Location'} fullScreen>
        <Stack>
          <TextInput label="Name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <TextInput label="Floor" value={form.floor} onChange={e=>setForm({...form,floor:e.target.value})} />
          <Select label="Hotel" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} clearable />
          <NumberInput label="Map Pin X" value={form.pin_x} onChange={v=>setForm({...form,pin_x:Number(v)})} />
          <NumberInput label="Map Pin Y" value={form.pin_y} onChange={v=>setForm({...form,pin_y:Number(v)})} />
          <Button onClick={save}>{editId?'Update':'Create'}</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
