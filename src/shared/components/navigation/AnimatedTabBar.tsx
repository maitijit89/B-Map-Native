import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import type { Tabs } from 'expo-router';
import { useTheme, useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';

export type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

export const AnimatedTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = useThemeColors();

  // Bottom padding: ensure proper distance from bottom edge across devices
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  const handleTabPress = (route: typeof state.routes[0], isFocused: boolean) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable on web / unsupported env
      }
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const TabItem = ({
    route,
    index,
  }: {
    route: typeof state.routes[0];
    index: number;
  }) => {
    const isFocused = state.index === index;
    const { options } = descriptors[route.key];
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
    const pillAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: isFocused ? 1.05 : 0.95,
          useNativeDriver: true,
          friction: 8,
          tension: 70,
        }),
        Animated.spring(pillAnim, {
          toValue: isFocused ? 1 : 0,
          useNativeDriver: true,
          friction: 9,
          tension: 80,
        }),
      ]).start();
    }, [isFocused, scaleAnim, pillAnim]);

    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const iconColor = isFocused ? colors.primary : colors.onSurfaceVariant;

    const renderIcon = () => {
      if (options.tabBarIcon) {
        return options.tabBarIcon({
          focused: isFocused,
          color: iconColor,
          size: 22,
        });
      }
      return null;
    };

    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={
          options.tabBarAccessibilityLabel || (typeof label === 'string' ? label : route.name)
        }
        testID={options.tabBarButtonTestID}
        onPress={() => handleTabPress(route, isFocused)}
        style={styles.tabButton}>
        <Animated.View
          style={[
            styles.tabContent,
            { transform: [{ scale: scaleAnim }] },
          ]}>
          {/* Active indicator pill behind icon */}
          <Animated.View
            style={[
              styles.activePill,
              {
                backgroundColor: isDark
                  ? 'rgba(0, 150, 255, 0.18)'
                  : 'rgba(0, 97, 167, 0.10)',
                opacity: pillAnim,
                transform: [{ scaleX: pillAnim }],
              },
            ]}
          />

          <View style={styles.iconContainer}>{renderIcon()}</View>

          {typeof label === 'string' ? (
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.primary : colors.onSurfaceVariant,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}>
              {label}
            </Text>
          ) : null}

          {/* Active indicator dot under label */}
          <Animated.View
            style={[
              styles.activeDot,
              {
                backgroundColor: colors.primary,
                opacity: pillAnim,
                transform: [{ scale: pillAnim }],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const containerContent = (
    <View
      style={[
        styles.barContainer,
        {
          paddingBottom: bottomPadding,
          borderTopColor: isDark
            ? colors.surfaceContainerHighest
            : colors.surfaceContainerHigh,
          backgroundColor:
            Platform.OS === 'ios'
              ? 'transparent'
              : colors.surfaceContainerLowest,
        },
      ]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => (
          <TabItem key={route.key} route={route} index={index} />
        ))}
      </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={85}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurWrapper}>
        {containerContent}
      </BlurView>
    );
  }

  return (
    <View style={[styles.androidWrapper, Shadows.lg]}>
      {containerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  blurWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.25)',
  },
  androidWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 16,
  },
  barContainer: {
    paddingTop: 8,
    paddingHorizontal: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 52,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activePill: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -6,
    right: -6,
    borderRadius: Radius.full,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});

export default AnimatedTabBar;
