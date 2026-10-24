import React, { useMemo, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ChipVariant = 'filled' | 'outlined' | 'subtle' | 'filter';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 350,
  mass: 0.5,
};

export const Chip: React.FC<ChipProps> = React.memo(({
  label,
  icon,
  selected = false,
  onPress,
  variant = 'subtle',
  size = 'md',
  disabled = false,
  badgeCount,
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) return;
    scale.value = withSpring(0.93, SPRING_CONFIG);
    haptics.selection();
  }, [disabled, onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled || !onPress) return;
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [disabled, onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useMemo<ViewStyle>(() => {
    const isSm = size === 'sm';
    const basePaddingH = isSm ? Spacing.sm + 2 : Spacing.md;
    const basePaddingV = isSm ? 5 : 8;

    let bg = colors.surfaceContainerLow;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (selected) {
      bg = colors.primaryContainer;
      borderColor = colors.primary;
      borderWidth = 1;
    } else {
      switch (variant) {
        case 'outlined':
          bg = colors.surfaceContainerLowest;
          borderColor = colors.outlineVariant;
          borderWidth = 1;
          break;
        case 'filled':
          bg = colors.surfaceContainerHigh;
          break;
        case 'filter':
          bg = colors.surfaceContainerLowest;
          borderColor = colors.surfaceContainerHighest;
          borderWidth = 1;
          break;
        case 'subtle':
        default:
          bg = colors.surfaceContainerLow;
          break;
      }
    }

    return {
      backgroundColor: bg,
      borderColor,
      borderWidth,
      paddingHorizontal: basePaddingH,
      paddingVertical: basePaddingV,
      borderRadius: Radius.full,
      opacity: disabled ? 0.5 : 1,
    };
  }, [size, selected, variant, colors, disabled]);

  const textColor = useMemo(() => {
    return selected ? colors.onPrimaryContainer : colors.onSurface;
  }, [selected, colors]);

  const badgeBgColor = useMemo(() => {
    return selected ? colors.primary : colors.surfaceContainerHighest;
  }, [selected, colors]);

  const badgeTextColor = useMemo(() => {
    return selected ? colors.onPrimary : colors.onSurfaceVariant;
  }, [selected, colors]);

  return (
    <AnimatedPressable
      disabled={disabled || !onPress}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.container, containerStyle, animatedStyle, style]}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text
        style={[
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: textColor },
          labelStyle,
        ]}>
        {label}
      </Text>
      {badgeCount !== undefined ? (
        <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {badgeCount}
          </Text>
        </View>
      ) : null}
    </AnimatedPressable>
  );
});

Chip.displayName = 'Chip';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconWrapper: {
    marginRight: Spacing.xs + 2,
  },
  labelSm: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  labelMd: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },
  badge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Chip;
