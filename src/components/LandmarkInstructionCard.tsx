import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapElevation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import type { LandmarkInstruction } from '@/types';

/** Icon config for each maneuver type */
const MANEUVER_ICONS: Record<LandmarkInstruction['maneuverType'], keyof typeof Ionicons.glyphMap> = {
  'turn-left': 'arrow-back',
  'turn-right': 'arrow-forward',
  'keep-left': 'return-down-back',
  'keep-right': 'return-down-forward',
  'u-turn': 'return-up-back',
  straight: 'arrow-up',
  roundabout: 'sync-circle-outline',
  merge: 'git-merge-outline',
};

/** Icon for landmark types */
const LANDMARK_TYPE_ICONS: Record<NonNullable<LandmarkInstruction['landmarkType']>, {
  icon: string;
  family: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
}> = {
  bank: { icon: 'bank', family: 'MaterialCommunityIcons', color: '#1565C0' },
  temple: { icon: 'church', family: 'MaterialCommunityIcons', color: '#E65100' },
  'petrol-pump': { icon: 'gas-station', family: 'MaterialCommunityIcons', color: '#C62828' },
  hospital: { icon: 'hospital-box', family: 'MaterialCommunityIcons', color: '#EF4444' },
  school: { icon: 'school', family: 'MaterialCommunityIcons', color: '#7C3AED' },
  signal: { icon: 'traffic-light', family: 'MaterialCommunityIcons', color: '#D97706' },
  flyover: { icon: 'bridge', family: 'MaterialCommunityIcons', color: '#64748B' },
  'metro-station': { icon: 'train-variant', family: 'MaterialCommunityIcons', color: '#0284C7' },
  market: { icon: 'storefront-outline', family: 'MaterialCommunityIcons', color: '#059669' },
  monument: { icon: 'account-group', family: 'MaterialCommunityIcons', color: '#92400E' },
};

interface LandmarkInstructionCardProps {
  /** The navigation instruction data */
  instruction: LandmarkInstruction;
  /** Whether this is the active/current instruction (shows pulsing animation) */
  isActive?: boolean;
}

/**
 * LandmarkInstructionCard — Turn-by-turn card with Indian landmark context.
 *
 * Shows maneuver direction, distance, street name, and a contextual landmark
 * reference (e.g., "Turn left after the HDFC Bank"). The landmark name is
 * bold with a small type icon for quick visual recognition.
 */
export function LandmarkInstructionCard({
  instruction,
  isActive = true,
}: LandmarkInstructionCardProps) {

  // Pulse animation for active instruction
  const pulseAnim = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      pulseAnim.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isActive, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.88, 1]),
    transform: [{ scale: interpolate(pulseAnim.value, [0, 1], [0.97, 1.02]) }],
  }));

  const maneuverIcon = MANEUVER_ICONS[instruction.maneuverType] || 'arrow-up';

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters}m`;
  };

  const buildInstructionText = () => {
    const maneuverLabels: Record<LandmarkInstruction['maneuverType'], string> = {
      'turn-left': 'Turn Left',
      'turn-right': 'Turn Right',
      'keep-left': 'Keep Left',
      'keep-right': 'Keep Right',
      'u-turn': 'U-Turn',
      straight: 'Continue Straight',
      roundabout: 'Take Roundabout',
      merge: 'Merge',
    };
    return maneuverLabels[instruction.maneuverType] || 'Continue';
  };

  const landmarkConfig = instruction.landmarkType
    ? LANDMARK_TYPE_ICONS[instruction.landmarkType]
    : null;

  const renderLandmarkIcon = () => {
    if (!landmarkConfig) return null;

    if (landmarkConfig.family === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons
          name={landmarkConfig.icon as any}
          size={14}
          color={landmarkConfig.color}
        />
      );
    }
    return (
      <Ionicons
        name={landmarkConfig.icon as any}
        size={14}
        color={landmarkConfig.color}
      />
    );
  };

  return (
    <Animated.View
      style={[styles.container, isActive && pulseStyle]}
      accessibilityRole="alert"
      accessibilityLabel={`In ${formatDistance(instruction.distanceMeters)}, ${buildInstructionText()} on ${instruction.streetName}${instruction.landmarkName ? `, ${instruction.afterOrBefore} ${instruction.landmarkName}` : ''}`}
    >
      {/* Maneuver direction icon */}
      <View style={styles.iconBox}>
        <Ionicons name={maneuverIcon} size={isSmallDevice ? 30 : 36} color="#FFFFFF" />
      </View>

      {/* Text cluster */}
      <View style={styles.textColumn}>
        {/* Distance */}
        <Text style={styles.distanceText}>
          In {formatDistance(instruction.distanceMeters)}
        </Text>

        {/* Maneuver + street */}
        <Text style={styles.maneuverText} numberOfLines={1}>
          {buildInstructionText()} on{' '}
          <Text style={styles.streetName}>{instruction.streetName}</Text>
        </Text>

        {/* Landmark reference */}
        {instruction.landmarkName && (
          <View style={styles.landmarkRow}>
            {renderLandmarkIcon()}
            <Text style={styles.landmarkText} numberOfLines={1}>
              {instruction.afterOrBefore === 'after' && 'After '}
              {instruction.afterOrBefore === 'before' && 'Before '}
              {instruction.afterOrBefore === 'at' && 'At '}
              <Text style={styles.landmarkName}>{instruction.landmarkName}</Text>
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#004D40',
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    borderWidth: 1.5,
    borderColor: '#00BFA5',
    ...BMapElevation.hud,
  },
  iconBox: {
    width: isSmallDevice ? 46 : 56,
    height: isSmallDevice ? 46 : 56,
    borderRadius: isSmallDevice ? 23 : 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: moderateScale(isSmallDevice ? 18 : 24),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  maneuverText: {
    color: '#E0F2F1',
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
    fontWeight: '500',
  },
  streetName: {
    fontWeight: '700',
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  landmarkText: {
    color: '#B2DFDB',
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    fontWeight: '500',
  },
  landmarkName: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
