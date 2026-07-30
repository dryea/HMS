import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, TextInput, NumberInput, Card, Text, Badge, Modal, Paper, ActionIcon, Collapse, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBed, IconUser, IconArrowLeft, IconChevronDown, IconChevronRight, IconTrash, IconUsers } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function HotelRooms() {
  const { id: eventId, hid: hotelId } = useParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [gen, setGen] = useState({ floors: 1, rooms_per_floor: 10, room_prefix: '', beds_per_room: 2, wing: '' });
  const [expandedWings, setExpandedWings] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!eventId || !hotelId) return;
    try { setRooms(await api.rooms.listByHotel(eventId, hotelId)); } catch {}
    try { setHotel(await (await fetch('/api/hotels/'+hotelId)).json()); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setParticipants(await api.participants.listByHotel(eventId, hotelId)); } catch {}
    try { setAllHotels(await fetch('/api/hotels').then(r => r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId, hotelId]);

  const generate = async () => {
    try { await api.rooms.generate({ event_id: eventId, hotel_id: hotelId, ...gen });
      notifications.show({ title: 'Rooms created', color: 'green' }); close(); load();
    } catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
  };

  const unassigned = participants.filter((p: any) => !p.bed_label);
  const byWing = rooms.reduce((acc: any, r: any) => {
    const w = r.wing || 'General'; if (!acc[w]) acc[w] = []; acc[w].push(r); return acc;
  }, {});

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || '', href: '/admin/events/' + eventId },
        { label: 'Rooms', href: '/admin/events/' + eventId + '/rooms' },
        { label: hotel?.name || '', href: '/admin/events/' + eventId + '/hotels/' + hotelId + '/rooms' }
      ]} />
      <Group mb="md">
        <Title order={3}>{hotel?.name || 'Hotel'} Rooms</Title>
        <Select size="xs" placeholder="Switch hotel" data={allHotels.map(h=>({value:h.id,label:h.name}))} value={hotelId}
          onChange={v => v && v !== hotelId && nav('/admin/events/' + eventId + '/hotels/' + v + '/rooms')} searchable />
      </Group>
      <Group mb="md">
        <Button size="xs" variant="light" color="teal" leftSection={<IconUsers size={14} />}
          onClick={() => nav('/admin/events/' + eventId + '/hotels/' + hotelId + '/participants')}>People</Button>
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={open}>Generate</Button>
      </Group>

      {Object.entries(byWing).map(([wing, wingRooms]: [string, any]) => (
        <Card key={wing} withBorder mb="sm" padding="sm" radius="md">
          <Group onClick={() => setExpandedWings(prev => ({...prev, [wing]: !prev[wing]}))} style={{cursor:'pointer'}}>
            {expandedWings[wing] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            <Text fw={600}>{wing}</Text><Badge size="sm">{wingRooms.length} rooms</Badge>
          </Group>
          <Collapse in={expandedWings[wing]}>
            {wingRooms.map((room: any) => (
              <Card key={room.id} withBorder mt="xs" padding="xs" radius="sm">
                <Group mb={4}>
                  <IconBed size={14} /><Text size="sm" fw={500}>Room {room.room_number}</Text>
                  {room.floor && <Badge size="xs">Floor {room.floor}</Badge>}
                  <Badge size="xs" color={room.status==='ready'?'green':'yellow'}>{room.status}</Badge>
                  <ActionIcon size="xs" color="red" variant="subtle" onClick={async () => { if(confirm('Delete?')){ await api.rooms.delete(room.id); load(); }}}><IconTrash size={12} /></ActionIcon>
                </Group>
                <div className="bed-grid">
                  {(room.beds||[]).map((bed: any) => (
                    <Paper key={bed.id} p={4} withBorder radius="sm"
                      className={'bed-card'+(bed.is_occupied?' occupied':' vacant')}
                      onClick={() => {
                        if (!bed.is_occupied) setAssignModal(bed.id);
                        else if (bed.pid) { api.participants.unassignBed(bed.pid).then(load); }
                      }}>
                      <Text size="xs" fw={500}>{bed.label}</Text>
                      <Text size="xs" c={bed.is_occupied?'red':'green'}>{bed.participant_name||'Available'}</Text>
                    </Paper>
                  ))}
                </div>
              </Card>
            ))}
          </Collapse>
        </Card>
      ))}
      <Modal opened={opened} onClose={close} title="Generate Rooms">
        <Stack>
          <TextInput label="Wing/Section" value={gen.wing} onChange={e=>setGen({...gen,wing:e.target.value})} />
          <NumberInput label="Floors" value={gen.floors} onChange={v=>setGen({...gen,floors:Number(v)})} min={1} />
          <NumberInput label="Rooms/Floor" value={gen.rooms_per_floor} onChange={v=>setGen({...gen,rooms_per_floor:Number(v)})} min={1} />
          <NumberInput label="Beds/Room" value={gen.beds_per_room} onChange={v=>setGen({...gen,beds_per_room:Number(v)})} min={1} />
          <TextInput label="Prefix" value={gen.room_prefix} onChange={e=>setGen({...gen,room_prefix:e.target.value})} />
          <Button onClick={generate}>Generate</Button>
        </Stack>
      </Modal>
      <Modal opened={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Bed">
        <Stack>
          {unassigned.map((p:any) => (
            <Button key={p.id} variant="light" fullWidth onClick={async () => {
              try { await api.participants.assignBed(p.id, assignModal!); notifications.show({title:'Assigned',color:'green'}); setAssignModal(null); load(); }
              catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
            }}>{p.name}</Button>
          ))}
          {unassigned.length===0 && <Text c="dimmed">No unassigned participants</Text>}
        </Stack>
      </Modal>
    </Container>
  );
}
