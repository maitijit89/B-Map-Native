import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows } from '../../constants/tokens';

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

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const colors = useThemeColors();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
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
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.base,
          sizeStyles[size],
          getVariantStyle(),
          disabled && styles.disabled,
          style,
        ]}>
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

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
