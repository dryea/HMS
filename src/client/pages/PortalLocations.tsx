import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Stack, ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconMapPin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function PortalLocations() {
  const { token } = useParams();
  const nav = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (token) fetch('/api/portal/'+token+'/locations').then(r=>r.json()).then(setLocations).catch(() => {});
  }, [token]);

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={() => nav(-1)}><IconArrowLeft size={20} /></ActionIcon><Title order={3}>Locations</Title></Group>
      {locations.map((l: any) => (
        <Card key={l.id} withBorder mb="sm" padding="sm" radius="md">
          <Group><IconMapPin size={18} /><Text fw={500}>{l.name}</Text></Group>
          <Text size="sm" c="dimmed">{l.description||''}</Text>
          <Group mt={4}>
            {l.floor && <Badge size="sm">Floor {l.floor}</Badge>}
            {l.hotel_name && <Badge size="sm" variant="light">{l.hotel_name}</Badge>}
          </Group>
        </Card>
      ))}
    </Container>
  );
}
