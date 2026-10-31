import React, { useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';
import { FluidCurves, FluidDuration } from '../../animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
  accessibilityState?: { selected?: boolean; disabled?: boolean; checked?: boolean; busy?: boolean; expanded?: boolean };
  entering?: boolean;
  enteringDelay?: number;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  entering = false,
  enteringDelay = 0,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(0.985, {
      duration: FluidDuration.pressIn,
      easing: FluidCurves.pressIn,
    });
    haptics.light();
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    scale.value = withTiming(1, {
      duration: FluidDuration.pressOut,
      easing: FluidCurves.pressOut,
    });
  }, [onPress, scale]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle = useMemo<ViewStyle>(() => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceContainerLow,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...Shadows.md,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.surfaceContainerHigh,
          ...Shadows.sm,
        };
    }
  }, [variant, colors]);

  const enteringAnimation = useMemo(() => {
    return entering
      ? FadeInDown.delay(enteringDelay).duration(FluidDuration.normal).easing(FluidCurves.momentum)
      : undefined;
  }, [entering, enteringDelay]);


  if (onPress) {
    const pressableNode = (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={[
          styles.base,
          variantStyle,
          paddingStyles[padding],
          animatedScaleStyle,
          style,
        ]}>
        {children}
      </AnimatedPressable>
    );

    if (entering && enteringAnimation) {
      return (
        <Animated.View entering={enteringAnimation}>
          {pressableNode}
        </Animated.View>
      );
    }

    return pressableNode;
  }

  if (entering) {
    return (
      <Animated.View
        entering={enteringAnimation}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        style={[styles.base, variantStyle, paddingStyles[padding], style]}>
        {children}
      </Animated.View>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={[styles.base, variantStyle, paddingStyles[padding], style]}>
      {children}
    </View>
  );
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});

const paddingStyles: Record<CardPadding, ViewStyle> = {
  none: { padding: 0 },
  sm: { padding: Spacing.sm },
  md: { padding: Spacing.lg },
  lg: { padding: Spacing.xxl },
};

export default Card;
