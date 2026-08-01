import { createTheme } from '@mantine/core';

export const md3Colors = {
  primary: '#8C4A48', onPrimary: '#FFFFFF', primaryContainer: '#FFDAD8', onPrimaryContainer: '#3B0A09',
  secondary: '#775654', onSecondary: '#FFFFFF', secondaryContainer: '#FFDAD8', onSecondaryContainer: '#2F1513',
  error: '#BA1A1A', onError: '#FFFFFF', errorContainer: '#FFDAD6', onErrorContainer: '#410002',
  background: '#FCFCFC', onBackground: '#1C1B1B',
  surface: '#FCFCFC', onSurface: '#1C1B1B', onSurfaceVariant: '#494545',
  outline: '#7B7575', outlineVariant: '#CBC4C4',
  surfaceContainerLow: '#F6F6F6', surfaceContainer: '#F0F0F0', surfaceContainerHigh: '#EBEBEB',
};

export const appTheme = createTheme({
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  fontSizes: { xs: '11px', sm: '12px', md: '14px', lg: '16px', xl: '22px' },
  headings: {
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '400',
    sizes: {
      h1: { fontSize: '32px', fontWeight: '400', lineHeight: '40px' },
      h2: { fontSize: '28px', fontWeight: '400', lineHeight: '36px' },
      h3: { fontSize: '24px', fontWeight: '400', lineHeight: '32px' },
      h4: { fontSize: '22px', fontWeight: '400', lineHeight: '28px' },
      h5: { fontSize: '16px', fontWeight: '500', lineHeight: '24px' },
      h6: { fontSize: '14px', fontWeight: '500', lineHeight: '20px' },
    },
  },
  primaryColor: 'md3-primary',
  primaryShade: 6,
  defaultRadius: 12,
  cursorType: 'pointer',
  respectReducedMotion: true,
  white: '#FCFCFC',
  black: '#1C1B1B',
  colors: {
    'md3-primary': ['#FFDAD8','#F5C4C1','#EBAEAA','#E19894','#D7827E','#D36C68','#8C4A48','#7E3E3C','#703230','#622624'],
    gray: ['#FCFCFC','#F6F6F6','#F0F0F0','#EBEBEB','#E5E5E5','#CBC4C4','#7B7575','#494545','#1C1B1B','#000000'],
    dark: ['#E8E4E4','#D0CCCC','#B8B4B4','#9C9898','#807C7C','#605C5C','#443F3F','#2A2626','#1F1C1C','#161414'],
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  breakpoints: { xs: '480px', sm: '768px', md: '1024px', lg: '1280px', xl: '1440px' },
  shadows: {
    xs: '0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.30)',
    sm: '0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.30)',
    md: '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.30)',
    lg: '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px 0 rgba(0,0,0,0.30)',
    xl: '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px 0 rgba(0,0,0,0.30)',
  },
  components: {
    Container: {
      defaultProps: { px: 0 },
      styles: { root: { paddingLeft: '16px!important', paddingRight: '16px!important', maxWidth: 840, margin: '0 auto' } },
    },
    Card: {
      defaultProps: { padding: 16, radius: 16, withBorder: false },
      styles: { root: { background: md3Colors.surfaceContainerLow, boxShadow: '0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.30)', border: 'none' } },
    },
    Button: {
      defaultProps: { radius: 9999, color: 'md3-primary' },
      styles: { root: { fontWeight: 500, fontSize: '14px', height: 40, padding: '0 24px', letterSpacing: '0.1px', transition: 'box-shadow 200ms', '&:active': { transform: 'scale(0.96)' } } },
    },
    Table: {
      styles: { table: { borderCollapse: 'separate', borderSpacing: '0 4px' }, td: { padding: '12px 16px', background: md3Colors.surfaceContainerLow, border: 'none' }, th: { padding: '8px 16px', fontWeight: 500, color: md3Colors.onSurfaceVariant, border: 'none' } },
    },
    Modal: {
      defaultProps: { centered: true, padding: 'lg', radius: 24 },
      styles: { header: { marginBottom: 8 } },
    },
    TextInput: {
      defaultProps: { radius: 8 },
      styles: { input: { background: md3Colors.surfaceContainerHigh, border: `1px solid ${md3Colors.outlineVariant}`, color: md3Colors.onSurface, minHeight: 56, padding: '8px 16px', fontSize: 16, '&:focus': { borderColor: md3Colors.primary } }, label: { fontSize: 12, color: md3Colors.onSurfaceVariant, marginBottom: 4 } },
    },
    Select: {
      defaultProps: { radius: 8 },
      styles: { input: { background: md3Colors.surfaceContainerHigh, border: `1px solid ${md3Colors.outlineVariant}`, color: md3Colors.onSurface, minHeight: 56, padding: '8px 16px' }, label: { fontSize: 12, color: md3Colors.onSurfaceVariant, marginBottom: 4 } },
    },
    Badge: {
      defaultProps: { radius: 9999 },
      styles: { root: { fontWeight: 500, fontSize: 11, letterSpacing: '0.5px', padding: '2px 10px', textTransform: 'none', height: 20 } },
    },
    SegmentedControl: {
      defaultProps: { radius: 9999 },
      styles: { root: { background: md3Colors.surfaceContainerHigh, padding: 4 }, indicator: { borderRadius: 9999, background: md3Colors.primaryContainer }, label: { fontSize: 14, fontWeight: 500, padding: '8px 16px' } },
    },
    Tabs: {
      styles: { tab: { borderRadius: 9999, fontSize: 14, fontWeight: 500, padding: '8px 16px', '&[data-active]': { background: md3Colors.secondaryContainer, color: md3Colors.onSecondaryContainer } }, tabsList: { gap: 4 } },
    },
    Paper: {
      defaultProps: { radius: 16 },
      styles: { root: { background: md3Colors.surfaceContainerLow } },
    },
  },
});
