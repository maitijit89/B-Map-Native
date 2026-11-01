import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Navigation2, ShieldCheck, MapPin } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useCompass, useLocation } from '@/shared/hooks';
import { DynamicCompassIcon } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';
import { FluidCurves } from '@/shared/animations';

function getCardinalDirection(deg: number): string {
  const directions = [
    'North',
    'North-Northeast',
    'Northeast',
    'East-Northeast',
    'East',
    'East-Southeast',
    'Southeast',
    'South-Southeast',
    'South',
    'South-Southwest',
    'Southwest',
    'West-Southwest',
    'West',
    'West-Northwest',
    'Northwest',
    'North-Northwest',
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export const GyroCompassHUDModal: React.FC = () => {
  const { heading, pitch, roll, gyroMagnitude, source, accuracy } = useCompass(50, 0.25, true, true);
  const { location } = useLocation(false);
  const [mode, setMode] = useState<'north' | 'heading'>('north');

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const dialSize = Math.min(270, Math.floor(screenWidth * 0.72), Math.floor(screenHeight * 0.32));
  const dialRadius = Math.floor(dialSize / 2);
  const iconSize = Math.min(168, Math.floor(dialSize * 0.62));

  const dialRotation = useSharedValue(0);

  React.useEffect(() => {
    const target = mode === 'north' ? -heading : heading;
    const diff = (((target - dialRotation.value) % 360) + 540) % 360 - 180;
    dialRotation.value = withTiming(dialRotation.value + diff, {
      duration: 160,
      easing: FluidCurves.standard,
    });
  }, [heading, mode, dialRotation]);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));

  const handleClose = () => {
    haptics.light();
    router.back();
  };

  const toggleMode = () => {
    haptics.selection();
    setMode((prev) => (prev === 'north' ? 'heading' : 'north'));
  };

  const formattedHeading = Math.round(heading).toString().padStart(3, '0');
  const cardinal = getCardinalDirection(heading);
  const isLevel = Math.abs(pitch) < 2.0 && Math.abs(roll) < 2.0;

  // Clamped bubble offset (-24 to +24 px inside 72px reticle)
  const bubbleX = Math.max(-24, Math.min(24, roll * 0.8));
  const bubbleY = Math.max(-24, Math.min(24, pitch * 0.8));

  const getProviderName = () => {
    switch (source) {
      case 'location-fused':
        return 'NavIC Fused & 3D Gyroscope';
      case 'device-motion':
        return 'Hardware Gyroscope & Motion Sensor';
      case 'gyroscope':
        return 'Hardware Gyroscope (Live Rad/s)';
      case 'accelerometer':
        return 'Gravity Vector Tilt Sensor';
      case 'magnetometer':
        return 'Magnetometer Azimuth & Gyro Tilt';
      case 'web-orientation':
        return 'Web DeviceOrientation & Gyro';
      default:
        return 'Hardware Gyroscope Active';
    }
  };

  const getAccuracyLabel = () => {
    if (accuracy >= 3) return 'High';
    if (accuracy === 2) return 'Good';
    if (accuracy === 1) return 'Fair';
    return 'Calibrated';
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTag}>B MAP HARDWARE SENSORS</Text>
            <Text style={styles.headerTitle}>3D Gyro Compass HUD</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close compass"
            activeOpacity={0.8}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Central 3D Interactive Gyro Compass */}
          <View style={[styles.centerContainer, { height: dialSize + 20 }]}>
            {/* Rotating Compass Outer Ring */}
            <Animated.View
              style={[
                styles.dialRing,
                { width: dialSize, height: dialSize, borderRadius: dialRadius },
                dialStyle,
              ]}
            >
              <Text style={[styles.dialLabel, styles.northLabel]}>N</Text>
              <Text style={[styles.dialLabel, styles.eastLabel]}>E</Text>
              <Text style={[styles.dialLabel, styles.southLabel]}>S</Text>
              <Text style={[styles.dialLabel, styles.westLabel]}>W</Text>
              {/* Degree ticks */}
              <View style={[styles.tick, { height: dialSize - 20, transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.tick, { height: dialSize - 20, transform: [{ rotate: '135deg' }] }]} />
              <View style={[styles.tick, { height: dialSize - 20, transform: [{ rotate: '225deg' }] }]} />
              <View style={[styles.tick, { height: dialSize - 20, transform: [{ rotate: '315deg' }] }]} />
            </Animated.View>

            {/* Hero 3D Gyro Squircle Icon */}
            <DynamicCompassIcon
              size={iconSize}
              dynamic={true}
              tilt3D={true}
              mode={mode}
              borderRadius={Math.floor(iconSize * 0.25)}
            />
          </View>

          {/* Heading Readout & Cardinal */}
          <View style={styles.metricsContainer}>
            <View style={styles.headingRow}>
              <Text style={styles.headingDigits}>{formattedHeading}</Text>
              <Text style={styles.degreeSymbol}>°</Text>
              <Text style={styles.cardinalBadge}>{cardinal}</Text>
            </View>

            {/* Pitch & Roll Hardware Telematics with Gyro Angular Rate */}
            <View style={styles.telematicsRow}>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>PITCH</Text>
                <Text style={styles.telematicValue}>
                  {pitch > 0 ? '+' : ''}{pitch.toFixed(1)}°
                </Text>
              </View>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>ROLL</Text>
                <Text style={styles.telematicValue}>
                  {roll > 0 ? '+' : ''}{roll.toFixed(1)}°
                </Text>
              </View>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>GYRO RATE</Text>
                <Text style={[styles.telematicValue, { color: '#38BDF8' }]}>
                  {(gyroMagnitude ?? 0.00).toFixed(2)} r/s
                </Text>
              </View>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>ACCURACY</Text>
                <Text style={[styles.telematicValue, { color: '#34D399' }]}>
                  {getAccuracyLabel()}
                </Text>
              </View>
            </View>
          </View>

          {/* 3D Artificial Horizon & Tilt Level Gauge */}
          <View style={styles.horizonGaugeCard}>
            <View style={styles.horizonReticleContainer}>
              <View style={styles.reticleCrosshairH} />
              <View style={styles.reticleCrosshairV} />
              <View style={styles.reticleCenterRing} />
              <View
                style={[
                  styles.horizonBubble,
                  {
                    transform: [{ translateX: bubbleX }, { translateY: bubbleY }],
                    backgroundColor: isLevel ? '#10B981' : '#38BDF8',
                    shadowColor: isLevel ? '#10B981' : '#38BDF8',
                  },
                ]}
              />
            </View>
            <View style={styles.horizonTextColumn}>
              <View style={styles.horizonHeaderRow}>
                <Text style={styles.horizonTitle}>3D Horizon Level</Text>
                <View
                  style={[
                    styles.levelStatusBadge,
                    { backgroundColor: isLevel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelStatusText,
                      { color: isLevel ? '#10B981' : '#38BDF8' },
                    ]}
                  >
                    {isLevel ? 'PERFECT LEVEL' : 'TILT DETECTED'}
                  </Text>
                </View>
              </View>
              <Text style={styles.horizonSubtext}>
                Physical orientation: {Math.abs(pitch).toFixed(1)}° inclination, {Math.abs(roll).toFixed(1)}° bank.
              </Text>
            </View>
          </View>

          {/* Location / Coordinate Badge */}
          {location ? (
            <View style={styles.locationBadge}>
              <MapPin size={14} color="#60A5FA" />
              <Text style={styles.locationText}>
                {location.latitude.toFixed(5)}°N, {location.longitude.toFixed(5)}°E
              </Text>
            </View>
          ) : null}

          {/* Sensor Provider & Toggle Mode */}
          <View style={styles.footerControls}>
            <View style={styles.providerInfo}>
              <ShieldCheck size={14} color="#34D399" />
              <Text style={styles.providerText}>{getProviderName()}</Text>
            </View>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={toggleMode}
              accessibilityRole="button"
              accessibilityLabel={`Switch mode, currently ${mode}`}
              activeOpacity={0.8}
            >
              <Navigation2 size={16} color="#FFFFFF" />
              <Text style={styles.toggleBtnText}>
                {mode === 'north' ? 'Lock Heading' : 'Reset North'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 4,
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialLabel: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '800',
    color: '#93C5FD',
  },
  northLabel: {
    top: 6,
    color: '#EF4444',
  },
  eastLabel: {
    right: 8,
  },
  southLabel: {
    bottom: 6,
  },
  westLabel: {
    left: 8,
  },
  tick: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  headingDigits: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  degreeSymbol: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3B82F6',
  },
  cardinalBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#93C5FD',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  telematicsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  telematicPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  telematicLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  telematicValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  horizonGaugeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    gap: 14,
  },
  horizonReticleContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  reticleCrosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reticleCrosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  reticleCenterRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  horizonBubble: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  horizonTextColumn: {
    flex: 1,
    gap: 4,
  },
  horizonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  levelStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  horizonSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    lineHeight: 15,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
  },
  footerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  providerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default GyroCompassHUDModal;
