import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  Megaphone,
  CheckCircle2,
  Satellite,
} from 'lucide-react-native';
import VectorMapCanvas from '../components/VectorMapCanvas';
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
} from '@/shared/components/ui';
import { AppLaunchGyroIntro } from '@/features/compass';

const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AEtjO1VN3H4tzgmXs2ZRa0LcSjl67XdRLkUoaSPeH_CWrj-KjJJn-jxm5Ry5BCuQEgauBA2ThJbop3aKeUWeQ6SIdguokZoxbQ03I2vdvAUunO_QvAU8m1DCVcEXQYq8TxLTr2sWs2k07ep1c3xBFVp7H3inSTj60j6IHieJAYPLhMEQKWUapTBKMbNFv4M-1wMcH_cGS00_NluNZE-s9nOPbjxB6lGgQyLc1ATdoWESAGL1bzNPnljLN2abiRf-';

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
  const [showGyroIntro, setShowGyroIntro] = useState(true);

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleCompassPress = () => {
    triggerHaptic();
    router.push('/compass-hud' as any);
  };

  const handleStartNav = () => {
    triggerHaptic();
    router.push('/modal');
  };

  const handlePoiSelect = (poiName: string) => {
    triggerHaptic();
    Alert.alert('Waypoint Selected', `${poiName}\nReady for turn-by-turn guidance.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Route', onPress: handleStartNav },
    ]);
  };

  const { location, refreshLocation } = useLocation(true);

  const handleLocateMe = async () => {
    triggerHaptic();
    await refreshLocation();
    const lat = location.latitude.toFixed(4);
    const lon = location.longitude.toFixed(4);
    const acc = location.accuracy ? `${location.accuracy.toFixed(1)}m` : '±0.8m';
    Alert.alert('GPS Location Lock Established', `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy Fix: ${acc}`);
  };

  const handleVoiceAssistant = () => {
    triggerHaptic();
    router.push('/ai-copilot');
  };

  const handleModeChange = (mode: TransitMode) => {
    triggerHaptic();
    setActiveMode(mode);
    if (mode === 'transit') {
      router.push('/transit-planner');
    }
  };

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
            <Image source={{ uri: LOGO_URI }} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.titleColumn}>
              <Text style={[styles.logoTag, { color: colors.primaryContainer }]}>B MAP</Text>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Map Explore</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: colors.surfaceContainerLow }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => {
                triggerHaptic();
                Alert.alert('Notifications', 'No new alerts. Real-time traffic monitoring active.');
              }}>
              <Bell size={19} color={colors.onSurfaceVariant} />
              <View style={[styles.notifDot, { backgroundColor: colors.error }]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileAvatar, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="User profile"
              onPress={() => {
                triggerHaptic();
                router.push('/auth');
              }}>
              <User size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* 2. MAP CANVAS BACKGROUND */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.mapCanvasWrapper}>
          <VectorMapCanvas onPoiPress={handlePoiSelect} showTraffic={showTraffic} />

          {/* FLOATING TOP SEARCH BAR & TRANSIT CAROUSEL */}
          <View style={styles.floatingTopContainer}>
            {/* Search Bar Component */}
            <SearchBar
              placeholder="Search destination, DigiPIN, fuel..."
              editable={false}
              onPress={() => {
                triggerHaptic();
                router.push('/search');
              }}
              onMicPress={handleVoiceAssistant}
              leadingIcon={
                <View style={styles.searchLeftGroup}>
                  <Image source={{ uri: LOGO_URI }} style={styles.searchLogoThumb} resizeMode="contain" />
                </View>
              }
              trailingAction={
                <TouchableOpacity
                  style={[styles.cameraButton, { backgroundColor: colors.surfaceContainerLow }]}
                  onPress={() => {
                    triggerHaptic();
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
          </View>

          {/* FLOATING LEFT ENVIRONMENTAL & ROAD SAFETY WIDGETS */}
          <View style={styles.floatingLeftWidgets}>
            {/* Weather & Air Quality Pill */}
            <View
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
            </View>

            {/* Speed Camera Alert Badge */}
            <View
              style={[
                styles.speedCameraBadge,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}>
              <Video size={14} color={colors.error} />
              <Text style={[styles.speedCameraText, { color: colors.onSurface }]}>
                Camera 450m ahead (60 km/h)
              </Text>
            </View>
          </View>

          {/* FLOATING RIGHT MAP UTILITY CONTROLS */}
          <View style={styles.floatingRightControls}>
            {/* Map Layers */}
            <TouchableOpacity
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                triggerHaptic();
                setShowLayerModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Map layers"
              activeOpacity={0.8}>
              <Layers size={19} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Traffic Toggle */}
            <TouchableOpacity
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                triggerHaptic();
                setShowTraffic(!showTraffic);
              }}
              accessibilityRole="button"
              accessibilityLabel="Toggle live traffic"
              activeOpacity={0.8}>
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
            </TouchableOpacity>

            {/* Route Planner Shortcut */}
            <TouchableOpacity
              style={[
                styles.fabBtn,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                triggerHaptic();
                router.push('/(tabs)/routes');
              }}
              accessibilityRole="button"
              accessibilityLabel="Route planner"
              activeOpacity={0.8}>
              <Route size={17} color={colors.primaryContainer} />
              <Text style={[styles.routeFabText, { color: colors.primaryContainer }]}>Route</Text>
            </TouchableOpacity>

            {/* North Compass */}
            <TouchableOpacity
              onPress={handleCompassPress}
              accessibilityRole="button"
              accessibilityLabel="Compass reset north"
              activeOpacity={0.8}>
              <DynamicCompassIcon size={44} dynamic={true} tilt3D={true} borderRadius={12} />
            </TouchableOpacity>

            {/* Recenter / Locate Me FAB */}
            <TouchableOpacity
              style={[
                styles.locateMeFab,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={handleLocateMe}
              accessibilityRole="button"
              accessibilityLabel="Re-center map"
              activeOpacity={0.85}>
              <LocateFixed size={24} color={colors.primaryContainer} />
            </TouchableOpacity>
          </View>

          {/* 3. BOTTOM SHEET COMMUTE & DISCOVERY HUD */}
          <View
            style={[
              styles.bottomSheetHUD,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            {/* Drag Handle Bar */}
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />
            </View>

            {/* Commute Target 1: Company / Work */}
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
                triggerHaptic();
                Alert.alert('Configure Home', 'Enter home address to set automatic commute alerts');
              }}>
              <View style={styles.homeLeft}>
                <View
                  style={[
                    styles.homeIconBox,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}>
                  <House size={18} color={colors.onSurfaceVariant} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.homeTitle, { color: colors.onSurface }]}>Home</Text>
                  <Text style={[styles.homeSubtitle, { color: colors.onSurfaceVariant }]}>
                    Tap to configure commute route
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.starButton}
                accessibilityRole="button"
                accessibilityLabel="Star home address"
                onPress={() => {
                  triggerHaptic();
                  setIsHomeStarred(!isHomeStarred);
                }}
                activeOpacity={0.7}>
                <Star
                  size={19}
                  color={isHomeStarred ? '#FF9800' : colors.outline}
                  fill={isHomeStarred ? '#FF9800' : 'none'}
                />
              </TouchableOpacity>
            </Card>

            {/* Quick Services 4-Column Grid */}
            <View style={styles.servicesGrid}>
              {/* EV Charging */}
              <Card
                variant="flat"
                padding="sm"
                style={styles.serviceCol}
                onPress={() => {
                  triggerHaptic();
                  router.push('/ev-station');
                }}>
                <View style={[styles.serviceCircle, { backgroundColor: colors.primaryFixed }]}>
                  <Zap size={20} color={colors.primary} />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.onSurface }]}>EV Charge</Text>
                <Text style={[styles.serviceSubLabel, { color: colors.primaryContainer }]}>
                  42 nearby
                </Text>
              </Card>

              {/* Gas Station */}
              <Card
                variant="flat"
                padding="sm"
                style={styles.serviceCol}
                onPress={() => {
                  triggerHaptic();
                  router.push('/(tabs)/nearby');
                }}>
                <View style={[styles.serviceCircle, { backgroundColor: colors.tertiaryFixed }]}>
                  <Fuel size={20} color={colors.tertiary} />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.onSurface }]}>Gas Station</Text>
                <Text style={[styles.serviceSubLabel, { color: colors.trafficGreen }]}>-₹3.50/L</Text>
              </Card>

              {/* Parking */}
              <Card
                variant="flat"
                padding="sm"
                style={styles.serviceCol}
                onPress={() => {
                  triggerHaptic();
                  router.push('/indoor-parking');
                }}>
                <View style={[styles.serviceCircle, { backgroundColor: colors.secondaryContainer }]}>
                  <SquareParking size={20} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.onSurface }]}>Parking</Text>
                <Text style={[styles.serviceSubLabel, { color: colors.onSurfaceVariant }]}>Live spots</Text>
              </Card>

              {/* Dining */}
              <Card
                variant="flat"
                padding="sm"
                style={styles.serviceCol}
                onPress={() => {
                  triggerHaptic();
                  router.push('/(tabs)/nearby');
                }}>
                <View style={[styles.serviceCircle, { backgroundColor: colors.surfaceContainerHighest }]}>
                  <Utensils size={20} color={colors.onSurface} />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.onSurface }]}>Dining</Text>
                <Text style={[styles.serviceSubLabel, { color: colors.trafficOrange }]}>Top Rated</Text>
              </Card>
            </View>

            {/* Traffic Alert Banner */}
            <Card variant="flat" padding="sm" style={styles.alertBanner}>
              <View style={styles.alertLeft}>
                <Megaphone size={18} color={colors.primaryContainer} />
                <Text style={[styles.alertText, { color: colors.onSurface }]} numberOfLines={1}>
                  <Text style={{ fontWeight: '700' }}>Expressway East:</Text> Roadwork cleared, normal
                  flow resumed.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  Alert.alert('Traffic Details', 'Expressway East flow normalized at 75 km/h.');
                }}
                accessibilityRole="button"
                accessibilityLabel="View traffic alert details"
                activeOpacity={0.7}>
                <Text style={[styles.alertDetailsBtn, { color: colors.primary }]}>Details</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Map Layers & Overlays BottomSheet */}
      <BottomSheet
        visible={showLayerModal}
        onClose={() => setShowLayerModal(false)}
        title="Sovereign Map Layers"
        subtitle="ISRO NavIC Dual-Band & Real-Time GIS">
        <View style={{ gap: Spacing.md }}>
          {/* Base Layer Switcher */}
          <Text style={[styles.layerSectionLabel, { color: colors.onSurface }]}>Base Map Type</Text>
          <View style={styles.layerOptionsRow}>
            {[
              { key: 'standard' as const, label: 'Sovereign Vector', icon: Layers },
              { key: 'satellite' as const, label: '3D Satellite', icon: Building },
              { key: 'night' as const, label: 'Night HUD', icon: Navigation },
              { key: 'navic' as const, label: 'NavIC L5/S', icon: Satellite },
            ].map((opt) => {
              const IconComp = opt.icon;
              const isSelected = selectedLayer === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.layerOptionChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryContainer
                        : colors.surfaceContainerLow,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.outlineVariant,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedLayer(opt.key);
                  }}
                  activeOpacity={0.8}>
                  <IconComp
                    size={18}
                    color={isSelected ? colors.onPrimary : colors.primaryContainer}
                  />
                  <Text
                    style={[
                      styles.layerOptionText,
                      {
                        color: isSelected
                          ? colors.onPrimary
                          : colors.onSurface,
                      },
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Live Overlays */}
          <Text style={[styles.layerSectionLabel, { color: colors.onSurface }]}>
            Real-Time Telematics Overlays
          </Text>
          <View
            style={[
              styles.overlayToggles,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <View
              style={[
                styles.overlayToggleRow,
                { borderBottomColor: colors.surfaceContainerHigh },
              ]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.overlayTitle, { color: colors.onSurface }]}>
                  Live 1Hz Traffic Heatmap
                </Text>
                <Text style={[styles.overlayDesc, { color: colors.onSurfaceVariant }]}>
                  Congestion coloring & flow re-weighting
                </Text>
              </View>
              <Switch
                value={showTraffic}
                onValueChange={(val) => {
                  triggerHaptic();
                  setShowTraffic(val);
                }}
                trackColor={{
                  false: colors.surfaceContainerHighest,
                  true: colors.primaryContainer,
                }}
                thumbColor="#ffffff"
              />
            </View>

            <View
              style={[
                styles.overlayToggleRow,
                { borderBottomColor: colors.surfaceContainerHigh },
              ]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.overlayTitle, { color: colors.onSurface }]}>
                  ADAS Speed Radar & Red Light Cameras
                </Text>
                <Text style={[styles.overlayDesc, { color: colors.onSurfaceVariant }]}>
                  Fixed radar alerts and corridor speed limits
                </Text>
              </View>
              <Switch
                value={showCameras}
                onValueChange={(val) => {
                  triggerHaptic();
                  setShowCameras(val);
                }}
                trackColor={{
                  false: colors.surfaceContainerHighest,
                  true: colors.primaryContainer,
                }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={[styles.overlayToggleRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.overlayTitle, { color: colors.onSurface }]}>
                  Crowdsourced Road Hazard Icons
                </Text>
                <Text style={[styles.overlayDesc, { color: colors.onSurfaceVariant }]}>
                  Potholes, waterlogging & accident pins
                </Text>
              </View>
              <Switch
                value={showHazards}
                onValueChange={(val) => {
                  triggerHaptic();
                  setShowHazards(val);
                }}
                trackColor={{
                  false: colors.surfaceContainerHighest,
                  true: colors.primaryContainer,
                }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          <Button
            variant="primary"
            size="md"
            title="Apply Layer Settings"
            leftIcon={<CheckCircle2 size={16} color={colors.onPrimary} />}
            onPress={() => {
              triggerHaptic();
              setShowLayerModal(false);
            }}
            style={{ marginTop: Spacing.xs }}
          />
        </View>
      </BottomSheet>

      {/* 4. INSTANT 3D GYRO LAUNCH EXPERIENCE */}
      {showGyroIntro && (
        <AppLaunchGyroIntro onDismiss={() => setShowGyroIntro(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  headerSafeArea: {
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Shadows.sm,
  },
  header: {
    height: 56,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  logoTag: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    ...Typography.titleMedium,
    fontWeight: '700',
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mapCanvasWrapper: {
    position: 'relative',
    width: '100%',
  },
  floatingTopContainer: {
    position: 'absolute',
    top: 8,
    left: 14,
    right: 14,
    zIndex: 30,
    gap: 8,
  },
  searchCard: {
    borderRadius: Radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.md,
    gap: 8,
  },
  searchLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchLogoThumb: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
  },
  searchAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCenterPrompt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  searchPlaceholder: {
    ...Typography.bodyMedium,
    fontSize: 13,
    flexShrink: 1,
  },
  cursorBeam: {
    width: 2,
    height: 14,
    marginLeft: 3,
  },
  searchRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dividerV: {
    width: 1,
    height: 18,
    opacity: 0.5,
  },
  micButtonWrapper: {
    position: 'relative',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHalo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitChipsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  transitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.xs,
  },
  transitChipLabel: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: '700',
  },
  metroBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  metroBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  ridePriceBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  floatingLeftWidgets: {
    position: 'absolute',
    top: 106,
    left: 14,
    zIndex: 20,
    gap: 8,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  weatherTemp: {
    ...Typography.labelMedium,
    fontSize: 11,
    fontWeight: '700',
  },
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  aqiDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  aqiText: {
    fontSize: 9,
    fontWeight: '600',
  },
  speedCameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    ...Shadows.xs,
  },
  speedCameraText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '600',
  },
  floatingRightControls: {
    position: 'absolute',
    top: 106,
    right: 14,
    zIndex: 20,
    alignItems: 'center',
    gap: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  trafficIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  trafficBars: {
    flexDirection: 'row',
    gap: 2,
  },
  miniBar: {
    width: 3,
    height: 10,
    borderRadius: 1.5,
  },
  routeFabText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  locateMeFab: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  bottomSheetHUD: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    marginTop: -20,
    gap: 12,
    ...Shadows.lg,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  commuteWorkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    ...Shadows.xs,
  },
  commuteLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: Spacing.sm,
  },
  workIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commuteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commuteTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  greenPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  fastestBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  commuteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  commuteTimeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotSeparator: {
    fontSize: 12,
  },
  commuteDistText: {
    fontSize: 12,
  },
  commuteRoadText: {
    fontSize: 11,
    flexShrink: 1,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  goButtonText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  commuteHomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  homeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  homeIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  homeSubtitle: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  starButton: {
    padding: 6,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 2,
  },
  serviceCol: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  serviceCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceLabel: {
    ...Typography.labelSmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  serviceSubLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  alertBanner: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  alertLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    ...Typography.bodySmall,
    flexShrink: 1,
  },
  alertDetailsBtn: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },

  /* Map Layers Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  layerModalCard: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: 14,
    ...Shadows.lg,
  },
  layerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
  },
  layerModalTitle: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  layerModalSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  layerModalClose: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerSectionLabel: {
    ...Typography.labelMedium,
    fontWeight: '700',
    marginTop: 2,
  },
  layerOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  layerOptionChip: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  layerOptionText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlayToggles: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
  },
  overlayToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlayTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  overlayDesc: {
    ...Typography.bodySmall,
    fontSize: 10,
    marginTop: 2,
  },
  applyLayersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    marginTop: 4,
    ...Shadows.sm,
  },
  applyLayersText: {
    ...Typography.labelLarge,
    fontWeight: '700',
  },
});
