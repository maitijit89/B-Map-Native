import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Magnetometer } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  G,
  Circle,
  Line,
} from 'react-native-svg';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Car,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react-native';
import { haptics } from '@/shared/utils/haptics';
import {
  arNavigationBackendService,
  ArVpsLocalizationResult,
  SAMPLE_LANDMARK_PHOTOS,
  SampleLandmarkPhoto,
  speechService,
  voiceLanguageService,
  VoiceLanguageCode,
} from '@/shared/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ArNavigationScreen() {
  const insets = useSafeAreaInsets();

  // Spatial & Backend Telemetry State
  const [deviceHeading, setDeviceHeading] = useState<number>(45);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activePhotoUri, setActivePhotoUri] = useState<string | null>(
    SAMPLE_LANDMARK_PHOTOS[0].previewUrl
  );
  const [voiceLang, setVoiceLang] = useState<VoiceLanguageCode>(
    voiceLanguageService.getLanguage()
  );
  const [vpsResult, setVpsResult] = useState<ArVpsLocalizationResult | null>(() =>
    arNavigationBackendService.getInitialVpsResult(voiceLanguageService.getLanguage())
  );
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>('anchor_entrance');
  const [showSamplesModal, setShowSamplesModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Pulse & Scan animations
  const scanBeamY = useSharedValue(0);
  const chevronOffset = useSharedValue(0);
  const targetPulse = useSharedValue(1);

  useEffect(() => {
    scanBeamY.value = withRepeat(
      withTiming(SCREEN_HEIGHT * 0.45, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    chevronOffset.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    targetPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, [chevronOffset, scanBeamY, targetPulse]);

  const scanBeamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanBeamY.value }],
  }));

  // Subscribe to device magnetometer sensor for real-time 360° AR positioning
  useEffect(() => {
    let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;

    const setupMagnetometer = async () => {
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (isAvailable) {
        Magnetometer.setUpdateInterval(60);
        subscription = Magnetometer.addListener((data) => {
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          let compassDegrees = Math.round(angle < 0 ? angle + 360 : angle);
          setDeviceHeading(compassDegrees);
        });
      }
    };

    setupMagnetometer();

    const unsubscribeLang = voiceLanguageService.subscribe((lang) => {
      setVoiceLang(lang);
    });

    return () => {
      if (subscription) subscription.remove();
      unsubscribeLang();
    };
  }, []);

  // Run initial VPS localization with default landmark
  const performLocalization = useCallback(
    async (uri: string, filename?: string) => {
      setIsAnalyzing(true);
      haptics.medium();

      try {
        const result = await arNavigationBackendService.uploadAndLocalize(
          {
            imageUri: uri,
            fileName: filename,
            deviceHeading,
            timestamp: Date.now(),
            userLocation: {
              latitude: 28.4984,
              longitude: 77.0895,
              accuracy: 0.6,
            },
          },
          voiceLang
        );

        setVpsResult(result);
        if (result.spatialAnchors.length > 0) {
          setSelectedAnchorId(result.spatialAnchors[0].id);
        }

        // Announce visual lock in active language
        if (!isMuted && result.spokenPrompt) {
          speechService.speak(result.spokenPrompt);
        }
      } catch {
        Alert.alert('Localization Notice', 'Offline sovereign fallback active for AR waypoints.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [deviceHeading, isMuted, voiceLang]
  );

  // Capture photo with camera
  const handleTakePhoto = async () => {
    haptics.selection();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permissions to capture live place photos for AR navigation.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        setActivePhotoUri(photo.uri);
        await performLocalization(photo.uri, photo.fileName || 'camera_place_photo.jpg');
      }
    } catch {
      Alert.alert('Camera Error', 'Could not access device camera. You can choose a sample photo.');
    }
  };

  // Upload photo from gallery
  const handlePickPhoto = async () => {
    haptics.selection();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow photo gallery access to upload a place photo for AR navigation.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        setActivePhotoUri(photo.uri);
        await performLocalization(photo.uri, photo.fileName || 'uploaded_place_photo.jpg');
      }
    } catch {
      Alert.alert('Gallery Error', 'Could not open photo library.');
    }
  };

  // Switch voice language
  const handleCycleLanguage = async () => {
    haptics.selection();
    const cycle: VoiceLanguageCode[] = ['en', 'bn', 'hi'];
    const next =
      cycle[(cycle.indexOf(voiceLang) + 1) % cycle.length] || 'en';
    await speechService.switchLanguageAndSpeak(next);
  };

  // Toggle audio mute
  const handleToggleMute = () => {
    haptics.selection();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
    if (!nextMuted) {
      speechService.speakPrompt('unmuted');
    }
  };

  // Replay speech prompt
  const handleSpeakCurrentGuidance = () => {
    haptics.light();
    if (vpsResult?.spokenPrompt) {
      speechService.speak(vpsResult.spokenPrompt);
    }
  };

  // Select sample landmark
  const handleSelectSample = (sample: SampleLandmarkPhoto) => {
    haptics.selection();
    setShowSamplesModal(false);
    setActivePhotoUri(sample.previewUrl);
    performLocalization(sample.previewUrl, sample.id);
  };

  const currentStep = vpsResult?.navigationSteps[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. REAL-WORLD CAMERA / PHOTO BACKDROP CANVAS */}
      <View style={StyleSheet.absoluteFill}>
        {activePhotoUri ? (
          <Image source={{ uri: activePhotoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#090F1D' }]} />
        )}

        {/* Holographic AR Dark Vignette */}
        <View style={styles.vignetteOverlay} />

        {/* 2. 3D SPATIAL PATH CHEVRONS (SVG PERSPECTIVE PROJECTION) */}
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="pathGradient" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#00E5FF" stopOpacity="0.85" />
              <Stop offset="0.5" stopColor="#0096FF" stopOpacity="0.5" />
              <Stop offset="1" stopColor="#00E5FF" stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="pulseGlow" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#00E5FF" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#00E5FF" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Perspective Ground Grid Lines */}
          <Line
            x1={SCREEN_WIDTH * 0.15}
            y1={SCREEN_HEIGHT}
            x2={SCREEN_WIDTH * 0.45}
            y2={SCREEN_HEIGHT * 0.58}
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeDasharray="6, 6"
          />
          <Line
            x1={SCREEN_WIDTH * 0.85}
            y1={SCREEN_HEIGHT}
            x2={SCREEN_WIDTH * 0.55}
            y2={SCREEN_HEIGHT * 0.58}
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeDasharray="6, 6"
          />

          {/* Animated Glowing AR Ground Chevrons */}
          <G transform={`translate(${SCREEN_WIDTH / 2}, ${SCREEN_HEIGHT * 0.72})`}>
            {/* Nearest Chevron */}
            <Path
              d="M -70,50 L 0,15 L 70,50 L 50,70 L 0,35 L -50,70 Z"
              fill="url(#pathGradient)"
            />
            {/* Mid Chevron */}
            <Path
              d="M -50, -5 L 0,-30 L 50,-5 L 35, 10 L 0,-15 L -35, 10 Z"
              fill="url(#pathGradient)"
              opacity="0.8"
            />
            {/* Distant Chevron */}
            <Path
              d="M -35,-55 L 0,-75 L 35,-55 L 25,-45 L 0,-60 L -25,-45 Z"
              fill="url(#pathGradient)"
              opacity="0.6"
            />
          </G>
        </Svg>

        {/* Neural Visual Scanner Beam (Active during analysis) */}
        {isAnalyzing && (
          <Animated.View style={[styles.scanBeam, scanBeamStyle]}>
            <View style={styles.scanBeamLine} />
            <Text style={styles.scanBeamText}>
              VPS NEURAL INFERENCE · DIGIPIN MATCHING · 4m×4m MESH
            </Text>
          </Animated.View>
        )}

        {/* Central HUD Crosshair Reticle */}
        <View style={styles.centerReticleContainer} pointerEvents="none">
          <View style={styles.reticleCrosshair}>
            <View style={[styles.reticleCorner, styles.reticleTL]} />
            <View style={[styles.reticleCorner, styles.reticleTR]} />
            <View style={[styles.reticleCorner, styles.reticleBL]} />
            <View style={[styles.reticleCorner, styles.reticleBR]} />
            <View style={styles.reticleDot} />
          </View>
          <Text style={styles.reticleBearingText}>
            {deviceHeading}° {getCompassDirection(deviceHeading)} · HDOP 0.6m
          </Text>
        </View>

        {/* 3. DYNAMIC 3D AR SPATIAL WAYPOINT ANCHORS */}
        {vpsResult?.spatialAnchors.map((anchor) => {
          const relBearing = arNavigationBackendService.calculateRelativeBearing(
            anchor.bearingDegrees,
            deviceHeading
          );

          const { x, y, isVisible, offscreenDirection } =
            arNavigationBackendService.calculateScreenPosition(
              relBearing,
              anchor.elevationAngleDegrees,
              SCREEN_WIDTH,
              SCREEN_HEIGHT,
              vpsResult.cameraFovDegrees
            );

          const isSelected = anchor.id === selectedAnchorId;

          // If out of camera FOV, render an off-screen edge indicator guiding the user to turn
          if (!isVisible) {
            return (
              <TouchableOpacity
                key={anchor.id}
                style={[
                  styles.offscreenGuidePill,
                  offscreenDirection === 'left' ? styles.offscreenLeft : styles.offscreenRight,
                  { borderColor: anchor.color },
                ]}
                onPress={() => {
                  haptics.selection();
                  setSelectedAnchorId(anchor.id);
                }}
                activeOpacity={0.85}>
                {offscreenDirection === 'left' ? (
                  <ChevronLeft size={14} color={anchor.color} />
                ) : (
                  <ChevronRight size={14} color={anchor.color} />
                )}
                <Text style={[styles.offscreenText, { color: anchor.color }]}>
                  {anchor.distanceMeters}m · {anchor.title.split('·')[0]}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <Animated.View
              key={anchor.id}
              style={[
                styles.anchorContainer,
                {
                  left: x - 75,
                  top: y - 55,
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.anchorPill,
                  {
                    borderColor: anchor.color,
                    backgroundColor: isSelected
                      ? 'rgba(0, 229, 255, 0.28)'
                      : 'rgba(10, 18, 32, 0.88)',
                  },
                ]}
                onPress={() => {
                  haptics.selection();
                  setSelectedAnchorId(anchor.id);
                  speechService.speak(
                    `${anchor.title}. ${anchor.distanceMeters} meters away. DigiPIN ${anchor.digiPin}.`
                  );
                }}
                activeOpacity={0.85}>
                {/* Icon category */}
                <View style={[styles.anchorIconCircle, { backgroundColor: anchor.color }]}>
                  {getCategoryIcon(anchor.category)}
                </View>

                {/* Info stack */}
                <View style={styles.anchorInfo}>
                  <Text style={styles.anchorTitle} numberOfLines={1}>
                    {anchor.title}
                  </Text>
                  <View style={styles.anchorSubRow}>
                    <Text style={[styles.anchorDistance, { color: anchor.color }]}>
                      {anchor.distanceMeters}m
                    </Text>
                    <Text style={styles.anchorPin}>{anchor.digiPin}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Waypoint Vertical Needle Pointer */}
              <View style={[styles.anchorNeedle, { backgroundColor: anchor.color }]} />
              <View style={[styles.anchorGroundDot, { backgroundColor: anchor.color }]} />
            </Animated.View>
          );
        })}
      </View>

      {/* 4. TOP HUD COCKPIT HEADER */}
      <SafeAreaView style={styles.topHud} edges={['top']}>
        <View style={styles.topBarRow}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.hudCircleBtn}
            onPress={() => {
              haptics.light();
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close AR navigation">
            <X size={20} color="#fff" />
          </TouchableOpacity>

          {/* Place Title & Satellite Fix */}
          <TouchableOpacity
            style={styles.headerTitlePill}
            onPress={() => setShowSamplesModal(true)}
            activeOpacity={0.85}>
            <View style={styles.headerDotPulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerPlaceTitle} numberOfLines={1}>
                {vpsResult?.placeName || 'Scanning Place...'}
              </Text>
              <Text style={styles.headerSubNavic}>
                NavIC L5+S · DigiPIN {vpsResult?.digiPin || '4m×4m Grid'}
              </Text>
            </View>
            <Sparkles size={14} color="#00E5FF" />
          </TouchableOpacity>

          {/* Controls: Voice Lang Switcher & Mute */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.langPill}
              onPress={handleCycleLanguage}
              accessibilityRole="button"
              accessibilityLabel="Switch Voice Language">
              <Globe size={13} color="#00E5FF" />
              <Text style={styles.langPillText}>{voiceLang.toUpperCase()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hudCircleBtn}
              onPress={handleToggleMute}
              accessibilityRole="button"
              accessibilityLabel={isMuted ? 'Unmute voice' : 'Mute voice'}>
              {isMuted ? <VolumeX size={18} color="#FF9800" /> : <Volume2 size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend VPS Status Banner */}
        <View style={styles.vpsTelemetryBar}>
          <View style={styles.vpsConfidenceGroup}>
            <ShieldCheck size={13} color="#00C06D" />
            <Text style={styles.vpsConfidenceText}>
              VPS Confidence {Math.round((vpsResult?.confidenceScore ?? 0.98) * 100)}%
            </Text>
          </View>
          <Text style={styles.vpsLatencyText}>
            Server: {vpsResult?.serverLatencyMs ?? 42}ms · Sovereign VPS
          </Text>
        </View>
      </SafeAreaView>

      {/* 5. BOTTOM HUD CONTROLS & STEP GUIDANCE */}
      <View
        style={[styles.bottomHudContainer, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
        {/* Active Turn Guidance Card */}
        {currentStep && (
          <TouchableOpacity
            style={styles.guidanceCard}
            onPress={handleSpeakCurrentGuidance}
            activeOpacity={0.9}>
            <View style={styles.stepIconRing}>
              <ArrowUpRight size={22} color="#00E5FF" strokeWidth={2.6} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.stepDistanceRow}>
                <Text style={styles.stepDistanceNumber}>{currentStep.distanceMeters}m</Text>
                <Text style={styles.stepDistanceLabel}>Next Action</Text>
              </View>
              <Text style={styles.stepInstructionText} numberOfLines={2}>
                {voiceLang === 'bn'
                  ? currentStep.instructionBn || currentStep.instruction
                  : voiceLang === 'hi'
                    ? currentStep.instructionHi || currentStep.instruction
                    : currentStep.instruction}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.speakRepeatBtn}
              onPress={handleSpeakCurrentGuidance}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Volume2 size={16} color="#00E5FF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Action Buttons: Take Photo / Upload Photo / Samples */}
        <View style={styles.bottomControlsRow}>
          {/* Snap Camera Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.cameraBtn]}
            onPress={handleTakePhoto}
            activeOpacity={0.85}>
            <Camera size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Snap Photo</Text>
          </TouchableOpacity>

          {/* Upload Gallery Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadBtn]}
            onPress={handlePickPhoto}
            activeOpacity={0.85}>
            <ImageIcon size={18} color="#00E5FF" />
            <Text style={[styles.actionBtnText, { color: '#00E5FF' }]}>Upload Place</Text>
          </TouchableOpacity>

          {/* Sample Landmarks Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.sampleBtn]}
            onPress={() => setShowSamplesModal(true)}
            activeOpacity={0.85}>
            <Layers size={18} color="#FFD700" />
            <Text style={[styles.actionBtnText, { color: '#FFD700' }]}>Samples</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. SAMPLE LANDMARKS SELECTION MODAL */}
      {showSamplesModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Sample Landmark</Text>
                <Text style={styles.modalSubtitle}>
                  Test AR VPS navigation with verified sovereign place photos
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowSamplesModal(false)}>
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {SAMPLE_LANDMARK_PHOTOS.map((sample) => (
                <TouchableOpacity
                  key={sample.id}
                  style={styles.sampleItemRow}
                  onPress={() => handleSelectSample(sample)}
                  activeOpacity={0.85}>
                  <Image source={{ uri: sample.previewUrl }} style={styles.sampleThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.sampleItemTitle}>{sample.title}</Text>
                    <Text style={styles.sampleItemCity}>{sample.city}</Text>
                    <Text style={styles.sampleItemDigi}>{sample.digiPin}</Text>
                  </View>
                  <ChevronRight size={18} color="#707884" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Analysis Spinner Overlay */}
      {isAnalyzing && (
        <View style={styles.loadingBackdrop} pointerEvents="none">
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Sending Place Photo to Backend VPS...</Text>
          <Text style={styles.loadingSub}>Extracting Visual Features · NavIC Ground Grid</Text>
        </View>
      )}
    </View>
  );
}

function getCompassDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((bearing %= 360) < 0 ? bearing + 360 : bearing) / 45) % 8;
  return directions[index];
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'destination':
      return <MapPin size={13} color="#fff" />;
    case 'entrance':
      return <DoorIcon />;
    case 'turn_maneuver':
      return <ArrowUpRight size={13} color="#fff" />;
    case 'ev_charging':
      return <Zap size={13} color="#fff" />;
    case 'parking':
      return <Car size={13} color="#fff" />;
    default:
      return <MapPin size={13} color="#fff" />;
  }
}

function DoorIcon() {
  return (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
      <Path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <Path d="M2 20h20" />
      <Circle cx="14" cy="12" r="1" fill="#fff" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  vignetteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 11, 20, 0.45)',
  },

  /* Scan Beam */
  scanBeam: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanBeamLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  scanBeamText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },

  /* Reticle */
  centerReticleContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.42,
    left: SCREEN_WIDTH / 2 - 40,
    width: 80,
    alignItems: 'center',
  },
  reticleCrosshair: {
    width: 50,
    height: 50,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCorner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: '#00E5FF',
  },
  reticleTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  reticleTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  reticleBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  reticleBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  reticleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E5FF',
  },
  reticleBearingText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    color: '#E0F7FF',
    backgroundColor: 'rgba(5, 11, 20, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  /* Waypoint Anchors */
  anchorContainer: {
    position: 'absolute',
    width: 150,
    alignItems: 'center',
  },
  anchorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  anchorIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorInfo: {
    flex: 1,
  },
  anchorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  anchorSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  anchorDistance: {
    fontSize: 10,
    fontWeight: '800',
  },
  anchorPin: {
    fontSize: 9,
    color: '#A0A8B4',
  },
  anchorNeedle: {
    width: 2,
    height: 24,
  },
  anchorGroundDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* Offscreen Guides */
  offscreenGuidePill: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 18, 32, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  offscreenLeft: { left: 12 },
  offscreenRight: { right: 12 },
  offscreenText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* Top HUD */
  topHud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 8,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 18, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitlePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 18, 32, 0.88)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    gap: 8,
  },
  headerDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C06D',
  },
  headerPlaceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubNavic: {
    fontSize: 10,
    color: '#00E5FF',
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 18, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    justifyContent: 'center',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00E5FF',
  },

  /* VPS Telemetry Bar */
  vpsTelemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 18, 32, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vpsConfidenceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vpsConfidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C06D',
  },
  vpsLatencyText: {
    fontSize: 10,
    color: '#A0A8B4',
    fontWeight: '500',
  },

  /* Bottom HUD */
  bottomHudContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 12,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 18, 32, 0.94)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  stepIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  stepDistanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stepDistanceNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00E5FF',
  },
  stepDistanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A8B4',
    textTransform: 'uppercase',
  },
  stepInstructionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  speakRepeatBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Action Buttons Row */
  bottomControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: '#0096FF',
    borderColor: '#00B0FF',
  },
  uploadBtn: {
    backgroundColor: 'rgba(10, 18, 32, 0.92)',
    borderColor: '#00E5FF',
  },
  sampleBtn: {
    backgroundColor: 'rgba(10, 18, 32, 0.92)',
    borderColor: '#FFD700',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Samples Modal */
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0D1626',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#A0A8B4',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sampleThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  sampleItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sampleItemCity: {
    fontSize: 11,
    color: '#00E5FF',
    marginTop: 2,
  },
  sampleItemDigi: {
    fontSize: 10,
    color: '#A0A8B4',
    marginTop: 1,
  },

  /* Loading Overlay */
  loadingBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 11, 20, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00E5FF',
  },
  loadingSub: {
    fontSize: 11,
    color: '#A0A8B4',
  },
});
