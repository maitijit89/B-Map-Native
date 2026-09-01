import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors } from '@/constants/bmap-theme';

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
  const [remaining, setRemaining] = useState(countdownSeconds || 0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (countdownSeconds && countdownSeconds > 0) {
        setRemaining(countdownSeconds);
        const timer = setInterval(() => {
          setRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              if (onDismiss) onDismiss();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, countdownSeconds]);

  if (!visible) return null;

  const getColors = () => {
    switch (type) {
      case 'error':
        return { bg: '#FFEBEE', border: '#EF5350', text: '#C62828', icon: 'alert-circle' as const };
      case 'success':
        return { bg: '#E8F5E9', border: '#66BB6A', text: '#2E7D32', icon: 'checkmark-circle' as const };
      case 'info':
        return { bg: '#E3F2FD', border: '#42A5F5', text: '#1565C0', icon: 'information-circle' as const };
      default:
        return { bg: '#FFF3E0', border: '#FFA726', text: '#E65100', icon: 'time' as const };
    }
  };

  const theme = getColors();

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border, opacity: fadeAnim }]}>
      <Ionicons name={theme.icon} size={22} color={theme.text} />
      <View style={styles.textContainer}>
        <Text style={[styles.message, { color: theme.text }]}>
          {message}
          {remaining > 0 && ` (${remaining}s remaining)`}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
