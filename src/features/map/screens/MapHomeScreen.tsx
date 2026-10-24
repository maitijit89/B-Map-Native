import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import {
  Bell,
  User,
  Camera,
  Car,
  TrainFront,
  CarTaxiFront,
  Bike,
  Footprints,
  Sun,
  Video,
  Layers,
  Route,
  LocateFixed,
  Building,
  House,
  Star,
  Navigation,
  Zap,
  Fuel,
  SquareParking,
  Utensils,
} from 'lucide-react-native';
import { VectorMapCanvas } from '../components/VectorMapCanvas';
import { useThemeColors, useLocation } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Chip,
  Card,
  Button,
  StatusBadge,
  BottomSheet,
  SearchBar,
  DynamicCompassIcon,
  AnimatedPressable,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

type TransitMode = 'drive' | 'transit' | 'ride' | 'bike' | 'walk';
type MapLayerType = 'standard' | 'satellite' | 'night' | 'navic';

export default function HomeScreen() {
  const colors = useThemeColors();

  const [activeMode, setActiveMode] = useState<TransitMode>('drive');
  const [showTraffic, setShowTraffic] = useState(true);
  const [isHomeStarred, setIsHomeStarred] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>('standard');
  const [showCameras, setShowCameras] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  // Pulse animation for weather & speed camera badge
  const alertPulse = useSharedValue(1);

  useEffect(() => {
    alertPulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, [alertPulse]);

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
    Alert.alert('Waypoint Selected', `${poiName}\nReady for turn-by-turn guidance.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Route', onPress: handleStartNav },
    ]);
  }, [handleStartNav]);

  const { location, refreshLocation } = useLocation(true);

  const handleLocateMe = useCallback(async () => {
    haptics.heavy();
    setIsLocating(true);
    try {
      await refreshLocation();
      const lat = location.latitude.toFixed(4);
      const lon = location.longitude.toFixed(4);
      const acc = location.accuracy ? `${location.accuracy.toFixed(1)}m` : '±0.8m';
      Alert.alert(
        'GPS Location Lock Established',
        `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy Fix: ${acc}`
      );
    } finally {
      setIsLocating(false);
    }
  }, [location, refreshLocation]);

  const handleVoiceAssistant = useCallback(() => {
    haptics.light();
    router.push('/ai-copilot');
  }, []);

  const handleModeChange = useCallback((mode: TransitMode) => {
    haptics.selection();
    setActiveMode(mode);
    if (mode === 'transit') {
      router.push('/transit-planner');
    }
  }, []);

  const handleLayerModalClose = useCallback(() => {
    setShowLayerModal(false);
  }, []);

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      {/* 1. FIXED TOP HEADER */}
      <SafeAreaView
        edges={['top']}
        style={[
          styles.headerSafeArea,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <View style={styles.header}>
          <View style={styles.brandCluster}>
            <AnimatedPressable
              onPress={handleCompassPress}
              accessibilityRole="button"
              accessibilityLabel="B Map live compass app icon">
              <DynamicCompassIcon size={34} dynamic={false} borderRadius={9} />
            </AnimatedPressable>
            <View style={styles.titleColumn}>
              <Text style={[styles.logoTag, { color: colors.primaryContainer }]}>B MAP</Text>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Map Explore</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <AnimatedPressable
              style={[styles.headerIconButton, { backgroundColor: colors.surfaceContainerLow }]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => {
                haptics.light();
                Alert.alert('Notifications', 'No new alerts. Real-time traffic monitoring active.');
              }}>
              <Bell size={19} color={colors.onSurfaceVariant} />
              <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.profileAvatar, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="User profile"
              onPress={() => {
                haptics.light();
                router.push('/auth');
              }}>
              <User size={18} color={colors.onPrimary} />
            </AnimatedPressable>
          </View>
        </View>
      </SafeAreaView>

      {/* 2. MAP CANVAS BACKGROUND & INTERACTIVE HUD */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.mapCanvasWrapper}>
          <VectorMapCanvas onPoiPress={handlePoiSelect} showTraffic={showTraffic} />

          {/* FLOATING TOP SEARCH BAR & TRANSIT CAROUSEL */}
          <Animated.View
            entering={FadeInDown.duration(320).springify().damping(16)}
            style={styles.floatingTopContainer}>
            {/* Search Bar Component */}
            <SearchBar
              placeholder="Search destination, DigiPIN, fuel..."
              editable={false}
              onPress={() => {
                haptics.light();
                router.push('/search');
              }}
              onMicPress={handleVoiceAssistant}
              leadingIcon={
                <View style={styles.searchLeftGroup}>
                  <DynamicCompassIcon size={26} dynamic={false} borderRadius={7} />
                </View>
              }
              trailingAction={
                <TouchableOpacity
                  style={[styles.cameraButton, { backgroundColor: colors.surfaceContainerLow }]}
                  onPress={() => {
                    haptics.light();
                    Alert.alert('AR Navigation', 'Opening AR Camera mode with sovereign spatial anchors...');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Visual AR Camera"
                  activeOpacity={0.7}>
                  <Camera size={18} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              }
              variant="floating"
            />

            {/* Quick Transit Mode Switcher Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.transitChipsTrack}>
              <Chip
                label="Drive"
                size="sm"
                selected={activeMode === 'drive'}
                onPress={() => handleModeChange('drive')}
                icon={<Car size={15} color={activeMode === 'drive' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
              />
              <Chip
                label="Transit"
                size="sm"
                selected={activeMode === 'transit'}
                onPress={() => handleModeChange('transit')}
                icon={<TrainFront size={15} color={activeMode === 'transit' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
                badgeCount={2}
              />
              <Chip
                label="Ride · ₹120"
                size="sm"
                selected={activeMode === 'ride'}
                onPress={() => handleModeChange('ride')}
                icon={<CarTaxiFront size={15} color={activeMode === 'ride' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
              />
              <Chip
                label="Bike"
                size="sm"
                selected={activeMode === 'bike'}
                onPress={() => handleModeChange('bike')}
                icon={<Bike size={15} color={activeMode === 'bike' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
              />
              <Chip
                label="Walk"
                size="sm"
                selected={activeMode === 'walk'}
                onPress={() => handleModeChange('walk')}
                icon={<Footprints size={15} color={activeMode === 'walk' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
              />
            </ScrollView>
          </Animated.View>

          {/* FLOATING LEFT ENVIRONMENTAL & ROAD SAFETY WIDGETS */}
          <View style={styles.floatingLeftWidgets}>
            {/* Weather & Air Quality Pill */}
            <Animated.View
              entering={FadeInLeft.delay(100).duration(280).springify().damping(16)}
              style={[
                styles.weatherPill,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Sun size={18} color="#FF9800" />
              <View>
                <Text style={[styles.weatherTemp, { color: colors.onSurface }]}>24°C Sunny</Text>
                <View style={styles.aqiRow}>
                  <View style={[styles.aqiDot, { backgroundColor: colors.secondary }]} />
                  <Text style={[styles.aqiText, { color: colors.secondary }]}>AQI 28 · Good</Text>
                </View>
              </View>
            </Animated.View>

            {/* Speed Camera Alert Badge */}
            <Animated.View
              entering={FadeInLeft.delay(200).duration(280).springify().damping(16)}
              style={[
                styles.speedCameraBadge,
                alertAnimatedStyle,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Video size={14} color={colors.error} />
              <Text style={[styles.speedCameraText, { color: colors.onSurface }]}>
                Camera 450m ahead (60 km/h)
              </Text>
            </Animated.View>
          </View>

          {/* FLOATING RIGHT MAP UTILITY CONTROLS */}
          <Animated.View
            entering={FadeInRight.delay(150).duration(280).springify().damping(16)}
            style={styles.floatingRightControls}>
            {/* Map Layers */}
            <AnimatedPressable
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                haptics.light();
                setShowLayerModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Map layers">
              <Layers size={20} color={colors.onSurfaceVariant} />
            </AnimatedPressable>

            {/* Traffic Toggle */}
            <AnimatedPressable
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: showTraffic ? colors.primary : colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                haptics.light();
                setShowTraffic(!showTraffic);
              }}
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

            {/* Route Planner Shortcut */}
            <AnimatedPressable
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/(tabs)/routes');
              }}
              accessibilityRole="button"
              accessibilityLabel="Route planner">
              <Route size={18} color={colors.primaryContainer} />
              <Text style={[styles.routeFabText, { color: colors.primaryContainer }]}>Route</Text>
            </AnimatedPressable>

            {/* North Compass FAB */}
            <AnimatedPressable
              style={styles.compassFab}
              onPress={handleCompassPress}
              accessibilityRole="button"
              accessibilityLabel="Compass reset north">
              <DynamicCompassIcon size={46} dynamic={true} tilt3D={true} borderRadius={13} />
            </AnimatedPressable>

            {/* Recenter / Locate Me FAB */}
            <AnimatedPressable
              style={[
                styles.locateMeFab,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: isLocating ? colors.primary : colors.surfaceContainerHigh,
                },
              ]}
              onPress={handleLocateMe}
              accessibilityRole="button"
              accessibilityLabel="Re-center map">
              <LocateFixed
                size={24}
                color={isLocating ? colors.secondary : colors.primaryContainer}
              />
            </AnimatedPressable>
          </Animated.View>

          {/* 3. BOTTOM SHEET COMMUTE & DISCOVERY HUD */}
          <Animated.View
            entering={FadeInUp.delay(180).duration(300).springify().damping(16)}
            style={[
              styles.bottomSheetHUD,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />
            </View>

            <Card
              variant="flat"
              padding="md"
              style={styles.commuteWorkCard}
              onPress={handleStartNav}>
              <View style={styles.commuteLeft}>
                <View
                  style={[
                    styles.workIconBox,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}>
                  <Building size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.commuteTitleRow}>
                    <Text style={[styles.commuteTitle, { color: colors.onSurface }]}>Company</Text>
                    <StatusBadge status="success" label="Fastest Route" size="sm" pulsing />
                  </View>
                  <View style={styles.commuteMetaRow}>
                    <Text style={[styles.commuteTimeText, { color: colors.onSurface }]}>28 min</Text>
                    <Text style={[styles.dotSeparator, { color: colors.onSurfaceVariant }]}>·</Text>
                    <Text style={[styles.commuteDistText, { color: colors.onSurfaceVariant }]}>14.2 km</Text>
                    <Text style={[styles.dotSeparator, { color: colors.onSurfaceVariant }]}>·</Text>
                    <Text
                      style={[styles.commuteRoadText, { color: colors.onSurfaceVariant }]}
                      numberOfLines={1}>
                      via Highway 4
                    </Text>
                  </View>
                </View>
              </View>

              <Button
                variant="primary"
                size="sm"
                title="Go"
                leftIcon={<Navigation size={15} color={colors.onPrimary} />}
                onPress={handleStartNav}
              />
            </Card>

            {/* Commute Target 2: Home */}
            <Card
              variant="flat"
              padding="md"
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
                  <House size={20} color={colors.onSurfaceVariant} />
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

            {/* Quick POI Categories Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.poiCategoriesTrack}>
              <TouchableOpacity
                style={[
                  styles.poiCategoryCard,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/ev-station');
                }}
                activeOpacity={0.8}>
                <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.primaryContainer }]}>
                  <Zap size={18} color={colors.onPrimary} />
                </View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>EV Charge</Text>
                <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>42 nearby</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.poiCategoryCard,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/(tabs)/nearby');
                }}
                activeOpacity={0.8}>
                <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.tertiaryContainer }]}>
                  <Fuel size={18} color={colors.onTertiaryContainer} />
                </View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Fuel</Text>
                <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>28 stations</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.poiCategoryCard,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/indoor-parking');
                }}
                activeOpacity={0.8}>
                <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.secondaryContainer }]}>
                  <SquareParking size={18} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Indoor Parking</Text>
                <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>18 lots</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.poiCategoryCard,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() => {
                  haptics.light();
                  router.push('/(tabs)/nearby');
                }}
                activeOpacity={0.8}>
                <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.errorContainer }]}>
                  <Utensils size={18} color={colors.onErrorContainer} />
                </View>
                <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Dining</Text>
                <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>65 places</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </ScrollView>

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
            onPress={() => setSelectedLayer('standard')}>
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
                  selectedLayer === 'navic'
                    ? colors.primaryContainer
                    : colors.surfaceContainerLow,
                borderColor:
                  selectedLayer === 'navic'
                    ? colors.primary
                    : colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => setSelectedLayer('navic')}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  headerSafeArea: {
    borderBottomWidth: 1,
    zIndex: 20,
  },
  header: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleColumn: {
    justifyContent: 'center',
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
    gap: Spacing.xs + 2,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  mapCanvasWrapper: {
    width: '100%',
    height: 720,
    position: 'relative',
  },
  floatingTopContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 15,
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
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  floatingLeftWidgets: {
    position: 'absolute',
    top: 130,
    left: Spacing.md,
    zIndex: 14,
    gap: Spacing.xs,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.xs,
  },
  weatherTemp: {
    ...Typography.labelMedium,
    fontWeight: '700',
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
  },
  speedCameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.xs,
  },
  speedCameraText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  floatingRightControls: {
    position: 'absolute',
    top: 130,
    right: Spacing.md,
    zIndex: 14,
    alignItems: 'center',
    gap: Spacing.xs + 2,
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
  routeFabText: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
  },
  compassFab: {
    marginTop: 4,
    ...Shadows.md,
  },
  locateMeFab: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    ...Shadows.md,
  },
  bottomSheetHUD: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.xs,
    zIndex: 16,
    ...Shadows.xl,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
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
  },
  dotSeparator: {
    fontSize: 10,
  },
  commuteDistText: {
    ...Typography.bodySmall,
  },
  commuteRoadText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  commuteHomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
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
  poiCategoriesTrack: {
    gap: Spacing.xs + 2,
    paddingVertical: 2,
  },
  poiCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.lg,
  },
  poiCategoryIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
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
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  layerGridOption: {
    flex: 1,
    padding: Spacing.md,
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
});
