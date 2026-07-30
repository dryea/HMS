import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Title, Text, Stack, Center, Image, Button, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconPhone, IconBrandWhatsapp, IconDownload, IconCheck } from '@tabler/icons-react';
import { api } from '../api/client';

export default function ParticipantQR() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) api.qr.get(token).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <Container><Text>Loading...</Text></Container>;

  const p = data.participant;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'qr-' + p.name.replace(/\s+/g, '-') + '.png';
    link.href = data.qr_data_url;
    link.click();
  };

  return (
    <Container size="sm" py="xl">
      <Paper radius="lg" padding="xl" withBorder>
        <Stack align="center" gap="lg">
          <Title order={3}>{p.name}</Title>
          <Text c="dimmed">{p.event_name}</Text>

          <Paper withBorder p="md" radius="md">
            <Image src={data.qr_data_url} w={280} h={280} alt="QR Code" />
          </Paper>

          <Text size="sm" c="dimmed">Show this QR to hotel staff for check-in</Text>

          <Group>
            <Button leftSection={<IconDownload size={16} />} onClick={handleDownload}>
              Download QR
            </Button>
          </Group>

          {p.phone && (
            <Group>
              <Text size="sm">Share via:</Text>
              <Tooltip label="SMS"><ActionIcon size="lg" variant="filled" color="blue" component="a" href={'sms:' + p.phone + '?body=Your%20QR%3A%20' + window.location.href}><IconPhone size={18} /></ActionIcon></Tooltip>
              <Tooltip label="WhatsApp"><ActionIcon size="lg" variant="filled" color="green" component="a" href={'https://wa.me/' + p.phone.replace(/[^0-9]/g, '') + '?text=Your%20QR%3A%20' + encodeURIComponent(window.location.href)} target="_blank"><IconBrandWhatsapp size={18} /></ActionIcon></Tooltip>
            </Group>
          )}

          {data.checkin_url && (
            <Text size="xs" c="dimmed">Staff: {data.checkin_url}</Text>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
