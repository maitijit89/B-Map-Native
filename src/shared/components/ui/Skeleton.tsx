import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BMapColors } from '../../constants/BMapTheme';
import { Radius } from '../../constants/tokens';

export type SkeletonShape = 'rect' | 'circle' | 'text';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  shape?: SkeletonShape;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 18,
  shape = 'rect',
  borderRadius,
  style,
}) => {
  const [shimmerAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [shimmerAnim]);

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
          width: width as any,
          height: height as any,
          borderRadius: computedRadius,
          opacity: shimmerAnim,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: BMapColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
});

export default Skeleton;
