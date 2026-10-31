import React from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { FluidCurves, FluidDuration } from '../../animations';

export interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
  itemDelay?: number;
  maxStaggerItems?: number;
  itemContainerStyle?: StyleProp<ViewStyle>;
}

export function AnimatedList<T>({
  renderItem,
  itemDelay = 25,
  maxStaggerItems = 8,
  itemContainerStyle,
  ...flatListProps
}: AnimatedListProps<T>) {
  const animatedRenderItem = (info: ListRenderItemInfo<T>) => {
    const delay = Math.min(info.index, maxStaggerItems) * itemDelay;

    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(FluidDuration.normal).easing(FluidCurves.momentum)}
        layout={Layout.duration(FluidDuration.normal).easing(FluidCurves.momentum)}
        style={itemContainerStyle}>
        {renderItem(info)}
      </Animated.View>
    );
  };

  return <FlatList {...flatListProps} renderItem={animatedRenderItem} />;
}

export default AnimatedList;
