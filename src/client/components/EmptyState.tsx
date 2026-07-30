import { Container, Text, Button, Stack } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Container py="xl" ta="center">
      <Stack align="center" gap="md">
        {icon || <IconMoodEmpty size={64} style={{ opacity: 0.3 }} />}
        <Text size="lg" fw={600}>{title}</Text>
        <Text size="sm" c="dimmed" maw={300}>{description}</Text>
        {actionLabel && onAction && (
          <Button variant="light" onClick={onAction}>{actionLabel}</Button>
        )}
      </Stack>
    </Container>
  );
}
