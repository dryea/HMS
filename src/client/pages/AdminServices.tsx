import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, Card, Text, Badge, Select, TextInput, SimpleGrid, Checkbox, ActionIcon, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconCopy } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminServices() {
  const { id: eventId } = useParams();
  const [dates, setDates] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [services, setServices] = useState<any[]>([]);

  const load = async () => {
    if (!eventId) return;
    try { setDates(await (await fetch('/api/services/'+eventId+'/dates')).json()); } catch {}
    try { setTypes(await (await fetch('/api/services/types')).json()); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const addDate = () => {
    if (!selectedDate) return;
    setServices([...services, { date: selectedDate, entries: types.map(t => ({ hotel_id: hotels[0]?.id||'', type_id: t.id, start_time: '', end_time: '' })) }]);
    setSelectedDate('');
  };

  const saveDate = async (date: string) => {
    const entry = services.find(s => s.date === date);
    if (!entry) return;
    try {
      await fetch('/api/services/'+eventId+'/dates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date, services: entry.entries }) });
      notifications.show({ title: 'Services saved for '+date, color:'green' }); load();
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  const copyFromPrevious = async (date: string) => {
    const idx = services.findIndex(s => s.date === date);
    if (idx > 0) {
      const prev = services[idx - 1];
      setServices(services.map((s,i) => i === idx ? { ...s, entries: prev.entries.map((e:any) => ({...e})) } : s));
    }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Services'}
      ]} />
      <Title order={3} mb="md">Service Schedule</Title>
      <Group mb="md">
        <TextInput type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
        <Button leftSection={<IconPlus size={14} />} onClick={addDate}>Add Date</Button>
      </Group>

      {services.map((entry: any) => (
        <Card key={entry.date} withBorder mb="sm" padding="sm" radius="md">
          <Group mb="sm">
            <Text fw={500}>{entry.date}</Text>
            <Button size="xs" variant="light" leftSection={<IconCopy size={12} />} onClick={() => copyFromPrevious(entry.date)}>Copy Prev</Button>
            <Button size="xs" onClick={() => saveDate(entry.date)}>Save</Button>
          </Group>
          {entry.entries.map((svc: any, i: number) => (
            <Group key={i} mb={4}>
              <Badge size="sm">{types.find(t=>t.id===svc.type_id)?.name||svc.type_id}</Badge>
              <Select size="xs" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={svc.hotel_id} onChange={v=>{
                const e = [...entry.entries]; e[i] = {...e[i], hotel_id: v||''}; setServices(services.map(s=>s.date===entry.date?{...s,entries:e}:s));
              }} searchable />
              <TextInput size="xs" type="time" value={svc.start_time} onChange={e=>{
                const es = [...entry.entries]; es[i] = {...es[i], start_time: e.target.value}; setServices(services.map(s=>s.date===entry.date?{...s,entries:es}:s));
              }} />
              <TextInput size="xs" type="time" value={svc.end_time} onChange={e=>{
                const es = [...entry.entries]; es[i] = {...es[i], end_time: e.target.value}; setServices(services.map(s=>s.date===entry.date?{...s,entries:es}:s));
              }} />
            </Group>
          ))}
        </Card>
      ))}
    </Container>
  );
}
