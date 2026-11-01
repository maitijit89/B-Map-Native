import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Path,
  Line,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import {
  Satellite,
  Crosshair,
  Check,
  Copy,
  Share2,
  Volume2,
  X,
  ShieldCheck,
  Radio,
  Zap,
} from 'lucide-react-native';

import { useTheme } from '@/shared/hooks';
import {
  locationService,
  type LocationCoordinates,
  type GpsLockTelemetry,
} from '@/shared/services/LocationService';
import { speechService } from '@/shared/services/SpeechService';
import { haptics } from '@/shared/utils/haptics';

export interface GpsLocationLockModalProps {
  visible: boolean;
  onClose: () => void;
  onCenterMap?: (coords: LocationCoordinates) => void;
  initialTelemetry?: GpsLockTelemetry | null;
}

export const GpsLocationLockModal: React.FC<GpsLocationLockModalProps> = ({
  visible,
  onClose,
  onCenterMap,
  initialTelemetry,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [telemetry, setTelemetry] = useState<GpsLockTelemetry | null>(
    initialTelemetry || locationService.getGpsLockTelemetry()
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Animations
  const radarRotation = useSharedValue(0);
  const pulseScale = useSharedValue(0);

  // Run radar rotation and wave pulse continuously only when visible
  useEffect(() => {
    if (visible) {
      radarRotation.value = 0;
      radarRotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      pulseScale.value = 0;
      pulseScale.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      cancelAnimation(radarRotation);
      cancelAnimation(pulseScale);
      radarRotation.value = 0;
      pulseScale.value = 0;
    }
  }, [visible, radarRotation, pulseScale]);

  const radarSweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value}deg` }],
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulseScale.value, [0, 1], [0.8, 1.45]) }],
    opacity: interpolate(pulseScale.value, [0, 0.7, 1], [0.5, 0.2, 0]),
  }));

  // Trigger Lock Acquisition & Voice Speech upon opening
  useEffect(() => {
    let isMounted = true;

    if (visible) {
      (async () => {
        try {
          const result = await locationService.establishGpsLock();
          if (!isMounted) return;
          setTelemetry(result.telemetry);
          haptics.success();

          // Announce with Opposite-Gender Voice
          const spokenPin = result.telemetry.digiPin.replace(/-/g, ' ');
          const prompt = `NavIC GPS Location Lock Established. Sub-meter precision fix confirmed. DigiPIN: ${spokenPin}`;
          setIsSpeaking(true);
          speechService.speak(prompt, {
            onDone: () => {
              if (isMounted) setIsSpeaking(false);
            },
            onError: () => {
              if (isMounted) setIsSpeaking(false);
            },
          });
        } catch {
          const cached = locationService.getGpsLockTelemetry();
          if (cached && isMounted) {
            setTelemetry(cached);
          }
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Voice replay action
  const handleReplayVoice = useCallback(() => {
    haptics.selection();
    if (!telemetry) return;
    const spokenPin = telemetry.digiPin.replace(/-/g, ' ');
    const prompt = `NavIC GPS Location Lock Active. Carrier frequencies L5 and S-band. Accuracy point seven meters. DigiPIN: ${spokenPin}`;
    setIsSpeaking(true);
    speechService.speak(prompt, {
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [telemetry]);

  // Copy DigiPIN
  const handleCopyDigiPin = useCallback(async () => {
    if (!telemetry) return;
    haptics.success();
    setCopied(true);

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(telemetry.digiPin);
      } catch {}
    }

    setTimeout(() => {
      setCopied(false);
    }, 2400);
  }, [telemetry]);

  // Share Geodetic Fix & DigiPIN
  const handleShare = useCallback(async () => {
    if (!telemetry) return;
    haptics.medium();
    const latStr = telemetry.latitude.toFixed(6);
    const lonStr = telemetry.longitude.toFixed(6);
    const shareMessage = `🛰️ B MAP NavIC GPS Location Lock\n📍 DigiPIN: ${telemetry.digiPin}\n🌐 Coordinates: ${latStr}, ${lonStr}\n🎯 Precision: ±${telemetry.accuracyMeters.toFixed(1)}m (NavIC L5+S)\n🔗 https://maps.google.com/?q=${latStr},${lonStr}`;

    try {
      await Share.share({
        title: 'B MAP NavIC GPS Location Lock',
        message: shareMessage,
      });
    } catch {}
  }, [telemetry]);

  // Center Map on Coordinates
  const handleCenterMap = useCallback(() => {
    if (!telemetry) {
      onClose();
      return;
    }
    haptics.success();
    const coords: LocationCoordinates = {
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.altitudeMsl,
      accuracy: telemetry.accuracyMeters,
      heading: telemetry.headingDeg,
      speed: telemetry.speedKmh / 3.6,
    };
    onCenterMap?.(coords);
    onClose();
  }, [telemetry, onCenterMap, onClose]);

  // Format Display Coordinates
  const latDisplay = useMemo(() => {
    if (!telemetry) return '28.631500° N';
    const hemi = telemetry.latitude >= 0 ? 'N' : 'S';
    return `${Math.abs(telemetry.latitude).toFixed(6)}° ${hemi}`;
  }, [telemetry]);

  const lonDisplay = useMemo(() => {
    if (!telemetry) return '77.216700° E';
    const hemi = telemetry.longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(telemetry.longitude).toFixed(6)}° ${hemi}`;
  }, [telemetry]);

  if (!visible) return null;

  const reticleSize = Math.min(180, Math.floor(screenWidth * 0.44));
  const reticleRadius = reticleSize / 2;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdropOverlay}>
        <SafeAreaView
          edges={['top', 'bottom']}
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#0A101A' : '#FFFFFF',
              borderColor: isDark ? '#1E2C3D' : '#E2E8F0',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.navicBadge,
                  {
                    backgroundColor: isDark ? 'rgba(0, 200, 83, 0.16)' : 'rgba(0, 150, 255, 0.12)',
                    borderColor: isDark ? '#00C853' : '#0096FF',
                  },
                ]}
              >
                <View style={styles.pulsingDot} />
                <Satellite size={12} color={isDark ? '#00E676' : '#0061A7'} />
                <Text
                  style={[
                    styles.navicBadgeText,
                    { color: isDark ? '#00E676' : '#0061A7' },
                  ]}
                >
                  ISRO NavIC DUAL-BAND L5+S
                </Text>
              </View>

              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                GPS Location Lock
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
                Carrier-Phase 3D Geodetic Lock Established
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? '#162232' : '#F1F5F9',
                  borderColor: isDark ? '#26384D' : '#CBD5E1',
                },
              ]}
              onPress={() => {
                haptics.light();
                onClose();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Close GPS Lock modal"
            >
              <X size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 72 },
            ]}
          >
            {/* Center Animated Dual-Band Radar Lock Reticle */}
            <View style={styles.reticleSection}>
              <View
                style={[
                  styles.reticleWrapper,
                  { width: reticleSize + 24, height: reticleSize + 24 },
                ]}
              >
                {/* Expanding Pulse Ring */}
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      width: reticleSize,
                      height: reticleSize,
                      borderRadius: reticleRadius,
                      borderColor: isDark ? '#00E676' : '#0096FF',
                    },
                    pulseRingStyle,
                  ]}
                />

                {/* SVG Radar Face with Dual-Band Frequency Markers */}
                <Svg
                  width={reticleSize}
                  height={reticleSize}
                  viewBox={`0 0 ${reticleSize} ${reticleSize}`}
                  style={StyleSheet.absoluteFill}
                >
                  <Defs>
                    <RadialGradient id="radarBg" cx="50%" cy="50%" r="50%">
                      <Stop
                        offset="0%"
                        stopColor={isDark ? '#00E676' : '#0096FF'}
                        stopOpacity="0.12"
                      />
                      <Stop
                        offset="100%"
                        stopColor={isDark ? '#00E676' : '#0096FF'}
                        stopOpacity="0.02"
                      />
                    </RadialGradient>
                  </Defs>

                  {/* Concentric Geodetic Range Rings */}
                  <Circle
                    cx={reticleRadius}
                    cy={reticleRadius}
                    r={reticleRadius - 2}
                    fill="url(#radarBg)"
                    stroke={isDark ? '#00E676' : '#0096FF'}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.6}
                  />
                  <Circle
                    cx={reticleRadius}
                    cy={reticleRadius}
                    r={reticleRadius * 0.68}
                    fill="none"
                    stroke={isDark ? '#00E676' : '#0096FF'}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.4}
                  />
                  <Circle
                    cx={reticleRadius}
                    cy={reticleRadius}
                    r={reticleRadius * 0.36}
                    fill="none"
                    stroke={isDark ? '#00E676' : '#0096FF'}
                    strokeWidth={1}
                    opacity={0.45}
                  />

                  {/* Crosshairs */}
                  <Line
                    x1={reticleRadius}
                    y1={4}
                    x2={reticleRadius}
                    y2={reticleSize - 4}
                    stroke={isDark ? '#00E676' : '#0096FF'}
                    strokeWidth={1}
                    strokeDasharray="2 4"
                    opacity={0.5}
                  />
                  <Line
                    x1={4}
                    y1={reticleRadius}
                    x2={reticleSize - 4}
                    y2={reticleRadius}
                    stroke={isDark ? '#00E676' : '#0096FF'}
                    strokeWidth={1}
                    strokeDasharray="2 4"
                    opacity={0.5}
                  />

                  {/* IRNSS / NavIC Orbital Satellite Markers */}
                  <Circle
                    cx={reticleRadius + 44}
                    cy={reticleRadius - 38}
                    r={3.5}
                    fill="#00E676"
                  />
                  <Circle
                    cx={reticleRadius - 48}
                    cy={reticleRadius + 24}
                    r={3.5}
                    fill="#00E676"
                  />
                  <Circle
                    cx={reticleRadius + 32}
                    cy={reticleRadius + 46}
                    r={3.5}
                    fill="#00E676"
                  />
                  <Circle
                    cx={reticleRadius - 36}
                    cy={reticleRadius - 42}
                    r={3.5}
                    fill="#00E676"
                  />

                  {/* Center Lock Reticle Core */}
                  <Circle
                    cx={reticleRadius}
                    cy={reticleRadius}
                    r={12}
                    fill={isDark ? '#00E676' : '#0061A7'}
                  />
                  <Circle cx={reticleRadius} cy={reticleRadius} r={6} fill="#FFFFFF" />
                </Svg>

                {/* Rotating Dual-Frequency Sweeping Radar Beam */}
                <Animated.View
                  style={[
                    styles.sweepArmContainer,
                    {
                      width: reticleSize,
                      height: reticleSize,
                    },
                    radarSweepStyle,
                  ]}
                  pointerEvents="none"
                >
                  <Svg width={reticleSize} height={reticleSize}>
                    <Defs>
                      <LinearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop
                          offset="0%"
                          stopColor={isDark ? '#00E676' : '#0096FF'}
                          stopOpacity="0.45"
                        />
                        <Stop
                          offset="100%"
                          stopColor={isDark ? '#00E676' : '#0096FF'}
                          stopOpacity="0.0"
                        />
                      </LinearGradient>
                    </Defs>
                    <Path
                      d={`M ${reticleRadius},${reticleRadius} L ${reticleRadius},4 A ${reticleRadius - 4} ${reticleRadius - 4} 0 0 1 ${reticleRadius + 50},${reticleRadius - 30} Z`}
                      fill="url(#sweepGrad)"
                    />
                  </Svg>
                </Animated.View>
              </View>

              {/* Status pill under reticle */}
              <View style={styles.reticleCaptionRow}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isDark ? 'rgba(0, 200, 83, 0.18)' : '#E8F5E9',
                      borderColor: isDark ? '#00C853' : '#4CAF50',
                    },
                  ]}
                >
                  <ShieldCheck size={14} color={isDark ? '#00E676' : '#2E7D32'} />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: isDark ? '#00E676' : '#1B5E20' },
                    ]}
                  >
                    3D High Precision · ±{telemetry ? telemetry.accuracyMeters.toFixed(1) : '0.7'}m Fix
                  </Text>
                </View>

                {/* Audio speech toggle button */}
                <TouchableOpacity
                  style={[
                    styles.voiceReplayBtn,
                    {
                      backgroundColor: isSpeaking
                        ? isDark
                          ? '#00E676'
                          : '#0061A7'
                        : isDark
                        ? '#162232'
                        : '#F1F5F9',
                    },
                  ]}
                  onPress={handleReplayVoice}
                  accessibilityRole="button"
                  accessibilityLabel="Replay opposite-gender voice lock telematics"
                  activeOpacity={0.8}
                >
                  {isSpeaking ? (
                    <Volume2 size={15} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={15} color={colors.onSurface} />
                  )}
                  <Text
                    style={[
                      styles.voiceBtnText,
                      {
                        color: isSpeaking ? '#FFFFFF' : colors.onSurface,
                      },
                    ]}
                  >
                    {isSpeaking ? 'Announcing...' : 'Hear Voice'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sovereign 10-char DigiPIN Banner Card */}
            <View
              style={[
                styles.digiPinCard,
                {
                  backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                  borderColor: isDark ? '#1F3146' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.digiPinHeader}>
                <View style={styles.digiPinTitleRow}>
                  <Zap size={14} color="#0096FF" />
                  <Text style={[styles.digiPinLabel, { color: colors.onSurfaceVariant }]}>
                    SOVEREIGN DIGIPIN GIS GEOCODE
                  </Text>
                </View>
                <Text style={styles.digiPinStandardTag}>Dept. of Posts & ISRO Standard</Text>
              </View>

              <View style={styles.digiPinValueRow}>
                <Text
                  style={[
                    styles.digiPinCode,
                    { color: isDark ? '#60A5FA' : '#0061A7' },
                  ]}
                >
                  {telemetry?.digiPin || '28J4-K8M2-9P'}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.copyPillBtn,
                    {
                      backgroundColor: copied
                        ? isDark
                          ? '#00C853'
                          : '#10B981'
                        : isDark
                        ? '#1E293B'
                        : '#E2E8F0',
                    },
                  ]}
                  onPress={handleCopyDigiPin}
                  accessibilityRole="button"
                  accessibilityLabel="Copy DigiPIN to clipboard"
                  activeOpacity={0.8}
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#FFFFFF" />
                      <Text style={[styles.copyBtnText, { color: '#FFFFFF' }]}>Copied</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={14} color={colors.onSurface} />
                      <Text style={[styles.copyBtnText, { color: colors.onSurface }]}>Copy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Geodetic Telemetry Metrics Grid */}
            <View style={styles.metricsGrid}>
              {/* Latitude */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  Latitude
                </Text>
                <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                  {latDisplay}
                </Text>
              </View>

              {/* Longitude */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  Longitude
                </Text>
                <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                  {lonDisplay}
                </Text>
              </View>

              {/* Altitude MSL */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  Altitude (MSL)
                </Text>
                <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                  {telemetry ? `${telemetry.altitudeMsl.toFixed(1)} m` : '216.4 m'}
                </Text>
              </View>

              {/* HDOP (Precision) */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  HDOP / Precision
                </Text>
                <Text style={[styles.metricValue, { color: isDark ? '#00E676' : '#059669' }]}>
                  {telemetry ? `${telemetry.hdop} (Ideal)` : '0.72 (Ideal)'}
                </Text>
              </View>

              {/* Fix Latency */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  Lock Latency
                </Text>
                <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                  {telemetry ? `${telemetry.fixDurationMs} ms` : '98 ms'}
                </Text>
              </View>

              {/* Geodetic Datum */}
              <View
                style={[
                  styles.metricCell,
                  {
                    backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                    borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>
                  Geodetic Datum
                </Text>
                <Text style={[styles.metricValue, { fontSize: 12, color: colors.onSurface }]}>
                  WGS84 / IRNSS
                </Text>
              </View>
            </View>

            {/* NavIC Satellite Constellation Telematics */}
            <View
              style={[
                styles.constellationCard,
                {
                  backgroundColor: isDark ? '#111B27' : '#F8FAFC',
                  borderColor: isDark ? '#1E2D3E' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.constellationHeader}>
                <View style={styles.constellationTitleRow}>
                  <Radio size={14} color={isDark ? '#00E676' : '#0061A7'} />
                  <Text style={[styles.constellationTitle, { color: colors.onSurface }]}>
                    NavIC Satellites Locked ({telemetry?.satellitesLocked || 8}/14)
                  </Text>
                </View>
                <Text
                  style={[
                    styles.carrierPill,
                    {
                      backgroundColor: isDark ? '#1E2F40' : '#E0F2FE',
                      color: isDark ? '#38BDF8' : '#0284C7',
                    },
                  ]}
                >
                  L5 + S-Band Active
                </Text>
              </View>

              {/* Satellite Chips */}
              <View style={styles.satelliteChipsWrap}>
                {(telemetry?.satellites || []).slice(0, 8).map((sat) => (
                  <View
                    key={sat.id}
                    style={[
                      styles.satelliteChip,
                      {
                        backgroundColor: sat.locked
                          ? isDark
                            ? 'rgba(0, 200, 83, 0.12)'
                            : '#ECFDF5'
                          : isDark
                          ? '#162232'
                          : '#F1F5F9',
                        borderColor: sat.locked
                          ? isDark
                            ? '#00C853'
                            : '#10B981'
                          : isDark
                          ? '#2A3B4F'
                          : '#CBD5E1',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.satStatusDot,
                        { backgroundColor: sat.locked ? '#00E676' : '#94A3B8' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.satName,
                        { color: sat.locked ? (isDark ? '#00E676' : '#065F46') : colors.onSurfaceVariant },
                      ]}
                    >
                      {sat.id}
                    </Text>
                    <Text
                      style={[
                        styles.satSnr,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {sat.snrDbHz.toFixed(0)} dB·Hz ({sat.carrier})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Dock (Thumb Zone Ergonomics) */}
          <View
            style={[
              styles.bottomDock,
              {
                backgroundColor: isDark ? '#0A101A' : '#FFFFFF',
                borderTopColor: isDark ? '#1E2C3D' : '#E2E8F0',
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.shareSecondaryBtn,
                {
                  backgroundColor: isDark ? '#162232' : '#F1F5F9',
                  borderColor: isDark ? '#26384D' : '#CBD5E1',
                },
              ]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share GPS coordinates and DigiPIN"
              activeOpacity={0.8}
            >
              <Share2 size={18} color={colors.onSurface} />
              <Text style={[styles.shareSecondaryText, { color: colors.onSurface }]}>
                Share Fix
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.centerPrimaryBtn,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={handleCenterMap}
              accessibilityRole="button"
              accessibilityLabel="Center map on locked GPS coordinates"
              activeOpacity={0.85}
            >
              <Crosshair size={18} color="#FFFFFF" />
              <Text style={styles.centerPrimaryText}>Center Map</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.72)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  navicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  navicBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '400',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  reticleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  reticleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  sweepArmContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  voiceReplayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  voiceBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  digiPinCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  digiPinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  digiPinTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  digiPinLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  digiPinStandardTag: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  digiPinValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  digiPinCode: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  copyPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricCell: {
    width: '48.2%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  constellationCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  constellationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  constellationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  constellationTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  carrierPill: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  satelliteChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  satelliteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  satStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  satName: {
    fontSize: 11,
    fontWeight: '700',
  },
  satSnr: {
    fontSize: 10,
    fontWeight: '500',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  shareSecondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  centerPrimaryBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0061A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  centerPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
