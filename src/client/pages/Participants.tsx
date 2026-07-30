import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Table, TextInput, Stack, Modal, Text, ActionIcon, Badge, Tooltip, Select, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconUpload, IconTrash, IconPhone, IconBrandWhatsapp, IconQrcode, IconBed, IconChartBar, IconChevronDown, IconChevronRight, IconUsers } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Participants() {
  const { id: eventId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [children, setChildren] = useState<Record<string, any[]>>({});
  const [event, setEvent] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelFilter, setHotelFilter] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);
  const [bulkOpened, { open: openBulk, close: closeBulk }] = useDisclosure(false);
  const [childOpened, { open: openChild, close: closeChild }] = useDisclosure(false);
  const [childForm, setChildForm] = useState({ participant_id: '', name: '', age: '' });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ ein: '', name: '', phone: '', email: '', company: '', department: '', hotel_id: '' });
  const [bulkText, setBulkText] = useState('');

  const load = async () => {
    if (!eventId) return;
    try {
      const parts = await api.participants.list(eventId);
      setParticipants(parts);
      // Load children for each participant
      const childMap: Record<string, any[]> = {};
      for (const p of parts) {
        try { childMap[p.id] = await (await fetch('/api/participants/' + p.id + '/children')).json(); } catch { childMap[p.id] = []; }
      }
      setChildren(childMap);
    } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r => r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const filtered = hotelFilter ? participants.filter((p: any) => p.hotel_id === hotelFilter) : participants;

  const addChild = async () => {
    try {
      await fetch('/api/participants/' + childForm.participant_id + '/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: childForm.name, age: parseInt(childForm.age) || 0 }) });
      notifications.show({ title: 'Child added', color: 'green' }); closeChild(); load();
    } catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        { label: 'Super Admin', href: '/admin' },
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || '', href: '/admin/events/' + eventId },
        { label: 'Participants' }
      ]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Participants ({filtered.length})</Title>
        <Group>
          <Button size="xs" variant="light" color="grape" leftSection={<IconBed size={14} />} onClick={() => window.location.href = '/admin/events/' + eventId + '/rooms'}>Rooms</Button>
          <Button size="xs" variant="light" color="blue" leftSection={<IconChartBar size={14} />} onClick={() => window.location.href = '/admin/events/' + eventId + '/dashboard'}>Dash</Button>
          <Button size="xs" variant="light" leftSection={<IconUpload size={14} />} onClick={openBulk}>CSV</Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={open}>Add</Button>
        </Group>
      </Group>

      <Select mb="sm" placeholder="Filter by hotel" data={[{value:'',label:'All Hotels'},...hotels.map((h:any)=>({value:h.id,label:h.name}))]} value={hotelFilter} onChange={setHotelFilter} clearable searchable />

      <div style={{overflowX:'auto'}}>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Hotel</Table.Th><Table.Th>Phone</Table.Th><Table.Th>Room</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {filtered.map((p: any) => (
            <>
              <Table.Tr key={p.id}>
                <Table.Td>
                  <Group gap={4}>
                    <Text size="sm" fw={500}>{p.name}</Text>
                    {(children[p.id]?.length||0) > 0 && (
                      <Badge size="xs" color="pink" leftSection={<IconUsers size={8} />}
                        style={{cursor:'pointer'}} onClick={() => setExpandedRows(prev => ({...prev, [p.id]: !prev[p.id]}))}>
                        +{children[p.id].length}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">{p.company||p.department||''}</Text>
                </Table.Td>
                <Table.Td><Text size="xs">{p.hotel_name||'-'}</Text></Table.Td>
                <Table.Td><Text size="sm">{p.phone||'-'}</Text></Table.Td>
                <Table.Td><Text size="sm">{p.room_number ? p.room_number+' / '+p.bed_label : '-'}</Text></Table.Td>
                <Table.Td><Badge size="sm" color={p.status==='checked_in'?'green':p.status==='arrived'?'yellow':'gray'}>{p.status}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Add child"><ActionIcon size="sm" variant="subtle" color="pink" onClick={() => { setChildForm({participant_id:p.id,name:'',age:''}); openChild(); }}><IconUsers size={14} /></ActionIcon></Tooltip>
                    {p.phone && <><Tooltip label="WhatsApp"><ActionIcon size="sm" variant="subtle" component="a" href={'https://wa.me/'+p.phone.replace(/[^0-9]/g,'')+'?text=QR%3A%20'+encodeURIComponent(window.location.origin+'/qr/'+p.qr_token)} target="_blank"><IconBrandWhatsapp size={14} /></ActionIcon></Tooltip>
                    <Tooltip label="SMS"><ActionIcon size="sm" variant="subtle" component="a" href={'sms:'+p.phone+'?body=QR%3A%20'+window.location.origin+'/qr/'+p.qr_token}><IconPhone size={14} /></ActionIcon></Tooltip></>}
                    {p.qr_token && <Tooltip label="QR"><ActionIcon size="sm" variant="subtle" component="a" href={'/qr/'+p.qr_token} target="_blank"><IconQrcode size={14} /></ActionIcon></Tooltip>}
                    <Tooltip label="Delete"><ActionIcon size="sm" variant="subtle" color="red" onClick={async () => { if(confirm('Delete?')){ await api.participants.delete(p.id); load(); }}}><IconTrash size={14} /></ActionIcon></Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
              {expandedRows[p.id] && (children[p.id]||[]).map((c: any) => (
                <Table.Tr key={c.id}>
                  <Table.Td><Text size="sm" ml="xl">👶 {c.name} <Badge size="xs" color="pink">{c.age}y</Badge></Text></Table.Td>
                  <Table.Td><Text size="xs">same</Text></Table.Td>
                  <Table.Td><Text size="sm">-</Text></Table.Td>
                  <Table.Td><Text size="sm">same</Text></Table.Td>
                  <Table.Td><Badge size="sm" color="gray">child</Badge></Table.Td>
                  <Table.Td>
                    <ActionIcon size="sm" color="red" variant="subtle" onClick={async () => {
                      await fetch('/api/participants/children/'+c.id, {method:'DELETE'}); load();
                    }}><IconTrash size={14} /></ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </>
          ))}
        </Table.Tbody>
      </Table>
      </div>

      <Modal opened={opened} onClose={close} title="Add Participant">
        <Stack>
          <Select label="Hotel" data={hotels.map(h=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} searchable />
          <TextInput label="EIN" value={form.ein} onChange={e=>setForm({...form,ein:e.target.value})} />
          <TextInput label="Name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <TextInput label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <TextInput label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <TextInput label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <TextInput label="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />
          <Button onClick={async () => { try { await api.participants.create({event_id:eventId,...form}); notifications.show({title:'Added',color:'green'}); close(); load(); } catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }}}>Add</Button>
        </Stack>
      </Modal>

      <Modal opened={childOpened} onClose={closeChild} title="Add Child/Companion">
        <Stack>
          <TextInput label="Child Name" required value={childForm.name} onChange={e=>setChildForm({...childForm,name:e.target.value})} />
          <TextInput label="Age" type="number" value={childForm.age} onChange={e=>setChildForm({...childForm,age:e.target.value})} />
          <Button onClick={addChild}>Add Child</Button>
        </Stack>
      </Modal>

      <Modal opened={bulkOpened} onClose={closeBulk} title="Bulk Import" fullScreen>
        <Stack>
          <Select label="Hotel" data={hotels.map(h=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} searchable />
          <Text size="sm" c="dimmed">CSV: ein, name, phone, email, company, dept, children (name(age);...)</Text>
          <TextInput component="textarea" rows={10} placeholder="1992, John Doe, +977, j@c.com, Acme, Sales, Aarav(3);Neha(5)" value={bulkText} onChange={e=>setBulkText(e.target.value)} />
          <Button onClick={async () => {
            const lines = bulkText.trim().split('\n').map(l=>{const p=l.split(',').map(s=>s.trim()); const ch=p[6]||''; return {ein:p[0]||'',name:p[1]||'',phone:p[2]||'',email:p[3]||'',company:p[4]||'',department:p[5]||'',children:ch};}).filter(p=>p.name);
            try { const r = await api.participants.bulk({event_id:eventId,hotel_id:form.hotel_id||null,participants:lines}); 
              // Add children after import
              if (r?.participants) {
                for (let i=0; i<r.participants.length; i++) {
                  const ch = lines[i]?.children;
                  if (ch) {
                    ch.split(';').filter(Boolean).forEach((c:string) => {
                      const m = c.match(/(.+?)\((\d+)\)/);
                      if (m) fetch('/api/participants/'+r.participants[i].id+'/children', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:m[1].trim(),age:parseInt(m[2])})});
                    });
                  }
                }
              }
              notifications.show({title:'Imported',color:'green'}); closeBulk(); load();
            } catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
          }}>Import</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
