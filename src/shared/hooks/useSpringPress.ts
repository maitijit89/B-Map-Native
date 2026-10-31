import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  WithSpringConfig,
} from 'react-native-reanimated';
import { haptics } from '../utils/haptics';
import { FluidCurves, FluidDuration } from '../animations';

export interface UseSpringPressOptions {
  activeScale?: number;
  springConfig?: WithSpringConfig;
  enableHaptic?: boolean;
  hapticType?: 'light' | 'medium' | 'selection';
  disabled?: boolean;
}

export function useSpringPress(options: UseSpringPressOptions = {}) {
  const {
    activeScale = 0.975,
    enableHaptic = true,
    hapticType = 'light',
    disabled = false,
  } = options;

  const scale = useSharedValue(1);

  const onPressIn = () => {
    'worklet';
    if (disabled) return;
    scale.value = withTiming(activeScale, {
      duration: FluidDuration.pressIn,
      easing: FluidCurves.pressIn,
    });
    if (enableHaptic) {
      if (hapticType === 'selection') haptics.selection();
      else if (hapticType === 'medium') haptics.medium();
      else haptics.light();
    }
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withTiming(1, {
      duration: FluidDuration.pressOut,
      easing: FluidCurves.pressOut,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return {
    scale,
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

export const useFluidPress = useSpringPress;
export default useSpringPress;
