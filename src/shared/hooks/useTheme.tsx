import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import {
  BMapColors,
  getThemeColors,
  type BMapPalette,
} from '../constants/BMapTheme';

interface ThemeContextValue {
  /** Current resolved palette (light or dark). */
  colors: BMapPalette;
  /** 'light' | 'dark' */
  scheme: 'light' | 'dark';
  /** True when the device/user prefers dark mode. */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: BMapColors,
  scheme: 'light',
  isDark: false,
});

/**
 * Provides theme-aware colors to the component tree.
 *
 * Wraps around the system color-scheme and exposes a `colors` object
 * that automatically switches between `BMapColors` and `BMapColorsDark`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const scheme: 'light' | 'dark' = systemScheme === 'dark' ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: getThemeColors(scheme),
      scheme,
      isDark: scheme === 'dark',
    }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the current theme colors, scheme, and isDark flag.
 *
 * ```tsx
 * const { colors, isDark } = useTheme();
 * <View style={{ backgroundColor: colors.surface }} />
 * ```
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Convenience hook — returns only the palette.
 */
export function useThemeColors(): BMapPalette {
  return useContext(ThemeContext).colors;
}
