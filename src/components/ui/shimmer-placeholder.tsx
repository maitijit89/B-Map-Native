import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { BMapColors } from '@/constants/bmap-theme';

interface ShimmerPlaceholderProps {
  /** Width of the placeholder */
  width: number | `${number}%`;
  /** Height of the placeholder */
  height: number;
  /** Border radius. Default: 8 */
  borderRadius?: number;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
}

/**
 * ShimmerPlaceholder — Animated skeleton loading indicator.
 *
 * Displays a pulsing shimmer sweep effect while content is loading.
 * Uses a translating gradient overlay driven by Reanimated for 60fps.
 */
export function ShimmerPlaceholder({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerPlaceholderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const shimmerTranslate = useSharedValue(0);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // infinite repeat
      true // reverse direction
    );
  }, [shimmerTranslate]);

  const baseColor = isDark
    ? BMapColors.dark.surfaceVariant
    : BMapColors.light.surfaceVariant;

  const shimmerColor = isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(255, 255, 255, 0.7)';

  const animatedShimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerTranslate.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3]
    );

    return { opacity };
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: shimmerColor },
          animatedShimmerStyle,
        ]}
      />
    </View>
  );
}
