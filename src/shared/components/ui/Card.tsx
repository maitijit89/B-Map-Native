import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing } from '../../constants/tokens';

export type CardVariant = 'elevated' | 'outlined' | 'flat' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  activeOpacity = 0.85,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceContainerLow,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          ...Shadows.md,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.surfaceContainerHigh,
          ...Shadows.sm,
        };
    }
  };

  const content = (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        paddingStyles[padding],
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}>
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});

const paddingStyles: Record<CardPadding, ViewStyle> = {
  none: { padding: 0 },
  sm: { padding: Spacing.sm },
  md: { padding: Spacing.lg },
  lg: { padding: Spacing.xxl },
};

export default Card;
