import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Stack, ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconBell } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function PortalAnnouncements() {
  const { token } = useParams();
  const nav = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch('/api/portal/'+token+'/announcements').then(r=>r.json()).then((data) => {
        setAnnouncements(data);
        // Mark all as read
        data.forEach((a: any) => {
          if (!a.is_read) fetch('/api/portal/'+token+'/announcements/'+a.id+'/read', { method:'POST' });
        });
      }).catch(() => {});
    }
  }, [token]);

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={() => nav(-1)}><IconArrowLeft size={20} /></ActionIcon><Title order={3}>Announcements</Title></Group>
      {announcements.map((a: any) => (
        <Card key={a.id} withBorder mb="sm" padding="sm" radius="md" style={{opacity: a.is_read ? 0.7 : 1}}>
          <Group><IconBell size={16} /><Text fw={500}>{a.title}</Text>{a.priority==='high'&&<Badge size="sm" color="red">High</Badge>}</Group>
          <Text size="sm" mt={4}>{a.message}</Text>
          <Text size="xs" c="dimmed" mt={4}>{a.created_at}</Text>
        </Card>
      ))}
    </Container>
  );
}
