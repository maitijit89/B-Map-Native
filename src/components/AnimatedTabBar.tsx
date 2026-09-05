import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapAnimation } from '@/constants/bmap-theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/services/translations';

interface TabItem {
  name: string;
  translationKey: TranslationKey;
  iconName: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { name: 'index', translationKey: 'tabs_home', iconName: 'home-outline', iconFocused: 'home' },
  { name: 'features', translationKey: 'tabs_go', iconName: 'navigate-outline', iconFocused: 'navigate' },
  { name: 'fleet', translationKey: 'tabs_explore', iconName: 'compass-outline', iconFocused: 'compass' },
  { name: 'profile', translationKey: 'tabs_profile', iconName: 'person-outline', iconFocused: 'person' },
];

interface AnimatedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function AnimatedTabItem({
  tab,
  label,
  isFocused,
  onPress,
  onLongPress,
  colors,
  isDark,
}: {
  tab: TabItem;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: typeof BMapColors.light | typeof BMapColors.dark;
  isDark: boolean;
}) {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, BMapAnimation.pressSpring);
  }, [isFocused, focusProgress]);

  const iconContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      focusProgress.value,
      [0, 1],
      [1, 1.08],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { scale: scale * pressScale.value },
      ],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      focusProgress.value,
      [0, 1],
      [0.75, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      focusProgress.value,
      [0, 1],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const opacity = focusProgress.value;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Animated dot under active tab (Baidu-style)
  const dotStyle = useAnimatedStyle(() => {
    const dotScale = interpolate(
      focusProgress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale: dotScale }],
      opacity: focusProgress.value,
    };
  });

  const handlePressIn = () => {
    pressScale.value = withSpring(0.92, BMapAnimation.pressSpring);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, BMapAnimation.pressSpring);
  };

  const iconName = isFocused ? tab.iconFocused : tab.iconName;
  const activePillBg = isDark ? '#1C2438' : '#EEF4FF';

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.88}
      style={styles.tabItem}
    >
      {/* Active background pill */}
      <Animated.View
        style={[
          styles.activeIndicator,
          { backgroundColor: activePillBg },
          indicatorStyle,
        ]}
      />

      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
        <Ionicons
          name={iconName}
          size={21}
          color={isFocused ? BMapColors.primary : colors.textMuted}
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? BMapColors.primary : colors.textMuted,
            fontWeight: isFocused ? '700' : '500',
          },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>

      {/* Baidu-style active dot */}
      <Animated.View
        style={[
          styles.activeDot,
          { backgroundColor: BMapColors.primary },
          dotStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

export function AnimatedTabBar({ state, descriptors, navigation }: AnimatedTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const { t } = useLanguage();

  // Accurately respect both iOS home bar and Android navigation gesture pill
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 10);

  return (
    <View
      style={[
        styles.tabBarOuter,
        {
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View
        style={[
          styles.tabBarContainer,
          {
            overflow: 'hidden',
            backgroundColor: colors.surface,
            borderColor: colors.tabBarBorder,
          },
        ]}
      >

        {state.routes.map((route: any, index: number) => {
          const tab = TABS[index];
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedTabItem
              key={route.key}
              tab={tab}
              label={t(tab.translationKey)}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              colors={colors}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    ...BMapElevation.level2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 4,
    right: 4,
    borderRadius: 18,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
