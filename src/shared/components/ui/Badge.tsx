import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'live';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  showDot = false,
  leftIcon,
  style,
  textStyle,
}) => {
  const colors = useThemeColors();
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (variant === 'live' || showDot) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [variant, showDot, pulseAnim]);

  const getVariantStyles = (): { bg: string; text: string; dot: string; border?: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.secondaryContainer,
          text: colors.onSecondaryContainer,
          dot: colors.secondary,
        };
      case 'warning':
        return {
          bg: colors.tertiaryContainer,
          text: colors.onTertiaryContainer,
          dot: colors.tertiary,
        };
      case 'error':
        return {
          bg: colors.errorContainer,
          text: colors.onErrorContainer,
          dot: colors.error,
        };
      case 'neutral':
        return {
          bg: colors.surfaceContainerHigh,
          text: colors.onSurfaceVariant,
          dot: colors.outline,
        };
      case 'live':
        return {
          bg: colors.surfaceContainerLow,
          text: colors.primary,
          dot: colors.primaryContainer,
          border: colors.primaryContainer,
        };
      case 'primary':
      default:
        return {
          bg: colors.primaryFixed,
          text: colors.onPrimaryFixedVariant,
          dot: colors.primary,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: currentStyles.bg,
          borderColor: currentStyles.border || 'transparent',
          borderWidth: currentStyles.border ? 1 : 0,
        },
        style,
      ]}>
      {showDot && (
        <Animated.View
          style={[
            styles.dot,
            dotSizeStyles[size],
            { backgroundColor: currentStyles.dot, opacity: pulseAnim },
          ]}
        />
      )}
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <Text
        style={[
          styles.text,
          textSizeStyles[size],
          { color: currentStyles.text },
          textStyle,
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dot: {
    borderRadius: Radius.full,
    marginRight: Spacing.xs,
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
});

const sizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 22,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 28,
  },
};

const dotSizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: {
    width: 6,
    height: 6,
  },
  md: {
    width: 8,
    height: 8,
  },
};

const textSizeStyles: Record<BadgeSize, TextStyle> = {
  sm: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  md: {
    ...Typography.labelMedium,
    fontSize: 12,
  },
};

export default Badge;
