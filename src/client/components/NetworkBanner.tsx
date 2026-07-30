import { useState, useEffect } from 'react';
import { Alert } from '@mantine/core';
import { IconWifiOff } from '@tabler/icons-react';

export default function NetworkBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return <Alert icon={<IconWifiOff size={16} />} color="red" variant="filled" radius={0}>You are offline. Check-ins will sync when connected.</Alert>;
}
