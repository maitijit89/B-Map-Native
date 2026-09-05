/**
 * B Map - Flagship Indian Regional Navigation & Spatial Mobility Theme
 * Material 3 & High-Contrast Daylight Palette Tokens
 */

export const BMapColors = {
  // Brand & Accents
  primary: '#E65100', // Saffron Amber
  primaryDark: '#BF360C',
  primaryLight: '#FF8A50',
  navBlue: '#2563EB', // Digital Navigation Cobalt Blue
  navBlueLight: '#EFF6FF',
  navBlueDark: '#1D4ED8',
  secondary: '#059669', // GLOSA Emerald Green
  secondaryLight: '#10B981',
  tertiary: '#0F172A', // Deep Slate Indigo
  
  // Feature Accents (Modern Vibrant & High Contrast)
  fastagPurple: '#7C3AED',
  fastagPurpleLight: '#F5F3FF',
  evCyan: '#0284C7',
  evCyanLight: '#F0F9FF',
  emergencyRed: '#EF4444',
  emergencyRedLight: '#FEF2F2',
  digipinOrange: '#EA580C',
  glosaGreen: '#10B981',
  glosaGreenBg: '#ECFDF5',
  warningAmber: '#F59E0B',
  warningAmberBg: '#FFFBEB',
  rtaGold: '#D97706',
  weatherBlue: '#0284C7',

  // Indian Transport Mode Accents
  transport: {
    twoWheeler: '#7C3AED',    // Purple
    twoWheelerBg: '#F5F3FF',
    auto: '#059669',           // Emerald Green (auto-rickshaw)
    autoBg: '#ECFDF5',
    cab: '#D97706',            // Amber Gold (cab/taxi)
    cabBg: '#FFFBEB',
    metroBus: '#0284C7',       // Sky Blue (metro/transit)
    metroBusBg: '#F0F9FF',
    walking: '#64748B',        // Slate (walking)
    walkingBg: '#F1F5F9',
  },

  // Offline Status
  offline: {
    online: '#10B981',
    onlineBg: '#ECFDF5',
    offline: '#F59E0B',
    offlineBg: '#FFFBEB',
    offlineText: '#92400E',
  },

  // Light / Daylight Minimalist Mode
  light: {
    background: '#F8FAFD',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    borderFocus: '#2563EB',
    hudBackground: '#0F172A',
    hudText: '#FFFFFF',
    ripple: 'rgba(37, 99, 235, 0.08)',
    shadow: '#000000',
    // Solid surface & tab bar
    glassBackground: '#FFFFFF',
    glassBorder: '#E2E8F0',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },

  // Dark / OLED Night Minimalist Mode
  dark: {
    background: '#090D16',
    surface: '#111827',
    surfaceVariant: '#1F2937',
    card: '#161F30',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#273449',
    borderSubtle: '#1E293B',
    borderFocus: '#60A5FA',
    hudBackground: '#090D16',
    hudText: '#F8FAFC',
    ripple: 'rgba(96, 165, 250, 0.12)',
    shadow: '#000000',
    // Solid surface & tab bar
    glassBackground: '#111827',
    glassBorder: '#273449',
    tabBarBackground: '#111827',
    tabBarBorder: '#273449',
  },
} as const;

export const BMapSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BMapRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const BMapElevation = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
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
  headlineLarge: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  headlineMedium: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  titleLarge: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  titleMedium: { fontSize: 16, fontWeight: '600' as const, letterSpacing: -0.1 },
  titleSmall: { fontSize: 14, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
  labelSmall: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.4 },
  hudNumber: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
} as const;

/**
 * Reanimated animation presets — consistent motion language across the app.
 */
export const BMapAnimation = {
  /** Snappy spring for button press/release */
  pressSpring: {
    damping: 15,
    stiffness: 300,
    mass: 0.6,
  },
  /** Smooth spring for sheet/card transitions */
  sheetSpring: {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
  },
  /** Bouncy spring for icon/element emphasis */
  bounceSpring: {
    damping: 8,
    stiffness: 250,
    mass: 0.5,
  },
  /** Gentle spring for subtle UI shifts */
  gentleSpring: {
    damping: 25,
    stiffness: 150,
    mass: 1.0,
  },
  /** Standard fade/slide timing durations */
  timing: {
    fast: 200,
    normal: 350,
    slow: 500,
    entrance: 450,
  },
  /** Stagger intervals for list item animations */
  stagger: {
    fast: 40,
    normal: 75,
    slow: 120,
  },
  /** Bottom sheet drag spring — tuned for natural feel */
  bottomSheetSpring: {
    damping: 50,
    stiffness: 500,
    mass: 0.8,
  },
} as const;

/** Glassmorphism blur constants */
export const BMapBlur = {
  light: 20,
  medium: 40,
  heavy: 60,
} as const;

