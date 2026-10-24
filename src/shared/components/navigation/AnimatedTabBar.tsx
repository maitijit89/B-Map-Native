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
import { useTheme, useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

export type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 280,
  mass: 0.5,
};

const TabItem = React.memo(({
  route,
  index,
  isFocused,
  options,
  colors,
  isDark,
  onPress,
}: {
  route: any;
  index: number;
  isFocused: boolean;
  options: any;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(isFocused ? 1.05 : 0.95);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.05 : 0.95, SPRING_CONFIG);
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

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

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
              onPress={() => handleTabPress(route.key, route.name, isFocused)}
            />
          );
        })}
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
