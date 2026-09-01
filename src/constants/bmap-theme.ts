/**
 * B Map - Flagship Indian Regional Navigation & Spatial Mobility Theme
 * Material 3 & High-Contrast Daylight Palette Tokens
 */

export const BMapColors = {
  // Brand & Accents
  primary: '#E65100', // Saffron Amber
  primaryDark: '#BF360C',
  primaryLight: '#FF8A50',
  secondary: '#00875A', // GLOSA Emerald Green
  secondaryLight: '#00C853',
  tertiary: '#0B192C', // Deep Indigo Navy
  
  // Feature Accents
  fastagPurple: '#673AB7',
  fastagPurpleLight: '#EDE7F6',
  evCyan: '#0097A7',
  evCyanLight: '#E0F7FA',
  emergencyRed: '#D32F2F',
  emergencyRedLight: '#FFEBEE',
  digipinOrange: '#EF6C00',
  glosaGreen: '#2E7D32',
  glosaGreenBg: '#E8F5E9',
  warningAmber: '#F57C00',
  warningAmberBg: '#FFF3E0',

  // Light / Daylight High-Contrast Mode
  light: {
    background: '#F8F9FD',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F4F9',
    card: '#FFFFFF',
    text: '#191C1E',
    textSecondary: '#44474E',
    textMuted: '#74777F',
    border: '#E0E3E8',
    borderFocus: '#E65100',
    hudBackground: '#1B2430',
    hudText: '#FFFFFF',
    ripple: 'rgba(230, 81, 0, 0.12)',
    shadow: '#000000',
  },

  // Dark / Night Mode
  dark: {
    background: '#0B1118',
    surface: '#121B24',
    surfaceVariant: '#1B2633',
    card: '#16222F',
    text: '#E3E8EC',
    textSecondary: '#9AA7B4',
    textMuted: '#687787',
    border: '#243242',
    borderFocus: '#FF8A50',
    hudBackground: '#0B1118',
    hudText: '#FFFFFF',
    ripple: 'rgba(255, 138, 80, 0.15)',
    shadow: '#000000',
  },
} as const;

export const BMapElevation = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  hud: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

export const BMapTypography = {
  headlineLarge: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  headlineMedium: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  titleLarge: { fontSize: 18, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.2 },
  labelMedium: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.3 },
  labelSmall: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  hudNumber: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
} as const;
