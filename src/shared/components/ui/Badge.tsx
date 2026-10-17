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
import { BMapColors } from '../../constants/BMapTheme';
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

  const dotColor = dotColors[variant];

  return (
    <View
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        style,
      ]}>
      {showDot && (
        <Animated.View
          style={[
            styles.dot,
            dotSizeStyles[size],
            { backgroundColor: dotColor, opacity: pulseAnim },
          ]}
        />
      )}
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <Text
        style={[
          styles.text,
          textSizeStyles[size],
          textVariantStyles[variant],
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

const variantStyles: Record<BadgeVariant, ViewStyle> = {
  primary: {
    backgroundColor: BMapColors.primaryFixed,
  },
  success: {
    backgroundColor: '#E6F8F0',
  },
  warning: {
    backgroundColor: '#FFF4E5',
  },
  error: {
    backgroundColor: BMapColors.errorContainer,
  },
  neutral: {
    backgroundColor: BMapColors.surfaceContainerHigh,
  },
  live: {
    backgroundColor: '#E6F4FE',
    borderWidth: 1,
    borderColor: BMapColors.primaryContainer,
  },
};

const textVariantStyles: Record<BadgeVariant, TextStyle> = {
  primary: {
    color: BMapColors.onPrimaryFixedVariant,
  },
  success: {
    color: BMapColors.trafficGreen,
  },
  warning: {
    color: BMapColors.trafficOrange,
  },
  error: {
    color: BMapColors.onErrorContainer,
  },
  neutral: {
    color: BMapColors.onSurfaceVariant,
  },
  live: {
    color: BMapColors.primary,
  },
};

const dotColors: Record<BadgeVariant, string> = {
  primary: BMapColors.primary,
  success: BMapColors.trafficGreen,
  warning: BMapColors.trafficOrange,
  error: BMapColors.trafficRed,
  neutral: BMapColors.outline,
  live: BMapColors.primaryContainer,
};

export default Badge;
