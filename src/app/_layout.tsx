import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';
import { BMapColors } from '@/constants/bmap-theme';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Enable native screen view recycling without freezing React fibers
enableScreens(true);

// Keep the splash screen visible while fonts and static assets are cached
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const customDarkTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      primary: BMapColors.primary,
      background: BMapColors.dark.background,
      card: BMapColors.dark.surface,
      text: BMapColors.dark.text,
      border: BMapColors.dark.border,
      notification: BMapColors.primary,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: BMapColors.primary,
      background: BMapColors.light.background,
      card: BMapColors.light.surface,
      text: BMapColors.light.text,
      border: BMapColors.light.border,
      notification: BMapColors.primary,
    },
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider value={isDark ? customDarkTheme : customLightTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                  backgroundColor: isDark ? BMapColors.dark.background : BMapColors.light.background,
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="navigate" options={{ headerShown: false }} />
              <Stack.Screen name="features" options={{ headerShown: false }} />
              <Stack.Screen name="fleet" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
