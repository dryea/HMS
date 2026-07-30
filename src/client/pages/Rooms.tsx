import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, TextInput, NumberInput, Card, Text, Badge, Modal, Paper, Select, ActionIcon, Collapse, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { IconPlus, IconBed, IconChevronDown, IconChevronRight, IconUsers, IconChartBar, IconEdit } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';
import StatusDot from '../components/StatusDot';
import EmptyState from '../components/EmptyState';

const MotionCard = motion.create(Card);

export default function Rooms() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open,close}] = useDisclosure(false);
  const [assignModal, setAssignModal] = useState<string|null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [gen, setGen] = useState({ hotel_id:'', floors:1, rooms_per_floor:10, room_prefix:'', beds_per_room:2, wing:'' });
  const [expandedHotels, setExpandedHotels] = useState<Record<string, boolean>>({});
  const [editRoom, setEditRoom] = useState<any>(null);
  const [editOpened, {open:openEdit,close:closeEdit}] = useDisclosure(false);
  const [editForm, setEditForm] = useState({ room_number:'', floor:'', wing:'', status:'ready', room_type_id:'' });

  const load = async () => {
    if(!eventId) return;
    setLoading(true);
    try { setRooms(await api.rooms.list(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setParticipants(await api.participants.list(eventId)); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [eventId]);

  const unassigned = participants.filter((p:any)=>!p.bed_label);
  const grouped = rooms.reduce((acc:any,r:any)=>{const k=r.hotel_id||'unknown';if(!acc[k])acc[k]={hotel_name:r.hotel_name||'Unknown',rooms:[]};acc[k].rooms.push(r);return acc;},{});

  if(loading) return (
    <Container pb={70}><Skeleton height={20} width={300} mb="md" /><Skeleton height={36} mb="md" />
      {[1,2].map(i=><Skeleton key={i} height={200} mb="sm" radius="md" />)}
    </Container>
  );

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Rooms'}]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Rooms & Beds</Title>
        <Group>
          <Button size="xs" variant="light" color="teal" leftSection={<IconUsers size={14} />} onClick={()=>nav('../participants')}>People</Button>
          <Button size="xs" variant="light" color="blue" leftSection={<IconChartBar size={14} />} onClick={()=>nav('../dashboard')}>Dash</Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={open}>Generate</Button>
        </Group>
      </Group>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={<IconBed size={64} />} title="No rooms yet" description="Generate rooms for your hotels to start assigning participants." actionLabel="Generate Rooms" onAction={open} />
      ) : (
      Object.entries(grouped).map(([hotelId, g]:[string,any]) => (
        <MotionCard key={hotelId} withBorder mb="md" padding="sm" radius="md" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <Group onClick={()=>setExpandedHotels(prev=>({...prev,[hotelId]:!prev[hotelId]}))} style={{cursor:'pointer'}}>
            {expandedHotels[hotelId] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            <Text fw={600}>{g.hotel_name}</Text>
            <Badge size="sm">{g.rooms.length} rooms</Badge>
            <Button size="xs" variant="light" color="grape" onClick={(e)=>{e.stopPropagation();nav('hotels/'+hotelId+'/rooms');}}>Manage</Button>
          </Group>
          <Collapse in={expandedHotels[hotelId]}>
            <Stack mt="sm">
              {g.rooms.map((room:any) => (
                <MotionCard key={room.id} withBorder padding="sm" radius="sm" layout>
                  <Group mb="xs">
                    <IconBed size={16} /><Text fw={500}>Room {room.room_number}</Text>
                    {room.floor && <Badge size="sm">Floor {room.floor}</Badge>}
                    {room.wing && <Badge size="sm" variant="light">{room.wing}</Badge>}
                    <StatusDot status={room.status} />
                    <ActionIcon size="xs" variant="subtle" onClick={(e)=>{e.stopPropagation();setEditRoom(room);setEditForm({room_number:room.room_number,floor:room.floor||'',wing:room.wing||'',status:room.status,room_type_id:room.room_type_id||''});openEdit();}}><IconEdit size={12}/></ActionIcon>
                  </Group>
                  <div className="bed-grid">
                    {(room.beds||[]).map((bed:any) => (
                      <Paper key={bed.id} p="xs" withBorder radius="sm"
                        className={'bed-card'+(bed.is_occupied?' occupied':' vacant')}
                        onClick={() => {
                          if(!bed.is_occupied) setAssignModal(bed.id);
                          else if(bed.participant_name&&confirm('Unassign '+bed.participant_name+'?')){ api.participants.unassignBed(bed.pid).then(()=>load()).catch(()=>{}); }
                        }}>
                        <Text size="sm" fw={500}>{bed.label}</Text>
                        <Text size="xs" c="dimmed">{bed.bed_type}</Text>
                        {bed.participant_name ? <Group mt={4}><StatusDot status="occupied" /><Text size="xs">{bed.participant_name}</Text></Group> : <StatusDot status="vacant" label="Available" />}
                      </Paper>
                    ))}
                  </div>
                </MotionCard>
              ))}
            </Stack>
          </Collapse>
        </MotionCard>
      ))
      )}
      <Modal opened={opened} onClose={close} title="Generate Rooms">
        <Stack>
          <Select label="Hotel" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={gen.hotel_id} onChange={v=>setGen({...gen,hotel_id:v||''})} searchable />
          <TextInput label="Wing/Section" value={gen.wing} onChange={e=>setGen({...gen,wing:e.target.value})} />
          <NumberInput label="Floors" value={gen.floors} onChange={v=>setGen({...gen,floors:Number(v)})} min={1} />
          <NumberInput label="Rooms/Floor" value={gen.rooms_per_floor} onChange={v=>setGen({...gen,rooms_per_floor:Number(v)})} min={1} />
          <NumberInput label="Beds/Room" value={gen.beds_per_room} onChange={v=>setGen({...gen,beds_per_room:Number(v)})} min={1} />
          <TextInput label="Prefix" value={gen.room_prefix} onChange={e=>setGen({...gen,room_prefix:e.target.value})} />
          <Button onClick={async()=>{if(!gen.hotel_id){notifications.show({title:'Error',message:'Select a hotel',color:'red'});return;}try{await api.rooms.generate({event_id:eventId,hotel_id:gen.hotel_id,...gen});notifications.show({title:'Rooms created',color:'green'});close();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Generate</Button>
        </Stack>
      </Modal>
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Room">
        <Stack>
          <TextInput label="Room Number" value={editForm.room_number} onChange={e=>setEditForm({...editForm,room_number:e.target.value})} />
          <TextInput label="Floor" value={editForm.floor} onChange={e=>setEditForm({...editForm,floor:e.target.value})} />
          <TextInput label="Wing/Section" value={editForm.wing} onChange={e=>setEditForm({...editForm,wing:e.target.value})} />
          <Select label="Status" data={[{value:'ready',label:'Ready'},{value:'occupied',label:'Occupied'},{value:'maintenance',label:'Maintenance'},{value:'dirty',label:'Dirty'}]} value={editForm.status} onChange={v=>setEditForm({...editForm,status:v||'ready'})} />
          <Button onClick={async()=>{try{await fetch('/api/rooms/'+editRoom.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editForm)});notifications.show({title:'Room updated',color:'green'});closeEdit();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Save Changes</Button>
        </Stack>
      </Modal>
      <Modal opened={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Bed">
        <Stack>
          <TextInput placeholder="Search..." onChange={e=>{}} />
          {unassigned.filter((p:any)=>!p.bed_label).map((p:any)=>(
            <Button key={p.id} variant="light" fullWidth onClick={async()=>{try{await api.participants.assignBed(p.id,assignModal!);notifications.show({title:'Assigned',color:'green'});setAssignModal(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>{p.name}</Button>
          ))}
          {unassigned.filter((p:any)=>!p.bed_label).length===0 && <Text c="dimmed">No unassigned participants</Text>}
        </Stack>
      </Modal>
    </Container>
  );
}
