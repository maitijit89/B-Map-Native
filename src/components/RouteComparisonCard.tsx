import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {
  BMapColors,
  BMapElevation,
  BMapTypography,
} from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { FadeInView, staggerDelay } from '@/components/ui/fade-in-view';
import { ShimmerPlaceholder } from '@/components/ui/shimmer-placeholder';
import type { TransportComparison, IndianTransportMode } from '@/types';

/** Icon config for each Indian transport mode */
const TRANSPORT_ICON_MAP: Record<
  IndianTransportMode,
  {
    iconFamily: 'MaterialCommunityIcons' | 'FontAwesome5' | 'Ionicons';
    iconName: string;
    color: string;
    bgColor: string;
  }
> = {
  'two-wheeler': {
    iconFamily: 'FontAwesome5',
    iconName: 'motorcycle',
    color: BMapColors.transport.twoWheeler,
    bgColor: BMapColors.transport.twoWheelerBg,
  },
  auto: {
    iconFamily: 'MaterialCommunityIcons',
    iconName: 'rickshaw',
    color: BMapColors.transport.auto,
    bgColor: BMapColors.transport.autoBg,
  },
  cab: {
    iconFamily: 'Ionicons',
    iconName: 'car-sport',
    color: BMapColors.transport.cab,
    bgColor: BMapColors.transport.cabBg,
  },
  'metro-bus': {
    iconFamily: 'MaterialCommunityIcons',
    iconName: 'train-variant',
    color: BMapColors.transport.metroBus,
    bgColor: BMapColors.transport.metroBusBg,
  },
  walking: {
    iconFamily: 'FontAwesome5',
    iconName: 'walking',
    color: BMapColors.transport.walking,
    bgColor: BMapColors.transport.walkingBg,
  },
};

const TRAFFIC_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Low Traffic', color: '#059669', bg: '#ECFDF5' },
  moderate: { label: 'Moderate', color: '#D97706', bg: '#FFFBEB' },
  heavy: { label: 'Heavy Traffic', color: '#DC2626', bg: '#FEF2F2' },
};

interface RouteComparisonCardProps {
  /** Transport mode comparison data */
  comparisons: TransportComparison[];
  /** Currently selected mode */
  selectedMode?: IndianTransportMode;
  /** Selection handler */
  onSelectMode: (mode: IndianTransportMode) => void;
  /** Loading state — shows shimmer skeletons */
  isLoading?: boolean;
  /** Action: start navigation with selected mode */
  onStartNavigation?: (mode: IndianTransportMode) => void;
}

/**
 * RouteComparisonCard — Side-by-side Indian transport mode comparisons.
 *
 * Displays ETA, fare estimate, and traffic for Auto, Bike, Cab, Metro, and Walking.
 * Each card has a distinct colored icon, animated selection border, and spring feedback.
 */
export function RouteComparisonCard({
  comparisons,
  selectedMode,
  onSelectMode,
  isLoading = false,
  onStartNavigation,
}: RouteComparisonCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {[1, 2, 3].map((i) => (
          <ShimmerPlaceholder
            key={`skeleton-${i}`}
            width="100%"
            height={isSmallDevice ? 78 : 86}
            borderRadius={16}
            style={{ marginBottom: 10 }}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Transport mode comparison"
    >
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="compare-horizontal" size={18} color={BMapColors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Compare Routes
        </Text>
      </View>

      {/* Transport cards */}
      {comparisons.map((item, index) => {
        const isSelected = selectedMode === item.mode;
        const iconConfig = TRANSPORT_ICON_MAP[item.mode];
        const traffic = TRAFFIC_BADGE[item.trafficLevel];

        const renderIcon = () => {
          const iconSize = isSmallDevice ? 18 : 22;
          const iconColor = isSelected ? '#FFFFFF' : iconConfig.color;

          switch (iconConfig.iconFamily) {
            case 'FontAwesome5':
              return <FontAwesome5 name={iconConfig.iconName} size={iconSize} color={iconColor} />;
            case 'MaterialCommunityIcons':
              return (
                <MaterialCommunityIcons
                  name={iconConfig.iconName as any}
                  size={iconSize + 2}
                  color={iconColor}
                />
              );
            case 'Ionicons':
              return <Ionicons name={iconConfig.iconName as any} size={iconSize} color={iconColor} />;
          }
        };

        return (
          <FadeInView
            key={item.mode}
            delay={staggerDelay(index, 70)}
            from="up"
            slideDistance={10}
          >
            <AnimatedPressableButton
              pressScale={0.97}
              onPress={() => onSelectMode(item.mode)}
              disabled={!item.isAvailable}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? isDark ? '#1C2834' : '#FFF9F5'
                    : colors.surface,
                  borderColor: isSelected ? BMapColors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: item.isAvailable ? 1 : 0.5,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: !item.isAvailable }}
              accessibilityLabel={`${item.label}: ${item.etaMinutes} minutes, ${item.fareEstimate} rupees`}
            >
              {/* Icon circle */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isSelected ? iconConfig.color : iconConfig.bgColor,
                  },
                ]}
              >
                {renderIcon()}
              </View>

              {/* Info cluster */}
              <View style={styles.infoColumn}>
                <Text
                  style={[
                    styles.modeLabel,
                    { color: colors.text, fontSize: moderateScale(isSmallDevice ? 13 : 14) },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>

                {/* Traffic badge */}
                <View style={[styles.trafficBadge, { backgroundColor: traffic.bg }]}>
                  <View style={[styles.trafficDot, { backgroundColor: traffic.color }]} />
                  <Text style={[styles.trafficText, { color: traffic.color }]}>
                    {traffic.label}
                  </Text>
                </View>
              </View>

              {/* ETA & Fare */}
              <View style={styles.metaColumn}>
                <Text style={[styles.etaValue, BMapTypography.titleLarge, { color: colors.text }]}>
                  {item.etaMinutes}
                  <Text style={[styles.etaUnit, { color: colors.textSecondary }]}> min</Text>
                </Text>
                <Text style={[styles.fareValue, { color: BMapColors.primary }]}>
                  ₹{item.fareEstimate}
                  {item.surgeMultiplier && item.surgeMultiplier > 1 && (
                    <Text style={styles.surgeText}> {item.surgeMultiplier}x</Text>
                  )}
                </Text>
              </View>
            </AnimatedPressableButton>

            {/* Start navigation button for selected mode */}
            {isSelected && onStartNavigation && (
              <FadeInView delay={50} from="up" slideDistance={6}>
                <AnimatedPressableButton
                  pressScale={0.96}
                  onPress={() => onStartNavigation(item.mode)}
                  style={[styles.startBtn, { backgroundColor: BMapColors.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Start navigation via ${item.label}`}
                >
                  <Ionicons name="navigate" size={17} color="#FFFFFF" />
                  <Text style={styles.startBtnText}>
                    Start via {item.label} • ₹{item.fareEstimate}
                  </Text>
                </AnimatedPressableButton>
              </FadeInView>
            )}
          </FadeInView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: isSmallDevice ? 8 : 10,
  },
  loadingContainer: {
    gap: 10,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 16,
    gap: isSmallDevice ? 10 : 12,
    ...BMapElevation.level1,
  },
  iconCircle: {
    width: isSmallDevice ? 42 : 48,
    height: isSmallDevice ? 42 : 48,
    borderRadius: isSmallDevice ? 21 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  modeLabel: {
    fontWeight: '700',
  },
  trafficBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trafficDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trafficText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  etaValue: {
    fontWeight: '800',
  },
  etaUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  fareValue: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  surgeText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '700',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: isSmallDevice ? 44 : 48,
    borderRadius: 22,
    marginTop: 6,
    ...BMapElevation.level2,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(isSmallDevice ? 13 : 14),
    fontWeight: '700',
  },
});
