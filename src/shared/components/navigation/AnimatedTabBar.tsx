import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from 'expo-router';
import { useTheme, useThemeColors, useResponsive } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';
import { FluidCurves, FluidDuration } from '../../animations';

export type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const TabItem = React.memo(({
  route,
  isFocused,
  options,
  colors,
  isDark,
  isSmallDevice,
  onPress,
}: {
  route: any;
  index: number;
  isFocused: boolean;
  options: any;
  colors: any;
  isDark: boolean;
  isSmallDevice: boolean;
  onPress: () => void;
}) => {
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    pillOpacity.value = withTiming(isFocused ? 1 : 0, {
      duration: FluidDuration.normal,
      easing: FluidCurves.momentum,
    });
  }, [isFocused, pillOpacity]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      opacity: pillOpacity.value,
      transform: [{ scale: 0.88 + 0.12 * pillOpacity.value }],
    };
  });

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const iconColor = isFocused ? colors.primary : colors.onSurfaceVariant;
  const iconSize = isSmallDevice ? 20 : 22;

  const renderIcon = () => {
    if (options.tabBarIcon) {
      return options.tabBarIcon({
        focused: isFocused,
        color: iconColor,
        size: iconSize,
      });
    }
    return null;
  };

  return (
    <TouchableOpacity
      key={route.key}
      activeOpacity={0.75}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={
        options.tabBarAccessibilityLabel || (typeof label === 'string' ? label : route.name)
      }
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      style={styles.tabButton}>
      <View style={styles.tabContent}>
        {/* Uniform responsive active capsule pill behind icon */}
        <View style={[styles.iconWrapper, isSmallDevice && styles.iconWrapperSmall]}>
          <Animated.View
            style={[
              styles.activePill,
              {
                backgroundColor: isDark
                  ? 'rgba(0, 150, 255, 0.20)'
                  : 'rgba(0, 97, 167, 0.12)',
              },
              animatedPillStyle,
            ]}
          />
          <View style={styles.iconContainer}>{renderIcon()}</View>
        </View>

        {typeof label === 'string' ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.tabLabel,
              {
                color: isFocused ? colors.primary : colors.onSurfaceVariant,
                fontWeight: isFocused ? '700' : '500',
                fontSize: isSmallDevice ? 9.5 : 10.5,
              },
            ]}>
            {label}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

TabItem.displayName = 'TabItem';

export const AnimatedTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  emitter,
  navigateToTab,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { isSmallDevice, isTablet } = useResponsive();

  const bottomMargin = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10);
  const horizontalMargin = isSmallDevice ? 10 : isTablet ? 36 : Spacing.md;

  const handleTabPress = useCallback(
    (routeKey: string, _routeName: string, isFocused: boolean) => {
      // Clean, silent tab navigation — vibration removed per user request
      const event = emitter.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigateToTab(routeKey);
      }
    },
    [emitter, navigateToTab]
  );

  return (
    <View
      style={[
        styles.floatingDockWrapper,
        {
          left: horizontalMargin,
          right: horizontalMargin,
          bottom: bottomMargin,
        },
      ]}
      pointerEvents="box-none">
      <View
        style={[
          styles.dockContainer,
          {
            backgroundColor: isDark
              ? colors.surfaceContainerLowest
              : '#ffffff',
            borderColor: colors.surfaceContainerHigh,
            maxWidth: isTablet ? 480 : 520,
          },
        ]}>
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            return (
              <TabItem
                key={route.key}
                route={route}
                index={index}
                isFocused={isFocused}
                options={options}
                colors={colors}
                isDark={isDark}
                isSmallDevice={isSmallDevice}
                onPress={() => handleTabPress(route.key, route.name, isFocused)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingDockWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 100,
  },
  dockContainer: {
    width: '100%',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 5,
    paddingHorizontal: 4,
    ...Shadows.lg,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 48,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapperSmall: {
    width: 38,
    height: 26,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 14,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...Typography.labelSmall,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.1,
  },
});

export default AnimatedTabBar;
