import { Component, ReactNode } from 'react';
import { Container, Text, Button, Paper } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <Container py="xl" ta="center">
          <IconAlertCircle size={64} style={{ opacity: 0.5 }} />
          <Text size="lg" fw={600} mt="md">Something went wrong</Text>
          <Text size="sm" c="dimmed" mt="sm">{this.state.error?.message || 'An unexpected error occurred'}</Text>
          <Button mt="md" variant="light" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Reload Page</Button>
        </Container>
      );
    }
    return this.props.children;
  }
}
