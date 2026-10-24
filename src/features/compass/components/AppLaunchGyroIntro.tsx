import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { useCompass } from '@/shared/hooks';
import { DynamicCompassIcon } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

interface AppLaunchGyroIntroProps {
  onDismiss: () => void;
}

export const AppLaunchGyroIntro: React.FC<AppLaunchGyroIntroProps> = ({ onDismiss }) => {
  const { heading, pitch, roll, source } = useCompass(50, 0.2);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    haptics.light();
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  const formattedHeading = Math.round(heading).toString().padStart(3, '0');

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={styles.backdrop}
    >
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={handleDismiss}
      >
        <Animated.View entering={ZoomIn.duration(450)} style={styles.card}>
          <Text style={styles.badge}>B MAP 3D GYRO LIVE</Text>
          <Text style={styles.title}>Hardware Gyroscope Active</Text>
          <Text style={styles.subtitle}>
            Tilt and rotate your device to see live 3D compass orientation.
          </Text>

          {/* Large Hero 3D Gyro Compass with Real-time Tilt */}
          <View style={styles.iconWrapper}>
            <DynamicCompassIcon
              size={120}
              dynamic={true}
              tilt3D={true}
              borderRadius={30}
            />
          </View>

          {/* Heading Live Readout */}
          <View style={styles.headingBadge}>
            <Text style={styles.headingDigits}>{formattedHeading}°</Text>
            <Text style={styles.headingSource}>
              {source === 'location-fused' ? 'GPS Fused' : 'Hardware Gyro'}
            </Text>
          </View>

          <View style={styles.telemetryMiniRow}>
            <Text style={styles.telemetryMiniText}>Pitch: {pitch}°</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.telemetryMiniText}>Roll: {roll}°</Text>
          </View>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreBtnText}>Tap to Explore Map</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 17,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  headingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginTop: 14,
  },
  headingDigits: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  headingSource: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  telemetryMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  telemetryMiniText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  dot: {
    color: '#475569',
    fontSize: 12,
  },
  exploreBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
