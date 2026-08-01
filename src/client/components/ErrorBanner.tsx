import { Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function ErrorBanner({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light" mb="md">
      <Group justify="space-between" align="center">
        <span>{message}</span>
        {onRetry && <Button size="xs" variant="light" color="red" onClick={onRetry}>Retry</Button>}
      </Group>
    </Alert>
  );
}
