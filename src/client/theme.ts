import { createTheme } from '@mantine/core';

export const appTheme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, SF Mono, monospace',
  headings: {
    fontFamily: 'Playfair Display, Georgia, Cormorant Garamond, serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.3' },
      h2: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.35' },
      h3: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.4' },
      h4: { fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.4' },
      h5: { fontSize: '1rem', fontWeight: '600', lineHeight: '1.5' },
      h6: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.5' },
    },
  },
  primaryColor: 'dark',
  primaryShade: { light: 8, dark: 8 },
  defaultRadius: 16,
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
  colors: {
    dark: [
      '#FFFFFF', '#F7F7F8', '#F0F0F2', '#E8E8EA',
      '#D0D0D3', '#A0A0A6', '#717680', '#4A4D54',
      '#23262A', '#1E1E24',
    ],
    rose: [
      '#FFF5F4', '#FFE8E6', '#FDD4D0', '#FBC0BA',
      '#F9ACA4', '#F7A098', '#EBB8B6', '#D4A09E',
      '#BD8886', '#A6706E',
    ],
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  breakpoints: { xs: '480px', sm: '768px', md: '1024px', lg: '1280px', xl: '1440px' },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 2px 4px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.06)',
    lg: '0 10px 30px -5px rgba(0,0,0,0.08)',
    xl: '0 20px 40px -5px rgba(0,0,0,0.1)',
  },
  components: {
    Card: {
      defaultProps: { padding: 'lg', radius: 20, withBorder: false },
      styles: { root: { boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' } },
    },
    Button: {
      defaultProps: { radius: 9999 },
      styles: { root: { fontWeight: 500, fontSize: '14px', padding: '12px 24px' } },
    },
    Table: {
      defaultProps: { striped: false, highlightOnHover: true },
      styles: { table: { borderCollapse: 'separate', borderSpacing: '0 4px' } },
    },
    Modal: {
      defaultProps: { centered: true, padding: 'lg', radius: 28 },
      styles: { header: { marginBottom: 8 } },
    },
    TextInput: {
      defaultProps: { radius: 12 },
      styles: { input: { border: '1px solid rgba(0,0,0,0.08)', background: '#F7F7F8' } },
    },
    Select: {
      defaultProps: { radius: 12, searchable: true },
      styles: { input: { border: '1px solid rgba(0,0,0,0.08)', background: '#F7F7F8' } },
    },
    Textarea: {
      defaultProps: { radius: 12 },
      styles: { input: { border: '1px solid rgba(0,0,0,0.08)', background: '#F7F7F8' } },
    },
    Badge: {
      defaultProps: { radius: 9999 },
    },
    SegmentedControl: {
      defaultProps: { radius: 9999 },
    },
    Tabs: {
      defaultProps: { radius: 9999 },
    },
    Paper: {
      defaultProps: { radius: 20 },
    },
  },
});
