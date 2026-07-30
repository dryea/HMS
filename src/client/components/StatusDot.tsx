import { Group, Text } from '@mantine/core';

const colors: Record<string, string> = {
  allocated: 'gray', arrived: 'yellow', checked_in: 'green', departed: 'red',
  vacant: 'green', occupied: 'red',
  pending: 'yellow', confirmed: 'blue', cancelled: 'red',
  ready: 'green', maintenance: 'red', dirty: 'orange',
};

export default function StatusDot({ status, label }: { status: string; label?: string }) {
  const color = colors[status] || 'gray';
  return (
    <Group gap={6}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--mantine-color-${color}-6)` }} />
      <Text size="sm">{label || status}</Text>
    </Group>
  );
}
