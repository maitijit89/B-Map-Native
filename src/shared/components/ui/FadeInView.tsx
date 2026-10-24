import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

export type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeDirection;
  springify?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 350,
  direction = 'down',
  springify = true,
  style,
}) => {
  const getEnteringAnimation = () => {
    let anim;
    switch (direction) {
      case 'up':
        anim = FadeInUp;
        break;
      case 'left':
        anim = FadeInLeft;
        break;
      case 'right':
        anim = FadeInRight;
        break;
      case 'none':
        anim = FadeIn;
        break;
      case 'down':
      default:
        anim = FadeInDown;
        break;
    }

    let configuredAnim = anim.duration(duration);
    if (delay > 0) {
      configuredAnim = configuredAnim.delay(delay);
    }
    if (springify) {
      configuredAnim = configuredAnim.springify().damping(16).stiffness(180);
    }

    return configuredAnim;
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify().damping(15)}
      style={style}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
