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
  const { heading, pitch, roll, source, accuracy } = useCompass(50, 0.25);
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

            {/* Pitch & Roll Hardware Telematics */}
            <View style={styles.telematicsRow}>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>PITCH</Text>
                <Text style={styles.telematicValue}>{pitch.toFixed(1)}°</Text>
              </View>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>ROLL</Text>
                <Text style={styles.telematicValue}>{roll.toFixed(1)}°</Text>
              </View>
              <View style={styles.telematicPill}>
                <Text style={styles.telematicLabel}>ACCURACY</Text>
                <Text style={styles.telematicValue}>{accuracy}</Text>
              </View>
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
              <Text style={styles.providerText}>
                {source !== 'none' ? 'Fused Magnetometer & Gyro' : 'Fallback Direction'}
              </Text>
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
