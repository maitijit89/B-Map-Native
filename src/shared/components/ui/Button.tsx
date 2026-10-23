import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows } from '../../constants/tokens';

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

export const Button: React.FC<ButtonProps> = ({
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
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
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
  };

  const getTextStyle = (): TextStyle => {
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
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
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
          getVariantStyle(),
          isDisabled && styles.disabled,
          style,
        ]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary}
          />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text
              style={[
                styles.textBase,
                textSizeStyles[size],
                getTextStyle(),
                isDisabled && { color: colors.outline },
                textStyle,
              ]}>
              {title}
            </Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

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
