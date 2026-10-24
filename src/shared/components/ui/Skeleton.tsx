import React, { useEffect } from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import { Radius } from '../../constants/tokens';

export type SkeletonShape = 'rect' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  shape?: SkeletonShape;
  borderRadius?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 18,
  shape = 'rect',
  borderRadius,
  duration = 800,
  delay = 0,
  style,
}) => {
  const colors = useThemeColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0.35, 0.85]);
    const scale = interpolate(progress.value, [0, 1], [0.99, 1.01]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const computedRadius =
    borderRadius !== undefined
      ? borderRadius
      : shape === 'circle'
      ? Radius.full
      : shape === 'text'
      ? Radius.xs
      : Radius.md;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          backgroundColor: colors.surfaceContainerHigh,
          width: width as any,
          height: height as any,
          borderRadius: computedRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export interface SkeletonGroupProps {
  count?: number;
  spacing?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  spacing = 12,
  children,
  style,
}) => {
  if (children) {
    return (
      <View style={style}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              delay: index * 120,
            });
          }
          return child;
        })}
      </View>
    );
  }

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: index === count - 1 ? 0 : spacing }}>
          <Skeleton delay={index * 120} height={20} width="100%" />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default Skeleton;
