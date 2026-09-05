import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { FadeInView, staggerDelay } from '@/components/ui/fade-in-view';
import { triggerHaptic } from '@/utils/haptics';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/services/translations';

export interface BaiduServiceItem {
  id: string;
  label: string;
  translationKey: TranslationKey;
  sublabel?: string;
  iconName: string;
  iconType: 'material' | 'ionicons';
  accentColor: string;
  lightBg: string;
  darkBg: string;
  categoryFilter?: string;
}

export const BAIDU_SERVICES: BaiduServiceItem[] = [
  {
    id: 'ride',
    label: 'Ride & Go',
    translationKey: 'service_ride',
    sublabel: 'Cab/Auto',
    iconName: 'car-side',
    iconType: 'material',
    accentColor: '#4E6EF2', // Baidu Digital Blue
    lightBg: '#EEF2FF',
    darkBg: '#1A233A',
    categoryFilter: 'taxi',
  },
  {
    id: 'transit',
    label: 'Metro/Bus',
    translationKey: 'service_transit',
    sublabel: 'Live Arrivals',
    iconName: 'train-variant',
    iconType: 'material',
    accentColor: '#0284C7', // Sky Cyan
    lightBg: '#F0F9FF',
    darkBg: '#132B3A',
    categoryFilter: 'poi',
  },
  {
    id: 'ev',
    label: 'EV Charge',
    translationKey: 'service_ev',
    sublabel: 'Fast Ports',
    iconName: 'ev-station',
    iconType: 'material',
    accentColor: '#059669', // Clean Emerald
    lightBg: '#ECFDF5',
    darkBg: '#123024',
    categoryFilter: 'ev',
  },
  {
    id: 'fuel_toll',
    label: 'Fuel & Toll',
    translationKey: 'service_fuel',
    sublabel: 'FASTag/Gas',
    iconName: 'gas-station',
    iconType: 'material',
    accentColor: '#E65100', // Saffron Amber
    lightBg: '#FFF7ED',
    darkBg: '#352115',
    categoryFilter: 'toll',
  },
  {
    id: 'explore',
    label: 'Explore',
    translationKey: 'service_explore',
    sublabel: 'Food & Cafes',
    iconName: 'silverware-fork-knife',
    iconType: 'material',
    accentColor: '#D97706', // Warm Gold
    lightBg: '#FFFBEB',
    darkBg: '#302615',
    categoryFilter: 'poi',
  },
];

interface BaiduServiceGridProps {
  activeId?: string | null;
  onSelectService: (service: BaiduServiceItem) => void;
  entranceDelay?: number;
}

/**
 * BaiduServiceGrid — Iconic minimalist service bar inspired by Baidu Maps.
 *
 * Presents key travel and mobility actions in soft pastel squircle cards
 * with micro-spring touch response and haptic feedback.
 */
export function BaiduServiceGrid({
  activeId,
  onSelectService,
  entranceDelay = 200,
}: BaiduServiceGridProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const { t } = useLanguage();

  const handlePress = (service: BaiduServiceItem) => {
    triggerHaptic.selection();
    onSelectService(service);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityRole="tablist"
      >
        {BAIDU_SERVICES.map((service, index) => {
          const isSelected = activeId === service.id;
          const iconBg = isDark ? service.darkBg : service.lightBg;

          return (
            <FadeInView
              key={service.id}
              delay={staggerDelay(index, 45) + entranceDelay}
              from="down"
              slideDistance={10}
            >
              <AnimatedPressableButton
                pressScale={0.92}
                onPress={() => handlePress(service)}
                style={[
                  styles.serviceCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#1E2B58'
                        : '#EFF6FF'
                      : colors.surface,
                    borderColor: isSelected
                      ? service.accentColor
                      : colors.borderSubtle,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t(service.translationKey) || service.label}
              >
                {/* Micro-squircle icon container */}
                <View
                  style={[
                    styles.iconSquircle,
                    {
                      backgroundColor: isSelected
                        ? service.accentColor
                        : iconBg,
                    },
                  ]}
                >
                  {service.iconType === 'material' ? (
                    <MaterialCommunityIcons
                      name={service.iconName as any}
                      size={isSmallDevice ? 18 : 20}
                      color={isSelected ? '#FFFFFF' : service.accentColor}
                    />
                  ) : (
                    <Ionicons
                      name={service.iconName as any}
                      size={isSmallDevice ? 18 : 20}
                      color={isSelected ? '#FFFFFF' : service.accentColor}
                    />
                  )}
                </View>

                {/* Service Label */}
                <Text
                  style={[
                    styles.serviceLabel,
                    {
                      color: isSelected ? service.accentColor : colors.text,
                      fontWeight: isSelected ? '700' : '600',
                      fontSize: moderateScale(isSmallDevice ? 10.5 : 11.5),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {t(service.translationKey) || service.label}
                </Text>
              </AnimatedPressableButton>
            </FadeInView>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: isSmallDevice ? 6 : 8,
  },
  serviceCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: isSmallDevice ? 68 : 76,
    ...BMapElevation.level1,
  },
  iconSquircle: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceLabel: {
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
