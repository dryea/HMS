import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Tabs, Text, Select, Card, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconArrowLeft } from '@tabler/icons-react';
import { api } from '../api/client';

export default function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<string | null>('staff');
  const [step, setStep] = useState<'code' | 'hotel'>('code');
  const [eventCode, setEventCode] = useState(searchParams.get('code') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const errorParam = searchParams.get('error');

  const lookupEvent = async () => {
    if (!eventCode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/events').then(r => r.json());
      const ev = res.find((e: any) => e.event_code === eventCode.toUpperCase());
      if (!ev || !ev.hotels?.length) {
        notifications.show({ title: 'Error', message: 'Event not found or no hotels', color: 'red' });
        setLoading(false); return;
      }
      setHotels(ev.hotels);
      setEventInfo(ev);
      setStep('hotel');
    } catch {
      notifications.show({ title: 'Error', message: 'Could not find event', color: 'red' });
    }
    setLoading(false);
  };

  const selectHotel = async (hotel: any) => {
    setLoading(true);
    try {
      const code = eventCode.toUpperCase() + '-' + hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace('hotel-', '');
      const res = await api.auth.staff(code);
      sessionStorage.setItem('staff_session', JSON.stringify(res));
      nav('/staff/dashboard');
    } catch (e: any) {
      notifications.show({ title: 'Error', message: e.message, color: 'red' });
    }
    setLoading(false);
  };

  const adminLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await api.auth.admin(password);
      sessionStorage.setItem('admin_token', 'true');
      nav('/admin/events');
    } catch (e: any) {
      notifications.show({ title: 'Error', message: e.message, color: 'red' });
    }
    setLoading(false);
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="lg">HMS</Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">Hotel Management System</Text>
        {errorParam && <Text c="red" size="sm" ta="center" mb="md">{errorParam}</Text>}
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List grow mb="md">
            <Tabs.Tab value="staff">Staff</Tabs.Tab>
            <Tabs.Tab value="admin">Admin</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="staff">
            {step === 'code' ? (
              <Stack>
                <TextInput label="Event Code" placeholder="e.g. RBCBMC2026" value={eventCode}
                  onChange={e => setEventCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && lookupEvent()} />
                <Text size="xs" c="dimmed">Enter your event code to find your hotel</Text>
                <Button fullWidth onClick={lookupEvent} loading={loading}>Find My Hotel</Button>
              </Stack>
            ) : (
              <Stack>
                <Button variant="subtle" onClick={() => setStep('code')} leftSection={<IconArrowLeft size={16} />}>Change event</Button>
                <Text fw={500}>Select your hotel for {eventInfo?.name}:</Text>
                {hotels.map((h: any) => (
                  <Card key={h.id} withBorder padding="sm" radius="md" style={{ cursor: 'pointer' }}
                    onClick={() => selectHotel(h)}>
                    <Group><IconBuilding size={18} /><Text fw={500}>{h.name}</Text></Group>
                    <Text size="xs" c="dimmed">{h.address}</Text>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="admin">
            <Stack>
              <PasswordInput label="Admin Password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
              <Button fullWidth onClick={adminLogin} loading={loading}>Login</Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}
