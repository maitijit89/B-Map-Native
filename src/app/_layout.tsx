import '../../global.css';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme, ThemeProvider } from '@/shared/hooks';
import { ErrorBoundary as GlobalErrorBoundary } from '@/shared/components';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GlobalErrorBoundary>
      <RootLayoutNav />
    </GlobalErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 250,
            gestureEnabled: true,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="ai-copilot" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="tsp-optimizer" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="hazard-report" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="indoor-parking" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="digipin-explorer" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'fade_from_bottom', headerShown: false }} />
          <Stack.Screen name="sos-distress" options={{ presentation: 'fullScreenModal', animation: 'fade', headerShown: false }} />
          <Stack.Screen name="auth" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="transit-planner" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="ev-station" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="vehicle-fleet" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
          <Stack.Screen name="compass-hud" options={{ presentation: 'fullScreenModal', animation: 'fade', headerShown: false }} />
        </Stack>
      </NavThemeProvider>
    </ThemeProvider>
  );
}

