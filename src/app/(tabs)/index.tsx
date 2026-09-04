import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { PlaceDetailsSheet } from '@/components/PlaceDetailsSheet';
import { PlacePOI } from '@/types';
import { getLatestTelemetry } from '@/services/telemetry';
import { moderateScale, isSmallDevice } from '@/utils/responsive';

type MapLayerType = 'daylight' | 'dark' | 'satellite' | 'terrain';

const QUICK_FILTER_CHIPS = [
  { id: 'all', label: 'All Places', icon: 'layers-outline' },
  { id: 'ev', label: 'EV Stations', icon: 'flash-outline', color: BMapColors.evCyan },
  { id: 'toll', label: 'FASTag Tolls', icon: 'card-outline', color: BMapColors.fastagPurple },
  { id: 'hazard', label: 'Road Hazards', icon: 'warning-outline', color: BMapColors.warningAmber },
  { id: 'sos', label: '112 SOS', icon: 'medical-outline', color: BMapColors.emergencyRed },
];

const INITIAL_POIS: PlacePOI[] = [
  {
    id: 'poi-1',
    title: 'India Gate & War Memorial',
    category: 'poi',
    rating: 4.8,
    reviewCount: 4230,
    address: 'Rajpath, India Gate, New Delhi, Delhi 110001',
    digipin: 'DL-982-KP34',
    coordinates: { latitude: 28.6129, longitude: 77.2295 },
    distanceKm: 2.1,
    details: { timings: 'Open 24 Hours • Free Entry' },
  },
  {
    id: 'poi-2',
    title: 'Tata Power EV Fast Station - Connaught Place',
    category: 'ev',
    rating: 4.6,
    reviewCount: 382,
    address: 'Inner Circle, Block C, Connaught Place, New Delhi',
    digipin: 'DL-431-EZ88',
    coordinates: { latitude: 28.6328, longitude: 77.2197 },
    distanceKm: 1.4,
    details: { connectors: ['CCS2 (60kW)', 'Type-2 AC (22kW)'], pricing: '₹18.5/kWh' },
  },
  {
    id: 'poi-3',
    title: 'Kherki Daula FASTag Plaza',
    category: 'toll',
    rating: 4.1,
    reviewCount: 1540,
    address: 'Delhi-Gurugram Expressway (NH-48), Gurugram',
    digipin: 'HR-772-TG10',
    coordinates: { latitude: 28.4061, longitude: 76.9934 },
    distanceKm: 18.5,
    details: { fastagLane: true, pricing: '₹85 Car • 100% ETC' },
  },
  {
    id: 'poi-4',
    title: 'Waterlogging & Pothole Alert',
    category: 'hazard',
    rating: 3.2,
    reviewCount: 45,
    address: 'Near AIIMS Flyover Underpass, Ring Road, New Delhi',
    digipin: 'DL-118-HZ90',
    coordinates: { latitude: 28.5672, longitude: 77.2100 },
    distanceKm: 3.6,
    details: { timings: 'Reported 15 mins ago by 8 drivers' },
  },
  {
    id: 'poi-5',
    title: 'Safdarjung Emergency Trauma Centre',
    category: 'sos',
    rating: 4.7,
    reviewCount: 890,
    address: 'Ansari Nagar East, Ring Road, New Delhi 110029',
    digipin: 'DL-882-EM12',
    coordinates: { latitude: 28.5701, longitude: 77.2065 },
    distanceKm: 3.2,
    details: { phone: '011-26165060', timings: '24x7 Level-1 Trauma' },
  },
];

export default function ExploreMapScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [activeFilter, setActiveFilter] = useState('all');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('daylight');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPlace, setHighlightedPlace] = useState<PlacePOI | null>(INITIAL_POIS[0]);
  const [selectedPlace, setSelectedPlace] = useState<PlacePOI | null>(null);

  // Filter markers based on selected chip - only show relevant markers on the map
  const filteredPOIs = useMemo(() => {
    if (activeFilter === 'all') return INITIAL_POIS;
    return INITIAL_POIS.filter(p => p.category === activeFilter);
  }, [activeFilter]);

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
    if (marker.data) {
      setHighlightedPlace(marker.data as PlacePOI);
    }
  }, []);

  const handleFilterSelect = useCallback(
    (chipId: string) => {
      setActiveFilter(chipId);
      const matches = chipId === 'all' ? INITIAL_POIS : INITIAL_POIS.filter(p => p.category === chipId);
      if (matches.length > 0) {
        setHighlightedPlace(matches[0]);
      }
    },
    []
  );

  const cycleLayer = useCallback(() => {
    const layers: MapLayerType[] = ['daylight', 'satellite', 'terrain', 'dark'];
    setMapLayer(prev => {
      const nextIdx = (layers.indexOf(prev) + 1) % layers.length;
      return layers[nextIdx];
    });
  }, []);

  const handleCenterLocation = useCallback(() => {
    const loc = getLatestTelemetry();
    const userPOI: PlacePOI = {
      id: 'user-current-poi',
      title: 'Your Live Location',
      category: 'poi',
      rating: 5.0,
      reviewCount: 1,
      address: loc.addressString || 'Connaught Place, New Delhi',
      digipin: 'DL-982-KP34',
      coordinates: { latitude: loc.latitude, longitude: loc.longitude },
      distanceKm: 0,
    };
    setHighlightedPlace(userPOI);
  }, []);

  const handleVoiceCommand = useCallback(() => {
    setSearchQuery('Connaught Place EV Hub');
  }, []);

  const handleNavigateToPlace = useCallback(
    (place: PlacePOI) => {
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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'ev':
        return BMapColors.evCyan;
      case 'toll':
        return BMapColors.fastagPurple;
      case 'hazard':
        return BMapColors.warningAmber;
      case 'sos':
        return BMapColors.emergencyRed;
      default:
        return BMapColors.primary;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'ev':
        return 'EV FAST CHARGING';
      case 'toll':
        return 'FASTAG TOLL PLAZA';
      case 'hazard':
        return 'ROAD HAZARD';
      case 'sos':
        return '112 EMERGENCY TRAUMA';
      default:
        return 'LANDMARK DESTINATION';
    }
  };

  return (
    <View style={styles.container}>
      {/* High-Performance Vector Map Canvas */}
      <BMapView
        mapStyleType={mapLayer}
        markers={mapMarkers}
        onMarkerPress={handleMarkerPress}
        onMapPress={() => {
          // Keep highlighted place or toggle
        }}
      />

      {/* Top Floating Overlay Container */}
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        {/* Search Hero Bar */}
        <View
          style={[
            styles.searchHeroBar,
            {
              backgroundColor: isDark ? 'rgba(18, 27, 36, 0.96)' : 'rgba(255, 255, 255, 0.97)',
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/features' as any)}
            style={styles.leadingDrawerIcon}
          >
            <Ionicons name="menu" size={isSmallDevice ? 20 : 22} color={colors.text} />
          </TouchableOpacity>

          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={
              isSmallDevice ? 'Search place, DIGIPIN, EV...' : 'Search place, DIGIPIN, toll, EV...'
            }
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                router.push({
                  pathname: '/navigate/route-planner' as any,
                  params: { destTitle: searchQuery },
                });
              }
            }}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.actionIcon}>
              <Ionicons
                name="close-circle"
                size={isSmallDevice ? 18 : 20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleVoiceCommand} style={styles.actionIcon}>
              <Ionicons name="mic" size={isSmallDevice ? 20 : 22} color={BMapColors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Filter Pills */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {QUICK_FILTER_CHIPS.map(chip => {
            const isSelected = activeFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.8}
                onPress={() => handleFilterSelect(chip.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? BMapColors.primary
                      : isDark
                      ? '#16222F'
                      : '#FFFFFF',
                    borderColor: isSelected ? BMapColors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={chip.icon as any}
                  size={15}
                  color={isSelected ? '#FFFFFF' : chip.color || colors.text}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Controls (Right side above bottom peek card) */}
      <View
        style={[
          styles.fabContainer,
          { bottom: highlightedPlace ? (isSmallDevice ? 160 : 175) : (isSmallDevice ? 24 : 32) },
        ]}
        pointerEvents="box-none"
      >
        {/* Layer Switcher FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={cycleLayer}
          style={[styles.fabButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="layers" size={20} color={BMapColors.primary} />
          <Text style={[styles.fabLabel, { color: colors.text }]}>{mapLayer.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* Route Planner Quick FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/navigate/route-planner' as any)}
          style={[styles.fabButton, { backgroundColor: BMapColors.primary }]}
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center Location FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCenterLocation}
          style={[styles.fabButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="locate" size={20} color={BMapColors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Bottom Floating Place Peek Card - On-demand spatial intelligence */}
      {highlightedPlace && (
        <View
          style={[
            styles.bottomPeekCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Category Badge & Dismiss */}
          <View style={styles.peekHeaderRow}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: `${getCategoryColor(highlightedPlace.category)}18` },
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
              <Ionicons name="star" size={13} color="#FFB300" />
              <Text style={[styles.ratingNumber, { color: colors.text }]}>
                {highlightedPlace.rating.toFixed(1)}
              </Text>
              <Text style={[styles.distSnippet, { color: colors.textSecondary }]}>
                • {highlightedPlace.distanceKm} km
              </Text>

              <TouchableOpacity
                onPress={() => setHighlightedPlace(null)}
                style={styles.peekCloseBtn}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Place Title & Address Snippet */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedPlace(highlightedPlace)}
            style={styles.titleClickArea}
          >
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
          </TouchableOpacity>

          {/* Bottom Quick Action Buttons */}
          <View style={styles.peekActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNavigateToPlace(highlightedPlace)}
              style={[styles.directionsBtn, { backgroundColor: BMapColors.primary }]}
            >
              <Ionicons name="navigate" size={15} color="#FFFFFF" />
              <Text style={styles.directionsBtnText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlace(highlightedPlace)}
              style={[
                styles.detailsBtn,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
            >
              <Ionicons name="information-circle-outline" size={15} color={colors.text} />
              <Text style={[styles.detailsBtnText, { color: colors.text }]}>Full Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lightweight Native Spatial Place Details Modal */}
      {selectedPlace && (
        <PlaceDetailsSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onNavigatePress={handleNavigateToPlace}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    gap: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 10 : 14,
  },
  searchHeroBar: {
    height: isSmallDevice ? 44 : 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    ...BMapElevation.level2,
  },
  leadingDrawerIcon: {
    padding: 4,
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
    height: '100%',
  },
  actionIcon: {
    padding: 4,
  },
  chipsScrollContent: {
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: isSmallDevice ? 9 : 12,
    paddingVertical: isSmallDevice ? 6 : 7,
    borderRadius: 18,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  filterChipText: {
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
  },
  fabContainer: {
    position: 'absolute',
    right: isSmallDevice ? 10 : 14,
    zIndex: 20,
    gap: 10,
    alignItems: 'center',
  },
  fabButton: {
    width: isSmallDevice ? 42 : 46,
    height: isSmallDevice ? 42 : 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  fabLabel: {
    fontSize: 7,
    fontWeight: '800',
    marginTop: -2,
  },
  bottomPeekCard: {
    position: 'absolute',
    bottom: isSmallDevice ? 12 : 16,
    left: isSmallDevice ? 10 : 14,
    right: isSmallDevice ? 10 : 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: isSmallDevice ? 12 : 14,
    gap: 8,
    zIndex: 25,
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
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 10,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontWeight: '600',
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
  },
});
