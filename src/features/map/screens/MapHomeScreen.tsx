import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bell,
  User,
  Mic,
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
  X,
  CheckCircle2,
  Satellite,
} from 'lucide-react-native';
import VectorMapCanvas from '../components/VectorMapCanvas';
import { BMapColors } from '@/shared';

const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AEtjO1VN3H4tzgmXs2ZRa0LcSjl67XdRLkUoaSPeH_CWrj-KjJJn-jxm5Ry5BCuQEgauBA2ThJbop3aKeUWeQ6SIdguokZoxbQ03I2vdvAUunO_QvAU8m1DCVcEXQYq8TxLTr2sWs2k07ep1c3xBFVp7H3inSTj60j6IHieJAYPLhMEQKWUapTBKMbNFv4M-1wMcH_cGS00_NluNZE-s9nOPbjxB6lGgQyLc1ATdoWESAGL1bzNPnljLN2abiRf-';

type TransitMode = 'drive' | 'transit' | 'ride' | 'bike' | 'walk';
type MapLayerType = 'standard' | 'satellite' | 'night' | 'navic';

export default function HomeScreen() {
  const [activeMode, setActiveMode] = useState<TransitMode>('drive');
  const [showTraffic, setShowTraffic] = useState(true);
  const [isHomeStarred, setIsHomeStarred] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>('standard');
  const [showCameras, setShowCameras] = useState(true);
  const [showHazards, setShowHazards] = useState(true);

  // Animations using state initializers for React 19 compatibility
  const [cursorOpacity] = useState(() => new Animated.Value(1));
  const [micPulseAnim] = useState(() => new Animated.Value(1));
  const [compassRotate] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Blinking search cursor
    const cursorInterval = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    // Mic halo ping
    const micInterval = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(micPulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    cursorInterval.start();
    micInterval.start();

    return () => {
      cursorInterval.stop();
      micInterval.stop();
    };
  }, [cursorOpacity, micPulseAnim]);

  const handleCompassPress = () => {
    Animated.sequence([
      Animated.timing(compassRotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(compassRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLocateMe = () => {
    Alert.alert('GPS Location', 'Centered to current coordinate (31.2304° N, 121.4737° E)');
  };

  const handleVoiceAssistant = () => {
    router.push('/ai-copilot');
  };

  const handleStartNav = () => {
    router.push('/modal');
  };

  const handlePoiSelect = (poiName: string) => {
    Alert.alert('Waypoint Selected', `${poiName} highlighted on map. Tap "Go" to route.`);
  };

  const compassInterpolation = useMemo(
    () =>
      compassRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [compassRotate]
  );

  return (
    <View style={styles.screenContainer}>
      {/* 1. FIXED TOP HEADER */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.brandCluster}>
            <Image source={{ uri: LOGO_URI }} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.titleColumn}>
              <Text style={styles.logoTag}>B MAP</Text>
              <Text style={styles.headerTitle}>Map Explore</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Notifications', 'No new alerts. Real-time traffic monitoring active.')}>
              <Bell size={20} color={BMapColors.onSurfaceVariant} />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileAvatar}
              activeOpacity={0.7}
              onPress={() => router.push('/auth')}>
              <User size={18} color="#ffffff" />
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
            {/* Search Card */}
            <View style={styles.searchCard}>
              <View style={styles.searchLeftGroup}>
                <Image source={{ uri: LOGO_URI }} style={styles.searchLogoThumb} resizeMode="contain" />
                <View style={styles.searchAvatarMini}>
                  <User size={15} color={BMapColors.primary} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchCenterPrompt}
                activeOpacity={0.8}
                onPress={() => router.push('/search')}>
                <Text style={styles.searchPlaceholder} numberOfLines={1}>
                  Search destination, gas, food...
                </Text>
                <Animated.View style={[styles.cursorBeam, { opacity: cursorOpacity }]} />
              </TouchableOpacity>

              <View style={styles.searchRightGroup}>
                <View style={styles.dividerV} />

                {/* B-Assistant Voice with Glow Halo */}
                <TouchableOpacity
                  style={styles.micButtonWrapper}
                  onPress={handleVoiceAssistant}
                  activeOpacity={0.8}>
                  <Animated.View
                    style={[
                      styles.micHalo,
                      {
                        transform: [{ scale: micPulseAnim }],
                        opacity: 0.25,
                      },
                    ]}
                  />
                  <View style={styles.micButton}>
                    <Mic size={18} color={BMapColors.primaryContainer} fill={BMapColors.primaryContainer} />
                  </View>
                </TouchableOpacity>

                {/* AR Visual Search */}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => Alert.alert('AR Navigation', 'Opening AR Camera mode...')}
                  activeOpacity={0.7}>
                  <Camera size={19} color={BMapColors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Transit Mode Switcher Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.transitChipsTrack}>
              {/* Drive (Active) */}
              <TouchableOpacity
                style={[
                  styles.transitChip,
                  activeMode === 'drive' ? styles.transitChipActive : styles.transitChipInactive,
                ]}
                onPress={() => setActiveMode('drive')}
                activeOpacity={0.8}>
                <Car
                  size={16}
                  color={activeMode === 'drive' ? '#ffffff' : BMapColors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.transitChipLabel,
                    activeMode === 'drive' ? styles.chipTextActive : styles.chipTextInactive,
                  ]}>
                  Drive
                </Text>
              </TouchableOpacity>

              {/* Transit / Metro */}
              <TouchableOpacity
                style={[
                  styles.transitChip,
                  activeMode === 'transit' ? styles.transitChipActive : styles.transitChipInactive,
                ]}
                onPress={() => {
                  setActiveMode('transit');
                  router.push('/transit-planner');
                }}
                activeOpacity={0.8}>
                <TrainFront
                  size={16}
                  color={activeMode === 'transit' ? '#ffffff' : BMapColors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.transitChipLabel,
                    activeMode === 'transit' ? styles.chipTextActive : styles.chipTextInactive,
                  ]}>
                  Transit
                </Text>
                <View style={styles.metroBadge}>
                  <Text style={styles.metroBadgeText}>Line 2</Text>
                </View>
              </TouchableOpacity>

              {/* Ride / Taxi */}
              <TouchableOpacity
                style={[
                  styles.transitChip,
                  activeMode === 'ride' ? styles.transitChipActive : styles.transitChipInactive,
                ]}
                onPress={() => setActiveMode('ride')}
                activeOpacity={0.8}>
                <CarTaxiFront
                  size={16}
                  color={activeMode === 'ride' ? '#ffffff' : BMapColors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.transitChipLabel,
                    activeMode === 'ride' ? styles.chipTextActive : styles.chipTextInactive,
                  ]}>
                  Ride
                </Text>
                <Text style={styles.ridePriceBadge}>₹120~</Text>
              </TouchableOpacity>

              {/* Bike / E-Scooter */}
              <TouchableOpacity
                style={[
                  styles.transitChip,
                  activeMode === 'bike' ? styles.transitChipActive : styles.transitChipInactive,
                ]}
                onPress={() => setActiveMode('bike')}
                activeOpacity={0.8}>
                <Bike
                  size={16}
                  color={activeMode === 'bike' ? '#ffffff' : BMapColors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.transitChipLabel,
                    activeMode === 'bike' ? styles.chipTextActive : styles.chipTextInactive,
                  ]}>
                  Bike
                </Text>
              </TouchableOpacity>

              {/* Walk */}
              <TouchableOpacity
                style={[
                  styles.transitChip,
                  activeMode === 'walk' ? styles.transitChipActive : styles.transitChipInactive,
                ]}
                onPress={() => setActiveMode('walk')}
                activeOpacity={0.8}>
                <Footprints
                  size={16}
                  color={activeMode === 'walk' ? '#ffffff' : BMapColors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.transitChipLabel,
                    activeMode === 'walk' ? styles.chipTextActive : styles.chipTextInactive,
                  ]}>
                  Walk
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* FLOATING LEFT ENVIRONMENTAL & ROAD SAFETY WIDGETS */}
          <View style={styles.floatingLeftWidgets}>
            {/* Weather & Air Quality Pill */}
            <View style={styles.weatherPill}>
              <Sun size={18} color="#FF9800" fill="#FF9800" />
              <View>
                <Text style={styles.weatherTemp}>24°C Sunny</Text>
                <View style={styles.aqiRow}>
                  <View style={styles.aqiDot} />
                  <Text style={styles.aqiText}>AQI 28 · Good</Text>
                </View>
              </View>
            </View>

            {/* Speed Camera Alert Badge */}
            <View style={styles.speedCameraBadge}>
              <Video size={14} color={BMapColors.error} />
              <Text style={styles.speedCameraText}>Camera 450m ahead (60 km/h)</Text>
            </View>
          </View>

          {/* FLOATING RIGHT MAP UTILITY CONTROLS */}
          <View style={styles.floatingRightControls}>
            {/* Map Layers */}
            <TouchableOpacity
              style={styles.fabBtn}
              onPress={() => setShowLayerModal(true)}
              activeOpacity={0.8}>
              <Layers size={19} color={BMapColors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Traffic Toggle */}
            <TouchableOpacity
              style={styles.fabBtn}
              onPress={() => setShowTraffic(!showTraffic)}
              activeOpacity={0.8}>
              <View style={styles.trafficIconWrapper}>
                <View
                  style={[
                    styles.trafficIndicatorDot,
                    { backgroundColor: showTraffic ? BMapColors.primaryContainer : BMapColors.outlineVariant },
                  ]}
                />
                <View style={styles.trafficBars}>
                  <View style={[styles.miniBar, { backgroundColor: '#00C06D' }]} />
                  <View style={[styles.miniBar, { backgroundColor: '#FF9800' }]} />
                  <View style={[styles.miniBar, { backgroundColor: '#F44336' }]} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Route Planner Shortcut */}
            <TouchableOpacity
              style={styles.fabBtn}
              onPress={() => router.push('/(tabs)/routes')}
              activeOpacity={0.8}>
              <Route size={17} color={BMapColors.primaryContainer} />
              <Text style={styles.routeFabText}>Route</Text>
            </TouchableOpacity>

            {/* North Compass */}
            <TouchableOpacity style={styles.compassBtn} onPress={handleCompassPress} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ rotate: compassInterpolation }], alignItems: 'center' }}>
                <Text style={styles.compassN}>N</Text>
                <View style={styles.compassNeedle} />
              </Animated.View>
            </TouchableOpacity>

            {/* Recenter / Locate Me FAB */}
            <TouchableOpacity style={styles.locateMeFab} onPress={handleLocateMe} activeOpacity={0.85}>
              <LocateFixed size={24} color={BMapColors.primaryContainer} />
            </TouchableOpacity>
          </View>

          {/* 3. BOTTOM SHEET COMMUTE & DISCOVERY HUD */}
          <View style={styles.bottomSheetHUD}>
            {/* Drag Handle Bar */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Commute Target 1: Company / Work */}
            <View style={styles.commuteWorkCard}>
              <View style={styles.commuteLeft}>
                <View style={styles.workIconBox}>
                  <Building size={22} color={BMapColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.commuteTitleRow}>
                    <Text style={styles.commuteTitle}>Company</Text>
                    <View style={styles.fastestBadge}>
                      <View style={styles.greenPulseDot} />
                      <Text style={styles.fastestBadgeText}>Fastest Route</Text>
                    </View>
                  </View>
                  <View style={styles.commuteMetaRow}>
                    <Text style={styles.commuteTimeText}>28 min</Text>
                    <Text style={styles.dotSeparator}>·</Text>
                    <Text style={styles.commuteDistText}>14.2 km</Text>
                    <Text style={styles.dotSeparator}>·</Text>
                    <Text style={styles.commuteRoadText} numberOfLines={1}>
                      via Highway 4
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.goButton} onPress={handleStartNav} activeOpacity={0.85}>
                <Navigation size={17} color="#ffffff" />
                <Text style={styles.goButtonText}>Go</Text>
              </TouchableOpacity>
            </View>

            {/* Commute Target 2: Home */}
            <TouchableOpacity
              style={styles.commuteHomeCard}
              onPress={() => Alert.alert('Configure Home', 'Enter home address to set automatic commute alerts')}
              activeOpacity={0.7}>
              <View style={styles.homeLeft}>
                <View style={styles.homeIconBox}>
                  <House size={18} color={BMapColors.onSurfaceVariant} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.homeTitle}>Home</Text>
                  <Text style={styles.homeSubtitle}>Tap to configure commute route</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.starButton}
                onPress={() => setIsHomeStarred(!isHomeStarred)}
                activeOpacity={0.7}>
                <Star
                  size={19}
                  color={isHomeStarred ? '#FF9800' : BMapColors.tertiaryContainer}
                  fill={isHomeStarred ? '#FF9800' : 'none'}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Quick Services 4-Column Grid */}
            <View style={styles.servicesGrid}>
              {/* EV Charging */}
              <TouchableOpacity
                style={styles.serviceCol}
                onPress={() => router.push('/ev-station')}
                activeOpacity={0.7}>
                <View style={[styles.serviceCircle, { backgroundColor: BMapColors.primaryFixed }]}>
                  <Zap size={20} color={BMapColors.primary} />
                </View>
                <Text style={styles.serviceLabel}>EV Charge</Text>
                <Text style={[styles.serviceSubLabel, { color: BMapColors.primaryContainer }]}>
                  42 nearby
                </Text>
              </TouchableOpacity>

              {/* Gas Station */}
              <TouchableOpacity
                style={styles.serviceCol}
                onPress={() => router.push('/(tabs)/nearby')}
                activeOpacity={0.7}>
                <View style={[styles.serviceCircle, { backgroundColor: BMapColors.tertiaryFixed }]}>
                  <Fuel size={20} color={BMapColors.tertiary} />
                </View>
                <Text style={styles.serviceLabel}>Gas Station</Text>
                <Text style={[styles.serviceSubLabel, { color: '#00C06D' }]}>-₹3.50/L</Text>
              </TouchableOpacity>

              {/* Parking */}
              <TouchableOpacity
                style={styles.serviceCol}
                onPress={() => router.push('/indoor-parking')}
                activeOpacity={0.7}>
                <View style={[styles.serviceCircle, { backgroundColor: BMapColors.secondaryContainer }]}>
                  <SquareParking size={20} color={BMapColors.onSecondaryContainer} />
                </View>
                <Text style={styles.serviceLabel}>Parking</Text>
                <Text style={styles.serviceSubLabel}>Live spots</Text>
              </TouchableOpacity>

              {/* Dining */}
              <TouchableOpacity
                style={styles.serviceCol}
                onPress={() => router.push('/(tabs)/nearby')}
                activeOpacity={0.7}>
                <View style={[styles.serviceCircle, { backgroundColor: BMapColors.surfaceContainerHighest }]}>
                  <Utensils size={20} color={BMapColors.onSurface} />
                </View>
                <Text style={styles.serviceLabel}>Dining</Text>
                <Text style={[styles.serviceSubLabel, { color: '#FF9800' }]}>Top Rated</Text>
              </TouchableOpacity>
            </View>

            {/* Traffic Alert Banner */}
            <View style={styles.alertBanner}>
              <View style={styles.alertLeft}>
                <Megaphone size={18} color={BMapColors.primaryContainer} />
                <Text style={styles.alertText} numberOfLines={1}>
                  <Text style={{ fontWeight: '700' }}>Expressway East:</Text> Roadwork cleared, normal
                  flow resumed.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Traffic Details', 'Expressway East flow normalized at 75 km/h.')}
                activeOpacity={0.7}>
                <Text style={styles.alertDetailsBtn}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Map Layers & Overlays Modal */}
      <Modal
        visible={showLayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLayerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.layerModalCard}>
            <View style={styles.layerModalHeader}>
              <View>
                <Text style={styles.layerModalTitle}>Sovereign Map Layers</Text>
                <Text style={styles.layerModalSub}>ISRO NavIC Dual-Band & Real-Time GIS</Text>
              </View>
              <TouchableOpacity
                style={styles.layerModalClose}
                onPress={() => setShowLayerModal(false)}>
                <X size={18} color="#111C2D" />
              </TouchableOpacity>
            </View>

            {/* Base Layer Switcher */}
            <Text style={styles.layerSectionLabel}>Base Map Type</Text>
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
                    style={[styles.layerOptionChip, isSelected && styles.layerOptionChipSelected]}
                    onPress={() => setSelectedLayer(opt.key)}
                    activeOpacity={0.8}>
                    <IconComp size={18} color={isSelected ? '#ffffff' : '#0096FF'} />
                    <Text
                      style={[
                        styles.layerOptionText,
                        isSelected && styles.layerOptionTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Overlays */}
            <Text style={styles.layerSectionLabel}>Real-Time Telematics Overlays</Text>
            <View style={styles.overlayToggles}>
              <View style={styles.overlayToggleRow}>
                <View>
                  <Text style={styles.overlayTitle}>Live 1Hz Traffic Heatmap</Text>
                  <Text style={styles.overlayDesc}>Congestion coloring & flow re-weighting</Text>
                </View>
                <Switch
                  value={showTraffic}
                  onValueChange={setShowTraffic}
                  trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.overlayToggleRow}>
                <View>
                  <Text style={styles.overlayTitle}>ADAS Speed Radar & Red Light Cameras</Text>
                  <Text style={styles.overlayDesc}>Fixed radar alerts and corridor speed limits</Text>
                </View>
                <Switch
                  value={showCameras}
                  onValueChange={setShowCameras}
                  trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={[styles.overlayToggleRow, { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.overlayTitle}>Crowdsourced Road Hazard Icons</Text>
                  <Text style={styles.overlayDesc}>Potholes, waterlogging & accident pins</Text>
                </View>
                <Switch
                  value={showHazards}
                  onValueChange={setShowHazards}
                  trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyLayersBtn}
              onPress={() => setShowLayerModal(false)}
              activeOpacity={0.85}>
              <CheckCircle2 size={16} color="#ffffff" />
              <Text style={styles.applyLayersText}>Apply Layer Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: BMapColors.surface,
  },
  headerSafeArea: {
    backgroundColor: '#ffffff',
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
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
    fontSize: 10,
    fontWeight: '800',
    color: BMapColors.primaryContainer,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BMapColors.onSurface,
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
    borderRadius: 19,
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
    backgroundColor: BMapColors.error,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BMapColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
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
    borderRadius: 8,
    backgroundColor: BMapColors.primaryFixed,
  },
  searchAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BMapColors.surfaceContainerHigh,
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
    fontSize: 13,
    color: BMapColors.onSurfaceVariant,
    flexShrink: 1,
  },
  cursorBeam: {
    width: 2,
    height: 14,
    backgroundColor: BMapColors.primaryContainer,
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
    backgroundColor: BMapColors.outlineVariant,
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
    backgroundColor: BMapColors.primaryContainer,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BMapColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  transitChipActive: {
    backgroundColor: BMapColors.primaryContainer,
    shadowColor: BMapColors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  transitChipInactive: {
    backgroundColor: '#ffffff',
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  transitChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: BMapColors.onSurface,
  },
  metroBadge: {
    backgroundColor: BMapColors.errorContainer,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  metroBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BMapColors.onErrorContainer,
  },
  ridePriceBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C06D',
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
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherTemp: {
    fontSize: 11,
    fontWeight: '700',
    color: BMapColors.onSurface,
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
    backgroundColor: BMapColors.secondary,
  },
  aqiText: {
    fontSize: 9,
    fontWeight: '600',
    color: BMapColors.secondary,
  },
  speedCameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  speedCameraText: {
    fontSize: 10,
    fontWeight: '600',
    color: BMapColors.onSurface,
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
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  trafficIconWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  trafficIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  trafficBars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  miniBar: {
    width: 4,
    height: 3,
    borderRadius: 2,
  },
  routeFabText: {
    fontSize: 8,
    fontWeight: '700',
    color: BMapColors.primary,
    marginTop: 1,
  },
  compassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compassN: {
    fontSize: 9,
    fontWeight: '800',
    color: BMapColors.error,
    lineHeight: 11,
  },
  compassNeedle: {
    width: 2,
    height: 12,
    backgroundColor: BMapColors.error,
    borderRadius: 1,
    marginTop: 1,
  },
  locateMeFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BMapColors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
    marginTop: 4,
  },
  bottomSheetHUD: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginTop: -80,
    zIndex: 40,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BMapColors.outlineVariant,
  },
  commuteWorkCard: {
    backgroundColor: BMapColors.surfaceContainerLow,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  commuteLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BMapColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commuteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commuteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BMapColors.onSurface,
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2F6EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  greenPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#00C06D',
  },
  fastestBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00743F',
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
    color: '#00C06D',
  },
  dotSeparator: {
    color: BMapColors.outlineVariant,
  },
  commuteDistText: {
    fontSize: 12,
    fontWeight: '600',
    color: BMapColors.onSurfaceVariant,
  },
  commuteRoadText: {
    fontSize: 12,
    color: BMapColors.onSurfaceVariant,
    flexShrink: 1,
  },
  goButton: {
    backgroundColor: BMapColors.primaryContainer,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: BMapColors.primaryContainer,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  goButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  commuteHomeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BMapColors.surfaceContainer,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: 8,
    backgroundColor: BMapColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BMapColors.onSurface,
  },
  homeSubtitle: {
    fontSize: 11,
    color: BMapColors.onSurfaceVariant,
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
    backgroundColor: BMapColors.surfaceContainer,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  serviceCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BMapColors.onSurface,
    textAlign: 'center',
  },
  serviceSubLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: BMapColors.onSurfaceVariant,
    marginTop: 1,
    textAlign: 'center',
  },
  alertBanner: {
    backgroundColor: BMapColors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    fontSize: 11,
    color: BMapColors.onSurface,
    flexShrink: 1,
  },
  alertDetailsBtn: {
    fontSize: 11,
    fontWeight: '700',
    color: BMapColors.primary,
  },

  /* Map Layers Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  layerModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  layerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    paddingBottom: 10,
  },
  layerModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111C2D',
  },
  layerModalSub: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
  },
  layerModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
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
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#D8E3FB',
  },
  layerOptionChipSelected: {
    backgroundColor: '#0096FF',
    borderColor: '#0096FF',
  },
  layerOptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3F4753',
    textAlign: 'center',
  },
  layerOptionTextSelected: {
    color: '#ffffff',
  },
  overlayToggles: {
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E3FB',
  },
  overlayToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  overlayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  overlayDesc: {
    fontSize: 10,
    color: '#707884',
    marginTop: 2,
  },
  applyLayersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyLayersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
