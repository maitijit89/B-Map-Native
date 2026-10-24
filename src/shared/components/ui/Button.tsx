import React, { useMemo, useCallback } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'glass';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 320,
  mass: 0.5,
};

export const Button: React.FC<ButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.96, SPRING_CONFIG);
    haptics.light();
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle = useMemo<ViewStyle>(() => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primaryContainer,
          ...Shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surfaceContainerHigh,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.outlineVariant,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          ...Shadows.sm,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...Shadows.sm,
        };
    }
  }, [variant, colors]);

  const textVariantStyle = useMemo<TextStyle>(() => {
    switch (variant) {
      case 'primary':
        return { color: colors.onPrimary };
      case 'secondary':
        return { color: colors.onSurface };
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      case 'danger':
        return { color: colors.onError };
      case 'glass':
        return { color: colors.onSurface };
    }
  }, [variant, colors]);

  const indicatorColor = useMemo(() => {
    return variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;
  }, [variant, colors]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.textBase,
              textSizeStyles[size],
              textVariantStyle,
              isDisabled && { color: colors.outline },
              textStyle,
            ]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
  },
  md: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: Radius.lg,
  },
  lg: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: Radius.xl,
  },
};

const textSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: 13,
  },
  md: {
    fontSize: 15,
  },
  lg: {
    fontSize: 17,
  },
};

export default Button;
