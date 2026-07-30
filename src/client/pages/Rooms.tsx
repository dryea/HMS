import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, TextInput, NumberInput, Card, Text, Badge, Modal, Paper, Select, ActionIcon, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBed, IconUser, IconChevronDown, IconChevronRight, IconUsers, IconChartBar } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Rooms() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [assignModal, setAssignModal] = useState<{ roomId: string; bedId: string } | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [gen, setGen] = useState({ hotel_id: '', floors: 1, rooms_per_floor: 10, room_prefix: '', beds_per_room: 2, wing: '' });
  const [expandedHotels, setExpandedHotels] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!eventId) return;
    try { setRooms(await api.rooms.list(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setParticipants(await api.participants.list(eventId)); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r => r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const generate = async () => {
    if (!gen.hotel_id) { notifications.show({ title: 'Error', message: 'Select a hotel', color: 'red' }); return; }
    try {
      await api.rooms.generate({ event_id: eventId, hotel_id: gen.hotel_id, floors: gen.floors, rooms_per_floor: gen.rooms_per_floor, room_prefix: gen.room_prefix, beds_per_room: gen.beds_per_room, wing: gen.wing });
      notifications.show({ title: 'Rooms created', color: 'green' }); close(); load();
    } catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
  };

  const unassigned = participants.filter((p: any) => !p.bed_label);
  const grouped = rooms.reduce((acc: any, r: any) => {
    const key = r.hotel_id || 'unknown';
    if (!acc[key]) acc[key] = { hotel_name: r.hotel_name || 'Unknown', rooms: [] };
    acc[key].rooms.push(r); return acc;
  }, {});

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || '', href: '/admin/events/' + eventId },
        { label: 'Rooms' }
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Rooms & Beds</Title>
        <Group>
          <Button size="xs" variant="light" color="teal" leftSection={<IconUsers size={14} />} onClick={() => nav('../participants')}>People</Button>
          <Button size="xs" variant="light" color="blue" leftSection={<IconChartBar size={14} />} onClick={() => nav('../dashboard')}>Dash</Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={open}>Generate</Button>
        </Group>
      </Group>

      {Object.entries(grouped).map(([hotelId, g]: [string, any]) => (
        <Card key={hotelId} withBorder mb="md" padding="sm" radius="md">
          <Group onClick={() => setExpandedHotels(prev => ({...prev, [hotelId]: !prev[hotelId]}))} style={{cursor:'pointer'}}>
            {expandedHotels[hotelId] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            <Text fw={600}>{g.hotel_name}</Text>
            <Badge size="sm">{g.rooms.length} rooms</Badge>
            <Button size="xs" variant="light" color="grape" onClick={(e) => { e.stopPropagation(); nav('hotels/' + hotelId + '/rooms'); }}>Manage</Button>
          </Group>
          <Collapse in={expandedHotels[hotelId]}>
            <Stack mt="sm">
              {g.rooms.map((room: any) => (
                <Card key={room.id} withBorder padding="sm" radius="sm">
                  <Group mb="xs">
                    <IconBed size={16} /><Text fw={500}>Room {room.room_number}</Text>
                    {room.floor && <Badge size="sm">Floor {room.floor}</Badge>}
                    {room.wing && <Badge size="sm" variant="light">{room.wing}</Badge>}
                    <Badge size="sm" color={room.status==='ready'?'green':'yellow'}>{room.status}</Badge>
                  </Group>
                  <div className="bed-grid">
                    {(room.beds||[]).map((bed: any) => (
                      <Paper key={bed.id} p="xs" withBorder radius="sm"
                        className={'bed-card'+(bed.is_occupied?' occupied':' vacant')}
                        onClick={() => {
                          if (!bed.is_occupied) setAssignModal({ roomId: room.id, bedId: bed.id });
                          else if (bed.participant_name && confirm('Unassign ' + bed.participant_name + '?')) {
                            api.participants.unassignBed(bed.pid).then(() => load()).catch(() => {});
                          }
                        }}>
                        <Text size="sm" fw={500}>{bed.label}</Text>
                        <Text size="xs" c="dimmed">{bed.bed_type}</Text>
                        {bed.participant_name ? <Group mt={4}><IconUser size={12} /><Text size="xs">{bed.participant_name}</Text></Group> : <Text size="xs" c="green">Available</Text>}
                      </Paper>
                    ))}
                  </div>
                </Card>
              ))}
            </Stack>
          </Collapse>
        </Card>
      ))}
      <Modal opened={opened} onClose={close} title="Generate Rooms">
        <Stack>
          <Select label="Hotel" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={gen.hotel_id} onChange={v=>setGen({...gen,hotel_id:v||''})} searchable />
          <TextInput label="Wing/Section" value={gen.wing} onChange={e=>setGen({...gen,wing:e.target.value})} />
          <NumberInput label="Floors" value={gen.floors} onChange={v=>setGen({...gen,floors:Number(v)})} min={1} />
          <NumberInput label="Rooms per Floor" value={gen.rooms_per_floor} onChange={v=>setGen({...gen,rooms_per_floor:Number(v)})} min={1} />
          <NumberInput label="Beds per Room" value={gen.beds_per_room} onChange={v=>setGen({...gen,beds_per_room:Number(v)})} min={1} />
          <TextInput label="Room Prefix" value={gen.room_prefix} onChange={e=>setGen({...gen,room_prefix:e.target.value})} />
          <Button onClick={generate}>Generate</Button>
        </Stack>
      </Modal>
      <Modal opened={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Bed">
        <Stack>
          <TextInput placeholder="Search participants..." onChange={e => {}} />
          {unassigned.filter((p:any)=>!p.bed_label).map((p:any) => (
            <Button key={p.id} variant="light" fullWidth onClick={async () => {
              try { await api.participants.assignBed(p.id, assignModal!.bedId); notifications.show({title:'Assigned',color:'green'}); setAssignModal(null); load(); }
              catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
            }}>{p.name}</Button>
          ))}
          {unassigned.filter((p:any)=>!p.bed_label).length===0 && <Text c="dimmed">No unassigned participants</Text>}
        </Stack>
      </Modal>
    </Container>
  );
}
