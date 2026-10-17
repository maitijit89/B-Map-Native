import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BMapColors } from '../../constants/BMapTheme';
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
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  activeOpacity = 0.85,
}) => {
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

  const content = (
    <View
      style={[
        styles.base,
        variantStyles[variant],
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
          onPressOut={handlePressOut}>
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

const variantStyles: Record<CardVariant, ViewStyle> = {
  elevated: {
    backgroundColor: BMapColors.surfaceContainerLowest,
    ...Shadows.sm,
  },
  outlined: {
    backgroundColor: BMapColors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: BMapColors.outlineVariant,
  },
  flat: {
    backgroundColor: BMapColors.surfaceContainerLow,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...Shadows.md,
  },
};

export default Card;
