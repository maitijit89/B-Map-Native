import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { FadeInView, staggerDelay } from '@/components/ui/fade-in-view';
import type { QuickActionCategory } from '@/types';

/** India-specific quick action categories */
const DEFAULT_CATEGORIES: QuickActionCategory[] = [
  { id: 'petrol', label: 'Petrol', icon: 'gas-station', color: '#E65100', bgColor: '#FFF3E0' },
  { id: 'atm', label: 'ATMs', icon: 'credit-card-outline', color: '#1565C0', bgColor: '#E3F2FD' },
  { id: 'restaurants', label: 'Restaurants', icon: 'silverware-fork-knife', color: '#C62828', bgColor: '#FFEBEE' },
  { id: 'metro', label: 'Metro', icon: 'train-variant', color: '#0284C7', bgColor: '#F0F9FF' },
  { id: 'ev', label: 'EV Charge', icon: 'ev-station', color: '#059669', bgColor: '#ECFDF5' },
  { id: 'hospital', label: 'Hospitals', icon: 'hospital-box-outline', color: '#EF4444', bgColor: '#FEF2F2' },
  { id: 'parking', label: 'Parking', icon: 'car-brake-parking', color: '#7C3AED', bgColor: '#F5F3FF' },
];

interface QuickActionPillsProps {
  /** Categories to display (defaults to India-specific list) */
  categories?: QuickActionCategory[];
  /** Currently selected category ID */
  activeId?: string | null;
  /** Selection handler */
  onSelect: (category: QuickActionCategory) => void;
  /** Animation entrance delay offset */
  entranceDelay?: number;
}

/**
 * QuickActionPills — Horizontal scrolling row of category chips.
 *
 * Baidu-style quick-access pills floating below the search bar.
 * Each pill features a colored icon + label with spring press feedback.
 */
export function QuickActionPills({
  categories = DEFAULT_CATEGORIES,
  activeId,
  onSelect,
  entranceDelay = 200,
}: QuickActionPillsProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      accessibilityRole="tablist"
      accessibilityLabel="Quick action categories"
    >
      {categories.map((category, index) => {
        const isSelected = activeId === category.id;
        return (
          <FadeInView
            key={category.id}
            delay={staggerDelay(index, 50) + entranceDelay}
            from="right"
            slideDistance={12}
          >
            <AnimatedPressableButton
              pressScale={0.93}
              onPress={() => onSelect(category)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected
                    ? category.color
                    : isDark
                    ? 'rgba(17,19,26,0.85)'
                    : 'rgba(255,255,255,0.92)',
                  borderColor: isSelected
                    ? category.color
                    : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={category.label}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={isSmallDevice ? 15 : 17}
                color={isSelected ? '#FFFFFF' : category.color}
              />
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: moderateScale(isSmallDevice ? 11 : 12),
                  },
                ]}
                numberOfLines={1}
              >
                {category.label}
              </Text>
            </AnimatedPressableButton>
          </FadeInView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 7 : 9,
    borderRadius: 20,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  pillText: {
    letterSpacing: 0.1,
  },
});
