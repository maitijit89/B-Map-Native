import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BMapColors } from '../../constants/BMapTheme';
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
          variantStyles[variant],
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

const variantStyles: Record<IconButtonVariant, ViewStyle> = {
  default: {
    backgroundColor: BMapColors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: BMapColors.outlineVariant,
    ...Shadows.xs,
  },
  filled: {
    backgroundColor: BMapColors.primaryContainer,
    ...Shadows.sm,
  },
  tinted: {
    backgroundColor: BMapColors.surfaceContainerHigh,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.md,
  },
  danger: {
    backgroundColor: BMapColors.errorContainer,
  },
};

export default IconButton;
