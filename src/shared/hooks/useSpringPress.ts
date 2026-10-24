import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { haptics } from '../utils/haptics';

export interface UseSpringPressOptions {
  activeScale?: number;
  springConfig?: WithSpringConfig;
  enableHaptic?: boolean;
  hapticType?: 'light' | 'medium' | 'selection';
  disabled?: boolean;
}

const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  stiffness: 300,
  mass: 0.5,
};

export function useSpringPress(options: UseSpringPressOptions = {}) {
  const {
    activeScale = 0.96,
    springConfig = DEFAULT_SPRING_CONFIG,
    enableHaptic = true,
    hapticType = 'light',
    disabled = false,
  } = options;

  const scale = useSharedValue(1);

  const onPressIn = () => {
    'worklet';
    if (disabled) return;
    scale.value = withSpring(activeScale, springConfig);
    if (enableHaptic) {
      if (hapticType === 'selection') haptics.selection();
      else if (hapticType === 'medium') haptics.medium();
      else haptics.light();
    }
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, springConfig);
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

export default useSpringPress;
