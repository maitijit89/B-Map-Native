import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useIsFocused } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  fluidEntering,
  fluidEnteringUp,
  fluidEnteringLeft,
  fluidEnteringRight,
} from '@/shared/animations';
import {
  Bell,
  User,
  Camera,
  Sun,
  Video,
  Layers,
  Route,
  LocateFixed,
  Building,
  House,
  Star,
  Zap,
  Fuel,
  SquareParking,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Satellite,
  MapPin,
  TriangleAlert,
  Droplets,
  Wind,
  Eye,
  Mic,
  Search,
} from 'lucide-react-native';
import { VectorMapCanvas } from '../components/VectorMapCanvas';
import { GpsLocationLockModal } from '../components/GpsLocationLockModal';
import { useThemeColors, useLocation, usePoiCollisionEngine, RawMapPoi, MapEdgePadding } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Card,
  Button,
  StatusBadge,
  BottomSheet,
  DynamicCompassIcon,
  AnimatedPressable,
} from '@/shared/components/ui';
import { VoiceListeningModal } from '@/shared/components/voice/VoiceListeningModal';
import { haptics } from '@/shared/utils/haptics';
import { notificationService, VoiceRecognitionResult } from '@/shared/services';

type MapLayerType = 'standard' | 'satellite' | 'night' | 'navic';

const INITIAL_POIS: RawMapPoi[] = [
  { id: 'haz-nh48', title: 'Pothole · km 42', category: 'HAZARD', lat: 28.5921, lng: 77.1642, priority: 100, badgeCount: 18 },
  { id: 'metro-grand', title: 'Grand Metro Stn', category: 'METRO', lat: 28.5884, lng: 77.1715, priority: 85 },
  { id: 'ev-bpower', title: 'B-Power 120kW', category: 'EV', lat: 28.5840, lng: 77.1812, priority: 80, freeCount: 6 },
  { id: 'mall-ifc', title: 'IFC Mall', category: 'PARKING', lat: 28.5819, lng: 77.1795, priority: 70, rating: 4.8 },
  { id: 'cafe-blue', title: 'Blue Oasis Cafe', category: 'COMMERCIAL', lat: 28.5802, lng: 77.1685, priority: 60 },
  { id: 'park-tech', title: 'Tech Innovation Park', category: 'COMMERCIAL', lat: 28.5935, lng: 77.1780, priority: 65 },
];

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

  const [topHudHeight, setTopHudHeight] = useState<number>(0);
  const floatingTop = topHudHeight > 0 ? topHudHeight + 10 : Math.max(insets.top + 118, 162);

  // Flowstep v3.0 Physics-Driven 3-Detent Bottom Sheet (18% Peek, 45% Half, 88% Expanded)
  const [detentIndex, setDetentIndex] = useState<0 | 1 | 2>(1);

  const bottomSheetHeight = useMemo(() => {
    switch (detentIndex) {
      case 0:
        return 96;
      case 1:
        return 220;
      case 2:
        return 460;
    }
  }, [detentIndex]);

  // World-Space Camera Safe-Zone Edge Padding (Zero POI overlap with HUD, IMD pills, or Right FABs)
  const mapEdgePadding: MapEdgePadding = useMemo(() => ({
    top: floatingTop,
    bottom: bottomSheetHeight + Math.max(insets.bottom, 14) + 68,
    left: 164, // 164pt clearance for left IMD Weather & Radar pills
    right: 76, // 76pt clearance for Right FAB stack
  }), [floatingTop, bottomSheetHeight, insets.bottom]);

  const resolvedPois = usePoiCollisionEngine({
    pois: INITIAL_POIS,
    viewportWidth: viewportWidth || 420,
    viewportHeight: viewportHeight || 860,
    edgePadding: mapEdgePadding,
    centerLat: 28.5870,
    centerLng: 77.1720,
    zoomLevel: 14,
  });

  const [showTraffic, setShowTraffic] = useState(true);
  const [isHomeStarred, setIsHomeStarred] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>('standard');
  const [showCameras, setShowCameras] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [showGpsLockModal, setShowGpsLockModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(() =>
    notificationService.getUnreadCountSync()
  );

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((_, unread) => {
      setUnreadNotifications(unread);
    });
    return unsubscribe;
  }, []);

  const isFocused = useIsFocused();

  // Pulse animation for weather & speed camera badge (active only when focused)
  const alertPulse = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      alertPulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900 }),
          withTiming(1, { duration: 900 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(alertPulse);
      alertPulse.value = 1;
    }
  }, [isFocused, alertPulse]);

  const alertAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: alertPulse.value }],
    };
  });

  const handleCompassPress = useCallback(() => {
    haptics.selection();
    router.push('/compass-hud' as any);
  }, []);

  const handleStartNav = useCallback(() => {
    haptics.medium();
    router.push('/modal');
  }, []);

  const handlePoiSelect = useCallback((poiName: string) => {
    haptics.medium();
    if (poiName.includes('Road Hazard')) {
      Alert.alert(
        'Crowdsourced Road Hazard ⚠️',
        `${poiName}\nHigh severity road depression reported on Right Lane.\n18 NavIC community drivers verified.`,
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View Hazard Details',
            onPress: () => router.push('/hazard-report'),
          },
        ]
      );
      return;
    }
    Alert.alert('Waypoint Selected', `${poiName}\nReady for turn-by-turn guidance.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Route', onPress: handleStartNav },
    ]);
  }, [handleStartNav]);

  const { establishGpsLock, gpsLockTelemetry } = useLocation(false);

  const handleLocateMe = useCallback(async () => {
    haptics.heavy();
    setIsLocating(true);
    try {
      await establishGpsLock();
      setIsGpsLocked(true);
      setShowGpsLockModal(true);
    } catch {
      setShowGpsLockModal(true);
    } finally {
      setIsLocating(false);
    }
  }, [establishGpsLock]);

  const handleNavicPillPress = useCallback(() => {
    haptics.selection();
    setShowGpsLockModal(true);
  }, []);

  const handleVoiceAssistant = useCallback(() => {
    haptics.medium();
    setShowVoiceModal(true);
  }, []);

  const handleVoiceResult = useCallback((res: VoiceRecognitionResult) => {
    if (res.intent.targetRoute) {
      router.push(res.intent.targetRoute as any);
    } else if (res.transcript && res.transcript.trim()) {
      router.push({
        pathname: '/search',
        params: { q: res.transcript.trim() },
      } as any);
    }
  }, []);

  const handleLayerModalClose = useCallback(() => {
    setShowLayerModal(false);
  }, []);

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      {/* 1. IMMERSIVE FULL-VIEWPORT VECTOR MAP CANVAS */}
      <View style={StyleSheet.absoluteFill}>
        <VectorMapCanvas
          onPoiPress={handlePoiSelect}
          showTraffic={showTraffic}
          showHazards={showHazards}
          mapLayer={selectedLayer}
          isLocating={isLocating}
          isGpsLocked={isGpsLocked}
          resolvedPois={resolvedPois}
        />
      </View>

      {/* 2. FLOATING TOP HUD (Brand Cluster + Search Bar + Mode Chips) */}
      <SafeAreaView
        edges={['top']}
        style={styles.floatingTopSafeArea}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height > 0 && Math.abs(height - topHudHeight) > 2) {
            setTopHudHeight(height);
          }
        }}
        pointerEvents="box-none">
        {/* Consolidated 2-Row Omni-Header (Flowstep v3.0 Solid Opaque Architecture) */}
        <Animated.View
          entering={fluidEntering(0)}
          style={[
            styles.omniHeaderCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
            },
          ]}>
          {/* Row 1: 3D Squircle | B-MAP & NavIC L5+S Badge | SOS 112 | Bell | Profile */}
          <View style={styles.omniRow1}>
            <View style={styles.omniRow1Left}>
              <AnimatedPressable
                onPress={handleCompassPress}
                accessibilityRole="button"
                accessibilityLabel="3D Gyro Compass HUD"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <DynamicCompassIcon size={34} dynamic={true} tilt3D={true} borderRadius={10} />
              </AnimatedPressable>

              <View style={styles.titleColumn}>
                <View style={styles.logoRow}>
                  <Text style={[styles.logoTag, { color: colors.primary }]}>B-MAP</Text>
                  <AnimatedPressable
                    onPress={handleNavicPillPress}
                    accessibilityRole="button"
                    accessibilityLabel="NavIC GPS Telemetry"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.navicMiniPill,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderColor: colors.primary,
                        borderWidth: 1,
                      },
                    ]}>
                    <Satellite size={11} color={colors.primary} />
                    <Text
                      style={[
                        styles.navicMiniText,
                        { color: colors.primary, fontVariant: ['tabular-nums'] },
                      ]}>
                      NavIC L5+S ±0.7m (8 Sat)
                    </Text>
                  </AnimatedPressable>
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
                  Explore · NH-48 Express Corridor
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {/* 1-Tap SOS 112 Safety Beacon */}
              <AnimatedPressable
                style={[
                  styles.sosPillButton,
                  {
                    backgroundColor: colors.errorContainer,
                    borderColor: colors.error,
                    borderWidth: 1,
                  },
                ]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Emergency SOS 112 Beacon"
                onPress={() => {
                  haptics.heavy();
                  router.push('/sos-distress');
                }}>
                <ShieldAlert size={14} color={colors.onErrorContainer} />
                <Text
                  style={[
                    styles.sosPillText,
                    { color: colors.onErrorContainer, fontVariant: ['tabular-nums'] },
                  ]}>
                  SOS
                </Text>
              </AnimatedPressable>

              {/* Notifications */}
              <AnimatedPressable
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={`Notifications, ${unreadNotifications} unread alerts`}
                onPress={() => {
                  haptics.light();
                  router.push('/notifications');
                }}>
                <Bell size={17} color={colors.onSurfaceVariant} />
                {unreadNotifications > 0 && (
                  <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
                )}
              </AnimatedPressable>

              {/* User Profile */}
              <AnimatedPressable
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="User profile"
                onPress={() => {
                  haptics.light();
                  router.push('/auth');
                }}>
                <User size={16} color={colors.onPrimary} />
              </AnimatedPressable>
            </View>
          </View>

          {/* Row 2: Search Place, Address or 10-Char DigiPIN | Mic | AR */}
          <View style={styles.omniRow2}>
            <TouchableOpacity
              style={[
                styles.omniSearchBox,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/search');
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Search destination, address or DigiPIN">
              <Search size={16} color={colors.onSurfaceVariant} />
              <Text
                style={[styles.omniSearchPlaceholder, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}>
                Search Place, Address or 10-Char DigiPIN...
              </Text>
              <View style={styles.omniSearchActions}>
                <TouchableOpacity
                  style={[
                    styles.omniActionBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                  onPress={handleVoiceAssistant}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Voice Search">
                  <Mic size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.omniActionBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                  onPress={() => {
                    haptics.medium();
                    router.push('/ar-navigation');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="AR Photo Navigation">
                  <Camera size={15} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* 3. FLOATING LEFT ENVIRONMENTAL & ROAD SAFETY WIDGETS */}
      <View style={[styles.floatingLeftWidgets, { top: floatingTop }]} pointerEvents="box-none">
        {/* Weather & Air Quality Pill */}
        <AnimatedPressable
          entering={fluidEnteringLeft(30)}
          onPress={() => {
            haptics.light();
            setShowWeatherModal(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="View live weather and air quality report"
          style={[
            styles.weatherPill,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
            },
          ]}>
          <View style={styles.weatherIconCircle}>
            <Sun size={14} color="#FF9800" />
          </View>
          <View>
            <Text style={[styles.weatherTemp, { color: colors.onSurface }]}>24°C Sunny</Text>
            <View style={styles.aqiRow}>
              <View style={[styles.aqiDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.aqiText, { color: colors.secondary }]}>AQI 28 · Good</Text>
            </View>
          </View>
        </AnimatedPressable>

        {/* Speed Camera Alert Badge */}
        <AnimatedPressable
          entering={fluidEnteringLeft(40)}
          onPress={() => {
            haptics.light();
            Alert.alert(
              'NH-48 Radar Enforcement',
              'Fixed Speed Camera 450m ahead on Northbound Express Corridor.\nSpeed Limit: 70 km/h · Distance: 450m.\nTraffic condition: Clear flow.'
            );
          }}
          accessibilityRole="button"
          accessibilityLabel="Speed camera alert advisory">
          <Animated.View
            style={[
              styles.speedCameraBadge,
              alertAnimatedStyle,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <View style={[styles.cameraAlertDot, { backgroundColor: colors.error + '20' }]}>
              <Video size={11} color={colors.error} />
            </View>
            <Text style={[styles.speedCameraText, { color: colors.onSurface }]}>
              Camera 450m ahead
            </Text>
          </Animated.View>
        </AnimatedPressable>
      </View>

      {/* 4. FLOATING RIGHT INTERACTIVE CONTROLS */}
      <Animated.View
        entering={fluidEnteringRight(20)}
        style={[styles.floatingRightControls, { top: floatingTop }]}
        pointerEvents="box-none">
        {/* Map Layers */}
        <AnimatedPressable
          style={[
            styles.fabBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
              borderWidth: 1,
            },
          ]}
          onPress={() => {
            haptics.light();
            setShowLayerModal(true);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Map layers">
          <Layers size={19} color={colors.onSurfaceVariant} />
        </AnimatedPressable>

        {/* Traffic Toggle */}
        <AnimatedPressable
          style={[
            styles.fabBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: showTraffic ? colors.primary : colors.surfaceContainerHigh,
              borderWidth: 1,
            },
          ]}
          onPress={() => {
            haptics.light();
            setShowTraffic(!showTraffic);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Toggle live traffic">
          <View style={styles.trafficIconWrapper}>
            <View
              style={[
                styles.trafficIndicatorDot,
                {
                  backgroundColor: showTraffic
                    ? colors.primaryContainer
                    : colors.outlineVariant,
                },
              ]}
            />
            <View style={styles.trafficBars}>
              <View style={[styles.miniBar, { backgroundColor: colors.trafficGreen }]} />
              <View style={[styles.miniBar, { backgroundColor: colors.trafficOrange }]} />
              <View style={[styles.miniBar, { backgroundColor: colors.trafficRed }]} />
            </View>
          </View>
        </AnimatedPressable>

        {/* Route Planner FAB */}
        <AnimatedPressable
          style={[
            styles.fabBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
              borderWidth: 1,
            },
          ]}
          onPress={() => {
            haptics.medium();
            router.push('/transit-planner');
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Route Planner">
          <Route size={19} color={colors.primary} />
        </AnimatedPressable>

        {/* Recenter / Locate Me FAB (NavIC L5+S Dual-Band) */}
        <AnimatedPressable
          style={[
            styles.locateMeFab,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: isLocating ? colors.primary : colors.surfaceContainerHigh,
              borderWidth: 1,
            },
          ]}
          onPress={handleLocateMe}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Re-center map">
          <LocateFixed
            size={22}
            color={isGpsLocked ? colors.trafficGreen : colors.primaryContainer}
          />
        </AnimatedPressable>
      </Animated.View>

      {/* 5. FLOWSTEP v3.0 PHYSICS-DRIVEN 3-DETENT BOTTOM SHEET */}
      <Animated.View
        entering={fluidEnteringUp(50)}
        style={[
          styles.bottomSheetHUD,
          {
            bottom: detentIndex === 2 ? Math.max(insets.bottom, 10) + 12 : Math.max(insets.bottom, 14) + 76,
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.surfaceContainerHigh,
            borderWidth: 1,
            maxHeight: bottomSheetHeight + 64,
          },
        ]}>
        {/* Drag / Detent Cycle Handle */}
        <TouchableOpacity
          style={styles.sheetHandleContainer}
          onPress={() => {
            haptics.selection();
            setDetentIndex((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Bottom sheet detent ${detentIndex + 1} of 3`}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.sheetExpandRow}>
            <Text style={[styles.sheetExpandText, { color: colors.onSurfaceVariant }]}>
              {detentIndex === 0
                ? 'Peek (18%) · Tap to Expand'
                : detentIndex === 1
                ? 'Commute & Places (45%)'
                : 'Commute & Sovereign Tools (88%)'}
            </Text>
            {detentIndex === 2 ? (
              <ChevronDown size={14} color={colors.onSurfaceVariant} />
            ) : (
              <ChevronUp size={14} color={colors.onSurfaceVariant} />
            )}
          </View>
        </TouchableOpacity>

        {/* Commute Target: Company (Available in all 3 detents) */}
        <Card
          variant="flat"
          padding="sm"
          style={styles.commuteWorkCard}
          onPress={handleStartNav}>
          <View style={styles.commuteLeft}>
            <View
              style={[
                styles.workIconBox,
                { backgroundColor: colors.surfaceContainerHighest },
              ]}>
              <Building size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.commuteTitleRow}>
                <Text style={[styles.commuteTitle, { color: colors.onSurface }]}>Company</Text>
                <StatusBadge status="success" label="Fastest Route" size="sm" pulsing />
              </View>
              <View style={styles.commuteMetaRow}>
                <Text
                  style={[
                    styles.commuteTimeText,
                    { color: colors.onSurface, fontVariant: ['tabular-nums'] },
                  ]}>
                  28 min
                </Text>
                <Text style={[styles.dotSeparator, { color: colors.onSurfaceVariant }]}>·</Text>
                <Text
                  style={[
                    styles.commuteDistText,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  14.2 km
                </Text>
                <Text style={[styles.dotSeparator, { color: colors.onSurfaceVariant }]}>·</Text>
                <Text
                  style={[styles.commuteRoadText, { color: colors.onSurfaceVariant }]}
                  numberOfLines={1}>
                  via NH-48
                </Text>
              </View>
            </View>
          </View>

          <Button
            variant="primary"
            size="sm"
            title="Start ▶"
            onPress={handleStartNav}
          />
        </Card>

        {/* Detent 2 (Expanded): Home Card & Sovereign Tools Grid */}
        {detentIndex === 2 && (
          <>
            <Card
              variant="flat"
              padding="sm"
              style={styles.commuteHomeCard}
              onPress={() => {
                haptics.light();
                Alert.alert('Configure Home', 'Enter home address to set automatic commute alerts');
              }}>
              <View style={styles.commuteLeft}>
                <View
                  style={[
                    styles.homeIconBox,
                    { backgroundColor: colors.surfaceContainerLow },
                  ]}>
                  <House size={18} color={colors.onSurfaceVariant} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.commuteTitle, { color: colors.onSurface }]}>Home</Text>
                  <Text style={[styles.commuteSubText, { color: colors.onSurfaceVariant }]}>
                    Set home location for 1-tap guidance
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.starIconButton}
                onPress={() => {
                  haptics.selection();
                  setIsHomeStarred(!isHomeStarred);
                }}
                accessibilityRole="button"
                accessibilityLabel="Star home location">
                <Star
                  size={18}
                  color={isHomeStarred ? '#FF9800' : colors.outlineVariant}
                  fill={isHomeStarred ? '#FF9800' : 'transparent'}
                />
              </TouchableOpacity>
            </Card>

            {/* Sovereign Quick Tools Row */}
            <View style={styles.quickToolsRow}>
              <TouchableOpacity
                style={[
                  styles.quickToolBtn,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/digipin-explorer');
                }}
                activeOpacity={0.8}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>DigiPIN Grid</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickToolBtn,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/tsp-optimizer');
                }}
                activeOpacity={0.8}>
                <Route size={16} color={colors.secondary} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>TSP Delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickToolBtn,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/indoor-parking');
                }}
                activeOpacity={0.8}>
                <SquareParking size={16} color={colors.trafficGreen} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>Indoor Bay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickToolBtn,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/hazard-report');
                }}
                activeOpacity={0.8}>
                <TriangleAlert size={16} color={colors.error} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>Report Hazard</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Detent 1 & 2: Quick Categories Track */}
        {detentIndex >= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poiCategoriesTrack}
            style={styles.poiCategoriesScrollView}>
            <TouchableOpacity
              style={[
                styles.poiCategoryCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/ev-station');
              }}
              activeOpacity={0.8}>
              <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.primaryContainer + '25' }]}>
                <Zap size={14} color={colors.primaryContainer} />
              </View>
              <View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>EV Charge</Text>
                <Text
                  style={[
                    styles.poiCategorySub,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  6 free
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.poiCategoryCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                haptics.light();
                Alert.alert('Fuel Stations', 'Showing 28 verified petrol & CNG stations along NH-48');
              }}
              activeOpacity={0.8}>
              <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.tertiary + '20' }]}>
                <Fuel size={14} color={colors.tertiary} />
              </View>
              <View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Fuel</Text>
                <Text
                  style={[
                    styles.poiCategorySub,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  28 stations
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.poiCategoryCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/indoor-parking');
              }}
              activeOpacity={0.8}>
              <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.trafficGreen + '20' }]}>
                <SquareParking size={14} color={colors.trafficGreen} />
              </View>
              <View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Indoor Park</Text>
                <Text
                  style={[
                    styles.poiCategorySub,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  18 lots
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.poiCategoryCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                haptics.light();
                Alert.alert('FASTag Plaza', 'Upcoming Toll: Kherki Daula · ₹85 Auto-Debit');
              }}
              activeOpacity={0.8}>
              <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.primary + '20' }]}>
                <Route size={14} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>FASTag</Text>
                <Text
                  style={[
                    styles.poiCategorySub,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  Toll ₹85
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.poiCategoryCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/hazard-report');
              }}
              activeOpacity={0.8}>
              <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.error + '20' }]}>
                <TriangleAlert size={14} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>V2X Hazard</Text>
                <Text
                  style={[
                    styles.poiCategorySub,
                    { color: colors.onSurfaceVariant, fontVariant: ['tabular-nums'] },
                  ]}>
                  18 reports
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>

      {/* MAP LAYER SELECTOR BOTTOM SHEET MODAL */}
      <BottomSheet
        visible={showLayerModal}
        onClose={handleLayerModalClose}
        title="Map Style & Overlay Layers"
        subtitle="Custom vector cartography rendering engines">
        <View style={styles.layerOptionsGrid}>
          <TouchableOpacity
            style={[
              styles.layerGridOption,
              {
                backgroundColor:
                  selectedLayer === 'standard'
                    ? colors.primaryContainer
                    : colors.surfaceContainerLow,
                borderColor:
                  selectedLayer === 'standard'
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => {
              haptics.selection();
              setSelectedLayer('standard');
            }}>
            <Text
              style={[
                styles.layerGridOptionTitle,
                { color: selectedLayer === 'standard' ? colors.onPrimary : colors.onSurface },
              ]}>
              Standard Vector
            </Text>
            <Text style={[styles.layerGridOptionSub, { color: colors.onSurfaceVariant }]}>
              High contrast road layout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.layerGridOption,
              {
                backgroundColor:
                  selectedLayer === 'satellite'
                    ? colors.primaryContainer
                    : colors.surfaceContainerLow,
                borderColor:
                  selectedLayer === 'satellite'
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => {
              haptics.selection();
              setSelectedLayer('satellite');
            }}>
            <Text
              style={[
                styles.layerGridOptionTitle,
                { color: selectedLayer === 'satellite' ? colors.onPrimary : colors.onSurface },
              ]}>
              Satellite Hybrid
            </Text>
            <Text style={[styles.layerGridOptionSub, { color: colors.onSurfaceVariant }]}>
              Photorealistic imagery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.layerGridOption,
              {
                backgroundColor:
                  selectedLayer === 'night'
                    ? colors.primaryContainer
                    : colors.surfaceContainerLow,
                borderColor:
                  selectedLayer === 'night'
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => {
              haptics.selection();
              setSelectedLayer('night');
            }}>
            <Text
              style={[
                styles.layerGridOptionTitle,
                { color: selectedLayer === 'night' ? colors.onPrimary : colors.onSurface },
              ]}>
              OLED Night Mode
            </Text>
            <Text style={[styles.layerGridOptionSub, { color: colors.onSurfaceVariant }]}>
              Ultra dark high contrast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.layerGridOption,
              {
                backgroundColor:
                  selectedLayer === 'navic'
                    ? colors.primaryContainer
                    : colors.surfaceContainerLow,
                borderColor:
                  selectedLayer === 'navic'
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => {
              haptics.selection();
              setSelectedLayer('navic');
            }}>
            <Text
              style={[
                styles.layerGridOptionTitle,
                { color: selectedLayer === 'navic' ? colors.onPrimary : colors.onSurface },
              ]}>
              ISRO NavIC HD
            </Text>
            <Text style={[styles.layerGridOptionSub, { color: colors.onSurfaceVariant }]}>
              Sovereign dual-band GIS
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.layerSwitchRow}>
          <Text style={[styles.layerSwitchLabel, { color: colors.onSurface }]}>Fixed Speed Radar Guns</Text>
          <Switch
            value={showCameras}
            onValueChange={(val) => {
              haptics.selection();
              setShowCameras(val);
            }}
          />
        </View>

        <View style={styles.layerSwitchRow}>
          <Text style={[styles.layerSwitchLabel, { color: colors.onSurface }]}>Crowdsourced Hazards</Text>
          <Switch
            value={showHazards}
            onValueChange={(val) => {
              haptics.selection();
              setShowHazards(val);
            }}
          />
        </View>
      </BottomSheet>

      {/* IMD WEATHER & AIR QUALITY ADVISORY BOTTOM SHEET MODAL */}
      <BottomSheet
        visible={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        title="Weather & Air Quality"
        subtitle="IMD Sovereign Weather · CPCB Delhi NCR Telematics">
        <View style={styles.weatherModalContent}>
          {/* Main Temperature & Condition Card */}
          <View
            style={[
              styles.weatherHeroCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <View style={styles.weatherHeroLeft}>
              <View style={[styles.weatherHeroIconCircle, { backgroundColor: '#FF9800' + '20' }]}>
                <Sun size={28} color="#FF9800" />
              </View>
              <View>
                <Text style={[styles.weatherHeroTemp, { color: colors.onSurface }]}>24°C</Text>
                <Text style={[styles.weatherHeroCondition, { color: colors.onSurfaceVariant }]}>
                  Sunny · Clear Sky
                </Text>
              </View>
            </View>
            <View style={styles.weatherHeroRight}>
              <Text style={[styles.weatherFeelsLike, { color: colors.onSurfaceVariant }]}>
                Feels like 25°C
              </Text>
              <Text style={[styles.weatherStationText, { color: colors.primary }]}>
                IMD Palam Stn
              </Text>
            </View>
          </View>

          {/* AQI Telematics Strip */}
          <View
            style={[
              styles.aqiCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <View style={styles.aqiHeaderRow}>
              <View style={styles.aqiTitleGroup}>
                <Text style={[styles.aqiCardTitle, { color: colors.onSurface }]}>
                  Air Quality Index (AQI)
                </Text>
                <Text style={[styles.aqiStationSub, { color: colors.onSurfaceVariant }]}>
                  CPCB Real-Time Telemetry
                </Text>
              </View>
              <View style={[styles.aqiScoreBadge, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={[styles.aqiScoreText, { color: colors.secondary }]}>28 · Good</Text>
              </View>
            </View>
            <View style={styles.aqiBarTrack}>
              <View style={[styles.aqiBarFill, { backgroundColor: colors.secondary, width: '28%' }]} />
            </View>
            <Text style={[styles.aqiAdvisoryText, { color: colors.onSurfaceVariant }]}>
              Air quality is optimal. Perfect conditions for open corridor transit and outdoor commuting.
            </Text>
          </View>

          {/* 4-Metric Grid (Humidity, Wind, UV Index, Visibility) */}
          <View style={styles.weatherMetricGrid}>
            <View
              style={[
                styles.weatherMetricTile,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Droplets size={16} color={colors.primary} />
              <Text style={[styles.weatherMetricValue, { color: colors.onSurface }]}>48%</Text>
              <Text style={[styles.weatherMetricLabel, { color: colors.onSurfaceVariant }]}>
                HUMIDITY
              </Text>
            </View>
            <View
              style={[
                styles.weatherMetricTile,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Wind size={16} color={colors.secondary} />
              <Text style={[styles.weatherMetricValue, { color: colors.onSurface }]}>11 km/h</Text>
              <Text style={[styles.weatherMetricLabel, { color: colors.onSurfaceVariant }]}>
                WIND NE
              </Text>
            </View>
            <View
              style={[
                styles.weatherMetricTile,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Sun size={16} color="#FF9800" />
              <Text style={[styles.weatherMetricValue, { color: colors.onSurface }]}>4 Mod</Text>
              <Text style={[styles.weatherMetricLabel, { color: colors.onSurfaceVariant }]}>
                UV INDEX
              </Text>
            </View>
            <View
              style={[
                styles.weatherMetricTile,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Eye size={16} color={colors.primaryContainer} />
              <Text style={[styles.weatherMetricValue, { color: colors.onSurface }]}>4.8 km</Text>
              <Text style={[styles.weatherMetricLabel, { color: colors.onSurfaceVariant }]}>
                VISIBILITY
              </Text>
            </View>
          </View>
        </View>
      </BottomSheet>

      {/* Sovereign Flowstep Voice Listening Modal */}
      <VoiceListeningModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={handleVoiceResult}
      />

      {/* Sovereign NavIC Dual-Band GPS Location Lock Establishment Modal */}
      <GpsLocationLockModal
        visible={showGpsLockModal}
        onClose={() => setShowGpsLockModal(false)}
        initialTelemetry={gpsLockTelemetry}
        onCenterMap={() => {
          setIsGpsLocked(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  floatingTopSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: Spacing.md,
  },
  omniHeaderCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    ...Shadows.md,
  },
  omniRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  omniRow1Left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: -1,
  },
  omniRow2: {
    width: '100%',
  },
  omniSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 8,
  },
  omniSearchPlaceholder: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
  },
  omniSearchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  omniActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navicMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  navicMiniText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  floatingBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 10,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sosPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sosPillText: {
    ...Typography.labelSmall,
    fontWeight: '900',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingSearchContainer: {
    marginBottom: Spacing.xs,
  },
  searchLeftGroup: {
    marginRight: 2,
  },
  cameraButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitChipsTrack: {
    paddingTop: Spacing.xxs,
    paddingHorizontal: Spacing.xxs,
    gap: Spacing.xs + 2,
  },
  floatingLeftWidgets: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 14,
    gap: Spacing.sm,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  weatherIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherTemp: {
    ...Typography.labelMedium,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aqiDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  aqiText: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  speedCameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  cameraAlertDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedCameraText: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  floatingRightControls: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 14,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  trafficIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trafficIndicatorDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trafficBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  miniBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  compassFab: {
    marginTop: 6,
    ...Shadows.md,
  },
  locateMeFab: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Shadows.md,
  },
  bottomSheetHUD: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md + 2,
    paddingBottom: Spacing.md,
    paddingTop: 8,
    zIndex: 16,
    ...Shadows.lg,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetExpandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  sheetExpandText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
  },
  commuteWorkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    borderRadius: Radius.lg,
  },
  commuteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  workIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commuteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  commuteTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  commuteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  commuteTimeText: {
    ...Typography.labelMedium,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dotSeparator: {
    fontSize: 10,
  },
  commuteDistText: {
    ...Typography.bodySmall,
    fontVariant: ['tabular-nums'],
  },
  commuteRoadText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  commuteHomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    borderRadius: Radius.lg,
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  quickToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  quickToolLabel: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
  homeIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commuteSubText: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  starIconButton: {
    padding: Spacing.xs,
  },
  poiCategoriesScrollView: {
    marginTop: 2,
    marginHorizontal: -2,
  },
  poiCategoriesTrack: {
    gap: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  poiCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.xl,
  },
  poiCategoryIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poiCategoryName: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  poiCategorySub: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  layerOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  layerGridOption: {
    width: '48%',
    padding: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  layerGridOptionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  layerGridOptionSub: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  layerSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  layerSwitchLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  weatherModalContent: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  weatherHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  weatherHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherHeroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherHeroTemp: {
    fontSize: 28,
    fontWeight: '900',
  },
  weatherHeroCondition: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  weatherHeroRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  weatherFeelsLike: {
    ...Typography.labelSmall,
  },
  weatherStationText: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
  aqiCard: {
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  aqiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aqiTitleGroup: {
    gap: 1,
  },
  aqiCardTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  aqiStationSub: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  aqiScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  aqiScoreText: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
  aqiBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  aqiBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  aqiAdvisoryText: {
    ...Typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
  },
  weatherMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weatherMetricTile: {
    width: '48.5%',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  weatherMetricValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
    marginTop: 2,
  },
  weatherMetricLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
