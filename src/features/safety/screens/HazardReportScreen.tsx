import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fluidEntering } from '@/shared/animations';
import {
  Camera,
  CarFront,
  CheckCircle2,
  Cone,
  Droplets,
  MapPin,
  Send,
  ShieldCheck,
  TriangleAlert,
  X,
  Zap,
  Award,
  Mic,
  ThumbsUp,
  CheckCheck,
  Navigation,
  Share2,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';
import {
  notificationService,
  storageService,
  speechService,
  locationService,
  HazardReportItem,
  HazardType,
  HazardSeverity,
  VoiceRecognitionResult,
} from '@/shared/services';
import { encodeDigiPin } from '@/shared/utils/digipin';
import { VoiceListeningModal } from '@/shared/components/voice/VoiceListeningModal';

interface HazardTypeMeta {
  id: HazardType;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  tag: string;
}

const HAZARD_TYPES: HazardTypeMeta[] = [
  {
    id: 'pothole',
    label: 'Pothole / Road Damage',
    icon: TriangleAlert,
    color: '#F44336',
    tag: 'Road Hazard',
  },
  {
    id: 'waterlogging',
    label: 'Waterlogging / Flood',
    icon: Droplets,
    color: '#2196F3',
    tag: 'Monsoon Alert',
  },
  {
    id: 'speed_trap',
    label: 'Speed Radar / Interceptor',
    icon: Camera,
    color: '#FF9800',
    tag: 'Radar Zone',
  },
  {
    id: 'accident',
    label: 'Traffic Accident',
    icon: CarFront,
    color: '#D32F2F',
    tag: 'Accident',
  },
  {
    id: 'roadwork',
    label: 'Road Construction',
    icon: Cone,
    color: '#FFB300',
    tag: 'Work Zone',
  },
  {
    id: 'breakdown',
    label: 'Vehicle Breakdown',
    icon: Zap,
    color: '#7E57C2',
    tag: 'Obstruction',
  },
];

const SEVERITY_LEVELS: { id: HazardSeverity; label: string; desc: string; color: string }[] = [
  { id: 'low', label: 'Low', desc: 'Passable with caution', color: '#00C06D' },
  { id: 'medium', label: 'Medium', desc: 'Lane partially blocked', color: '#FF9800' },
  { id: 'high', label: 'Severe', desc: 'Hazardous, avoid lane', color: '#F44336' },
];

const HIGHWAY_LANES = [
  'Left Lane',
  'Center Lane',
  'Right Lane',
  'Shoulder / Flyover',
];

export default function HazardReportScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Navigation mode / tabs
  const [activeTab, setActiveTab] = useState<'report' | 'community'>('report');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Multi-step report form state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('pothole');
  const [selectedSeverity, setSelectedSeverity] = useState<HazardSeverity>('high');
  const [lanePosition, setLanePosition] = useState<string>('Right Lane');
  const [description, setDescription] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Live Location & Sovereign DigiPIN state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null }>({
    latitude: 28.3587,
    longitude: 76.9428,
    accuracy: 0.8,
  });
  const [digipinCode, setDigipinCode] = useState<string>('28J4-K8M2-9P');
  const [locationAddress, setLocationAddress] = useState<string>(
    'NH-48 Jaipur Highway Corridor, km 42.4 (Near Manesar)'
  );
  const [isRefreshingGps, setIsRefreshingGps] = useState<boolean>(false);

  // Voice Assistant modal state
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  // Community Feed state
  const [communityHazards, setCommunityHazards] = useState<HazardReportItem[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Load initial community hazards & current GPS location
  useEffect(() => {
    let isMounted = true;

    storageService.getHazardReports().then((hazards) => {
      if (isMounted) setCommunityHazards(hazards);
    });

    // Query live location once on mount
    locationService.getCurrentLocation().then((loc) => {
      if (!isMounted || !loc) return;
      const pin = encodeDigiPin(loc.latitude, loc.longitude);
      setCoords({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy ?? 0.8,
      });
      setDigipinCode(pin);
      setLocationAddress(`Corridor km 42.4 · ${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E`);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshLocation = useCallback(async () => {
    haptics.selection();
    setIsRefreshingGps(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        const pin = encodeDigiPin(loc.latitude, loc.longitude);
        setCoords({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy ?? 0.8,
        });
        setDigipinCode(pin);
        setLocationAddress(`NH-48 NavIC Fix · ${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E`);
        speechService.speak('GPS location fix refreshed with sovereign DigiPIN precision.');
      }
    } catch {
      // fallback preserved
    } finally {
      setIsRefreshingGps(false);
    }
  }, []);

  const currentHazard = useMemo(
    () => HAZARD_TYPES.find((h) => h.id === selectedHazard) || HAZARD_TYPES[0],
    [selectedHazard]
  );

  // Voice command parsing handler
  const handleVoiceResult = useCallback((res: VoiceRecognitionResult) => {
    setShowVoiceModal(false);
    const transcript = res.transcript.toLowerCase();

    // 1. Detect Hazard Type
    let detectedHazard: HazardType = selectedHazard;
    if (transcript.includes('water') || transcript.includes('flood') || transcript.includes('पानी')) {
      detectedHazard = 'waterlogging';
    } else if (transcript.includes('camera') || transcript.includes('radar') || transcript.includes('speed') || transcript.includes('कैमरा')) {
      detectedHazard = 'speed_trap';
    } else if (transcript.includes('accident') || transcript.includes('crash') || transcript.includes('दुर्घटना')) {
      detectedHazard = 'accident';
    } else if (transcript.includes('work') || transcript.includes('construction') || transcript.includes('काम')) {
      detectedHazard = 'roadwork';
    } else if (transcript.includes('breakdown') || transcript.includes('खराब')) {
      detectedHazard = 'breakdown';
    } else if (transcript.includes('pothole') || transcript.includes('hole') || transcript.includes('गड्ढा')) {
      detectedHazard = 'pothole';
    }
    setSelectedHazard(detectedHazard);

    // 2. Detect Lane Position
    let detectedLane = lanePosition;
    if (transcript.includes('left') || transcript.includes('बाएं')) {
      detectedLane = 'Left Lane';
    } else if (transcript.includes('center') || transcript.includes('middle') || transcript.includes('बीच')) {
      detectedLane = 'Center Lane';
    } else if (transcript.includes('right') || transcript.includes('दाएं')) {
      detectedLane = 'Right Lane';
    } else if (transcript.includes('shoulder') || transcript.includes('flyover') || transcript.includes('किनारे')) {
      detectedLane = 'Shoulder / Flyover';
    }
    setLanePosition(detectedLane);

    // 3. Detect Severity
    if (transcript.includes('severe') || transcript.includes('high') || transcript.includes('खतरनाक')) {
      setSelectedSeverity('high');
    } else if (transcript.includes('medium') || transcript.includes('moderate')) {
      setSelectedSeverity('medium');
    } else if (transcript.includes('low') || transcript.includes('minor') || transcript.includes('हल्का')) {
      setSelectedSeverity('low');
    }

    const matchedHazardObj = HAZARD_TYPES.find((h) => h.id === detectedHazard);
    speechService.speak(
      `Voice recorded: ${matchedHazardObj?.label || 'Hazard'} on ${detectedLane}. Ready to broadcast.`
    );
  }, [selectedHazard, lanePosition]);

  // Image capture / picker
  const handlePickPhoto = () => {
    haptics.light();
    Alert.alert(
      'Attach Road Hazard Evidence',
      'Capture camera photo or select gallery image for community verification:',
      [
        {
          text: 'Take Photo with Camera',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission Required',
                  'Camera permission is needed to capture live road hazard photos.'
                );
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
              });
              if (!res.canceled && res.assets?.[0]?.uri) {
                setPhotoUri(res.assets[0].uri);
                haptics.success();
              }
            } catch {
              setPhotoUri('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
              });
              if (!res.canceled && res.assets?.[0]?.uri) {
                setPhotoUri(res.assets[0].uri);
                haptics.success();
              }
            } catch {
              setPhotoUri('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Submit hazard broadcast
  const handleSubmit = async () => {
    haptics.success();

    const newReport = await storageService.addHazardReport({
      hazardType: selectedHazard,
      label: currentHazard.label,
      severity: selectedSeverity,
      lanePosition,
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: locationAddress,
      digipin: digipinCode,
      description: description.trim() || undefined,
      photoUri,
    });

    // Dispatch system in-app notification
    await notificationService.addNotification({
      title: `Road Hazard Broadcasted ⚠️ · ${currentHazard.label}`,
      message: `${currentHazard.label} reported at ${locationAddress} (${lanePosition}) · DigiPIN: ${digipinCode}`,
      category: 'hazard',
      priority: selectedSeverity === 'high' ? 'critical' : 'high',
      actionRoute: '/hazard-report',
      actionLabel: 'Inspect Hazard',
      metadata: {
        digiPin: digipinCode,
        roadName: locationAddress,
      },
    });

    // Spoken localized prompt in paired opposite-gender voice
    speechService.speakPrompt('hazardReported');

    // Update community feed list
    setCommunityHazards((prev) => [newReport, ...prev]);

    Alert.alert(
      'Hazard Report Broadcasted! 📡',
      `Thank you! Your report for ${currentHazard.label} (${lanePosition}) has been tagged with sovereign DigiPIN ${digipinCode} and broadcast to navigators within 5km.\n\nTrust Score: +5 Community XP awarded.`,
      [
        {
          text: 'View in Community Feed',
          onPress: () => {
            setActiveTab('community');
            setCurrentStep(1);
            setDescription('');
            setPhotoUri(null);
          },
        },
      ]
    );
  };

  // Community verification voting
  const handleVote = async (hazardId: string, isStillThere: boolean) => {
    if (votedIds.has(hazardId)) {
      Alert.alert('Already Verified', 'You have already submitted community verification for this hazard.');
      return;
    }

    haptics.selection();
    const updated = await storageService.voteHazardReport(hazardId, isStillThere);
    if (updated) {
      setVotedIds((prev) => new Set(prev).add(hazardId));
      setCommunityHazards((prev) => prev.map((h) => (h.id === hazardId ? updated : h)));

      if (isStillThere) {
        speechService.speak('Hazard report confirmed by community. Trust score increased.');
        Alert.alert('Hazard Confirmed 👍', 'Thank you! Your verification has refreshed this hazard active window (+2 XP).');
      } else {
        speechService.speakPrompt('hazardCleared');
        Alert.alert('Hazard Cleared ✅', 'Marked as cleared. Thank you for keeping Indian highway corridors safe (+2 XP)!');
      }
    }
  };

  const handleShareHazard = async (item: HazardReportItem) => {
    haptics.light();
    try {
      await Share.share({
        title: `Road Hazard Alert: ${item.label}`,
        message: `⚠️ B-Map Sovereign Road Alert: ${item.label} reported at ${item.address} (${item.lanePosition}). DigiPIN: ${item.digipin}. Drive carefully!`,
      });
    } catch {}
  };

  // Filtered community hazards
  const filteredCommunityHazards = useMemo(() => {
    if (activeFilter === 'all') return communityHazards;
    return communityHazards.filter((h) => h.hazardType === activeFilter);
  }, [communityHazards, activeFilter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="Safety & Road Hazards"
        onBackPress={() => {
          haptics.light();
          router.back();
        }}
        rightAction={
          <TouchableOpacity
            style={[styles.headerVoiceButton, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => setShowVoiceModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Voice Hazard Assistant"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Mic size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Segmented Top Switcher (Report New vs Community Feed) */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceContainerHigh }]}>
        <View style={[styles.segmentTrack, { backgroundColor: colors.surfaceContainerLow }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'report' && { backgroundColor: colors.primary }]}
            onPress={() => {
              haptics.selection();
              setActiveTab('report');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'report' }}>
            <TriangleAlert size={14} color={activeTab === 'report' ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.segmentText, { color: activeTab === 'report' ? colors.onPrimary : colors.onSurfaceVariant }]}>
              Report Hazard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'community' && { backgroundColor: colors.primary }]}
            onPress={() => {
              haptics.selection();
              setActiveTab('community');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'community' }}>
            <ShieldCheck size={14} color={activeTab === 'community' ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.segmentText, { color: activeTab === 'community' ? colors.onPrimary : colors.onSurfaceVariant }]}>
              Nearby Hazards ({communityHazards.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 20) + (activeTab === 'report' ? 120 : 40) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* TAB 1: REPORT NEW HAZARD */}
          {activeTab === 'report' ? (
            <>
              {/* Flowstep Multi-Step Progress Tracker */}
              <Animated.View entering={fluidEntering(0)} style={styles.flowstepStepsRow}>
                <TouchableOpacity
                  style={[
                    styles.stepPill,
                    { backgroundColor: currentStep === 1 ? colors.primaryContainer : colors.surfaceContainerLow },
                  ]}
                  onPress={() => setCurrentStep(1)}>
                  <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.stepText, { color: currentStep === 1 ? colors.primary : colors.onSurfaceVariant }]}>
                    1. Category
                  </Text>
                </TouchableOpacity>

                <View style={[styles.stepDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

                <TouchableOpacity
                  style={[
                    styles.stepPill,
                    { backgroundColor: currentStep === 2 ? colors.primaryContainer : colors.surfaceContainerLow },
                  ]}
                  onPress={() => setCurrentStep(2)}>
                  <View style={[styles.stepDot, { backgroundColor: selectedSeverity ? colors.primary : colors.onSurfaceVariant }]} />
                  <Text style={[styles.stepText, { color: currentStep === 2 ? colors.primary : colors.onSurfaceVariant }]}>
                    2. Severity & Lane
                  </Text>
                </TouchableOpacity>

                <View style={[styles.stepDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

                <TouchableOpacity
                  style={[
                    styles.stepPill,
                    { backgroundColor: currentStep === 3 ? colors.primaryContainer : colors.surfaceContainerLow },
                  ]}
                  onPress={() => setCurrentStep(3)}>
                  <View
                    style={[
                      styles.stepDot,
                      { backgroundColor: photoUri ? colors.trafficGreen : colors.onSurfaceVariant },
                    ]}
                  />
                  <Text style={[styles.stepText, { color: currentStep === 3 ? colors.primary : colors.onSurfaceVariant }]}>
                    3. Evidence
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Hands-Free Voice Reporting Quick Banner */}
              <TouchableOpacity
                style={[styles.voiceBanner, { backgroundColor: colors.primaryContainer + '25', borderColor: colors.primary + '50' }]}
                onPress={() => {
                  haptics.medium();
                  setShowVoiceModal(true);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Report with Voice Assistant">
                <View style={[styles.voiceMicCircle, { backgroundColor: colors.primary }]}>
                  <Mic size={16} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.voiceBannerTitle, { color: colors.onSurface }]}>
                    Hands-Free Voice Hazard Report
                  </Text>
                  <Text style={[styles.voiceBannerSub, { color: colors.onSurfaceVariant }]}>
                    Say &quot;Pothole in right lane&quot; or &quot;Waterlogging ahead&quot;
                  </Text>
                </View>
                <View style={[styles.speechBadge, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <Text style={[styles.speechBadgeText, { color: colors.primary }]}>
                    {speechService.getVoiceGender() === 'female' ? '♀ Female Voice' : '♂ Male Voice'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Location & Sovereign DigiPIN Card */}
              <Animated.View entering={fluidEntering(10)}>
                <Card variant="elevated" padding="md" style={styles.locationCard}>
                  <View style={styles.locationHeaderRow}>
                    <View style={styles.locationHeader}>
                      <MapPin size={16} color={colors.primary} />
                      <Text style={[styles.locationTitle, { color: colors.primary }]}>
                        Live GPS Coordinates (NavIC L5+S)
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={refreshLocation}
                      style={[styles.refreshGpsBtn, { backgroundColor: colors.surfaceContainerLow }]}
                      disabled={isRefreshingGps}>
                      <RefreshCw size={12} color={colors.primary} style={isRefreshingGps ? styles.spinIcon : undefined} />
                      <Text style={[styles.refreshGpsText, { color: colors.primary }]}>
                        {isRefreshingGps ? 'Locating...' : 'Refresh Fix'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.locationAddress, { color: colors.onSurface }]}>
                    {locationAddress}
                  </Text>

                  <View style={[styles.digiRow, { backgroundColor: colors.surfaceContainerLow }]}>
                    <View style={[styles.digiBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.digiBadgeText, { color: colors.onPrimary }]}>
                        DigiPIN
                      </Text>
                    </View>
                    <Text style={[styles.digiCode, { color: colors.primary }]}>
                      {digipinCode}
                    </Text>
                    <Text style={[styles.digiAccuracy, { color: colors.onSurfaceVariant }]}>
                      ±{coords.accuracy ? coords.accuracy.toFixed(1) : '0.8'}m NavIC Precision
                    </Text>
                  </View>
                </Card>
              </Animated.View>

              {/* STEP 1: Select Hazard Category */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  1. Hazard Category
                </Text>
                <Text style={[styles.sectionBadge, { color: currentHazard.color }]}>
                  {currentHazard.tag}
                </Text>
              </View>

              <View style={styles.hazardGrid}>
                {HAZARD_TYPES.map((ht, idx) => {
                  const IconComp = ht.icon;
                  const isSelected = selectedHazard === ht.id;
                  return (
                    <Animated.View
                      key={ht.id}
                      entering={fluidEntering(20 + idx * 20)}
                      style={styles.hazardChipWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.hazardChip,
                          {
                            backgroundColor: isSelected ? ht.color + '20' : colors.surfaceContainerLowest,
                            borderColor: isSelected ? ht.color : colors.surfaceContainerHigh,
                          },
                        ]}
                        onPress={() => {
                          haptics.selection();
                          setSelectedHazard(ht.id);
                          setCurrentStep(2);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Select hazard ${ht.label}`}
                        accessibilityState={{ selected: isSelected }}
                        activeOpacity={0.8}>
                        <View
                          style={[
                            styles.hazardIconBox,
                            {
                              backgroundColor: isSelected ? ht.color : colors.surfaceContainerLow,
                            },
                          ]}>
                          <IconComp size={18} color={isSelected ? '#fff' : ht.color} />
                        </View>
                        <Text
                          style={[
                            styles.hazardChipLabel,
                            { color: colors.onSurface },
                            isSelected && { fontWeight: '800' },
                          ]}
                          numberOfLines={2}>
                          {ht.label}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              {/* STEP 2: Severity Level Selector */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  2. Severity Level
                </Text>
                <Text style={[styles.sectionSublabel, { color: colors.onSurfaceVariant }]}>
                  Required for ADAS alert threshold
                </Text>
              </View>

              <View style={styles.severityRow}>
                {SEVERITY_LEVELS.map((sl) => {
                  const isSelected = selectedSeverity === sl.id;
                  return (
                    <TouchableOpacity
                      key={sl.id}
                      style={[
                        styles.severityChip,
                        {
                          backgroundColor: isSelected ? sl.color + '20' : colors.surfaceContainerLowest,
                          borderColor: isSelected ? sl.color : colors.surfaceContainerHigh,
                        },
                      ]}
                      onPress={() => {
                        haptics.selection();
                        setSelectedSeverity(sl.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select severity ${sl.label}, ${sl.desc}`}
                      accessibilityState={{ selected: isSelected }}
                      activeOpacity={0.8}>
                      <Text style={[styles.severityLabel, { color: sl.color }]}>
                        {sl.label}
                      </Text>
                      <Text style={[styles.severityDesc, { color: colors.onSurfaceVariant }]}>
                        {sl.desc}
                      </Text>
                      {isSelected && (
                        <CheckCircle2 size={14} color={sl.color} style={styles.hazardCheckBadge} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Corridor Lane Position */}
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Highway Corridor Lane Position
              </Text>
              <View style={styles.laneRow}>
                {HIGHWAY_LANES.map((lane) => (
                  <TouchableOpacity
                    key={lane}
                    style={[
                      styles.laneChip,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderColor: colors.surfaceContainerHigh,
                      },
                      lanePosition === lane && {
                        backgroundColor: colors.primaryContainer,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      haptics.selection();
                      setLanePosition(lane);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select corridor lane ${lane}`}
                    accessibilityState={{ selected: lanePosition === lane }}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.laneChipText,
                        { color: colors.onSurfaceVariant },
                        lanePosition === lane && {
                          color: colors.onPrimary,
                          fontWeight: '700',
                        },
                      ]}>
                      {lane}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Visual Highway Lane Schematic (Flowstep UI/UX Pattern) */}
              <View
                style={[
                  styles.highwaySchematic,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={[styles.schematicLabel, { color: colors.onSurfaceVariant }]}>
                  HIGHWAY CORRIDOR CROSS-SECTION (TAP TO POSITION)
                </Text>
                <View style={styles.schematicRoad}>
                  {HIGHWAY_LANES.map((lane) => {
                    const isLaneActive = lanePosition === lane;
                    return (
                      <TouchableOpacity
                        key={lane}
                        style={[
                          styles.schematicLane,
                          { borderColor: colors.outlineVariant },
                          isLaneActive && {
                            backgroundColor: (currentHazard?.color || colors.primary) + '25',
                            borderColor: currentHazard?.color || colors.primary,
                          },
                        ]}
                        onPress={() => {
                          haptics.selection();
                          setLanePosition(lane);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Select lane ${lane}`}>
                        {isLaneActive && (
                          <View
                            style={[
                              styles.hazardPointMarker,
                              { backgroundColor: currentHazard?.color || colors.error },
                            ]}>
                            <TriangleAlert size={10} color="#fff" />
                          </View>
                        )}
                        <Text
                          style={[
                            styles.schematicLaneText,
                            {
                              color: isLaneActive ? colors.onSurface : colors.onSurfaceVariant,
                            },
                            isLaneActive && { fontWeight: '800' },
                          ]}>
                          {lane.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* STEP 3: Evidence & Verification Notes */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  3. Evidence & Warning Notes
                </Text>
                <Text style={[styles.sectionSublabel, { color: colors.trafficGreen }]}>
                  +25% Trust Boost
                </Text>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceContainerLowest,
                    borderColor: colors.surfaceContainerHigh,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="E.g., Deep crater on right wheel track after flyover descent, reduce speed to 40 km/h..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              {/* Photo Upload Attachment */}
              {photoUri ? (
                <View
                  style={[
                    styles.photoCard,
                    {
                      backgroundColor: colors.surfaceContainerLow,
                      borderColor: colors.trafficGreen,
                    },
                  ]}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} color={colors.trafficGreen} />
                      <Text style={[styles.photoTitle, { color: colors.onSurface }]}>
                        Photo Evidence Attached
                      </Text>
                    </View>
                    <Text style={[styles.photoSub, { color: colors.onSurfaceVariant }]}>
                      EXIF Geo-Stamp: {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      haptics.selection();
                      setPhotoUri(null);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo">
                    <X size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.photoCard,
                    {
                      backgroundColor: colors.surfaceContainerLowest,
                      borderColor: colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={handlePickPhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Attach dashcam or camera photo"
                  activeOpacity={0.8}>
                  <Camera size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.photoTitle, { color: colors.onSurface }]}>
                      Attach Camera / Dashcam Evidence
                    </Text>
                    <Text style={[styles.photoSub, { color: colors.onSurfaceVariant }]}>
                      Capturing visual proof boosts community verification trust score by +25%
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Trust Score Banner */}
              <View style={[styles.trustBanner, { backgroundColor: colors.surfaceContainerLow }]}>
                <ShieldCheck size={18} color={colors.trafficGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trustTitle, { color: colors.onSurface }]}>
                    Reporter Trust Score: 98.4% (VIP Navigator)
                  </Text>
                  <Text style={[styles.trustSub, { color: colors.onSurfaceVariant }]}>
                    Immediate V2X broadcast priority to all NavIC navigators within 5 km
                  </Text>
                </View>
              </View>
            </>
          ) : (
            /* TAB 2: NEARBY COMMUNITY HAZARDS FEED */
            <View style={styles.communityContainer}>
              {/* Category Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
                {[
                  { id: 'all', label: 'All Hazards' },
                  { id: 'pothole', label: '⚠️ Potholes' },
                  { id: 'waterlogging', label: '💧 Flooding' },
                  { id: 'speed_trap', label: '📷 Speed Radar' },
                  { id: 'accident', label: '🚗 Accidents' },
                  { id: 'roadwork', label: '🚧 Construction' },
                ].map((f) => {
                  const isActive = activeFilter === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isActive ? colors.primary : colors.surfaceContainerLow,
                          borderColor: isActive ? colors.primary : colors.surfaceContainerHigh,
                        },
                      ]}
                      onPress={() => {
                        haptics.selection();
                        setActiveFilter(f.id);
                      }}>
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: isActive ? colors.onPrimary : colors.onSurfaceVariant },
                          isActive && { fontWeight: '700' },
                        ]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filteredCommunityHazards.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <ShieldCheck size={36} color={colors.trafficGreen} />
                  <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>Corridor is Clear</Text>
                  <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
                    No active hazards reported for this filter within 15 km.
                  </Text>
                </View>
              ) : (
                filteredCommunityHazards.map((item, idx) => {
                  const meta = HAZARD_TYPES.find((h) => h.id === item.hazardType) || HAZARD_TYPES[0];
                  const IconComp = meta.icon;
                  const hasVoted = votedIds.has(item.id);

                  return (
                    <Animated.View key={item.id} entering={fluidEntering(idx * 30)}>
                      <Card
                        variant="elevated"
                        padding="md"
                        style={[styles.hazardCard, { borderColor: meta.color + '40', borderWidth: 1 }]}>
                        {/* Top Meta Row */}
                        <View style={styles.hazardCardHeader}>
                          <View style={[styles.hazardCardIconBox, { backgroundColor: meta.color + '20' }]}>
                            <IconComp size={18} color={meta.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.hazardCardTitle, { color: colors.onSurface }]}>
                                {item.label}
                              </Text>
                              {item.cleared && (
                                <View style={[styles.clearedBadge, { backgroundColor: colors.trafficGreen + '20' }]}>
                                  <Text style={[styles.clearedText, { color: colors.trafficGreen }]}>
                                    CLEARED
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={[styles.hazardCardAddress, { color: colors.onSurfaceVariant }]}>
                              {item.address}
                            </Text>
                          </View>

                          <View style={[styles.severityBadge, { backgroundColor: meta.color }]}>
                            <Text style={styles.severityBadgeText}>
                              {item.severity.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Description & Lane Row */}
                        <View style={[styles.hazardCardBody, { backgroundColor: colors.surfaceContainerLow }]}>
                          <View style={styles.hazardMetaRow}>
                            <View style={styles.hazardMetaPill}>
                              <Layers size={11} color={colors.primary} />
                              <Text style={[styles.hazardMetaText, { color: colors.onSurface }]}>
                                {item.lanePosition}
                              </Text>
                            </View>

                            <View style={styles.hazardMetaPill}>
                              <MapPin size={11} color={colors.primary} />
                              <Text style={[styles.hazardMetaText, { color: colors.primary, fontWeight: '700' }]}>
                                {item.digipin}
                              </Text>
                            </View>

                            <View style={styles.hazardMetaPill}>
                              <Clock size={11} color={colors.onSurfaceVariant} />
                              <Text style={[styles.hazardMetaText, { color: colors.onSurfaceVariant }]}>
                                {item.reportedAt}
                              </Text>
                            </View>
                          </View>

                          {item.description ? (
                            <Text style={[styles.hazardDescription, { color: colors.onSurface }]}>
                              &quot;{item.description}&quot;
                            </Text>
                          ) : null}
                        </View>

                        {/* Verification & Trust Footer */}
                        <View style={styles.hazardCardFooter}>
                          <View style={styles.trustScoreBox}>
                            <ShieldCheck size={14} color={colors.trafficGreen} />
                            <Text style={[styles.trustScoreText, { color: colors.onSurfaceVariant }]}>
                              {item.verifiedCount} drivers verified ({item.trustScore}% Trust)
                            </Text>
                          </View>

                          <View style={styles.cardActionsRow}>
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                { backgroundColor: colors.surfaceContainerLow },
                                hasVoted && { opacity: 0.5 },
                              ]}
                              onPress={() => handleVote(item.id, true)}
                              disabled={hasVoted}
                              accessibilityRole="button"
                              accessibilityLabel="Confirm hazard is still there">
                              <ThumbsUp size={13} color={colors.trafficGreen} />
                              <Text style={[styles.actionBtnText, { color: colors.trafficGreen }]}>
                                Still There
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                { backgroundColor: colors.surfaceContainerLow },
                                hasVoted && { opacity: 0.5 },
                              ]}
                              onPress={() => handleVote(item.id, false)}
                              disabled={hasVoted}
                              accessibilityRole="button"
                              accessibilityLabel="Report hazard cleared">
                              <CheckCheck size={13} color={colors.primary} />
                              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                                Cleared
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.shareMiniBtn, { backgroundColor: colors.surfaceContainerLow }]}
                              onPress={() => handleShareHazard(item)}
                              accessibilityRole="button"
                              accessibilityLabel="Share hazard alert">
                              <Share2 size={13} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.navMiniBtn, { backgroundColor: colors.primary }]}
                              onPress={() => {
                                haptics.medium();
                                router.push('/modal');
                              }}
                              accessibilityRole="button"
                              accessibilityLabel="Navigate avoiding hazard">
                              <Navigation size={13} color={colors.onPrimary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Card>
                    </Animated.View>
                  );
                })
              )}
            </View>
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Sticky Broadcast Action Bar (Flowstep Thumb-Zone Pattern for Report Tab) */}
      {activeTab === 'report' && (
        <View
          style={[
            styles.bottomDock,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderTopColor: colors.surfaceContainerHigh,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}>
          <View style={styles.dockRewardRow}>
            <View style={[styles.rewardBadge, { backgroundColor: colors.primaryContainer }]}>
              <Award size={13} color={colors.primary} />
              <Text style={[styles.rewardText, { color: colors.primary }]}>
                +5 Community Trust XP
              </Text>
            </View>
            <Text style={[styles.dockMetaText, { color: colors.onSurfaceVariant }]}>
              Real-Time V2X Dispatch
            </Text>
          </View>
          <View style={styles.dockContent}>
            <Button
              title={`Broadcast ${currentHazard.label} Report`}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Send size={18} color={colors.onPrimary} />}
              onPress={handleSubmit}
            />
          </View>
        </View>
      )}

      {/* Voice Recognition Listening Modal */}
      <VoiceListeningModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={handleVoiceResult}
        initialPrompt="Report pothole in right lane..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: { padding: Spacing.md, gap: Spacing.md },

  headerVoiceButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Segmented Bar */
  segmentContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  segmentText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },

  /* Flowstep Step Tracker Styles */
  flowstepStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
  },
  stepDivider: {
    flex: 1,
    height: 1,
    marginHorizontal: 4,
  },

  /* Hands-Free Voice Quick Banner */
  voiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  voiceMicCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBannerTitle: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  voiceBannerSub: {
    ...Typography.bodySmall,
    fontSize: 10,
    marginTop: 1,
  },
  speechBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  speechBadgeText: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '800',
  },

  /* Location Card */
  locationCard: { gap: Spacing.xs },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationTitle: { ...Typography.labelSmall, fontWeight: '700' },
  refreshGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  refreshGpsText: { ...Typography.labelSmall, fontSize: 9, fontWeight: '700' },
  spinIcon: { transform: [{ rotate: '45deg' }] },
  locationAddress: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    marginTop: 2,
  },
  digiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: Radius.md,
    marginTop: 6,
  },
  digiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  digiBadgeText: { fontSize: 9, fontWeight: '800' },
  digiCode: {
    ...Typography.labelMedium,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  digiAccuracy: { ...Typography.bodySmall, fontSize: 10, flex: 1 },

  /* Section Headers */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  sectionBadge: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '800',
  },
  sectionSublabel: {
    ...Typography.bodySmall,
    fontSize: 10,
  },

  /* Hazard Grid */
  hazardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  hazardChipWrapper: { width: '48%' },
  hazardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  hazardIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardChipLabel: { ...Typography.labelSmall, fontWeight: '700', flex: 1 },

  /* Severity Row */
  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: {
    flex: 1,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  severityLabel: { ...Typography.labelMedium, fontWeight: '800' },
  severityDesc: {
    ...Typography.bodySmall,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  hazardCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  /* Corridor Lane */
  laneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  laneChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  laneChipText: { ...Typography.labelSmall, fontWeight: '600' },

  /* Flowstep Highway Cross-Section Visualizer */
  highwaySchematic: {
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  schematicLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  schematicRoad: {
    flexDirection: 'row',
    gap: 6,
  },
  schematicLane: {
    flex: 1,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  schematicLaneText: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  hazardPointMarker: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Text & Photo inputs */
  textInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    ...Typography.bodyMedium,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  photoPreview: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
  },
  photoTitle: { ...Typography.labelMedium, fontWeight: '700' },
  photoSub: { ...Typography.bodySmall, fontSize: 10, marginTop: 1 },

  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
  },
  trustTitle: { ...Typography.labelSmall, fontWeight: '700' },
  trustSub: { ...Typography.bodySmall, fontSize: 10, marginTop: 1 },

  /* Community Feed Styles */
  communityContainer: { gap: Spacing.md },
  filterPillRow: { gap: 8, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    ...Typography.labelSmall,
    fontSize: 11,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  emptySub: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  hazardCard: {
    borderRadius: Radius.lg,
    gap: 10,
  },
  hazardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hazardCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardCardTitle: {
    ...Typography.labelMedium,
    fontWeight: '800',
  },
  clearedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  clearedText: {
    fontSize: 8,
    fontWeight: '800',
  },
  hazardCardAddress: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  hazardCardBody: {
    padding: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  hazardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  hazardMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hazardMetaText: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  hazardDescription: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontStyle: 'italic',
  },
  hazardCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  trustScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  trustScoreText: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
  },
  shareMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Flowstep Thumb-Zone Bottom Dock */
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: Spacing.md,
    ...Shadows.lg,
  },
  dockRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  rewardText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '800',
  },
  dockMetaText: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  dockContent: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
});
