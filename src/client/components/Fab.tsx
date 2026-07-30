import { ActionIcon, Paper, Transition, Group, Text, Stack } from '@mantine/core';
import { IconPlus, IconUserPlus, IconBed, IconQrcode } from '@tabler/icons-react';
import { useState } from 'react';

interface FabAction { label: string; icon: React.ReactNode; onClick: () => void; }

export default function Fab({ actions }: { actions: FabAction[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Paper style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 200, background: 'transparent' }}>
      <Transition mounted={open} transition="slide-up" duration={200}>
        {(style) => (
          <Stack align="end" gap={8} style={style}>
            {actions.map((a) => (
              <Group key={a.label} gap={8}>
                <Text size="sm" style={{ background: 'var(--mantine-color-body)', padding: '4px 8px', borderRadius: 4 }}>{a.label}</Text>
                <ActionIcon size="md" radius="xl" variant="filled" color="blue" onClick={() => { setOpen(false); a.onClick(); }}>{a.icon}</ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Transition>
      <ActionIcon size="xl" radius="xl" variant="filled" color={open ? 'red' : 'blue'}
        onClick={() => setOpen(!open)} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <IconPlus size={24} style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </ActionIcon>
    </Paper>
  );
}
