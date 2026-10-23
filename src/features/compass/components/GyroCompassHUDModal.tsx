import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Compass, Navigation2, ShieldCheck, MapPin } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useCompass, useLocation } from '@/shared/hooks';
import { DynamicCompassIcon } from '@/shared/components/ui';

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

  const dialRotation = useSharedValue(0);

  React.useEffect(() => {
    const target = mode === 'north' ? -heading : heading;
    const diff = (((target - dialRotation.value) % 360) + 540) % 360 - 180;
    dialRotation.value = withSpring(dialRotation.value + diff, {
      damping: 20,
      stiffness: 140,
    });
  }, [heading, mode, dialRotation]);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleClose = () => {
    triggerHaptic();
    router.back();
  };

  const toggleMode = () => {
    triggerHaptic();
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

        {/* Central 3D Interactive Gyro Compass */}
        <View style={styles.centerContainer}>
          {/* Rotating Compass Outer Ring */}
          <Animated.View style={[styles.dialRing, dialStyle]}>
            <Text style={[styles.dialLabel, styles.northLabel]}>N</Text>
            <Text style={[styles.dialLabel, styles.eastLabel]}>E</Text>
            <Text style={[styles.dialLabel, styles.southLabel]}>S</Text>
            <Text style={[styles.dialLabel, styles.westLabel]}>W</Text>
            {/* Degree ticks */}
            <View style={[styles.tick, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.tick, { transform: [{ rotate: '135deg' }] }]} />
            <View style={[styles.tick, { transform: [{ rotate: '225deg' }] }]} />
            <View style={[styles.tick, { transform: [{ rotate: '315deg' }] }]} />
          </Animated.View>

          {/* Hero 3D Gyro Squircle Icon */}
          <DynamicCompassIcon
            size={168}
            dynamic={true}
            tilt3D={true}
            mode={mode}
            borderRadius={42}
          />
        </View>

        {/* Heading Digital Readout */}
        <View style={styles.metricsContainer}>
          <View style={styles.headingRow}>
            <Text style={styles.headingDigits}>{formattedHeading}°</Text>
            <Text style={styles.headingUnit}>MAG</Text>
          </View>
          <Text style={styles.cardinalText}>{cardinal}</Text>

          {/* Attitude / Gyro Telemetry Pills */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryPill}>
              <Text style={styles.telemetryLabel}>Pitch</Text>
              <Text style={styles.telemetryVal}>{pitch > 0 ? `+${pitch}°` : `${pitch}°`}</Text>
            </View>
            <View style={styles.telemetryPill}>
              <Text style={styles.telemetryLabel}>Roll</Text>
              <Text style={styles.telemetryVal}>{roll > 0 ? `+${roll}°` : `${roll}°`}</Text>
            </View>
            <View style={styles.telemetryPill}>
              <Text style={styles.telemetryLabel}>Accuracy</Text>
              <Text style={styles.telemetryVal}>{accuracy > 0 ? `${accuracy}/3 High` : 'Fused'}</Text>
            </View>
          </View>

          {/* Location & GPS Fix */}
          <View style={styles.locationPill}>
            <MapPin size={14} color="#60A5FA" />
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </Text>
            <View style={styles.statusDot} />
            <ShieldCheck size={14} color="#34D399" />
            <Text style={styles.sensorSourceText}>
              {source === 'location-fused' ? 'GPS + Gyro Fused' : 'Hardware Gyro'}
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.modeToggleBtn}
            onPress={toggleMode}
            activeOpacity={0.8}
          >
            {mode === 'north' ? (
              <Compass size={18} color="#93C5FD" />
            ) : (
              <Navigation2 size={18} color="#93C5FD" />
            )}
            <Text style={styles.modeToggleText}>
              Mode: {mode === 'north' ? 'Point to True North' : 'Direction of Travel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Explore Live Map</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
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
    height: 290,
  },
  dialRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
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
    height: 250,
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
    letterSpacing: -1,
  },
  headingUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B82F6',
  },
  cardinalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93C5FD',
    marginTop: -4,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  telemetryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  telemetryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginHorizontal: 2,
  },
  sensorSourceText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
  },
  footer: {
    gap: 12,
    paddingBottom: 16,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  modeToggleText: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
