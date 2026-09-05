import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Redirect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { checkAuth } from '@/services/auth';
import { BMapColors } from '@/constants/bmap-theme';

export default function EntryScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  const logoScale = useSharedValue(0);
  const dotOpacity1 = useSharedValue(0);
  const dotOpacity2 = useSharedValue(0);
  const dotOpacity3 = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    dotOpacity1.value = withDelay(400, withRepeat(withTiming(1, { duration: 500 }), -1, true));
    dotOpacity2.value = withDelay(600, withRepeat(withTiming(1, { duration: 500 }), -1, true));
    dotOpacity3.value = withDelay(800, withRepeat(withTiming(1, { duration: 500 }), -1, true));
  }, [logoScale, dotOpacity1, dotOpacity2, dotOpacity3]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  useEffect(() => {
    async function determineAuth() {
      try {
        const { isAuthenticated } = await checkAuth();
        setAuthStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
      } catch {
        setAuthStatus('authenticated'); // Default to home if check fails
      }
    }
    determineAuth();
  }, []);

  if (authStatus === 'authenticated') return <Redirect href={'/(tabs)' as any} />;
  if (authStatus === 'unauthenticated') return <Redirect href={'/(auth)/login' as any} />;

  const bg = isDark ? BMapColors.dark.background : BMapColors.light.background;
  const textColor = isDark ? BMapColors.dark.text : BMapColors.light.text;
  const subColor = isDark ? BMapColors.dark.textSecondary : BMapColors.light.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Animated.View style={[styles.logoBadge, logoStyle]}>
        <Text style={styles.logoLetter}>B</Text>
      </Animated.View>

      <Text style={[styles.appName, { color: textColor }]}>B Map</Text>
      <Text style={[styles.tagline, { color: subColor }]}>
        India's Regional Navigation Network
      </Text>

      <View style={styles.dotRow}>
        <Animated.View style={[styles.dot, { backgroundColor: BMapColors.primary }, dot1Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: BMapColors.primary }, dot2Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: BMapColors.primary }, dot3Style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: BMapColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BMapColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    opacity: 0.3,
  },
});
