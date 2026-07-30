import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Button, Paper, Text, Group } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconDeviceMobile } from '@tabler/icons-react';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './styles/global.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Register background sync for offline check-ins
      if ('sync' in reg) {
        navigator.serviceWorker.ready.then((r) => {
          r.sync.register('sync-checkins').catch(() => {});
        });
      }
    });
  });
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setVisible(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!visible) return null;
  return (
    <Paper className="install-banner" withBorder p="md" radius={0}>
      <Group justify="space-between">
        <Group><IconDeviceMobile size={24} /><Text size="sm" fw={500}>Install HMS for the best experience</Text></Group>
        <Group>
          <Button size="xs" variant="subtle" onClick={() => setVisible(false)}>Later</Button>
          <Button size="xs" onClick={async () => { deferredPrompt?.prompt(); const r = await deferredPrompt?.userChoice; if (r?.outcome === 'accepted') setVisible(false); }}>Install</Button>
        </Group>
      </Group>
    </Paper>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <App />
      <InstallPrompt />
    </MantineProvider>
  </React.StrictMode>
);
