import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';

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

export const Chip: React.FC<ChipProps> = ({
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

  const getContainerStyle = (): ViewStyle => {
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
  };

  const getTextColor = (): string => {
    if (selected) {
      return colors.onPrimaryContainer;
    }
    return colors.onSurface;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || !onPress}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.container, getContainerStyle(), style]}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text
        style={[
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: getTextColor() },
          labelStyle,
        ]}>
        {label}
      </Text>
      {badgeCount !== undefined ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: selected
                ? colors.primary
                : colors.surfaceContainerHighest,
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              { color: selected ? colors.onPrimary : colors.onSurfaceVariant },
            ]}>
            {badgeCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

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
