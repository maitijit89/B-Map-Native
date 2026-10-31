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
import { FluidCurves, FluidDuration } from '../../animations';

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
  duration = FluidDuration.normal,
  direction = 'down',
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

    let configuredAnim = anim.duration(duration).easing(FluidCurves.momentum);
    if (delay > 0) {
      configuredAnim = configuredAnim.delay(delay);
    }
    return configuredAnim;
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      exiting={FadeOut.duration(160).easing(FluidCurves.accelerate)}
      layout={Layout.duration(FluidDuration.normal).easing(FluidCurves.momentum)}
      style={style}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
