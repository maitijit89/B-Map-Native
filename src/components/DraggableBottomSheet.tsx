import React, { useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  useColorScheme,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { BMapColors, BMapElevation } from '@/constants/bmap-theme';
import { isSmallDevice } from '@/utils/responsive';

interface DraggableBottomSheetProps {
  /** Snap points as percentages or pixel values. Default: ['15%', '50%', '90%'] */
  snapPoints?: (string | number)[];
  /** Initial snap index. Default: 0 (collapsed) */
  initialIndex?: number;
  /** Children to render inside the sheet */
  children: React.ReactNode;
  /** Whether content is scrollable (uses BottomSheetScrollView). Default: false */
  scrollable?: boolean;
  /** Callback when snap point changes */
  onStateChange?: (index: number) => void;
  /** Whether to show the handle bar. Default: true */
  showHandle?: boolean;
  /** Additional bottom sheet props */
  sheetProps?: Partial<BottomSheetProps>;
  /** Enable glassmorphism background. Default: true */
  enableBlur?: boolean;
}

/**
 * DraggableBottomSheet — Reusable gesture-driven bottom sheet.
 *
 * Wraps @gorhom/bottom-sheet with B Map's glassmorphic design tokens
 * and physics-based gesture handling. Three default snap points:
 * collapsed (peek), half, expanded.
 */
export function DraggableBottomSheet({
  snapPoints: customSnapPoints,
  initialIndex = 0,
  children,
  scrollable = false,
  onStateChange,
  showHandle = true,
  sheetProps,
  enableBlur = true,
}: DraggableBottomSheetProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(
    () => customSnapPoints ?? [isSmallDevice ? '16%' : '15%', '50%', '90%'],
    [customSnapPoints]
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      onStateChange?.(index);
    },
    [onStateChange]
  );

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  const renderBackdropComponent = useCallback(() => null, []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={initialIndex}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor: isDark ? '#11131A' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: isDark ? '#4B5563' : '#CBD5E1' },
        !showHandle && { opacity: 0 },
      ]}
      handleStyle={styles.handleContainer}
      style={styles.sheet}
      backdropComponent={renderBackdropComponent}
      animateOnMount
      {...sheetProps}
    >
      <ContentWrapper
        style={styles.contentContainer}
        {...(scrollable ? { showsVerticalScrollIndicator: false } : {})}
      >
        {children}
      </ContentWrapper>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    zIndex: 30,
    ...BMapElevation.level3,
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleContainer: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 14 : 18,
  },
});
