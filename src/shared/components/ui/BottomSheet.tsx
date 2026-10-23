import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = SCREEN_HEIGHT * 0.75,
  showCloseButton = true,
  contentStyle,
}) => {
  const colors = useThemeColors();
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surfaceContainerLowest,
              maxHeight: maxHeight as any,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={[styles.handleBar, { backgroundColor: colors.outlineVariant }]} />

          {(title || showCloseButton) && (
            <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
              <View style={styles.headerTitleContainer}>
                {title && <Text style={[styles.title, { color: colors.onBackground }]}>{title}</Text>}
                {subtitle && <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>}
              </View>
              {showCloseButton && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]}>
                  <X size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
    paddingBottom: Spacing.xl,
    ...Shadows.xl,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
