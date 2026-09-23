/**
 * Cardly design tokens.
 *
 * Neobrutalist surfaces use ink outlines, hard offset shadows, compact type,
 * and a deliberately small violet / yellow / lime palette. Both themes carry
 * the same hierarchy instead of relying on a naïve color inversion.
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
  focus: string;
  surface: string;
  surfaceAccent: string;
  outline: string;
  outlineStrong: string;
  hardShadow: string;
  purple: string;
  purpleText: string;
  yellow: string;
  yellowText: string;
  lime: string;
  limeText: string;
  dangerSurface: string;
  dangerText: string;
  disabledSurface: string;
  disabledText: string;
  /** Soft ambient shadow color (rgba). */
  ambientShadow: string;
  /** Overlay for pressed states. */
  pressedOverlay: string;
  /** Success accent for checkmarks, valid states. */
  success: string;
  successText: string;
}

export const lightTheme: Theme = {
  scheme: 'light',
  background: '#FFFFFF',
  backgroundElevated: '#FFFFFF',
  backgroundCard: '#A987F5',
  text: '#1B1612',
  textSecondary: '#453D34',
  textTertiary: '#62594F',
  divider: '#EBEBEB',
  accent: '#A987F5',
  accentText: '#1B1612',
  danger: '#C13D2D',
  chipBackground: '#FFE36F',
  focus: '#1B1612',
  surface: '#FFFFFF',
  surfaceAccent: '#FFE36F',
  outline: '#1B1612',
  outlineStrong: '#1B1612',
  hardShadow: '#1B1612',
  purple: '#A987F5',
  purpleText: '#1B1612',
  yellow: '#FFE36F',
  yellowText: '#1B1612',
  lime: '#C7F36F',
  limeText: '#1B1612',
  dangerSurface: '#FF8B78',
  dangerText: '#1B1612',
  disabledSurface: '#E8DECC',
  disabledText: '#756B60',
  ambientShadow: 'rgba(27,22,18,0.10)',
  pressedOverlay: 'rgba(27,22,18,0.06)',
  success: '#4CAF50',
  successText: '#1B1612',
};

export const darkTheme: Theme = {
  scheme: 'dark',
  background: '#17130F',
  backgroundElevated: '#262019',
  backgroundCard: '#B69AFF',
  text: '#FFF6E7',
  textSecondary: '#D6C8B4',
  textTertiary: '#A89A88',
  divider: '#4A4138',
  accent: '#B69AFF',
  accentText: '#17130F',
  danger: '#FF9A87',
  chipBackground: '#FFE36F',
  focus: '#FFE36F',
  surface: '#262019',
  surfaceAccent: '#332C24',
  outline: '#E8DAC6',
  outlineStrong: '#FFF1D9',
  hardShadow: '#080604',
  purple: '#B69AFF',
  purpleText: '#17130F',
  yellow: '#FFE36F',
  yellowText: '#17130F',
  lime: '#C7F36F',
  limeText: '#17130F',
  dangerSurface: '#FF9A87',
  dangerText: '#17130F',
  disabledSurface: '#433B32',
  disabledText: '#8A7E72',
  ambientShadow: 'rgba(0,0,0,0.30)',
  pressedOverlay: 'rgba(255,246,231,0.06)',
  success: '#81C784',
  successText: '#17130F',
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
  sm: 2,
  md: 4,
  lg: 6,
  card: 18,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  standard: 2,
  heavy: 3,
} as const;

export const hardShadow = {
  x: 4,
  y: 4,
  compact: 3,
} as const;

export const fontSize = {
  caption: 12,
  label: 11,
  body: 16,
  bodyLarge: 17,
  title: 23,
  hero: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Loaded in the app via `@expo-google-fonts/geist`. */
export const fontRegular = 'Geist_400Regular';
export const fontMedium = 'Geist_500Medium';
export const displayFont = 'Geist_600SemiBold';
export const displayFontBold = 'Geist_700Bold';

/** Tabular numerals for card numbers and sensitive values. */
export const tabularNums = { fontVariant: ['tabular-nums'] } as const;

export const typography = {
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.medium, fontFamily: fontMedium },
  label: { fontSize: fontSize.label, fontWeight: fontWeight.bold, fontFamily: displayFontBold },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular, fontFamily: fontRegular },
  bodyLarge: { fontSize: fontSize.bodyLarge, fontWeight: fontWeight.medium, fontFamily: fontMedium },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.semibold, fontFamily: displayFont },
  hero: { fontSize: fontSize.hero, fontWeight: fontWeight.bold, fontFamily: displayFontBold },
} as const;

/* ─── Elevation ──────────────────────────────────────────────────────── */

export const elevation = {
  /** Cards in a list, resting surfaces. */
  low: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.12,
    elevation: 2,
  },
  /** Modals, floating action buttons. */
  medium: {
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    shadowOpacity: 0.16,
    elevation: 6,
  },
  /** Tooltips, drop-downs. */
  high: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    shadowOpacity: 0.20,
    elevation: 12,
  },
} as const;

/* ─── Animation ──────────────────────────────────────────────────────── */

export const animation = {
  /** Quick micro-interactions (button press, icon swap). */
  fast: { duration: 120 },
  /** Standard transitions (screen enter, card expand). */
  normal: { duration: 240 },
  /** Deliberate transitions (modal appear, layout shift). */
  slow: { duration: 360 },
  /** Spring config for organic movement. */
  spring: { damping: 18, stiffness: 180, mass: 1 },
  /** Snappy spring for press feedback. */
  springSnappy: { damping: 22, stiffness: 300, mass: 0.8 },
} as const;

/* ─── Card Palette ───────────────────────────────────────────────────── */

export interface CardPalette {
  background: string;
  gradientStops: [string, string];
  accent: string;
  accentSecondary: string;
  text: string;
  chip: string;
}

/** Violet-gold — the default Cardly identity. */
export const PALETTE_VIOLET_GOLD: CardPalette = {
  background: '#AA87F6',
  gradientStops: ['#B894FF', '#9A72E6'],
  accent: '#FFE36F',
  accentSecondary: '#C7F36F',
  text: '#1B1612',
  chip: '#FFE36F',
};

/** Violet-lime swap. */
export const PALETTE_VIOLET_LIME: CardPalette = {
  background: '#AA87F6',
  gradientStops: ['#B08AFF', '#9B77E8'],
  accent: '#C7F36F',
  accentSecondary: '#FFE36F',
  text: '#1B1612',
  chip: '#FFE36F',
};

/** Deep violet — richer purple base. */
export const PALETTE_DEEP_VIOLET: CardPalette = {
  background: '#8E6BE5',
  gradientStops: ['#9E7BF5', '#7E5BD5'],
  accent: '#FFE36F',
  accentSecondary: '#B9E96D',
  text: '#1B1612',
  chip: '#FFE36F',
};

/** Midnight teal. */
export const PALETTE_MIDNIGHT_TEAL: CardPalette = {
  background: '#1B4D5A',
  gradientStops: ['#22606F', '#164250'],
  accent: '#FFE36F',
  accentSecondary: '#7EECD4',
  text: '#F0F7F4',
  chip: '#FFE36F',
};

/** Coral sunset. */
export const PALETTE_CORAL: CardPalette = {
  background: '#E8735A',
  gradientStops: ['#F0856E', '#D8634A'],
  accent: '#FFE36F',
  accentSecondary: '#FFDBC2',
  text: '#1B1612',
  chip: '#FFE36F',
};

/** Deep navy. */
export const PALETTE_NAVY: CardPalette = {
  background: '#2A3655',
  gradientStops: ['#334268', '#202C45'],
  accent: '#FFE36F',
  accentSecondary: '#8EAAFF',
  text: '#E8EDF5',
  chip: '#FFE36F',
};

/** Emerald. */
export const PALETTE_EMERALD: CardPalette = {
  background: '#2E7D5B',
  gradientStops: ['#3A9570', '#246B4C'],
  accent: '#FFE36F',
  accentSecondary: '#B8F0D5',
  text: '#F0F7F4',
  chip: '#FFE36F',
};

/** Warm rose. */
export const PALETTE_ROSE: CardPalette = {
  background: '#B85C78',
  gradientStops: ['#CC6D8A', '#A84D68'],
  accent: '#FFE36F',
  accentSecondary: '#FFD1E0',
  text: '#FFF0F5',
  chip: '#FFE36F',
};

/** Charcoal — premium dark card. */
export const PALETTE_CHARCOAL: CardPalette = {
  background: '#3A3530',
  gradientStops: ['#484340', '#2E2A26'],
  accent: '#FFE36F',
  accentSecondary: '#C7F36F',
  text: '#FFF6E7',
  chip: '#FFE36F',
};

/** Ocean blue. */
export const PALETTE_OCEAN: CardPalette = {
  background: '#3168A8',
  gradientStops: ['#3E78BC', '#285A95'],
  accent: '#FFE36F',
  accentSecondary: '#A8D8FF',
  text: '#F0F5FA',
  chip: '#FFE36F',
};

/** Burnt sienna. */
export const PALETTE_SIENNA: CardPalette = {
  background: '#A0593A',
  gradientStops: ['#B5694A', '#8E4C30'],
  accent: '#FFE36F',
  accentSecondary: '#FFD0A8',
  text: '#FFF6E7',
  chip: '#FFE36F',
};

/** Obsidian Onyx — luxury jet black card. */
export const PALETTE_OBSIDIAN: CardPalette = {
  background: '#121214',
  gradientStops: ['#222226', '#0E0E10'],
  accent: '#F5D061',
  accentSecondary: '#E2E8F0',
  text: '#FFFFFF',
  chip: '#F5D061',
};

/** Royal Emerald — deep forest green. */
export const PALETTE_ROYAL_EMERALD: CardPalette = {
  background: '#064E3B',
  gradientStops: ['#0A6850', '#04382A'],
  accent: '#FDE047',
  accentSecondary: '#6EE7B7',
  text: '#F0FDF4',
  chip: '#FDE047',
};

/** Royal Sapphire — deep oceanic navy. */
export const PALETTE_ROYAL_SAPPHIRE: CardPalette = {
  background: '#0A1931',
  gradientStops: ['#173B75', '#081426'],
  accent: '#93C5FD',
  accentSecondary: '#FDE047',
  text: '#FFFFFF',
  chip: '#E2E8F0',
};

/** Crimson Ruby — rich wine burgundy. */
export const PALETTE_CRIMSON: CardPalette = {
  background: '#7F1D1D',
  gradientStops: ['#9B2222', '#631414'],
  accent: '#FDE047',
  accentSecondary: '#FCA5A5',
  text: '#FEF2F2',
  chip: '#FDE047',
};

/** Solar Amber — warm terracotta sunset. */
export const PALETTE_SOLAR_AMBER: CardPalette = {
  background: '#7C2D12',
  gradientStops: ['#C2410C', '#68220A'],
  accent: '#FEF08A',
  accentSecondary: '#FDBA74',
  text: '#FFF7ED',
  chip: '#FEF08A',
};

/** Amethyst Velvet — imperial purple. */
export const PALETTE_AMETHYST: CardPalette = {
  background: '#4A044E',
  gradientStops: ['#701A75', '#330237'],
  accent: '#F5D0FE',
  accentSecondary: '#FDE047',
  text: '#FDF4FF',
  chip: '#F5D0FE',
};

/** Electric Cobalt — modern vivid blue. */
export const PALETTE_ELECTRIC_COBALT: CardPalette = {
  background: '#1E40AF',
  gradientStops: ['#2563EB', '#172554'],
  accent: '#FEF08A',
  accentSecondary: '#93C5FD',
  text: '#FFFFFF',
  chip: '#FEF08A',
};

/** Graphite Titanium — cool brushed metal. */
export const PALETTE_TITANIUM: CardPalette = {
  background: '#334155',
  gradientStops: ['#475569', '#1E293B'],
  accent: '#FDE047',
  accentSecondary: '#CBD5E1',
  text: '#F8FAFC',
  chip: '#E2E8F0',
};

/** Peacock Teal — deep marine cyan. */
export const PALETTE_PEACOCK_TEAL: CardPalette = {
  background: '#042F2E',
  gradientStops: ['#0D5E58', '#021F1E'],
  accent: '#5EEAD4',
  accentSecondary: '#FDE047',
  text: '#F0FDFA',
  chip: '#CCFBF1',
};

/** Copper Bronze — warm metallic amber. */
export const PALETTE_COPPER_GOLD: CardPalette = {
  background: '#78350F',
  gradientStops: ['#A14812', '#542308'],
  accent: '#FEF08A',
  accentSecondary: '#FCD34D',
  text: '#FFFBEB',
  chip: '#FEF08A',
};

/** Plum Rose — luxurious deep berry. */
export const PALETTE_PLUM_ROSE: CardPalette = {
  background: '#831843',
  gradientStops: ['#9D174D', '#540D2A'],
  accent: '#FCE7F3',
  accentSecondary: '#FDE047',
  text: '#FDF2F8',
  chip: '#FCE7F3',
};

/** Forest Sage — deep pine green. */
export const PALETTE_FOREST_SAGE: CardPalette = {
  background: '#14532D',
  gradientStops: ['#166534', '#0D381E'],
  accent: '#86EFAC',
  accentSecondary: '#FEF08A',
  text: '#F0FDF4',
  chip: '#BBF7D0',
};

/** Ocean Cyan — deep azure waters. */
export const PALETTE_CYAN_DEPTHS: CardPalette = {
  background: '#0369A1',
  gradientStops: ['#0284C7', '#064468'],
  accent: '#7DD3FC',
  accentSecondary: '#FEF08A',
  text: '#F0F9FF',
  chip: '#BAE6FD',
};

/** Matte Carbon — stealth dark gray. */
export const PALETTE_MATTE_CARBON: CardPalette = {
  background: '#1C1917',
  gradientStops: ['#292524', '#141211'],
  accent: '#FDE047',
  accentSecondary: '#D6D3D1',
  text: '#FAFAF9',
  chip: '#FDE047',
};

/** Twilight Indigo — celestial deep violet. */
export const PALETTE_INDIGO_NIGHT: CardPalette = {
  background: '#312E81',
  gradientStops: ['#4338CA', '#1E1B4B'],
  accent: '#C7D2FE',
  accentSecondary: '#FDE047',
  text: '#EEF2FF',
  chip: '#C7D2FE',
};

/** Ordered palette array for hash-based distinct assignment. */
export const CARD_PALETTES: CardPalette[] = [
  PALETTE_OBSIDIAN,
  PALETTE_ROYAL_EMERALD,
  PALETTE_ROYAL_SAPPHIRE,
  PALETTE_CRIMSON,
  PALETTE_SOLAR_AMBER,
  PALETTE_AMETHYST,
  PALETTE_ELECTRIC_COBALT,
  PALETTE_TITANIUM,
  PALETTE_PEACOCK_TEAL,
  PALETTE_COPPER_GOLD,
  PALETTE_PLUM_ROSE,
  PALETTE_FOREST_SAGE,
  PALETTE_CYAN_DEPTHS,
  PALETTE_MATTE_CARBON,
  PALETTE_INDIGO_NIGHT,
  PALETTE_MIDNIGHT_TEAL,
];

export function getTheme(scheme: ColorScheme): Theme {
  return scheme === 'dark' ? darkTheme : lightTheme;
}
