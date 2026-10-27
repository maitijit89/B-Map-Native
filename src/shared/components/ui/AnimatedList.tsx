import React from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
  itemDelay?: number;
  maxStaggerItems?: number;
  itemContainerStyle?: StyleProp<ViewStyle>;
}

export function AnimatedList<T>({
  renderItem,
  itemDelay = 20,
  maxStaggerItems = 8,
  itemContainerStyle,
  ...flatListProps
}: AnimatedListProps<T>) {
  const animatedRenderItem = (info: ListRenderItemInfo<T>) => {
    const delay = Math.min(info.index, maxStaggerItems) * itemDelay;

    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(180).springify().damping(22)}
        layout={Layout.springify().damping(22)}
        style={itemContainerStyle}>
        {renderItem(info)}
      </Animated.View>
    );
  };


  return <FlatList {...flatListProps} renderItem={animatedRenderItem} />;
}

export default AnimatedList;
