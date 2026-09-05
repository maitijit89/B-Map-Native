import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BMapColors, BMapElevation, BMapTypography, BMapAnimation } from '@/constants/bmap-theme';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { FloatingSearchBar } from '@/components/FloatingSearchBar';
import { BaiduServiceGrid, BaiduServiceItem } from '@/components/BaiduServiceGrid';
import { SmartCommuteCard } from '@/components/SmartCommuteCard';
import { DraggableBottomSheet } from '@/components/DraggableBottomSheet';
import { PlaceDetailsSheet } from '@/components/PlaceDetailsSheet';
import { PlacePOI } from '@/types';
import { getLatestTelemetry } from '@/services/telemetry';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { FadeInView } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { triggerHaptic } from '@/utils/haptics';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';
import {
  detectLanguageFromScript,
  INDIAN_LANGUAGES,
} from '@/services/languageService';
import { speakText } from '@/services/voiceGuidance';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlacesAPI, IndianEcosystemAPI } from '@/api/api';
import { Place, HighwayWeatherReport } from '@/api/types';
import { PlaceCategory } from '@/types';

type MapLayerType = 'daylight' | 'dark' | 'satellite' | 'terrain';

function mapBackendPlaceToPOI(p: Place): PlacePOI {
  const coords = p.location?.coordinates || [77.2090, 28.6139];
  const lng = coords[0];
  const lat = coords[1];
  const distanceKm = p.distance_meters
    ? parseFloat((p.distance_meters / 1000).toFixed(1))
    : 1.5;

  let cat: PlaceCategory = 'poi';
  switch (p.category?.toLowerCase()) {
    case 'ev': cat = 'ev'; break;
    case 'toll': cat = 'toll'; break;
    case 'fuel': cat = 'fuel'; break;
    case 'hospital': cat = 'sos'; break;
    case 'taxi': cat = 'taxi'; break;
    case 'hazard': cat = 'hazard'; break;
    default: cat = 'poi'; break;
  }

  return {
    id: p.id || `poi-${Math.random()}`,
    title: p.name,
    category: cat,
    rating: undefined, // Backend Place type does not include rating field
    reviewCount: undefined, // Backend Place type does not include review_count field
    address: p.address || p.name,
    digipin: p.digipin || undefined,
    coordinates: { latitude: lat, longitude: lng },
    distanceKm,
    details: {
      timings: 'Open 24 Hours',
      pricing: p.category === 'ev' ? '₹18.5/kWh' : undefined,
      fastagLane: p.category === 'toll' ? true : undefined,
    },
  };
}

export default function HomeMapScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  // State
  const [mapLayer, setMapLayer] = useState<MapLayerType>('daylight');
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(true);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [highlightedPlace, setHighlightedPlace] = useState<PlacePOI | null>(null);
  const [detailModalPlace, setDetailModalPlace] = useState<PlacePOI | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);

  // Live Backend Places and Highway Weather
  const [places, setPlaces] = useState<PlacePOI[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [highwayWeather, setHighwayWeather] = useState<HighwayWeatherReport | null>(null);

  // Multi-lingual Indian 12-Language state & translations via LanguageContext
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

  // Reanimated shared values for smooth Baidu minimalism transitions
  const peekCardTranslateY = useSharedValue(200);
  const peekCardOpacity = useSharedValue(0);
  const layerRotation = useSharedValue(0);
  const compassRotation = useSharedValue(45);
  const topOverlayTranslateY = useSharedValue(0);
  const topOverlayOpacity = useSharedValue(1);

  // Fetch real places from backend PlacesAPI
  useEffect(() => {
    let isMounted = true;
    const fetchPlaces = async () => {
      setIsLoadingPlaces(true);
      try {
        const loc = getLatestTelemetry();
        const res = await PlacesAPI.search({
          lat: loc.latitude,
          lng: loc.longitude,
          radius: 35000,
          limit: 30,
          category: activeCategory || undefined,
        });
        const placeList = res.data?.places;
        if (isMounted && placeList && placeList.length > 0) {
          setPlaces(placeList.map(mapBackendPlaceToPOI));
        }
      } catch (err) {
        console.warn('Failed to load places from backend:', err);
      } finally {
        if (isMounted) setIsLoadingPlaces(false);
      }
    };

    fetchPlaces();
    return () => { isMounted = false; };
  }, [activeCategory]);

  // Fetch real live Highway Weather from IndianEcosystemAPI
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const loc = getLatestTelemetry();
        const res = await IndianEcosystemAPI.getHighwayWeather(loc.latitude, loc.longitude);
        if (isMounted && res.data?.data) {
          setHighwayWeather(res.data.data);
        }
      } catch (e) {
        console.warn('Failed to load highway weather:', e);
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, []);

  // Minimalist Mode animation
  useEffect(() => {
    if (isMinimalMode) {
      topOverlayTranslateY.value = withTiming(-180, { duration: BMapAnimation.timing.normal });
      topOverlayOpacity.value = withTiming(0, { duration: BMapAnimation.timing.fast });
    } else {
      topOverlayTranslateY.value = withSpring(0, BMapAnimation.sheetSpring);
      topOverlayOpacity.value = withTiming(1, { duration: BMapAnimation.timing.normal });
    }
  }, [isMinimalMode, topOverlayTranslateY, topOverlayOpacity]);

  // Animate peek card appearance
  useEffect(() => {
    if (highlightedPlace && sheetIndex === 0 && !isMinimalMode) {
      peekCardTranslateY.value = withSpring(0, BMapAnimation.sheetSpring);
      peekCardOpacity.value = withTiming(1, { duration: BMapAnimation.timing.normal });
    } else {
      peekCardTranslateY.value = withSpring(200, BMapAnimation.sheetSpring);
      peekCardOpacity.value = withTiming(0, { duration: BMapAnimation.timing.fast });
    }
  }, [highlightedPlace, sheetIndex, isMinimalMode, peekCardTranslateY, peekCardOpacity]);

  const topOverlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topOverlayTranslateY.value }],
    opacity: topOverlayOpacity.value,
  }));

  const peekCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: peekCardTranslateY.value }],
    opacity: peekCardOpacity.value,
  }));

  const layerIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${layerRotation.value}deg` }],
  }));

  const compassIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  // Live POIs mapped from backend Places API
  const filteredPOIs = useMemo(() => {
    return places;
  }, [places]);

  const mapMarkers: BMapMarkerItem[] = useMemo(() => {
    return filteredPOIs.map(p => ({
      id: p.id,
      coordinate: p.coordinates,
      title: p.title,
      description: p.address,
      category: p.category,
      data: p,
    }));
  }, [filteredPOIs]);

  const handleMarkerPress = useCallback((marker: BMapMarkerItem) => {
    triggerHaptic.selection();
    if (marker.data) {
      setHighlightedPlace(marker.data as PlacePOI);
      if (isMinimalMode) {
        setIsMinimalMode(false);
      }
    }
  }, [isMinimalMode]);

  const handleServiceSelect = useCallback((service: BaiduServiceItem) => {
    if (activeServiceId === service.id) {
      setActiveServiceId(null);
      setActiveCategory(null);
    } else {
      setActiveServiceId(service.id);
      setActiveCategory(service.categoryFilter || null);
    }
  }, [activeServiceId]);

  const cycleLayer = useCallback(() => {
    triggerHaptic.selection();
    const layers: MapLayerType[] = ['daylight', 'satellite', 'terrain', 'dark'];
    layerRotation.value = withSpring(layerRotation.value + 90, BMapAnimation.bounceSpring);
    setMapLayer(prev => {
      const nextIdx = (layers.indexOf(prev) + 1) % layers.length;
      return layers[nextIdx];
    });
  }, [layerRotation]);

  const toggleTrafficOverlay = useCallback(() => {
    triggerHaptic.medium();
    setShowTrafficOverlay(prev => !prev);
  }, []);

  const snapCompassToNorth = useCallback(() => {
    triggerHaptic.light();
    compassRotation.value = withSpring(0, BMapAnimation.bounceSpring);
  }, [compassRotation]);

  const handleCenterLocation = useCallback(() => {
    triggerHaptic.success();
    const loc = getLatestTelemetry();
    const userPOI: PlacePOI = {
      id: 'user-current-poi',
      title: 'Your Live Location',
      category: 'poi',
      rating: undefined,
      reviewCount: undefined,
      address: loc.addressString || 'Locating…',
      digipin: undefined,
      coordinates: { latitude: loc.latitude, longitude: loc.longitude },
      distanceKm: 0,
    };
    setHighlightedPlace(userPOI);
  }, []);

  const toggleMinimalMode = useCallback(() => {
    triggerHaptic.heavy();
    setIsMinimalMode(prev => !prev);
  }, []);

  const handleVoiceSearch = useCallback(() => {
    triggerHaptic.medium();
    setIsVoiceModalVisible(true);
  }, []);

  const handleLanguagePress = useCallback(() => {
    triggerHaptic.selection();
    setIsVoiceModalVisible(true);
  }, []);

  const handleSelectVoiceQuery = useCallback(
    (query: string) => {
      setSearchQuery(query);
      router.push({
        pathname: '/navigate/route-planner' as any,
        params: { destTitle: query },
      });
    },
    [router]
  );

  const handleSearchQueryChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      const detectedScript = detectLanguageFromScript(text);
      if (detectedScript && detectedScript !== currentLanguage) {
        setLanguage(detectedScript);
      }
    },
    [currentLanguage, setLanguage]
  );

  const handleAIAssistant = useCallback(() => {
    triggerHaptic.light();
    const aiPrompt =
      currentLanguage === 'hi'
        ? 'एयरपोर्ट जाने का सबसे तेज़ रास्ता'
        : currentLanguage === 'ta'
        ? 'விமான நிலையத்திற்கான அதிவேக வழி'
        : 'Fastest route to Airport via Metro';
    setSearchQuery(aiPrompt);
    speakText(
      currentLanguage === 'hi'
        ? 'स्मार्ट एआई ने एयरपोर्ट का सबसे तेज़ रास्ता चुना है'
        : 'Smart AI routing activated',
      currentLanguage
    );
  }, [currentLanguage]);

  const handleNavigateToPlace = useCallback(
    (place: PlacePOI) => {
      triggerHaptic.medium();
      router.push({
        pathname: '/navigate/route-planner' as any,
        params: {
          destTitle: place.title,
          destLat: place.coordinates.latitude.toString(),
          destLng: place.coordinates.longitude.toString(),
          destDigipin: place.digipin,
        },
      });
    },
    [router]
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      triggerHaptic.medium();
      router.push({
        pathname: '/navigate/route-planner' as any,
        params: { destTitle: searchQuery },
      });
    }
  }, [searchQuery, router]);

  const handleCommuteStart = useCallback((commute: any) => {
    triggerHaptic.medium();
    router.push({
      pathname: '/navigate/route-planner' as any,
      params: {
        destTitle: commute.name,
        destLat: commute.lat.toString(),
        destLng: commute.lng.toString(),
        destDigipin: commute.digipin,
      },
    });
  }, [router]);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'ev': return BMapColors.evCyan;
      case 'toll': return BMapColors.fastagPurple;
      case 'fuel': return '#E65100';
      case 'taxi': return '#4E6EF2';
      case 'hazard': return BMapColors.warningAmber;
      case 'sos': return BMapColors.emergencyRed;
      default: return '#4E6EF2';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'ev': return 'EV FAST CHARGING';
      case 'toll': return 'FASTAG TOLL';
      case 'fuel': return 'FUEL & SERVICES';
      case 'taxi': return 'RIDE & PICKUP';
      case 'hazard': return 'ROAD ALERT';
      case 'sos': return 'EMERGENCY 112';
      default: return 'LANDMARK';
    }
  };

  const getCategoryBgColor = (category?: string) => {
    switch (category) {
      case 'ev': return isDark ? '#123024' : '#ECFDF5';
      case 'toll': return isDark ? '#261840' : '#F5F3FF';
      case 'fuel': return isDark ? '#352115' : '#FFF7ED';
      case 'taxi': return isDark ? '#1A233A' : '#EFF6FF';
      case 'hazard': return isDark ? '#332612' : '#FFFBEB';
      case 'sos': return isDark ? '#381616' : '#FEF2F2';
      default: return isDark ? '#1A233A' : '#EFF6FF';
    }
  };

  return (
    <View style={styles.container}>
      {/* Full-screen Vector Canvas Map */}
      <BMapView
        mapStyleType={mapLayer}
        markers={mapMarkers}
        showTrafficOverlay={showTrafficOverlay}
        onMarkerPress={handleMarkerPress}
        onMapPress={() => setHighlightedPlace(null)}
      />

      {/* === Minimalist Mode Top Banner (Only visible in pure map mode) === */}
      {isMinimalMode && (
        <SafeAreaView style={styles.minimalBannerContainer} edges={['top']}>
          <FadeInView from="up" slideDistance={20}>
            <AnimatedPressableButton
              pressScale={0.92}
              onPress={toggleMinimalMode}
              style={[
                styles.minimalBannerBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Exit Minimalist Mode"
            >
              <Ionicons name="contract" size={14} color="#4E6EF2" />
              <Text style={[styles.minimalBannerText, { color: colors.text }]}>
                {t('pure_map_mode')}
              </Text>
            </AnimatedPressableButton>
          </FadeInView>
        </SafeAreaView>
      )}

      {/* === Top Floating Baidu Header Stack === */}
      <Animated.View
        style={[styles.topOverlayWrapper, topOverlayAnimatedStyle]}
        pointerEvents={isMinimalMode ? 'none' : 'box-none'}
      >
        <SafeAreaView edges={['top']} pointerEvents="box-none">
          <View style={styles.topOverlayContent}>
            {/* 1. Baidu-style Acrylic Search Capsule with Weather & Language */}
            <FadeInView delay={80} from="down" slideDistance={15}>
              <FloatingSearchBar
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                onSubmit={handleSearchSubmit}
                onVoicePress={handleVoiceSearch}
                onAIPress={handleAIAssistant}
                onMenuPress={() => router.push('/(tabs)/features' as any)}
                cityName="Delhi"
                weatherText={
                  highwayWeather
                    ? `${Math.round(highwayWeather.temperature_celsius)}°C ${
                        highwayWeather.is_dense_fog_active
                          ? 'Fog'
                          : highwayWeather.rainfall_mm_per_hour > 0
                          ? 'Rain'
                          : 'Clear'
                      }`
                    : '29°C Clear'
                }
                aqiText={
                  highwayWeather?.imd_alert_level
                    ? `IMD: ${highwayWeather.imd_alert_level.split('_')[0]}`
                    : 'AQI 48'
                }
                languageName={INDIAN_LANGUAGES[currentLanguage]?.nativeName || 'हिन्दी'}
                onLanguagePress={handleLanguagePress}
              />
            </FadeInView>

            {/* 2. Baidu 5-Item Minimalist Service Hub */}
            <View style={styles.serviceGridWrapper}>
              <BaiduServiceGrid
                activeId={activeServiceId}
                onSelectService={handleServiceSelect}
                entranceDelay={200}
              />
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* === Right Floating Utility Dock (Baidu Minimalist Right Rail) === */}
      <View
        style={[
          styles.utilityDockContainer,
          {
            bottom:
              highlightedPlace && sheetIndex === 0 && !isMinimalMode
                ? isSmallDevice ? 185 : 205
                : isMinimalMode
                ? isSmallDevice ? 85 : 95
                : isSmallDevice ? 105 : 120,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Layer Switcher */}
        <AnimatedPressableButton
          pressScale={0.88}
          onPress={cycleLayer}
          style={[
            styles.utilityBtn,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Map layer: ${mapLayer}`}
        >
          <Animated.View style={layerIconAnimatedStyle}>
            <MaterialCommunityIcons name="layers" size={18} color="#4E6EF2" />
          </Animated.View>
          <Text style={[styles.utilityLabel, { color: colors.textSecondary }]}>
            {mapLayer === 'daylight' ? 'DAY' : mapLayer.slice(0, 4).toUpperCase()}
          </Text>
        </AnimatedPressableButton>

        {/* Real-time Traffic Congestion Toggle (路况) */}
        <AnimatedPressableButton
          pressScale={0.88}
          onPress={toggleTrafficOverlay}
          style={[
            styles.utilityBtn,
            {
              backgroundColor: showTrafficOverlay
                ? isDark ? '#0D2E24' : '#ECFDF5'
                : colors.surface,
              borderColor: showTrafficOverlay ? '#10B981' : colors.borderSubtle,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle live traffic overlay"
        >
          <Ionicons
            name="speedometer-outline"
            size={18}
            color={showTrafficOverlay ? '#059669' : colors.textSecondary}
          />
          <View
            style={[
              styles.trafficStatusDot,
              { backgroundColor: showTrafficOverlay ? '#10B981' : '#94A3B8' },
            ]}
          />
        </AnimatedPressableButton>

        {/* Dynamic Compass / North Snap */}
        <AnimatedPressableButton
          pressScale={0.88}
          onPress={snapCompassToNorth}
          style={[
            styles.utilityBtn,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Snap map to north"
        >
          <Animated.View style={compassIconAnimatedStyle}>
            <Ionicons name="compass-outline" size={19} color="#EF4444" />
          </Animated.View>
        </AnimatedPressableButton>

        {/* GPS Centering */}
        <AnimatedPressableButton
          pressScale={0.88}
          onPress={handleCenterLocation}
          style={[
            styles.utilityBtn,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Center on my location"
        >
          <Ionicons name="locate" size={18} color="#4E6EF2" />
        </AnimatedPressableButton>

        {/* Minimalist Pure Map Mode Toggle */}
        <AnimatedPressableButton
          pressScale={0.88}
          onPress={toggleMinimalMode}
          style={[
            styles.utilityBtn,
            {
              backgroundColor: isMinimalMode ? '#4E6EF2' : colors.surface,
              borderColor: isMinimalMode ? '#4E6EF2' : colors.borderSubtle,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle pure minimalist mode"
        >
          <Ionicons
            name={isMinimalMode ? 'contract' : 'expand'}
            size={17}
            color={isMinimalMode ? '#FFFFFF' : colors.textSecondary}
          />
        </AnimatedPressableButton>
      </View>

      {/* === Bottom Floating Place Peek Card === */}
      {highlightedPlace && sheetIndex === 0 && !isMinimalMode && (
        <Animated.View
          style={[
            styles.bottomPeekCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
            peekCardAnimatedStyle,
          ]}
        >
          {/* Category badge + Rating + Close */}
          <View style={styles.peekHeaderRow}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: getCategoryBgColor(highlightedPlace.category) },
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: getCategoryColor(highlightedPlace.category) },
                ]}
              >
                {getCategoryLabel(highlightedPlace.category)}
              </Text>
            </View>

            <View style={styles.ratingCluster}>
              {highlightedPlace.rating !== undefined && (
                <>
                  <Ionicons name="star" size={12} color="#FFB300" />
                  <Text style={[styles.ratingNumber, { color: colors.text }]}>
                    {highlightedPlace.rating.toFixed(1)}
                  </Text>
                </>
              )}
              <Text style={[styles.distSnippet, { color: colors.textSecondary }]}>
                {highlightedPlace.rating !== undefined && '• '}{highlightedPlace.distanceKm} km
              </Text>

              <TouchableOpacity
                onPress={() => setHighlightedPlace(null)}
                style={styles.peekCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close place card"
              >
                <Ionicons name="close" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Place Title & Address */}
          <View style={styles.titleClickArea}>
            <Text
              style={[
                styles.peekTitle,
                BMapTypography.titleMedium,
                { color: colors.text, fontSize: moderateScale(isSmallDevice ? 15 : 16) },
              ]}
              numberOfLines={1}
            >
              {highlightedPlace.title}
            </Text>
            <Text
              style={[
                styles.peekAddress,
                { color: colors.textSecondary, fontSize: moderateScale(isSmallDevice ? 11 : 12) },
              ]}
              numberOfLines={1}
            >
              {highlightedPlace.address}
            </Text>
          </View>

          {/* Action Buttons: 1-Tap Directions & Details Modal */}
          <View style={styles.peekActionsRow}>
            <AnimatedPressableButton
              pressScale={0.94}
              onPress={() => handleNavigateToPlace(highlightedPlace)}
              style={styles.directionsBtn}
              accessibilityRole="button"
              accessibilityLabel="Get directions"
            >
              <Ionicons name="navigate" size={15} color="#FFFFFF" />
              <Text style={styles.directionsBtnText}>{t('directions')}</Text>
            </AnimatedPressableButton>

            <AnimatedPressableButton
              pressScale={0.94}
              onPress={() => setDetailModalPlace(highlightedPlace)}
              style={[
                styles.detailsBtn,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.borderSubtle },
              ]}
              accessibilityRole="button"
              accessibilityLabel="View full details"
            >
              <Ionicons name="information-circle-outline" size={15} color={colors.text} />
              <Text style={[styles.detailsBtnText, { color: colors.text }]}>{t('details')}</Text>
            </AnimatedPressableButton>
          </View>
        </Animated.View>
      )}

      {/* === Draggable Bottom Sheet (Baidu Smart Commute & Explore) === */}
      {!isMinimalMode && (
        <DraggableBottomSheet
          snapPoints={[isSmallDevice ? '13%' : '14%', '52%', '88%']}
          initialIndex={0}
          scrollable
          onStateChange={setSheetIndex}
        >
          {/* 1. Baidu Signature Smart Commute Card */}
          <SmartCommuteCard
            onStartRoute={handleCommuteStart}
            currentLanguage={currentLanguage}
          />

          {/* 2. Explore Section Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, BMapTypography.titleLarge, { color: colors.text }]}>
              {t('explore_nearby')}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              {isLoadingPlaces ? 'Loading nearby places...' : `${filteredPOIs.length} ${t('recommendations')}`}
            </Text>
          </View>

          {/* 3. Curated Nearby Places */}
          {filteredPOIs.map((poi, index) => (
            <FadeInView key={poi.id} delay={index * 45} from="up" slideDistance={8}>
              <AnimatedPressableButton
                pressScale={0.98}
                onPress={() => setHighlightedPlace(poi)}
                style={[
                  styles.poiCard,
                  { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                ]}
              >
                {/* Category Icon */}
                <View
                  style={[
                    styles.poiIcon,
                    { backgroundColor: getCategoryBgColor(poi.category) },
                  ]}
                >
                  <Ionicons
                    name={
                      poi.category === 'ev'
                        ? 'flash'
                        : poi.category === 'toll'
                        ? 'card-outline'
                        : poi.category === 'fuel'
                        ? 'flame'
                        : poi.category === 'taxi'
                        ? 'car'
                        : poi.category === 'sos'
                        ? 'medical'
                        : 'location'
                    }
                    size={17}
                    color={getCategoryColor(poi.category)}
                  />
                </View>

                {/* POI Info */}
                <View style={styles.poiInfo}>
                  <Text style={[styles.poiTitle, { color: colors.text }]} numberOfLines={1}>
                    {poi.title}
                  </Text>
                  <Text style={[styles.poiAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {poi.address}
                  </Text>
                </View>

                {/* POI Meta & Quick Go */}
                <View style={styles.poiMeta}>
                  {poi.rating !== undefined && (
                    <View style={styles.poiRating}>
                      <Ionicons name="star" size={10} color="#FFB300" />
                      <Text style={[styles.poiRatingText, { color: colors.text }]}>
                        {poi.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.poiDistance, { color: colors.textMuted }]}>
                    {poi.distanceKm} km
                  </Text>
                </View>
              </AnimatedPressableButton>
            </FadeInView>
          ))}

          {/* Tab bar clearance spacer */}
          <View style={{ height: 120 }} />
        </DraggableBottomSheet>
      )}

      {/* === Place Details Modal Sheet === */}
      <PlaceDetailsSheet
        place={detailModalPlace}
        onClose={() => setDetailModalPlace(null)}
        onNavigatePress={handleNavigateToPlace}
      />

      {/* === 12-Language Voice Input & Assistant Modal === */}
      <VoiceSearchModal
        visible={isVoiceModalVisible}
        onClose={() => setIsVoiceModalVisible(false)}
        onSelectQuery={handleSelectVoiceQuery}
        currentLanguage={currentLanguage}
        onLanguageChange={setLanguage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  minimalBannerContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  minimalBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    ...BMapElevation.level2,
  },
  minimalBannerText: {
    fontSize: moderateScale(11.5),
    fontWeight: '700',
  },
  topOverlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topOverlayContent: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    gap: 8,
  },
  serviceGridWrapper: {
    paddingTop: 2,
  },

  // Right-rail Utility Dock
  utilityDockContainer: {
    position: 'absolute',
    right: isSmallDevice ? 12 : 16,
    zIndex: 25,
    gap: 8,
    alignItems: 'center',
  },
  utilityBtn: {
    width: isSmallDevice ? 42 : 46,
    height: isSmallDevice ? 42 : 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    ...BMapElevation.level2,
  },
  utilityLabel: {
    fontSize: 7,
    fontWeight: '800',
    marginTop: -1,
  },
  trafficStatusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Bottom Peek Card
  bottomPeekCard: {
    position: 'absolute',
    bottom: isSmallDevice ? 82 : 92,
    left: isSmallDevice ? 12 : 16,
    right: isSmallDevice ? 12 : 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: isSmallDevice ? 14 : 16,
    gap: 8,
    zIndex: 28,
    ...BMapElevation.level3,
  },
  peekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ratingCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  distSnippet: {
    fontSize: 11,
  },
  peekCloseBtn: {
    padding: 2,
    marginLeft: 6,
  },
  titleClickArea: {
    gap: 2,
  },
  peekTitle: {
    fontWeight: '700',
  },
  peekAddress: {
    lineHeight: 16,
  },
  peekActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  directionsBtn: {
    flex: 1.2,
    backgroundColor: '#4E6EF2', // Baidu Brand Blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: isSmallDevice ? 9 : 11,
    borderRadius: 14,
    ...BMapElevation.level1,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: isSmallDevice ? 9 : 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontWeight: '600',
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
  },

  // Bottom Sheet Interior
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sheetTitle: {
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 11 : 13,
    borderRadius: 16,
    borderWidth: 1,
    gap: isSmallDevice ? 10 : 12,
    marginBottom: 8,
  },
  poiIcon: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 18 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiInfo: {
    flex: 1,
    gap: 2,
  },
  poiTitle: {
    fontSize: moderateScale(isSmallDevice ? 12.5 : 13.5),
    fontWeight: '700',
  },
  poiAddress: {
    fontSize: moderateScale(isSmallDevice ? 10.5 : 11.5),
    lineHeight: 15,
  },
  poiMeta: {
    alignItems: 'flex-end',
    gap: 3,
  },
  poiRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  poiRatingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  poiDistance: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
