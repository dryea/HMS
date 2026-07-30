import { ReactNode } from 'react';
import { useEventTheme } from '../hooks/useEventTheme';

export default function ThemeProvider({ eventId, children }: { eventId?: string; children: ReactNode }) {
  const theme = useEventTheme(eventId);
  return (
    <div className="event-root" style={{
      '--event-banner': theme.banner,
      '--event-accent': theme.accent,
      '--event-accent-rgb': hexToRgb(theme.accent),
    } as React.CSSProperties}>
      {children}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '76, 110, 245';
}
