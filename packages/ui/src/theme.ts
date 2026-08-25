/**
 * Cardly design tokens.
 *
 * Small, semantic palette. No gradients, no dense chrome — warm neutrals in
 * light mode, near-black neutrals in dark mode.
 */

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  scheme: ColorScheme;
  background: string;
  backgroundElevated: string;
  backgroundCard: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  accent: string;
  accentText: string;
  danger: string;
  chipBackground: string;
}

export const lightTheme: Theme = {
  scheme: 'light',
  background: '#F7F7F5',
  backgroundElevated: '#FFFFFF',
  backgroundCard: '#F0F0ED',
  text: '#171717',
  textSecondary: '#8A8A8A',
  textTertiary: '#B0B0AC',
  divider: '#E8E8E5',
  accent: '#171717',
  accentText: '#FFFFFF',
  danger: '#B3261E',
  chipBackground: '#ECECE8',
};

export const darkTheme: Theme = {
  scheme: 'dark',
  background: '#0E0E0C',
  backgroundElevated: '#161614',
  backgroundCard: '#1C1C19',
  text: '#F4F4F1',
  textSecondary: '#9A9A94',
  textTertiary: '#6E6E68',
  divider: '#262622',
  accent: '#F4F4F1',
  accentText: '#0E0E0C',
  danger: '#F2B8B5',
  chipBackground: '#232320',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  body: 16,
  bodyLarge: 18,
  title: 24,
  hero: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular },
  bodyLarge: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold },
  hero: { fontSize: fontSize.hero, fontWeight: fontWeight.bold },
} as const;

export function getTheme(scheme: ColorScheme): Theme {
  return scheme === 'dark' ? darkTheme : lightTheme;
}
