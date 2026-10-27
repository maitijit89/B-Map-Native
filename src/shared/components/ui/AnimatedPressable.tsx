import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { haptics } from '../../utils/haptics';

const AnimatedComponent = Animated.createAnimatedComponent(Pressable);

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  activeScale?: number;
  activeOpacity?: number;
  springConfig?: WithSpringConfig;
  enableHaptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'rigid' | 'soft';
  entering?: any;
  exiting?: any;
  layout?: any;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
}

const DEFAULT_SPRING: WithSpringConfig = {
  damping: 26,
  stiffness: 380,
  mass: 0.4,
};

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  activeScale = 0.975,
  activeOpacity = 0.92,
  springConfig = DEFAULT_SPRING,
  enableHaptic = true,

  hapticType = 'light',
  disabled = false,
  entering,
  exiting,
  layout,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = (e: GestureResponderEvent) => {
    if (disabled) return;
    scale.value = withSpring(activeScale, springConfig);
    opacity.value = withSpring(activeOpacity, springConfig);
    if (enableHaptic) {
      switch (hapticType) {
        case 'selection':
          haptics.selection();
          break;
        case 'medium':
          haptics.medium();
          break;
        case 'heavy':
          haptics.heavy();
          break;
        case 'rigid':
          haptics.rigid();
          break;
        case 'soft':
          haptics.soft();
          break;
        case 'light':
        default:
          haptics.light();
          break;
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withSpring(1, springConfig);
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const content = (
    <AnimatedComponent
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style as any]}
      {...rest}>
      {children}
    </AnimatedComponent>
  );

  if (entering || exiting || layout) {
    return (
      <Animated.View entering={entering} exiting={exiting} layout={layout}>
        {content}
      </Animated.View>
    );
  }

  return content;
};

export default AnimatedPressable;
