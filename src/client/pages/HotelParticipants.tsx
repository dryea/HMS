import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Table, TextInput, Stack, Modal, Text, ActionIcon, Badge, Tooltip, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconPhone, IconBrandWhatsapp, IconQrcode, IconBed } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function HotelParticipants() {
  const { id: eventId, hid: hotelId } = useParams();
  const nav = useNavigate();
  const [participants, setParticipants] = useState<any[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [opened, {open,close}] = useDisclosure(false);
  const [form, setForm] = useState({ ein:'', name:'', phone:'', email:'', company:'', department:'' });

  const load = async () => {
    if (!eventId || !hotelId) return;
    try { setParticipants(await api.participants.listByHotel(eventId, hotelId)); } catch {}
    try { setHotel(await (await fetch('/api/hotels/'+hotelId)).json()); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setAllHotels(await fetch('/api/hotels').then(r => r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId, hotelId]);

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || '', href: '/admin/events/' + eventId },
        { label: 'Participants', href: '/admin/events/' + eventId + '/participants' },
        { label: hotel?.name || '' }
      ]} />
      <Group mb="md">
        <Title order={3}>{hotel?.name||'Hotel'} Participants ({participants.length})</Title>
        <Select size="xs" placeholder="Switch hotel" data={allHotels.map(h=>({value:h.id,label:h.name}))} value={hotelId}
          onChange={v => v && v !== hotelId && nav('/admin/events/'+eventId+'/hotels/'+v+'/participants')} searchable />
      </Group>
      <Group mb="md">
        <Button size="xs" variant="light" color="grape" leftSection={<IconBed size={14} />}
          onClick={() => nav('/admin/events/'+eventId+'/hotels/'+hotelId+'/rooms')}>Rooms</Button>
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={open}>Add</Button>
      </Group>

      <div style={{overflowX:'auto'}}>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Phone</Table.Th><Table.Th>Room</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {participants.map((p:any) => (
            <Table.Tr key={p.id}>
              <Table.Td><Text size="sm" fw={500}>{p.name}</Text><Text size="xs" c="dimmed">{p.company||p.department||''}</Text></Table.Td>
              <Table.Td><Text size="sm">{p.phone||'-'}</Text></Table.Td>
              <Table.Td><Text size="sm">{p.room_number?p.room_number+'/'+p.bed_label:'-'}</Text></Table.Td>
              <Table.Td><Badge size="sm" color={p.status==='checked_in'?'green':p.status==='arrived'?'yellow':'gray'}>{p.status}</Badge></Table.Td>
              <Table.Td>
                <Group gap={4}>
                  {p.phone && <><Tooltip label="WhatsApp"><ActionIcon size="sm" variant="subtle" component="a" href={'https://wa.me/'+p.phone.replace(/[^0-9]/g,'')} target="_blank"><IconBrandWhatsapp size={14} /></ActionIcon></Tooltip>
                  <Tooltip label="SMS"><ActionIcon size="sm" variant="subtle" component="a" href={'sms:'+p.phone}><IconPhone size={14} /></ActionIcon></Tooltip></>}
                  {p.qr_token && <Tooltip label="QR"><ActionIcon size="sm" variant="subtle" component="a" href={'/qr/'+p.qr_token} target="_blank"><IconQrcode size={14} /></ActionIcon></Tooltip>}
                  <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { if (confirm('Delete?')) { await api.participants.delete(p.id); load(); }}}><IconTrash size={14} /></ActionIcon></Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </div>
      <Modal opened={opened} onClose={close} title="Add Participant">
        <Stack>
          <TextInput label="EIN" value={form.ein} onChange={e=>setForm({...form,ein:e.target.value})} />
          <TextInput label="Name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <TextInput label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <TextInput label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <TextInput label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <TextInput label="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />
          <Button onClick={async () => { try { await api.participants.create({event_id:eventId,hotel_id:hotelId,...form}); notifications.show({title:'Added',color:'green'}); close(); load(); } catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }}}>Add</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
