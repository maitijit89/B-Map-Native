import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

type SlideDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInViewProps {
  /** Delay before the animation starts (ms). Default: 0 */
  delay?: number;
  /** Duration of the fade+slide animation (ms). Default: 450 */
  duration?: number;
  /** Direction the element slides in from. Default: 'up' */
  from?: SlideDirection;
  /** Alias for from */
  direction?: SlideDirection;
  /** Distance to slide in dp. Default: 20 */
  slideDistance?: number;
  /** Style for the container */
  style?: StyleProp<ViewStyle>;
  /** Children to animate */
  children: React.ReactNode;
}

/**
 * FadeInView — Smooth fade + directional slide entrance animation.
 *
 * Wraps children with an animated entrance on mount.
 * Perfect for staggered list items (increment `delay` by 50-100ms per item).
 *
 * Uses Reanimated on the native thread for jank-free 60fps.
 */
export function FadeInView({
  delay = 0,
  duration = 450,
  from = 'up',
  direction,
  slideDistance = 20,
  style,
  children,
}: FadeInViewProps) {
  const slideFrom = direction ?? from;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    let translateX = 0;
    let translateY = 0;

    switch (slideFrom) {
      case 'up':
        translateY = interpolate(
          progress.value,
          [0, 1],
          [slideDistance, 0],
          Extrapolation.CLAMP
        );
        break;
      case 'down':
        translateY = interpolate(
          progress.value,
          [0, 1],
          [-slideDistance, 0],
          Extrapolation.CLAMP
        );
        break;
      case 'left':
        translateX = interpolate(
          progress.value,
          [0, 1],
          [-slideDistance, 0],
          Extrapolation.CLAMP
        );
        break;
      case 'right':
        translateX = interpolate(
          progress.value,
          [0, 1],
          [slideDistance, 0],
          Extrapolation.CLAMP
        );
        break;
      case 'none':
        break;
    }

    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Helper: generates staggered delays for a list of items.
 * Usage: `staggerDelay(index, 75)` → 0, 75, 150, 225, ...
 */
export function staggerDelay(index: number, intervalMs: number = 75): number {
  return index * intervalMs;
}
