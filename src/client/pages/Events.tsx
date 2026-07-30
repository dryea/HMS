import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Text, Title, Group, Button, Stack, Modal, TextInput, SimpleGrid, Badge, Checkbox, Divider, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBuilding, IconMapPin, IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import { api } from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Events() {
  const nav = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '', event_code: '', hotel_name: '', hotel_address: '', contact_person: '', contact_phone: '' });
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [createNewHotel, setCreateNewHotel] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setEvents(await api.events.list()); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r => r.json())); } catch {}
  };
  useEffect(() => { load(); }, []);

  const openEdit = (e: any) => {
    setEditEvent(e);
    setForm({ name: e.name, description: e.description||'', start_date: e.start_date, end_date: e.end_date, event_code: e.event_code, hotel_name: '', hotel_address: '', contact_person: '', contact_phone: '' });
    setSelectedHotels([]); open();
  };

  const save = async () => {
    setLoading(true);
    try {
      if (editEvent) {
        await api.events.update(editEvent.id, { name: form.name, description: form.description, start_date: form.start_date, end_date: form.end_date });
        notifications.show({ title: 'Updated', color: 'green' });
      } else {
        let hotelIds = [...selectedHotels];
        if (createNewHotel && form.hotel_name) {
          const hotel = await fetch('/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.hotel_name, address: form.hotel_address, contact_person: form.contact_person, contact_phone: form.contact_phone }) });
          hotelIds.push((await hotel.json()).id);
        }
        if (hotelIds.length === 0) { notifications.show({ title: 'Error', message: 'Select at least one hotel', color: 'red' }); setLoading(false); return; }
        await api.events.create({ hotel_ids: hotelIds, name: form.name, description: form.description, start_date: form.start_date, end_date: form.end_date, event_code: form.event_code });
        notifications.show({ title: 'Created', color: 'green' });
      }
      close(); setEditEvent(null); setForm({ name: '', description: '', start_date: '', end_date: '', event_code: '', hotel_name: '', hotel_address: '', contact_person: '', contact_phone: '' });
      setSelectedHotels([]); setCreateNewHotel(false); load();
    } catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
    setLoading(false);
  };

  const deleteEvent = async (id: string, name: string) => {
    if (!confirm('Delete event "' + name + '" and all its data?')) return;
    try { await api.events.delete(id); notifications.show({ title: 'Deleted', color: 'green' }); load(); }
    catch (e: any) { notifications.show({ title: 'Error', message: e.message, color: 'red' }); }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); notifications.show({ title: 'Copied: ' + code, color: 'blue' }); };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{ label: 'Super Admin', href: '/admin' }, { label: 'Events' }]} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Events</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditEvent(null); setForm({ name: '', description: '', start_date: '', end_date: '', event_code: '', hotel_name: '', hotel_address: '', contact_person: '', contact_phone: '' }); setSelectedHotels([]); setCreateNewHotel(false); open(); }}>New Event</Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {events.map((e: any) => (
          <Card key={e.id} padding="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Group><IconBuilding size={18} /><Title order={5}>{e.name}</Title></Group>
              <Group gap={4}>
                <ActionIcon size="sm" variant="subtle" onClick={() => openEdit(e)}><IconEdit size={14} /></ActionIcon>
                <ActionIcon size="sm" variant="subtle" color="red" onClick={() => deleteEvent(e.id, e.name)}><IconTrash size={14} /></ActionIcon>
              </Group>
            </Group>
            <Text size="sm" c="dimmed">{e.description}</Text>
            <Text size="xs" mt="xs">{e.start_date} to {e.end_date}</Text>
            <Group gap={4} mt={4}>
              {(e.hotels || []).map((h: any) => (
                <Badge key={h.id} size="sm" variant="light" color="blue" leftSection={<IconMapPin size={10} />}>
                  {h.name}
                  {h.staff_code && <span style={{cursor:'pointer',marginLeft:4}} onClick={(ev) => { ev.stopPropagation(); copyCode(h.staff_code); }} title="Copy staff code">📋</span>}
                </Badge>
              ))}
            </Group>
            <Group mt="xs"><Badge size="sm">{e.event_code}</Badge></Group>
            <Group mt="md">
              <Button size="xs" variant="light" onClick={() => nav('/admin/events/' + e.id)}>Open</Button>
              <Button size="xs" variant="light" color="blue" onClick={() => nav('/admin/events/' + e.id + '/dashboard')}>Dashboard</Button>
              <Button size="xs" variant="light" color="grape" onClick={() => nav('/admin/events/' + e.id + '/rooms')}>Rooms</Button>
              <Button size="xs" variant="light" color="teal" onClick={() => nav('/admin/events/' + e.id + '/participants')}>Participants</Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
      <Modal opened={opened} onClose={() => { close(); setEditEvent(null); }} title={editEvent ? 'Edit Event' : 'New Event'} fullScreen>
        <Stack>
          {!editEvent && (
            <>
              <Text size="sm" fw={500}>Select Hotels</Text>
              {hotels.map((h: any) => (
                <Checkbox key={h.id} label={`${h.name} — ${h.address}`} checked={selectedHotels.includes(h.id)}
                  onChange={() => setSelectedHotels(prev => prev.includes(h.id) ? prev.filter(id => id !== h.id) : [...prev, h.id])} />
              ))}
              <Divider label="Or create a new hotel" labelPosition="center" />
              <Checkbox label="Add a new hotel" checked={createNewHotel} onChange={e => setCreateNewHotel(e.currentTarget.checked)} />
              {createNewHotel && (
                <Stack>
                  <TextInput label="Hotel Name" required value={form.hotel_name} onChange={e => setForm({...form, hotel_name: e.target.value})} />
                  <TextInput label="Address" value={form.hotel_address} onChange={e => setForm({...form, hotel_address: e.target.value})} />
                  <TextInput label="Contact Person" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} />
                  <TextInput label="Contact Phone" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
                </Stack>
              )}
              <Divider />
            </>
          )}
          <TextInput label="Event Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <TextInput label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <TextInput label="Start Date" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          <TextInput label="End Date" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          <TextInput label="Event Code" value={form.event_code} onChange={e => setForm({...form, event_code: e.target.value})} disabled={!!editEvent} />
          <Button fullWidth onClick={save} loading={loading}>{editEvent ? 'Update Event' : 'Create Event'}</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
