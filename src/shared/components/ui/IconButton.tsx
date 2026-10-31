import React, { useMemo, useCallback, memo } from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';
import { FluidCurves, FluidDuration } from '../../animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonVariant =
  | 'default'
  | 'filled'
  | 'tinted'
  | 'glass'
  | 'danger';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = memo(({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withTiming(0.94, {
      duration: FluidDuration.pressIn,
      easing: FluidCurves.pressIn,
    });
    haptics.light();
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: FluidDuration.pressOut,
      easing: FluidCurves.pressOut,
    });
  }, [scale]);


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle = useMemo<ViewStyle>(() => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.primaryContainer,
          ...Shadows.sm,
        };
      case 'tinted':
        return {
          backgroundColor: colors.surfaceContainerHigh,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...Shadows.md,
        };
      case 'danger':
        return {
          backgroundColor: colors.errorContainer,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...Shadows.xs,
        };
    }
  }, [variant, colors]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.base,
        sizeStyles[size],
        variantStyle,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {icon}
    </AnimatedPressable>
  );
});

IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  disabled: {
    opacity: 0.4,
  },
});

const sizeStyles: Record<IconButtonSize, ViewStyle> = {
  sm: {
    width: 36,
    height: 36,
  },
  md: {
    width: 46,
    height: 46,
  },
  lg: {
    width: 54,
    height: 54,
  },
};

export default IconButton;
