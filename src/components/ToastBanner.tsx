import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BMapAnimation } from '@/constants/bmap-theme';

interface ToastBannerProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  countdownSeconds?: number;
  onDismiss?: () => void;
}

export function ToastBanner({
  visible,
  message,
  type = 'warning',
  countdownSeconds,
  onDismiss,
}: ToastBannerProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, BMapAnimation.sheetSpring);
      opacity.value = withTiming(1, { duration: BMapAnimation.timing.fast });

      // Countdown progress bar
      if (countdownSeconds && countdownSeconds > 0) {
        progress.value = 1;
        progress.value = withTiming(0, {
          duration: countdownSeconds * 1000,
          easing: Easing.linear,
        });

        // Auto-dismiss after countdown
        const timer = setTimeout(() => {
          translateY.value = withSpring(-100, BMapAnimation.sheetSpring);
          opacity.value = withTiming(0, { duration: BMapAnimation.timing.fast });
          if (onDismiss) {
            setTimeout(onDismiss, BMapAnimation.timing.fast);
          }
        }, countdownSeconds * 1000);

        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withSpring(-100, BMapAnimation.sheetSpring);
      opacity.value = withTiming(0, { duration: BMapAnimation.timing.fast });
    }
  }, [visible, countdownSeconds, onDismiss, opacity, progress, translateY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  if (!visible) return null;

  const getColors = () => {
    switch (type) {
      case 'error':
        return { bg: '#FFEBEE', border: '#EF5350', text: '#C62828', icon: 'alert-circle' as const, progress: '#EF5350' };
      case 'success':
        return { bg: '#E8F5E9', border: '#66BB6A', text: '#2E7D32', icon: 'checkmark-circle' as const, progress: '#66BB6A' };
      case 'info':
        return { bg: '#E3F2FD', border: '#42A5F5', text: '#1565C0', icon: 'information-circle' as const, progress: '#42A5F5' };
      default:
        return { bg: '#FFF3E0', border: '#FFA726', text: '#E65100', icon: 'time' as const, progress: '#FFA726' };
    }
  };

  const theme = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.bg, borderColor: theme.border },
        containerAnimatedStyle,
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons name={theme.icon} size={22} color={theme.text} />
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Ionicons name="close" size={16} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Animated countdown progress bar */}
      {countdownSeconds && countdownSeconds > 0 && (
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: theme.progress },
              progressBarStyle,
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  dismissBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
