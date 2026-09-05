import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

const BaseAnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEFAULT_SPRING: WithSpringConfig = {
  damping: 15,
  stiffness: 300,
  mass: 0.6,
  overshootClamping: false,
};

interface AnimatedPressableButtonProps extends Omit<PressableProps, 'style'> {
  /** Scale factor when pressed (0-1). Default: 0.96 */
  pressScale?: number;
  /** Alias for pressScale */
  scaleTo?: number;
  /** Spring configuration for the press animation */
  springConfig?: WithSpringConfig;
  /** Style for the container */
  style?: StyleProp<ViewStyle>;
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Universal animated pressable with spring scale feedback.
 * Drop-in replacement for TouchableOpacity with production-grade press feel.
 *
 * Uses Reanimated worklets for 60fps native-thread animation.
 */
export function AnimatedPressableButton({
  pressScale = 0.96,
  scaleTo,
  springConfig = DEFAULT_SPRING,
  style,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: AnimatedPressableButtonProps) {
  const targetScale = scaleTo ?? pressScale;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      'worklet';
      scale.value = withSpring(targetScale, springConfig);
      onPressIn?.(e);
    },
    [scale, targetScale, springConfig, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      'worklet';
      scale.value = withSpring(1, springConfig);
      onPressOut?.(e);
    },
    [scale, springConfig, onPressOut]
  );

  return (
    <BaseAnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style, disabled && { opacity: 0.5 }]}
      {...rest}
    >
      {children}
    </BaseAnimatedPressable>
  );
}

export const AnimatedPressable = AnimatedPressableButton;
export default AnimatedPressableButton;
