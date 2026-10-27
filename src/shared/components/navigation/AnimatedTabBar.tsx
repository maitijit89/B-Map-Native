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
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import type { Tabs } from 'expo-router';
import { useTheme, useThemeColors, useResponsive } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

export type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 320,
  mass: 0.5,
};

const TabItem = React.memo(({
  route,
  index,
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
  const scale = useSharedValue(isFocused ? 1.02 : 1.0);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.02 : 1.0, SPRING_CONFIG);
    pillOpacity.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
  }, [isFocused, scale, pillOpacity]);


  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      opacity: pillOpacity.value,
      transform: [{ scaleX: pillOpacity.value }],
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      opacity: pillOpacity.value,
      transform: [{ scale: pillOpacity.value }],
    };
  });

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
        size: isSmallDevice ? 20 : 22,
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
      onPress={onPress}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedContentStyle]}>
        {/* Active indicator pill behind icon */}
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: isDark
                ? 'rgba(0, 150, 255, 0.18)'
                : 'rgba(0, 97, 167, 0.10)',
            },
            animatedPillStyle,
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
                fontSize: isSmallDevice ? 9 : 10,
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
            },
            animatedDotStyle,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
});

TabItem.displayName = 'TabItem';

export const AnimatedTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { isSmallDevice } = useResponsive();

  const bottomMargin = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10);

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      haptics.selection();

      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  return (
    <View style={[styles.floatingDockWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
      <BlurView
        intensity={Platform.OS === 'ios' ? 85 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.dockContainer,
          {
            backgroundColor: isDark
              ? 'rgba(15, 22, 36, 0.88)'
              : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 97, 167, 0.12)',
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
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingDockWrapper: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
    zIndex: 100,
  },
  dockContainer: {
    width: '100%',
    maxWidth: 520,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 2,
    ...Shadows.lg,
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
    minHeight: 48,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  activePill: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -4,
    right: -4,
    borderRadius: Radius.full,
  },
  iconContainer: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default AnimatedTabBar;
