import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { BMapView, BMapPolylineItem } from '@/components/BMapView';
import { LandmarkInstructionCard } from '@/components/LandmarkInstructionCard';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import type { LandmarkInstruction, LatLng } from '@/types';
import {
  SupportedLanguage,
  VERNACULAR_ALERTS,
  playVernacularAlert,
  speakText,
} from '@/services/voiceGuidance';
import { isSmallDevice } from '@/utils/responsive';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';
import { useNavigationEngine } from '@/hooks/useNavigationEngine';
import { IndianEcosystemAPI } from '@/api/api';
import { RoadHazard, RouteResponse } from '@/api/types';
import { useTelemetry } from '@/services/telemetry';

function decodePolyline(encoded: string): LatLng[] {
  if (!encoded) return [];
  const points: LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export default function LiveNavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
    durationMinutes?: string;
    distanceKm?: string;
    destTitle?: string;
    overviewPolyline?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeSpeechBanner, setActiveSpeechBanner] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [aheadHazards, setAheadHazards] = useState<RoadHazard[]>([]);

  const telemetry = useTelemetry(); // Reactive — updates every GPS poll cycle

  // Initial Route Model for Navigation Engine
  const initialRoute: RouteResponse = useMemo(() => {
    return {
      summary: params.routeName || 'NH-48 Expressway Corridor',
      distance_meters: parseFloat(params.distanceKm || '24.2') * 1000,
      duration_seconds: parseInt(params.durationMinutes || '38', 10) * 60,
      overview_polyline: params.overviewPolyline || '',
      bounds: {
        northeast: { latitude: 28.6139, longitude: 77.2295 },
        southwest: { latitude: 28.4907, longitude: 77.0891 },
      },
      steps: [
        {
          instruction: 'Proceed onto NH-48 towards Gurugram Toll Plaza',
          maneuver: 'depart',
          distance_meters: 650,
          duration_seconds: 50,
          start_location: { latitude: 28.6139, longitude: 77.2090 },
          end_location: { latitude: 28.6089, longitude: 77.2030 },
          road_name: 'NH-48 Corridor',
        },
      ],
    };
  }, [params.routeName, params.distanceKm, params.durationMinutes, params.overviewPolyline]);

  const [currentInstruction, setCurrentInstruction] = useState<LandmarkInstruction>({
    maneuverType: 'turn-right',
    distanceMeters: 650,
    streetName: params.routeName || 'NH-48 Expressway Corridor',
    landmarkName: 'Upcoming Junction',
    landmarkType: 'flyover',
    afterOrBefore: 'after',
  });

  // Use Live Navigation Heartbeat Loop Hook
  const {
    activeRoute,
    remainingDistance,
    remainingDuration,
  } = useNavigationEngine({
    route: initialRoute,
    isNavigating: true,
    userLocation: { latitude: telemetry.latitude, longitude: telemetry.longitude },
    mode: 'driving',
    onStepChange: (step) => {
      setCurrentInstruction({
        maneuverType:
          step.maneuver.includes('left')
            ? 'turn-left'
            : step.maneuver.includes('right')
            ? 'turn-right'
            : step.maneuver === 'u_turn'
            ? 'u-turn'
            : 'straight',
        distanceMeters: step.distance_meters,
        streetName: step.road_name || step.instruction,
        landmarkName: step.road_name || 'Highway Corridor',
        landmarkType: 'flyover',
        afterOrBefore: 'after',
      });
      speakText(step.instruction, selectedLang);
    },
    onReroute: () => {
      playVernacularAlert(selectedLang, 'hazard');
    },
  });

  // Query live hazards along highway corridor
  useEffect(() => {
    let isMounted = true;
    const fetchHazards = async () => {
      try {
        const res = await IndianEcosystemAPI.getAheadHazards(telemetry.latitude, telemetry.longitude, 1500);
        if (isMounted && res.data?.data?.hazards) {
          setAheadHazards(res.data.data.hazards);
        }
      } catch {}
    };

    fetchHazards();
    const interval = setInterval(fetchHazards, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [telemetry.latitude, telemetry.longitude]);

  // Decoded polyline
  const polylines: BMapPolylineItem[] = useMemo(() => {
    const raw = activeRoute?.overview_polyline || params.overviewPolyline;
    if (raw) {
      const decoded = decodePolyline(raw);
      if (decoded.length > 0) {
        return [{ coordinates: decoded, strokeColor: BMapColors.primary, strokeWidth: 6 }];
      }
    }
    return [
      {
        coordinates: [
          { latitude: 28.6139, longitude: 77.2090 },
          { latitude: 28.4952, longitude: 77.0891 },
        ],
        strokeColor: BMapColors.primary,
        strokeWidth: 6,
      },
    ];
  }, [activeRoute?.overview_polyline, params.overviewPolyline]);

  const remainingKm = Math.max(0.1, Math.round((remainingDistance / 1000) * 10) / 10);
  const remainingMinutes = Math.max(1, Math.round(remainingDuration / 60));
  const speedKmh = telemetry.speedKmh; // Live GPS-driven speed

  const etaClock = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + remainingMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [remainingMinutes]);

  const triggerVoiceGuidance = useCallback((alertType: 'maneuver' | 'hazard' | 'glosa') => {
    const prompt = playVernacularAlert(selectedLang, alertType);
    setActiveSpeechBanner(prompt);
    setTimeout(() => {
      setActiveSpeechBanner(null);
    }, 4500);
  }, [selectedLang]);

  const handleEndTrip = () => {
    Alert.alert('End Trip', 'Are you sure you want to end navigation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Navigation',
        style: 'destructive',
        onPress: () => router.replace('/(tabs)' as any),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Background Interactive Map in HUD mode with live polyline */}
      <BMapView
        mapStyleType={isDark ? 'dark' : 'daylight'}
        polylines={polylines}
      />

      {/* Top Navigation HUD Directional Banner */}
      <SafeAreaView style={styles.topHUD} edges={['top']}>
        {/* Landmark-Aware Turn-by-Turn Instruction Card */}
        <FadeInView delay={100} direction="down">
          <View style={styles.instructionRow}>
            <View style={{ flex: 1 }}>
              <LandmarkInstructionCard instruction={currentInstruction} isActive />
            </View>
            {/* Quick Audio Play Button */}
            <AnimatedPressable
              onPress={() => triggerVoiceGuidance('maneuver')}
              scaleTo={0.9}
              style={styles.speakerButton}
            >
              <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            </AnimatedPressable>
          </View>
        </FadeInView>

        {/* Offline Status Indicator */}
        <FadeInView delay={150} direction="left">
          <OfflineIndicator isOnline={isOnline} onPress={() => setIsOnline(prev => !prev)} />
        </FadeInView>

        {/* Dynamic Vernacular Voice Speech Overlay Bar */}
        {activeSpeechBanner && (
          <FadeInView delay={0} direction="down">
            <View style={styles.speechBubbleBanner}>
              <Ionicons name="mic" size={18} color="#FF6F00" />
              <Text style={styles.speechText} numberOfLines={2}>
                "{activeSpeechBanner}"
              </Text>
            </View>
          </FadeInView>
        )}

        {/* Dynamic Warning Chips: Hazard 500m & GLOSA Green Wave */}
        <View style={styles.warningChipsStack}>
          {/* Upcoming Hazard Chip */}
          <FadeInView delay={250} direction="left">
            <AnimatedPressable
              onPress={() => triggerVoiceGuidance('hazard')}
              scaleTo={0.96}
              style={[styles.warningChip, styles.hazardChip]}
            >
              <Ionicons name="warning" size={16} color="#FFFFFF" />
              <Text style={styles.warningChipText}>
                {aheadHazards.length > 0
                  ? `Upcoming: ${aheadHazards[0].description || aheadHazards[0].voice_prompt}`
                  : 'Upcoming Alert: All clear ahead on corridor'}
              </Text>
            </AnimatedPressable>
          </FadeInView>

          {/* GLOSA Green Wave Advisory */}
          <FadeInView delay={350} direction="left">
            <AnimatedPressable
              onPress={() => triggerVoiceGuidance('glosa')}
              scaleTo={0.96}
              style={[styles.warningChip, styles.glosaChip]}
            >
              <Ionicons name="speedometer" size={16} color="#FFFFFF" />
              <Text style={styles.warningChipText}>
                GLOSA Speed: Maintain 45 km/h for Green Signal
              </Text>
            </AnimatedPressable>
          </FadeInView>
        </View>
      </SafeAreaView>

      {/* Floating Vernacular Voice Controls & Speedometer */}
      <View style={styles.midControlsContainer} pointerEvents="box-none">
        {/* Speedometer Widget */}
        <FadeInView delay={300} direction="right">
          <View style={[styles.speedometerCard, { backgroundColor: isDark ? '#111E2E' : '#FFFFFF' }]}>
            <Text style={[styles.speedNumber, { color: speedKmh > 80 ? BMapColors.emergencyRed : colors.text }]}>{speedKmh}</Text>
            <Text style={[styles.speedUnit, { color: colors.textSecondary }]}>KM/H</Text>
            <View style={[styles.speedLimitPill, { backgroundColor: speedKmh > 80 ? BMapColors.emergencyRed : '#1E293B' }]}>
              <Text style={styles.speedLimitText}>LIMIT {activeRoute?.steps?.[0] ? '60' : '60'}</Text>
            </View>
          </View>
        </FadeInView>

        {/* Voice Language Selector FAB */}
        <FadeInView delay={400} direction="left">
          <AnimatedPressable
            onPress={() => setIsVoiceModalOpen(true)}
            scaleTo={0.92}
            style={[styles.voiceFab, { backgroundColor: BMapColors.primary }]}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.voiceFabText}>{selectedLang.toUpperCase()}</Text>
          </AnimatedPressable>
        </FadeInView>
      </View>

      {/* Bottom Floating ETA Bar */}
      <SafeAreaView style={styles.bottomBarContainer} edges={['bottom']}>
        <FadeInView delay={200} direction="up">
          <View
            style={[
              styles.bottomEtaCard,
              {
                backgroundColor: isDark ? '#16222F' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.etaInfoCluster}>
              <Text style={[styles.timeRemaining, { color: BMapColors.secondary }]}>
                {remainingMinutes} <Text style={styles.minUnit}>min</Text>
              </Text>
              <View style={styles.subMetaRow}>
                <Text style={[styles.etaClock, { color: colors.textSecondary }]}>
                  ETA {etaClock}
                </Text>
                <Text style={[styles.dotSep, { color: colors.textSecondary }]}>•</Text>
                <Text style={[styles.distanceRemain, { color: colors.textSecondary }]}>
                  {remainingKm} km
                </Text>
              </View>
            </View>

            {/* Red End Trip Button */}
            <AnimatedPressable
              onPress={handleEndTrip}
              scaleTo={0.94}
              style={styles.endTripBtn}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.endTripText}>End Trip</Text>
            </AnimatedPressable>
          </View>
        </FadeInView>
      </SafeAreaView>

      {/* Regional Vernacular Language Modal */}
      <Modal
        visible={isVoiceModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVoiceModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <FadeInView delay={0} direction="up">
            <View style={[styles.langCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.langTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                Regional Vernacular Voice
              </Text>
              <Text style={[styles.langSubtitle, { color: colors.textSecondary }]}>
                Select voice prompt dialect for navigation and hazard alerts
              </Text>

              <View style={styles.langList}>
                {(Object.keys(VERNACULAR_ALERTS) as SupportedLanguage[]).map(langKey => {
                  const lang = VERNACULAR_ALERTS[langKey];
                  const isSelected = selectedLang === langKey;
                  return (
                    <AnimatedPressable
                      key={langKey}
                      onPress={() => {
                        setSelectedLang(langKey);
                        setIsVoiceModalOpen(false);
                        triggerVoiceGuidance('maneuver');
                      }}
                      scaleTo={0.97}
                      style={[
                        styles.langOption,
                        {
                          backgroundColor: isSelected ? BMapColors.primary : colors.surfaceVariant,
                          borderColor: isSelected ? BMapColors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.langName, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {lang.name} ({lang.nativeName})
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
                    </AnimatedPressable>
                  );
                })}
              </View>

              <AnimatedPressable
                onPress={() => setIsVoiceModalOpen(false)}
                style={[styles.closeModalBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Text style={[styles.closeModalText, { color: colors.text }]}>Close</Text>
              </AnimatedPressable>
            </View>
          </FadeInView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHUD: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: isSmallDevice ? 10 : 16,
    gap: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  speakerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 77, 64, 0.9)',
    marginTop: 8,
  },
  speechBubbleBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#FFA000',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...BMapElevation.level3,
  },
  speechText: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  warningChipsStack: {
    gap: 6,
    marginTop: 4,
  },
  warningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...BMapElevation.level2,
  },
  hazardChip: {
    backgroundColor: '#D97706', // Alert Amber
  },
  glosaChip: {
    backgroundColor: '#059669', // Emerald Green
  },
  warningChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  midControlsContainer: {
    position: 'absolute',
    top: '38%',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 20,
  },
  speedometerCard: {
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...BMapElevation.level3,
  },
  speedNumber: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  speedUnit: {
    fontSize: 10,
    fontWeight: '700',
  },
  speedLimitPill: {
    marginTop: 6,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  speedLimitText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  voiceFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    ...BMapElevation.level3,
  },
  voiceFabText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomEtaCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    ...BMapElevation.hud,
  },
  etaInfoCluster: {
    gap: 2,
  },
  timeRemaining: {
    fontSize: 26,
    fontWeight: '900',
  },
  minUnit: {
    fontSize: 16,
    fontWeight: '700',
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaClock: {
    fontSize: 13,
    fontWeight: '600',
  },
  dotSep: {
    fontSize: 12,
  },
  distanceRemain: {
    fontSize: 13,
    fontWeight: '600',
  },
  endTripBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...BMapElevation.level2,
  },
  endTripText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  langCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    ...BMapElevation.level3,
  },
  langTitle: {
    fontWeight: '800',
  },
  langSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  langList: {
    gap: 10,
  },
  langOption: {
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  langName: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeModalBtn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
