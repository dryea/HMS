import { useState, useEffect } from 'react';

const PRESETS: Record<string, { banner: string; accent: string }> = {
  ocean: { banner: '#0D1117', accent: '#1E88E5' },
  forest: { banner: '#0D1F11', accent: '#2E7D32' },
  sunset: { banner: '#1F0D0D', accent: '#E65100' },
  royal: { banner: '#1A0D2E', accent: '#7B1FA2' },
  teal: { banner: '#0D1F1A', accent: '#00897B' },
  slate: { banner: '#111318', accent: '#546E7A' },
};

export { PRESETS };

export function useEventTheme(eventId?: string) {
  const [theme, setTheme] = useState({ banner: '#1a1b1e', accent: '#4c6ef5', logo: '' });
  useEffect(() => {
    if (eventId) {
      fetch('/api/branding/' + eventId).then(r => r.json()).then(d => {
        if (d?.banner_color) setTheme({ banner: d.banner_color, accent: d.accent_color || '#4c6ef5', logo: d.logo_url || '' });
      }).catch(() => {});
    }
  }, [eventId]);
  return theme;
}
