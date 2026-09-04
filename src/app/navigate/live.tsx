import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { BMapView } from '@/components/BMapView';
import {
  SupportedLanguage,
  VERNACULAR_ALERTS,
  playVernacularAlert,
} from '@/services/voiceGuidance';
import { moderateScale, isSmallDevice } from '@/utils/responsive';

const STATIC_LIVE_POLYLINES = [
  {
    coordinates: [
      { latitude: 28.6139, longitude: 77.2090 },
      { latitude: 28.4952, longitude: 77.0891 },
    ],
    strokeColor: BMapColors.primary,
    strokeWidth: 6,
  },
];

export default function LiveNavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
    durationMinutes?: string;
    distanceKm?: string;
    destTitle?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [currentManeuver, setCurrentManeuver] = useState<{
    distanceMeters: number;
    action: string;
    icon: keyof typeof Ionicons.glyphMap;
    street: string;
  }>({
    distanceMeters: 300,
    action: 'Turn Right',
    icon: 'arrow-forward',
    street: 'Outer Ring Road / NH-44',
  });

  const [remainingMinutes, setRemainingMinutes] = useState(
    parseInt(params.durationMinutes || '38', 10)
  );
  const [remainingKm, setRemainingKm] = useState(
    parseFloat(params.distanceKm || '24.2')
  );
  const [speedKmh, setSpeedKmh] = useState(48);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeSpeechBanner, setActiveSpeechBanner] = useState<string | null>(null);

  // Simulate turn-by-turn progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentManeuver(prev => {
        if (prev.distanceMeters > 50) {
          return { ...prev, distanceMeters: prev.distanceMeters - 10 };
        }
        return {
          distanceMeters: 500,
          action: 'Keep Left towards Flyover',
          icon: 'arrow-back',
          street: 'Dwarka Expressway Entry Gate',
        };
      });

      setRemainingKm(prev => Math.max(0.1, Math.round((prev - 0.05) * 10) / 10));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const triggerVoiceGuidance = (alertType: 'maneuver' | 'hazard' | 'glosa') => {
    const prompt = playVernacularAlert(selectedLang, alertType);
    setActiveSpeechBanner(prompt);

    setTimeout(() => {
      setActiveSpeechBanner(null);
    }, 4500);
  };

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
      {/* Background Interactive Map in HUD mode */}
      <BMapView
        mapStyleType={isDark ? 'dark' : 'daylight'}
        polylines={STATIC_LIVE_POLYLINES}
      />

      {/* Top Navigation HUD Directional Banner (High-Contrast Dark Green) */}
      <SafeAreaView style={styles.topHUD} edges={['top']}>
        <View style={styles.maneuverBanner}>
          <View style={styles.maneuverIconBox}>
            <Ionicons name={currentManeuver.icon} size={36} color="#FFFFFF" />
          </View>
          <View style={styles.maneuverTextCluster}>
            <Text style={styles.distanceManeuverText}>
              In {currentManeuver.distanceMeters}m
            </Text>
            <Text style={styles.maneuverStreetText} numberOfLines={1}>
              {currentManeuver.action} on {currentManeuver.street}
            </Text>
          </View>
          {/* Quick Audio Play Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => triggerVoiceGuidance('maneuver')}
            style={styles.speakerButton}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Vernacular Voice Speech Overlay Bar */}
        {activeSpeechBanner && (
          <View style={styles.speechBubbleBanner}>
            <Ionicons name="mic" size={18} color="#FF6F00" />
            <Text style={styles.speechText} numberOfLines={2}>
              "{activeSpeechBanner}"
            </Text>
          </View>
        )}

        {/* Dynamic Warning Chips: Hazard 500m & GLOSA Green Wave */}
        <View style={styles.warningChipsStack}>
          {/* Upcoming Hazard Chip */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => triggerVoiceGuidance('hazard')}
            style={[styles.warningChip, styles.hazardChip]}
          >
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.warningChipText}>
              Upcoming Hazard 500m: Waterlogging reported
            </Text>
          </TouchableOpacity>

          {/* GLOSA Green Wave Advisory */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => triggerVoiceGuidance('glosa')}
            style={[styles.warningChip, styles.glosaChip]}
          >
            <Ionicons name="speedometer" size={16} color="#FFFFFF" />
            <Text style={styles.warningChipText}>
              GLOSA Speed: Maintain 45 km/h for Green Signal
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Floating Vernacular Voice Controls & Speedometer */}
      <View style={styles.midControlsContainer} pointerEvents="box-none">
        {/* Speedometer Widget */}
        <View style={[styles.speedometerCard, { backgroundColor: isDark ? '#111E2E' : '#FFFFFF' }]}>
          <Text style={[styles.speedNumber, { color: colors.text }]}>{speedKmh}</Text>
          <Text style={[styles.speedUnit, { color: colors.textSecondary }]}>KM/H</Text>
          <View style={styles.speedLimitPill}>
            <Text style={styles.speedLimitText}>LIMIT 60</Text>
          </View>
        </View>

        {/* Voice Language Selector FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsVoiceModalOpen(true)}
          style={[styles.voiceFab, { backgroundColor: BMapColors.primary }]}
        >
          <Ionicons name="mic" size={24} color="#FFFFFF" />
          <Text style={styles.voiceFabText}>{selectedLang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Floating ETA Bar */}
      <SafeAreaView style={styles.bottomBarContainer} edges={['bottom']}>
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
                ETA 04:22 PM
              </Text>
              <Text style={[styles.dotSep, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.distanceRemain, { color: colors.textSecondary }]}>
                {remainingKm} km
              </Text>
            </View>
          </View>

          {/* Red End Trip Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEndTrip}
            style={styles.endTripBtn}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.endTripText}>End Trip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Regional Vernacular Language Modal */}
      <Modal
        visible={isVoiceModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVoiceModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
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
                  <TouchableOpacity
                    key={langKey}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedLang(langKey);
                      setIsVoiceModalOpen(false);
                      triggerVoiceGuidance('maneuver');
                    }}
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
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setIsVoiceModalOpen(false)}
              style={[styles.closeModalBtn, { backgroundColor: colors.surfaceVariant }]}
            >
              <Text style={[styles.closeModalText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
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
  maneuverBanner: {
    backgroundColor: '#004D40', // High contrast dark emerald green
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    borderWidth: 1.5,
    borderColor: '#00BFA5',
    ...BMapElevation.hud,
  },
  maneuverIconBox: {
    width: isSmallDevice ? 46 : 56,
    height: isSmallDevice ? 46 : 56,
    borderRadius: isSmallDevice ? 23 : 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maneuverTextCluster: {
    flex: 1,
  },
  distanceManeuverText: {
    color: '#FFFFFF',
    fontSize: moderateScale(isSmallDevice ? 18 : 24),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  maneuverStreetText: {
    color: '#E0F2F1',
    fontSize: moderateScale(isSmallDevice ? 12 : 14),
    fontWeight: '600',
  },
  speakerButton: {
    padding: 8,
  },
  speechBubbleBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF6F00',
  },
  speechText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  warningChipsStack: {
    gap: 6,
  },
  warningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    ...BMapElevation.level2,
  },
  hazardChip: {
    backgroundColor: '#C62828', // Alert Red
  },
  glosaChip: {
    backgroundColor: '#1565C0', // GLOSA Blue/Green wave
  },
  warningChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  midControlsContainer: {
    position: 'absolute',
    top: '36%',
    right: 16,
    zIndex: 25,
    alignItems: 'center',
    gap: 14,
  },
  speedometerCard: {
    width: 68,
    borderRadius: 18,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...BMapElevation.level3,
  },
  speedNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '700',
  },
  speedLimitPill: {
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
  },
  speedLimitText: {
    color: '#D32F2F',
    fontSize: 8,
    fontWeight: '800',
  },
  voiceFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level3,
  },
  voiceFabText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: -2,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bottomEtaCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...BMapElevation.hud,
  },
  etaInfoCluster: {
    gap: 2,
  },
  timeRemaining: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  minUnit: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 13,
  },
  distanceRemain: {
    fontSize: 13,
    fontWeight: '600',
  },
  endTripBtn: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
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
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 12,
    ...BMapElevation.level3,
  },
  langTitle: {
    fontWeight: '800',
  },
  langSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  langList: {
    gap: 8,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  langName: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeModalBtn: {
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
