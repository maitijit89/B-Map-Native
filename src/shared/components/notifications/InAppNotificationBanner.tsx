import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Bell,
  AlertTriangle,
  Camera,
  CreditCard,
  ShieldAlert,
  Satellite,
  X,
} from 'lucide-react-native';
import { haptics } from '@/shared/utils/haptics';
import {
  notificationService,
  NotificationItem,
  NotificationCategory,
} from '@/shared/services';

export function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const translateY = useSharedValue(-150);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideBanner = () => {
    translateY.value = withTiming(-150, { duration: 250 }, () => {
      runOnJS(setCurrentNotification)(null);
    });
  };

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToBanners((notification) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setCurrentNotification(notification);
      haptics.warning();
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 140,
      });

      // Auto-dismiss after 4.5 seconds
      timerRef.current = setTimeout(() => {
        translateY.value = withTiming(-150, { duration: 250 }, () => {
          runOnJS(setCurrentNotification)(null);
        });
      }, 4500);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentNotification) return null;

  const handlePress = () => {
    haptics.selection();
    hideBanner();
    notificationService.markAsRead(currentNotification.id);
    if (currentNotification.actionRoute) {
      router.push(currentNotification.actionRoute as any);
    } else {
      router.push('/notifications');
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        animatedStyle,
      ]}
      pointerEvents="box-none">
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Notification alert: ${currentNotification.title}`}>
        {/* Category Icon */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: getCategoryColor(currentNotification.category) },
          ]}>
          {getCategoryIcon(currentNotification.category)}
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {currentNotification.title}
            </Text>
            <Text style={styles.timeTag}>Now</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {currentNotification.message}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={(e) => {
            e.stopPropagation();
            hideBanner();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert">
          <X size={14} color="#A0A8B4" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getCategoryColor(category: NotificationCategory): string {
  switch (category) {
    case 'hazard':
      return '#FF9800';
    case 'camera':
      return '#F44336';
    case 'toll':
      return '#00C06D';
    case 'safety':
      return '#E91E63';
    case 'traffic':
      return '#0096FF';
    case 'system':
      return '#9C27B0';
    default:
      return '#0096FF';
  }
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case 'hazard':
      return <AlertTriangle size={15} color="#fff" />;
    case 'camera':
      return <Camera size={15} color="#fff" />;
    case 'toll':
      return <CreditCard size={15} color="#fff" />;
    case 'safety':
      return <ShieldAlert size={15} color="#fff" />;
    case 'traffic':
      return <Bell size={15} color="#fff" />;
    case 'system':
      return <Satellite size={15} color="#fff" />;
    default:
      return <Bell size={15} color="#fff" />;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1A2E',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  timeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
  },
  message: {
    fontSize: 11,
    color: '#C0C8D4',
    marginTop: 2,
    lineHeight: 15,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
