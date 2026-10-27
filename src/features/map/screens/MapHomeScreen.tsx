import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Satellite,
  MapPin,
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
  const insets = useSafeAreaInsets();
  const floatingTop = Math.max(insets.top + 105, 125);

  const [activeMode, setActiveMode] = useState<TransitMode>('drive');
  const [showTraffic, setShowTraffic] = useState(true);
  const [isHomeStarred, setIsHomeStarred] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>('standard');
  const [showCameras, setShowCameras] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

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
      {/* 1. IMMERSIVE FULL-VIEWPORT VECTOR MAP CANVAS */}
      <View style={StyleSheet.absoluteFill}>
        <VectorMapCanvas
          onPoiPress={handlePoiSelect}
          showTraffic={showTraffic}
          mapLayer={selectedLayer}
        />
      </View>

      {/* 2. FLOATING TOP HUD (Brand Cluster + Search Bar + Mode Chips) */}
      <SafeAreaView
        edges={['top']}
        style={styles.floatingTopSafeArea}
        pointerEvents="box-none">
        {/* Brand bar with Live Compass, SOS distress pill & Profile */}
        <Animated.View
          entering={FadeInDown.duration(180).springify().damping(22)}
          style={[
            styles.floatingBrandBar,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh + '80',
            },
          ]}>
          <View style={styles.brandCluster}>
            <AnimatedPressable
              onPress={handleCompassPress}
              accessibilityRole="button"
              accessibilityLabel="B Map live compass app icon">
              <DynamicCompassIcon size={32} dynamic={false} borderRadius={8} />
            </AnimatedPressable>
            <View style={styles.titleColumn}>
              <View style={styles.logoRow}>
                <Text style={[styles.logoTag, { color: colors.primaryContainer }]}>B MAP</Text>
                <View style={[styles.navicMiniPill, { backgroundColor: colors.primaryContainer + '20' }]}>
                  <Satellite size={10} color={colors.primary} />
                  <Text style={[styles.navicMiniText, { color: colors.primary }]}>NavIC L5+S</Text>
                </View>
              </View>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Explore</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* 1-Tap SOS Safety Beacon */}
            <AnimatedPressable
              style={[styles.sosPillButton, { backgroundColor: colors.errorContainer }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Emergency SOS Beacon"
              onPress={() => {
                haptics.heavy();
                router.push('/sos-distress');
              }}>
              <ShieldAlert size={14} color={colors.onErrorContainer} />
              <Text style={[styles.sosPillText, { color: colors.onErrorContainer }]}>SOS</Text>
            </AnimatedPressable>

            {/* Notifications */}
            <AnimatedPressable
              style={[styles.headerIconButton, { backgroundColor: colors.surfaceContainerLow }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => {
                haptics.light();
                Alert.alert('Notifications', 'No new alerts. Real-time traffic monitoring active.');
              }}>
              <Bell size={18} color={colors.onSurfaceVariant} />
              <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
            </AnimatedPressable>

            {/* User Profile */}
            <AnimatedPressable
              style={[styles.profileAvatar, { backgroundColor: colors.primary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="User profile"
              onPress={() => {
                haptics.light();
                router.push('/auth');
              }}>
              <User size={16} color={colors.onPrimary} />
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* Floating Search Bar */}
        <Animated.View
          entering={FadeInDown.delay(20).duration(180).springify().damping(22)}
          style={styles.floatingSearchContainer}>
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
                <DynamicCompassIcon size={24} dynamic={false} borderRadius={6} />
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
                <Camera size={16} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            }
            variant="floating"
          />
        </Animated.View>

        {/* Quick Transit Mode Switcher Chips */}
        <Animated.View entering={FadeInDown.delay(120).duration(320).springify().damping(18)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.transitChipsTrack}>
            <Chip
              label="Drive"
              size="sm"
              selected={activeMode === 'drive'}
              onPress={() => handleModeChange('drive')}
              icon={<Car size={14} color={activeMode === 'drive' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
            />
            <Chip
              label="Transit"
              size="sm"
              selected={activeMode === 'transit'}
              onPress={() => handleModeChange('transit')}
              icon={<TrainFront size={14} color={activeMode === 'transit' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
              badgeCount={2}
            />
            <Chip
              label="Ride · ₹120"
              size="sm"
              selected={activeMode === 'ride'}
              onPress={() => handleModeChange('ride')}
              icon={<CarTaxiFront size={14} color={activeMode === 'ride' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
            />
            <Chip
              label="Bike"
              size="sm"
              selected={activeMode === 'bike'}
              onPress={() => handleModeChange('bike')}
              icon={<Bike size={14} color={activeMode === 'bike' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
            />
            <Chip
              label="Walk"
              size="sm"
              selected={activeMode === 'walk'}
              onPress={() => handleModeChange('walk')}
              icon={<Footprints size={14} color={activeMode === 'walk' ? colors.onPrimaryContainer : colors.onSurfaceVariant} />}
            />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* 3. FLOATING LEFT ENVIRONMENTAL & ROAD SAFETY WIDGETS */}
      <View style={[styles.floatingLeftWidgets, { top: floatingTop }]} pointerEvents="box-none">
        {/* Weather & Air Quality Pill */}
        <Animated.View
          entering={FadeInLeft.delay(140).duration(320).springify().damping(18)}
          style={[
            styles.weatherPill,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh + '80',
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
        </Animated.View>

        {/* Speed Camera Alert Badge */}
        <Animated.View entering={FadeInLeft.delay(220).duration(320).springify().damping(18)}>
          <Animated.View
            style={[
              styles.speedCameraBadge,
              alertAnimatedStyle,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.surfaceContainerHigh + '80',
              },
            ]}>
            <View style={[styles.cameraAlertDot, { backgroundColor: colors.error + '20' }]}>
              <Video size={11} color={colors.error} />
            </View>
            <Text style={[styles.speedCameraText, { color: colors.onSurface }]}>
              Camera 450m ahead
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* 4. FLOATING RIGHT MAP UTILITY CONTROLS */}
      <Animated.View
        entering={FadeInRight.delay(60).duration(180).springify().damping(22)}
        style={[styles.floatingRightControls, { top: floatingTop }]}
        pointerEvents="box-none">
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
          <Layers size={19} color={colors.onSurfaceVariant} />
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
          <Route size={16} color={colors.primaryContainer} />
          <Text style={[styles.routeFabText, { color: colors.primaryContainer }]}>Route</Text>
        </AnimatedPressable>

        {/* North Compass FAB */}
        <AnimatedPressable
          style={styles.compassFab}
          onPress={handleCompassPress}
          accessibilityRole="button"
          accessibilityLabel="Compass reset north">
          <DynamicCompassIcon size={44} dynamic={true} tilt3D={false} borderRadius={12} />
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
            size={22}
            color={isLocating ? colors.secondary : colors.primaryContainer}
          />
        </AnimatedPressable>
      </Animated.View>

      {/* 5. INTERACTIVE BOTTOM COMMUTE & DISCOVERY HUD */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(340).springify().damping(18)}
        style={[
          styles.bottomSheetHUD,
          {
            bottom: Math.max(insets.bottom, 14) + 78,
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.surfaceContainerHigh + '60',
          },
        ]}>
        {/* Drag / Expand Handle Row */}
        <TouchableOpacity
          style={styles.sheetHandleContainer}
          onPress={() => {
            haptics.selection();
            setIsSheetExpanded(!isSheetExpanded);
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isSheetExpanded ? 'Collapse sheet' : 'Expand sheet'}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.sheetExpandRow}>
            <Text style={[styles.sheetExpandText, { color: colors.onSurfaceVariant }]}>
              {isSheetExpanded ? 'Tap to Collapse' : 'Commute & Places'}
            </Text>
            {isSheetExpanded ? (
              <ChevronDown size={14} color={colors.onSurfaceVariant} />
            ) : (
              <ChevronUp size={14} color={colors.onSurfaceVariant} />
            )}
          </View>
        </TouchableOpacity>

        {/* Commute Target 1: Company */}
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
            leftIcon={<Navigation size={14} color={colors.onPrimary} />}
            onPress={handleStartNav}
          />
        </Card>

        {/* If Expanded, show Home Card & Quick Tools */}
        {isSheetExpanded && (
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
                style={[styles.quickToolBtn, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => {
                  haptics.light();
                  router.push('/digipin-explorer');
                }}
                activeOpacity={0.8}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>DigiPIN Grid</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickToolBtn, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => {
                  haptics.light();
                  router.push('/tsp-optimizer');
                }}
                activeOpacity={0.8}>
                <Route size={16} color={colors.secondary} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>TSP Delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickToolBtn, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => {
                  haptics.light();
                  router.push('/indoor-parking');
                }}
                activeOpacity={0.8}>
                <SquareParking size={16} color={colors.trafficGreen} />
                <Text style={[styles.quickToolLabel, { color: colors.onSurface }]}>Indoor Bay</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Quick POI Categories Track */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poiCategoriesTrack}
          style={styles.poiCategoriesScrollView}>
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
            <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.primaryContainer + '25' }]}>
              <Zap size={14} color={colors.primaryContainer} />
            </View>
            <View>
              <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>EV Charge</Text>
              <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>42 nearby</Text>
            </View>
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
            <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.tertiaryContainer + '25' }]}>
              <Fuel size={14} color={colors.tertiaryContainer} />
            </View>
            <View>
              <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Fuel</Text>
              <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>28 stations</Text>
            </View>
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
            <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.secondaryContainer + '30' }]}>
              <SquareParking size={14} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Indoor Parking</Text>
              <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>18 lots</Text>
            </View>
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
            <View style={[styles.poiCategoryIconBox, { backgroundColor: colors.errorContainer + '40' }]}>
              <Utensils size={14} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.poiCategoryName, { color: colors.onSurface }]}>Dining</Text>
              <Text style={[styles.poiCategorySub, { color: colors.onSurfaceVariant }]}>65 places</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
  floatingBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 10,
    borderRadius: Radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
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
    top: 130,
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
    borderWidth: StyleSheet.hairlineWidth,
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
  floatingRightControls: {
    position: 'absolute',
    top: 130,
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
  routeFabText: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.3,
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navicMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  navicMiniText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
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
});
