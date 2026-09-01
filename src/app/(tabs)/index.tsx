import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { PlaceDetailsSheet } from '@/components/PlaceDetailsSheet';
import { PlacePOI } from '@/types';
import { EV_STATIONS_DATA } from '@/services/evData';
import { NATIONAL_TOLL_PLAZAS } from '@/services/fastagData';
import { useTelemetry } from '@/services/telemetry';

type MapLayerType = 'daylight' | 'dark' | 'satellite' | 'terrain';

const QUICK_FILTER_CHIPS = [
  { id: 'all', label: 'All Layers', icon: 'layers-outline' },
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
  const telemetry = useTelemetry();

  const [activeFilter, setActiveFilter] = useState('all');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('daylight');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlacePOI | null>(null);

  // Filter markers based on selected chip
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

  const handleMarkerPress = (marker: BMapMarkerItem) => {
    if (marker.data) {
      setSelectedPlace(marker.data as PlacePOI);
    }
  };

  const cycleLayer = () => {
    const layers: MapLayerType[] = ['daylight', 'satellite', 'terrain', 'dark'];
    const nextIdx = (layers.indexOf(mapLayer) + 1) % layers.length;
    setMapLayer(layers[nextIdx]);
  };

  const handleCenterLocation = () => {
    // Open user's own location as a POI preview
    setSelectedPlace({
      id: 'user-current-poi',
      title: 'Your Live Location',
      category: 'poi',
      rating: 5.0,
      reviewCount: 1,
      address: telemetry.addressString || 'Connaught Place, New Delhi',
      digipin: 'DL-982-KP34',
      coordinates: { latitude: telemetry.latitude, longitude: telemetry.longitude },
      distanceKm: 0,
    });
  };

  const handleVoiceCommand = () => {
    // Navigate or prompt search
    setSearchQuery('Navigate to CyberCity EV Hub');
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Vector Map Component */}
      <BMapView
        mapStyleType={mapLayer}
        markers={mapMarkers}
        onMarkerPress={handleMarkerPress}
        onMapPress={() => setSelectedPlace(null)}
      />

      {/* Top Floating Overlay Container with SafeAreaView */}
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        {/* Search Hero Bar */}
        <View
          style={[
            styles.searchHeroBar,
            {
              backgroundColor: isDark ? 'rgba(18, 27, 36, 0.95)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/features' as any)}
            style={styles.leadingDrawerIcon}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>

          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search address, DIGIPIN, toll plaza, EV..."
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
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleVoiceCommand} style={styles.actionIcon}>
              <Ionicons name="mic" size={22} color={BMapColors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Chips */}
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
                onPress={() => {
                  setActiveFilter(chip.id);
                  if (chip.id === 'toll') router.push('/features/fastag' as any);
                  else if (chip.id === 'ev') router.push('/features/ev-charging' as any);
                  else if (chip.id === 'hazard') router.push('/features/report-hazard' as any);
                  else if (chip.id === 'sos') router.push('/features/sos' as any);
                }}
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
                  size={16}
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

      {/* Floating Action Controls (Bottom-Right) */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {/* Layer Switcher FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={cycleLayer}
          style={[styles.fabButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="layers" size={22} color={BMapColors.primary} />
          <Text style={[styles.fabLabel, { color: colors.text }]}>{mapLayer.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* Route Planner Quick FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/navigate/route-planner' as any)}
          style={[styles.fabButton, { backgroundColor: BMapColors.primary }]}
        >
          <Ionicons name="navigate" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center Location FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCenterLocation}
          style={[styles.fabButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="locate" size={22} color={BMapColors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Spatial Place Details Bottom Sheet */}
      {selectedPlace && (
        <PlaceDetailsSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
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
    gap: 10,
    paddingHorizontal: 16,
  },
  searchHeroBar: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    ...BMapElevation.level2,
  },
  leadingDrawerIcon: {
    padding: 6,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  actionIcon: {
    padding: 6,
  },
  chipsScrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  filterChipText: {
    fontSize: 13,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 20,
    gap: 12,
    alignItems: 'center',
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...BMapElevation.level3,
  },
  fabLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: -2,
  },
});
