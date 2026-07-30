import { Text, Group } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface Crumb { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const nav = useNavigate();
  if (!items.length) return null;
  return (
    <Group gap={4} mb="sm" mt={-8} style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
      {items.map((item, i) => (
        <Text key={i} size="sm"
          c={item.href ? 'blue' : 'dimmed'}
          onClick={() => item.href && nav(item.href)}
          style={{ cursor: item.href ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}>
          {i > 0 && <IconChevronRight size={12} style={{ margin: '0 4px', flexShrink: 0 }} />}
          {item.label}
        </Text>
      ))}
    </Group>
  );
}
