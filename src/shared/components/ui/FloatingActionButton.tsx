import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Shadows } from '../../constants/tokens';

export type FABSize = 'sm' | 'md' | 'lg';
export type FABVariant = 'surface' | 'primary' | 'glass';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  size?: FABSize;
  variant?: FABVariant;
  badge?: React.ReactNode;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  active = false,
  size = 'md',
  variant = 'surface',
  badge,
  accessibilityLabel,
  style,
}) => {
  const colors = useThemeColors();

  const getDimensions = (): number => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 54;
      case 'md':
      default:
        return 46;
    }
  };

  const getBackgroundColor = (): string => {
    if (active) {
      return colors.primary;
    }
    switch (variant) {
      case 'primary':
        return colors.primaryContainer;
      case 'glass':
        return colors.surfaceContainerLowest;
      case 'surface':
      default:
        return colors.surfaceContainerLowest;
    }
  };

  const dim = getDimensions();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: getBackgroundColor(),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: active ? colors.primary : colors.surfaceContainerHigh,
        },
        Shadows.md,
        style,
      ]}>
      {icon}
      {badge ? <View style={styles.badgeWrapper}>{badge}</View> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});

export default FloatingActionButton;
