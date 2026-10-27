import React, { useEffect, useCallback, memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

const SPRING_CONFIG = {
  damping: 28,
  stiffness: 320,
  mass: 0.5,
};


export const BottomSheet: React.FC<BottomSheetProps> = memo(({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeight,
  showCloseButton = true,
  contentStyle,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const translateY = useSharedValue(screenHeight);
  const startY = useSharedValue(0);

  const calculatedMaxHeight = maxHeight ?? screenHeight * 0.82;

  const handleDismiss = useCallback(() => {
    haptics.light();
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = startY.value + event.translationY;
      } else {
        translateY.value = startY.value + event.translationY * 0.2;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 600) {
        translateY.value = withTiming(screenHeight, { duration: 220 }, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      translateY.value = withTiming(screenHeight, { duration: 250 });
    }
  }, [visible, translateY, screenHeight]);

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: Math.max(0, translateY.value) }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, screenHeight * 0.5, screenHeight],
      [1, 0.4, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: colors.surfaceContainerLowest,
                maxHeight: calculatedMaxHeight as any,
                paddingBottom: Math.max(insets.bottom, Spacing.lg),
              },
              sheetAnimatedStyle,
            ]}>
            <View style={styles.dragHandleHitSlop}>
              <View style={[styles.handleBar, { backgroundColor: colors.outlineVariant }]} />
            </View>

            {(title || showCloseButton) && (
              <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
                <View style={styles.headerTitleContainer}>
                  {title && <Text style={[styles.title, { color: colors.onBackground }]}>{title}</Text>}
                  {subtitle && <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>}
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleDismiss}
                    style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]}
                    accessibilityRole="button"
                    accessibilityLabel="Close bottom sheet">
                    <X size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={[styles.content, contentStyle]}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
});

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17, 28, 45, 0.45)',
  },
  sheetContainer: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Shadows.xl,
  },
  dragHandleHitSlop: {
    width: '100%',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: Radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.titleMedium,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
});

export default BottomSheet;
