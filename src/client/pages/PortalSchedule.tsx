import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Button, Stack, Divider, ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconBookmark, IconBookmarkFilled, IconMapPin, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function PortalSchedule() {
  const { token } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);

  const load = () => {
    if (token) fetch('/api/portal/'+token+'/sessions').then(r=>r.json()).then(setData).catch(() => {});
  };
  useEffect(() => { load(); }, [token]);

  const toggleBookmark = async (sid: string) => {
    await fetch('/api/portal/'+token+'/bookmark', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ session_id: sid }) });
    load();
  };

  if (!data) return <Container><Text>Loading...</Text></Container>;

  const byDate: Record<string, any[]> = {};
  for (const s of data.sessions || []) {
    if (!byDate[s.session_date]) byDate[s.session_date] = [];
    byDate[s.session_date].push(s);
  }

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={() => nav(-1)}><IconArrowLeft size={20} /></ActionIcon><Title order={3}>Schedule</Title></Group>
      {Object.entries(byDate).map(([date, sessions]) => (
        <Card key={date} withBorder mb="md" padding="sm" radius="md">
          <Text fw={600} mb="sm">{date}</Text>
          {sessions.map((s: any) => (
            <Card key={s.id} withBorder mb="xs" padding="sm" radius="sm">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text fw={500}>{s.title}</Text>
                  <Text size="sm" c="dimmed">{s.start_time} - {s.end_time}</Text>
                  <Group gap={4}>
                    {s.speaker_name && <><IconUser size={12} /><Text size="xs">{s.speaker_name}</Text></>}
                    {s.location_name && <><IconMapPin size={12} /><Text size="xs">{s.location_name}</Text></>}
                  </Group>
                  {s.track && <Badge size="sm" variant="light">{s.track}</Badge>}
                </Stack>
                <ActionIcon variant={s.booked ? 'filled' : 'subtle'} color="blue" onClick={() => toggleBookmark(s.id)}>
                  {s.booked ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Card>
      ))}
    </Container>
  );
}
