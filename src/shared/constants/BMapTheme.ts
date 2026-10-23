/**
 * B Map Design System — Color Themes
 *
 * Material 3–inspired tokens for light and dark palettes.
 * Import `BMapColors` for the light palette or `BMapColorsDark` for the
 * dark palette. Use `getThemeColors(scheme)` for runtime switching.
 */

/* ── Light Palette ── */
export const BMapColors = {
  /* Surface tones */
  surfaceDim: '#cfdaf2',
  surface: '#f9f9ff',
  surfaceBright: '#f9f9ff',
  surfaceVariant: '#d8e3fb',
  surfaceContainer: '#e7eeff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  surfaceTint: '#0061a7',

  /* On-surface */
  onSurface: '#111c2d',
  onSurfaceVariant: '#3f4753',
  onBackground: '#111c2d',
  background: '#f9f9ff',

  /* Primary */
  primary: '#0061a7',
  primaryContainer: '#0096ff',
  primaryFixed: '#d2e4ff',
  primaryFixedDim: '#a1c9ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#002d52',
  onPrimaryFixed: '#001c37',
  onPrimaryFixedVariant: '#00487f',

  /* Secondary */
  secondary: '#006d3b',
  secondaryContainer: '#66fea3',
  secondaryFixed: '#66fea3',
  secondaryFixedDim: '#44e189',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00743f',
  onSecondaryFixed: '#00210e',
  onSecondaryFixedVariant: '#00522b',

  /* Tertiary */
  tertiary: '#8b5000',
  tertiaryContainer: '#d57e00',
  tertiaryFixed: '#ffdcbe',
  tertiaryFixedDim: '#ffb870',
  onTertiary: '#ffffff',
  onTertiaryFixed: '#2c1600',
  onTertiaryFixedVariant: '#693c00',
  onTertiaryContainer: '#432400',

  /* Error */
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  /* Outline */
  outline: '#707884',
  outlineVariant: '#bfc7d5',

  /* Inverse */
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  inversePrimary: '#a1c9ff',

  /* Semantic traffic colors */
  trafficGreen: '#00C06D',
  trafficOrange: '#FF9800',
  trafficRed: '#F44336',

  /* Overlay */
  scrim: 'rgba(0, 0, 0, 0.45)',
  backdrop: 'rgba(17, 28, 45, 0.35)',
};

/* ── Dark Palette ── */
export const BMapColorsDark = {
  /* Surface tones */
  surfaceDim: '#0f1624',
  surface: '#0f1624',
  surfaceBright: '#2a3348',
  surfaceVariant: '#3f4753',
  surfaceContainer: '#1a2334',
  surfaceContainerLowest: '#0a0f1a',
  surfaceContainerLow: '#141d2e',
  surfaceContainerHigh: '#222d40',
  surfaceContainerHighest: '#2d384b',
  surfaceTint: '#a1c9ff',

  /* On-surface */
  onSurface: '#e0e4ef',
  onSurfaceVariant: '#bfc7d5',
  onBackground: '#e0e4ef',
  background: '#0f1624',

  /* Primary */
  primary: '#a1c9ff',
  primaryContainer: '#0078cc',
  primaryFixed: '#d2e4ff',
  primaryFixedDim: '#a1c9ff',
  onPrimary: '#00325a',
  onPrimaryContainer: '#d2e4ff',
  onPrimaryFixed: '#001c37',
  onPrimaryFixedVariant: '#00487f',

  /* Secondary */
  secondary: '#44e189',
  secondaryContainer: '#00522b',
  secondaryFixed: '#66fea3',
  secondaryFixedDim: '#44e189',
  onSecondary: '#00391c',
  onSecondaryContainer: '#66fea3',
  onSecondaryFixed: '#00210e',
  onSecondaryFixedVariant: '#00522b',

  /* Tertiary */
  tertiary: '#ffb870',
  tertiaryContainer: '#693c00',
  tertiaryFixed: '#ffdcbe',
  tertiaryFixedDim: '#ffb870',
  onTertiary: '#4a2800',
  onTertiaryFixed: '#2c1600',
  onTertiaryFixedVariant: '#693c00',
  onTertiaryContainer: '#ffdcbe',

  /* Error */
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  /* Outline */
  outline: '#8a919c',
  outlineVariant: '#3f4753',

  /* Inverse */
  inverseSurface: '#e0e4ef',
  inverseOnSurface: '#263143',
  inversePrimary: '#0061a7',

  /* Semantic traffic colors */
  trafficGreen: '#00E47F',
  trafficOrange: '#FFB347',
  trafficRed: '#FF6B6B',

  /* Overlay */
  scrim: 'rgba(0, 0, 0, 0.65)',
  backdrop: 'rgba(0, 0, 0, 0.50)',
};

/** Helper – pick the right palette based on a color-scheme string. */
export type BMapPalette = typeof BMapColors;

export function getThemeColors(scheme: 'light' | 'dark'): BMapPalette {
  return scheme === 'dark' ? BMapColorsDark : BMapColors;
}
