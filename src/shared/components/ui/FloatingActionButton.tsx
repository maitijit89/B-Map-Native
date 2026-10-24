import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Shadows } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type FABSize = 'sm' | 'md' | 'lg';
export type FABVariant = 'surface' | 'primary' | 'glass';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  pulse?: boolean;
  size?: FABSize;
  variant?: FABVariant;
  badge?: React.ReactNode;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 350,
  mass: 0.5,
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  active = false,
  pulse = false,
  size = 'md',
  variant = 'surface',
  badge,
  accessibilityLabel,
  style,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
    }
    return () => {
      cancelAnimation(pulseScale);
    };
  }, [pulse, pulseScale]);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIG);
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value * pulseScale.value }],
    };
  });

  const getDimensions = (): number => {
    switch (size) {
      case 'sm':
        return 40;
      case 'lg':
        return 56;
      case 'md':
      default:
        return 48;
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
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
        animatedStyle,
        style,
      ]}>
      {icon}
      {badge ? <View style={styles.badgeWrapper}>{badge}</View> : null}
    </AnimatedPressable>
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
