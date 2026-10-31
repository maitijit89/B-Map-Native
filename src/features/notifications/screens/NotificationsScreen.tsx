import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { fluidEntering } from '@/shared/animations';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Camera,
  CreditCard,
  ShieldAlert,
  Satellite,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Badge, Chip, EmptyState } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';
import {
  notificationService,
  NotificationItem,
  NotificationCategory,
} from '@/shared/services';

const CATEGORY_TABS: { key: string; label: string; category?: NotificationCategory }[] = [
  { key: 'all', label: 'All Alerts' },
  { key: 'traffic', label: 'Traffic & Route', category: 'traffic' },
  { key: 'hazard', label: 'Hazards', category: 'hazard' },
  { key: 'camera', label: 'Speed Radar', category: 'camera' },
  { key: 'toll', label: 'FASTag Tolls', category: 'toll' },
  { key: 'safety', label: 'SOS Safety', category: 'safety' },
  { key: 'system', label: 'NavIC System', category: 'system' },
];

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list, unread) => {
      setNotifications(list);
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    haptics.selection();
    await notificationService.markAllAsRead();
  }, []);

  const handleClearAll = useCallback(() => {
    haptics.heavy();
    Alert.alert(
      'Clear All Notifications?',
      'Are you sure you want to dismiss all alerts? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearAll();
          },
        },
      ]
    );
  }, []);

  const handleNotificationPress = useCallback(
    async (item: NotificationItem) => {
      haptics.selection();
      await notificationService.markAsRead(item.id);

      if (item.actionRoute) {
        router.push(item.actionRoute as any);
      }
    },
    []
  );

  const handleDeleteItem = useCallback(
    async (id: string) => {
      haptics.light();
      await notificationService.deleteNotification(id);
    },
    []
  );

  // Trigger simulated live road broadcast alert
  const handleTestSimulateAlert = useCallback(async () => {
    haptics.medium();
    const testAlerts = [
      {
        title: 'FASTag Toll Deducted · ₹85',
        message: 'Badshahpur Toll Gate (Sohna Elevated) · Auto-deducted via Sovereign FASTag.',
        category: 'toll' as const,
        priority: 'medium' as const,
        actionRoute: '/(tabs)/services',
        actionLabel: 'Inspect Telematics',
        metadata: { tollAmount: '₹85', roadName: 'Sohna Elevated Road' },
      },
      {
        title: 'Live Road Accident Reported',
        message: 'Crash reported 1.2 km ahead on Outer Ring Road. Emergency dispatch notified.',
        category: 'hazard' as const,
        priority: 'critical' as const,
        actionRoute: '/hazard-report',
        actionLabel: 'View Hazard Map',
        metadata: { roadName: 'Outer Ring Road' },
      },
      {
        title: 'NavIC Dual-Band Re-Calibrated',
        message: 'L5+S Band position lock verified at 0.5m sub-meter accuracy fix.',
        category: 'system' as const,
        priority: 'low' as const,
        actionRoute: '/digipin-explorer',
        actionLabel: 'View NavIC Satellites',
      },
    ];

    const random = testAlerts[Math.floor(Math.random() * testAlerts.length)];
    await notificationService.pushNotification(random);
  }, []);

  // Filtered list
  const filteredList = notifications.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <Header
        title="Notifications & Alerts"
        subtitle={`${unreadCount} New Alert${unreadCount === 1 ? '' : 's'} · Real-Time Telematics & Safety`}
        showBack={true}
        onBackPress={() => router.back()}
        rightAction={
          <View style={styles.headerRightCluster}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: colors.primaryContainer + '25' }]}
                onPress={handleMarkAllRead}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Mark all as read">
                <CheckCheck size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

            {notifications.length > 0 && (
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={handleClearAll}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear all notifications">
                <Trash2 size={16} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Category Filter Track */}
      <View style={[styles.filterTrackContainer, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTrack}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            const count =
              tab.key === 'all'
                ? notifications.length
                : notifications.filter((n) => n.category === tab.category).length;

            return (
              <Chip
                key={tab.key}
                label={`${tab.label} (${count})`}
                selected={isSelected}
                onPress={() => {
                  haptics.selection();
                  setSelectedFilter(tab.key);
                }}
                size="sm"
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Simulate Live Alert Pill */}
        <Animated.View entering={fluidEntering(0)}>
          <TouchableOpacity
            style={[
              styles.simulateAlertPill,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}
            onPress={handleTestSimulateAlert}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Simulate live road notification broadcast">
            <View style={[styles.sparkleIconRing, { backgroundColor: colors.primaryContainer + '30' }]}>
              <Sparkles size={14} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.simulateTitle, { color: colors.onSurface }]}>
                Simulate Live Road Alert
              </Text>
              <Text style={[styles.simulateSub, { color: colors.onSurfaceVariant }]}>
                Test real-time slide-down banner, haptics & audio cues
              </Text>
            </View>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {filteredList.length === 0 ? (
          <EmptyState
            title="All Caught Up!"
            message="No active notifications in this category. You will receive real-time alerts while driving or navigating."
            actionLabel="Simulate Test Alert"
            onAction={handleTestSimulateAlert}
          />
        ) : (
          filteredList.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={fluidEntering(Math.min(idx * 20, 100))}>
              <Card
                variant={item.read ? 'flat' : 'elevated'}
                padding="md"
                onPress={() => handleNotificationPress(item)}
                accessibilityLabel={`Notification: ${item.title}`}
                style={[
                  styles.notifCard,
                  !item.read && {
                    borderColor: colors.primary,
                    borderWidth: 1,
                  },
                ]}>
                <View style={styles.cardTopRow}>
                  {/* Category icon */}
                  <View
                    style={[
                      styles.categoryCircle,
                      { backgroundColor: getCategoryBackgroundColor(item.category) },
                    ]}>
                    {getCategoryIcon(item.category)}
                  </View>

                  {/* Title & Metadata */}
                  <View style={styles.cardHeaderStack}>
                    <View style={styles.cardTitleLine}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: colors.onSurface },
                          !item.read && { fontWeight: '800' },
                        ]}
                        numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>

                    <Text style={[styles.cardTime, { color: colors.onSurfaceVariant }]}>
                      {item.timestamp}
                    </Text>
                  </View>

                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteItemBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Delete notification">
                    <Trash2 size={14} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                {/* Message Body */}
                <Text style={[styles.cardMessage, { color: colors.onSurfaceVariant }]}>
                  {item.message}
                </Text>

                {/* Metadata tags */}
                {item.metadata && (
                  <View style={styles.metadataTagsRow}>
                    {item.metadata.tollAmount && (
                      <Badge label={item.metadata.tollAmount} variant="success" size="sm" />
                    )}
                    {item.metadata.speedLimit && (
                      <Badge label={item.metadata.speedLimit} variant="error" size="sm" />
                    )}
                    {item.metadata.roadName && (
                      <Badge label={item.metadata.roadName} variant="neutral" size="sm" />
                    )}
                    {item.metadata.digiPin && (
                      <Badge label={item.metadata.digiPin} variant="primary" size="sm" />
                    )}
                  </View>
                )}

                {/* Action button if route available */}
                {item.actionRoute && (
                  <TouchableOpacity
                    style={[styles.actionBtnRow, { backgroundColor: colors.surfaceContainerLow }]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                      {item.actionLabel || 'View Details'}
                    </Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoryBackgroundColor(category: NotificationCategory): string {
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
      return <AlertTriangle size={16} color="#fff" />;
    case 'camera':
      return <Camera size={16} color="#fff" />;
    case 'toll':
      return <CreditCard size={16} color="#fff" />;
    case 'safety':
      return <ShieldAlert size={16} color="#fff" />;
    case 'traffic':
      return <Bell size={16} color="#fff" />;
    case 'system':
      return <Satellite size={16} color="#fff" />;
    default:
      return <Bell size={16} color="#fff" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTrackContainer: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterTrack: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  simulateAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  sparkleIconRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  simulateSub: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  notifCard: {
    gap: 8,
    borderRadius: Radius.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  categoryCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderStack: {
    flex: 1,
  },
  cardTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTime: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  deleteItemBtn: {
    padding: 4,
  },
  cardMessage: {
    ...Typography.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  metadataTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  actionBtnText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
});
