import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapAnimation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';

interface OfflineIndicatorProps {
  /** Whether the device is online. */
  isOnline: boolean;
  /** Optional: label override for the online state */
  onlineLabel?: string;
  /** Optional: label override for the offline state */
  offlineLabel?: string;
  /** Optional: press handler to toggle or inspect network status */
  onPress?: () => void;
}

/**
 * OfflineIndicator — Floating status badge for network connectivity.
 *
 * Shows a subtle animated pill indicating whether maps are available
 * online or in offline cached mode. Designed for fluctuating Indian
 * network conditions.
 */
export function OfflineIndicator({
  isOnline,
  onlineLabel = 'Maps Online',
  offlineLabel = 'Offline Mode',
  onPress,
}: OfflineIndicatorProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Animated transition between states
  const stateProgress = useSharedValue(isOnline ? 1 : 0);
  const dotScale = useSharedValue(1);

  useEffect(() => {
    stateProgress.value = withTiming(isOnline ? 1 : 0, {
      duration: BMapAnimation.timing.normal,
      easing: Easing.out(Easing.cubic),
    });

    // Pulse the dot on state change
    dotScale.value = withSpring(1.4, BMapAnimation.bounceSpring);
    const timeout = setTimeout(() => {
      dotScale.value = withSpring(1, BMapAnimation.pressSpring);
    }, 250);

    return () => clearTimeout(timeout);
  }, [isOnline, stateProgress, dotScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      stateProgress.value,
      [0, 1],
      [
        isDark ? 'rgba(146,64,14,0.25)' : BMapColors.offline.offlineBg,
        isDark ? 'rgba(5,150,105,0.2)' : BMapColors.offline.onlineBg,
      ]
    ),
    borderColor: interpolateColor(
      stateProgress.value,
      [0, 1],
      [
        isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.25)',
        isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.25)',
      ]
    ),
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      stateProgress.value,
      [0, 1],
      [BMapColors.offline.offline, BMapColors.offline.online]
    ),
    transform: [{ scale: dotScale.value }],
  }));

  const content = (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={isOnline ? onlineLabel : offlineLabel}
      accessibilityLiveRegion="polite"
    >
      <Animated.View style={[styles.dot, dotAnimatedStyle]} />
      <Text
        style={[
          styles.label,
          {
            color: isOnline
              ? isDark ? '#6EE7B7' : '#065F46'
              : isDark ? '#FCD34D' : BMapColors.offline.offlineText,
          },
        ]}
        numberOfLines={1}
      >
        {isOnline ? onlineLabel : offlineLabel}
      </Text>

      {!isOnline && (
        <Ionicons
          name="cloud-offline-outline"
          size={13}
          color={isDark ? '#FCD34D' : BMapColors.offline.offlineText}
        />
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="button"
        accessibilityHint="Tap to toggle simulated network connectivity"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: 14,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: moderateScale(isSmallDevice ? 10 : 11),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
