import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Zap,
  Fuel,
  TrainFront,
  SquareParking,
  Utensils,
  Pill,
  Star,
  Clock,
  Filter,
  Navigation,
  Plug,
  CircleDot,
  Bus,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Chip,
  Card,
  SectionHeader,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

type NearbyCategory = 'ev' | 'fuel' | 'transit' | 'parking' | 'food' | 'pharmacy';

interface CategoryItem {
  key: NearbyCategory;
  label: string;
  icon: typeof Zap;
  color: string;
  count: string;
}

const CATEGORIES: CategoryItem[] = [
  { key: 'ev', label: 'EV Charge', icon: Zap, color: '#0096FF', count: '42' },
  { key: 'fuel', label: 'Fuel', icon: Fuel, color: '#FF9800', count: '28' },
  { key: 'transit', label: 'Transit', icon: TrainFront, color: '#9C27B0', count: '12' },
  { key: 'parking', label: 'Parking', icon: SquareParking, color: '#00C06D', count: '18' },
  { key: 'food', label: 'Dining', icon: Utensils, color: '#F44336', count: '65' },
  { key: 'pharmacy', label: 'Pharmacy', icon: Pill, color: '#E91E63', count: '9' },
];

const EV_STATIONS = [
  {
    id: 'ev_1',
    name: 'Tata Power EZ Charge Hub',
    network: 'Tata Power',
    distance: '1.2 km',
    rating: '4.8',
    connectors: ['CCS2 150kW', 'Type 2 22kW'],
    available: 4,
    total: 6,
    price: '₹16/kWh',
    status: 'Open 24/7',
  },
  {
    id: 'ev_2',
    name: 'Statiq Fast Charging',
    network: 'Statiq',
    distance: '2.4 km',
    rating: '4.6',
    connectors: ['CCS2 60kW', 'GB/T 30kW', 'Bharat AC-001'],
    available: 2,
    total: 4,
    price: '₹14/kWh',
    status: 'Open 06:00-23:00',
  },
  {
    id: 'ev_3',
    name: 'Jio-bp pulse Station',
    network: 'Jio-bp',
    distance: '3.8 km',
    rating: '4.7',
    connectors: ['CCS2 120kW', 'Type 2 7.4kW'],
    available: 1,
    total: 3,
    price: '₹18/kWh',
    status: 'Open 24/7',
  },
];

const TRANSIT_ROUTES = [
  {
    id: 'tr_1',
    type: 'Metro',
    line: 'Yellow Line',
    color: '#FFEB3B',
    from: 'HUDA City Centre',
    to: 'Rajiv Chowk',
    duration: '38 min',
    fare: '₹42',
    frequency: 'Every 4 min',
    network: 'DMRC',
  },
  {
    id: 'tr_2',
    type: 'Metro',
    line: 'Rapid Metro',
    color: '#FF9800',
    from: 'Cyber Hub',
    to: 'Sector 55-56',
    duration: '12 min',
    fare: '₹28',
    frequency: 'Every 6 min',
    network: 'GMRC',
  },
  {
    id: 'tr_3',
    type: 'Bus',
    line: 'Route 412A',
    color: '#4CAF50',
    from: 'IFFCO Chowk',
    to: 'Kashmere Gate ISBT',
    duration: '1h 10m',
    fare: '₹35',
    frequency: 'Every 15 min',
    network: 'DTC',
  },
];

const FUEL_STATIONS = [
  {
    id: 'fuel_1',
    name: 'Indian Oil (IOCL) — NH-48',
    distance: '0.8 km',
    petrol: '₹104.21/L',
    diesel: '₹90.76/L',
    brand: 'IOCL',
    amenities: ['Air', 'Water', 'Restroom'],
  },
  {
    id: 'fuel_2',
    name: 'Bharat Petroleum — Sec 29',
    distance: '1.5 km',
    petrol: '₹104.56/L',
    diesel: '₹91.02/L',
    brand: 'BPCL',
    amenities: ['Air', 'Restroom', 'ATM'],
  },
  {
    id: 'fuel_3',
    name: 'HP Station — MG Road',
    distance: '2.1 km',
    petrol: '₹103.97/L',
    diesel: '₹90.88/L',
    brand: 'HPCL',
    amenities: ['Air', 'Water', 'CNG'],
  },
];

const AUTO_FARE = {
  baseFare: '₹25',
  perKm: '₹11/km',
  nightSurcharge: '+50%',
  waitingCharge: '₹2/3min',
  estimatedFare: '₹82–₹105',
  distance: '5.2 km',
  authority: 'Delhi Transport Authority',
};

const DINING_PLACES = [
  {
    id: 'dining_1',
    name: 'Mannat Haveli Pure Veg Dhaba',
    cuisine: 'North Indian · Thali · Lassi',
    distance: '1.4 km',
    rating: '4.8',
    hygiene: 'FSSAI 5★',
    status: 'Open 24/7',
    tags: ['Clean Restrooms', 'Family Dining', 'EV Charger'],
    digiPin: '28J4-M1K9-7P',
  },
  {
    id: 'dining_2',
    name: "Haldiram's Highway Hub",
    cuisine: 'Sweets · Chaat · South Indian',
    distance: '2.8 km',
    rating: '4.6',
    hygiene: 'FSSAI 5★',
    status: 'Open 07:00–23:30',
    tags: ['Pure Veg', 'Fast Delivery', 'AC Hall'],
    digiPin: '28J4-H2K3-4P',
  },
  {
    id: 'dining_3',
    name: 'Amrik Sukhdev Landmark Dhaba',
    cuisine: 'Iconic Tandoori Parathas · White Butter',
    distance: '18.4 km',
    rating: '4.9',
    hygiene: 'FSSAI 5★',
    status: 'Open 24/7',
    tags: ['Highway Icon', 'Ample Parking', 'Clean Toilets'],
    digiPin: '28J4-S5T6-7U',
  },
];

const PHARMACY_PLACES = [
  {
    id: 'pharmacy_1',
    name: 'Apollo Pharmacy 24/7 Healthcare',
    type: '24/7 Chemist & Diagnostic',
    distance: '0.6 km',
    phone: '1860-500-0101',
    rating: '4.7',
    status: 'Open Now (24/7)',
    amenities: ['Prescription Medicines', 'First Aid', 'Doctor Consult'],
    digiPin: '28J4-A9B1-2C',
  },
  {
    id: 'pharmacy_2',
    name: 'Fortis Hospital Emergency Pharmacy',
    type: 'Trauma & Emergency Dispensary',
    distance: '2.4 km',
    phone: '0124-4921021',
    rating: '4.8',
    status: 'Emergency Open 24/7',
    amenities: ['ICU Support', 'Blood Bank Linked', 'Oxygen Available'],
    digiPin: '28J4-F3G4-5H',
  },
  {
    id: 'pharmacy_3',
    name: 'MedPlus 24x7 Chemist Hub',
    type: 'Generic & Branded Pharmacy',
    distance: '1.8 km',
    phone: '040-67006700',
    rating: '4.5',
    status: 'Open 06:00–00:00',
    amenities: ['Generic Medicines', 'Wheelchair Access'],
    digiPin: '28J4-M7N8-9P',
  },
];

export default function NearbyScreen() {
  const colors = useThemeColors();
  const [activeCategory, setActiveCategory] = useState<NearbyCategory>('ev');

  const handleCategorySelect = useCallback((key: NearbyCategory) => {
    haptics.selection();
    setActiveCategory(key);
  }, []);

  const renderCategoryChip: ListRenderItem<CategoryItem> = useCallback(
    ({ item }) => {
      const IconComp = item.icon;
      const isSelected = activeCategory === item.key;
      return (
        <Chip
          label={`${item.label} (${item.count})`}
          icon={<IconComp size={14} color={isSelected ? colors.onPrimaryContainer : item.color} />}
          selected={isSelected}
          onPress={() => handleCategorySelect(item.key)}
          style={styles.categoryChip}
        />
      );
    },
    [activeCategory, colors, handleCategorySelect]
  );

  const categoryKeyExtractor = useCallback((item: CategoryItem) => item.key, []);

  const renderEVContent = useCallback(() => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="EV Charging Stations"
        subtitle="Live OCPP 2.0.1 Connector Availability"
        actionText="Filter"
        actionIcon={<Filter size={14} color={colors.primary} />}
        onActionPress={() => {
          haptics.light();
          Alert.alert('Filter EV Stations', 'Filter by CCS2, Type 2, fast charging speed (>50kW), or 24/7 access.');
        }}
      />
      {EV_STATIONS.map((station, idx) => (
        <Animated.View
          key={station.id}
          entering={FadeInDown.delay(idx * 50).duration(260).springify().damping(18)}>
          <Card
            variant="flat"
            padding="md"
            style={styles.card}
            onPress={() => {
              haptics.light();
              router.push('/ev-station');
            }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{station.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  {station.network} · {station.distance}
                </Text>
              </View>
              <View
                style={[
                  styles.availBadge,
                  {
                    backgroundColor:
                      station.available > 2
                        ? colors.secondaryContainer
                        : colors.tertiaryContainer,
                  },
                ]}>
                <CircleDot
                  size={10}
                  color={
                    station.available > 2 ? colors.secondary : colors.tertiary
                  }
                />
                <Text
                  style={[
                    styles.availBadgeText,
                    {
                      color:
                        station.available > 2
                          ? colors.onSecondaryContainer
                          : colors.onTertiaryContainer,
                    },
                  ]}>
                  {station.available}/{station.total} free
                </Text>
              </View>
            </View>

            <View style={styles.connectorsRow}>
              {station.connectors.map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.connectorChip,
                    {
                      backgroundColor: colors.surfaceContainerLow,
                      borderColor: colors.surfaceContainerHigh,
                    },
                  ]}>
                  <Plug size={10} color={colors.primary} />
                  <Text style={[styles.connectorText, { color: colors.onSurface }]}>{c}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
              <View style={styles.footerLeft}>
                <Text style={[styles.priceHighlight, { color: colors.primary }]}>{station.price}</Text>
                <Text style={[styles.statusText, { color: colors.onSurfaceVariant }]}>{station.status}</Text>
              </View>
              <View style={[styles.ratingPill, { backgroundColor: colors.surfaceContainerLow }]}>
                <Star size={12} color="#FF9800" fill="#FF9800" />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>{station.rating}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  ), [colors]);

  const renderTransitContent = useCallback(() => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Public Transit"
        subtitle="Metro & DTC Bus Real-Time Telematics"
      />
      {TRANSIT_ROUTES.map((route, idx) => (
        <Animated.View
          key={route.id}
          entering={FadeInDown.delay(idx * 50).duration(260).springify().damping(18)}>
          <Card
            variant="flat"
            padding="md"
            style={styles.card}
            onPress={() => {
              haptics.light();
              router.push('/transit-planner');
            }}>
            <View style={styles.cardHeader}>
              <View style={[styles.transitLineBadge, { backgroundColor: route.color }]}>
                {route.type === 'Metro' ? (
                  <TrainFront size={12} color="#111" />
                ) : (
                  <Bus size={12} color="#fff" />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{route.line}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  {route.network}
                </Text>
              </View>
              <Text style={[styles.priceHighlight, { color: colors.primary }]}>{route.fare}</Text>
            </View>

            <View style={[styles.transitRouteRow, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.transitStopDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.transitFrom, { color: colors.onSurface }]}>{route.from}</Text>
              <View style={[styles.transitArrowLine, { backgroundColor: colors.outlineVariant }]} />
              <Text style={[styles.transitTo, { color: colors.onSurface }]}>{route.to}</Text>
              <View style={[styles.transitStopDot, { backgroundColor: colors.error }]} />
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
              <View style={styles.metaRow}>
                <Clock size={12} color={colors.onSurfaceVariant} />
                <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                  {route.duration}
                </Text>
              </View>
              <Text style={[styles.frequencyText, { color: colors.secondary }]}>
                {route.frequency}
              </Text>
            </View>
          </Card>
        </Animated.View>
      ))}

      {/* Auto-Rickshaw Fare Card */}
      <Animated.View entering={FadeInDown.delay(180).duration(260).springify().damping(18)}>
        <Card variant="flat" padding="md" style={styles.fareCard}>
          <Text style={[styles.cardTitle, { color: colors.onSurface, marginBottom: 8 }]}>
            Official Auto-Rickshaw Fare Estimate
          </Text>
          <View style={styles.fareGrid}>
            <View style={[styles.fareItem, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Base Fare</Text>
              <Text style={[styles.fareValue, { color: colors.onSurface }]}>{AUTO_FARE.baseFare}</Text>
            </View>
            <View style={[styles.fareItem, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Per Km Rate</Text>
              <Text style={[styles.fareValue, { color: colors.onSurface }]}>{AUTO_FARE.perKm}</Text>
            </View>
            <View style={[styles.fareItem, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Night (+50%)</Text>
              <Text style={[styles.fareValue, { color: colors.onSurface }]}>
                {AUTO_FARE.nightSurcharge}
              </Text>
            </View>
            <View style={[styles.fareItem, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.fareLabel, { color: colors.onSurfaceVariant }]}>Waiting</Text>
              <Text style={[styles.fareValue, { color: colors.onSurface }]}>
                {AUTO_FARE.waitingCharge}
              </Text>
            </View>
          </View>

          <View style={[styles.fareEstimateRow, { backgroundColor: colors.primaryFixed }]}>
            <View>
              <Text style={[styles.fareEstLabel, { color: colors.onPrimaryFixedVariant }]}>
                Estimated for {AUTO_FARE.distance}
              </Text>
              <Text style={[styles.fareAuthority, { color: colors.onPrimaryFixedVariant }]}>
                {AUTO_FARE.authority}
              </Text>
            </View>
            <Text style={[styles.fareEstValue, { color: colors.onPrimaryFixedVariant }]}>
              {AUTO_FARE.estimatedFare}
            </Text>
          </View>
        </Card>
      </Animated.View>
    </View>
  ), [colors]);

  const renderFuelContent = useCallback(() => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Fuel Stations"
        subtitle="IOCL · BPCL · HPCL Real-Time Prices"
      />
      {FUEL_STATIONS.map((st, idx) => (
        <Animated.View
          key={st.id}
          entering={FadeInDown.delay(idx * 50).duration(260).springify().damping(18)}>
          <Card variant="flat" padding="md" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{st.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  {st.distance} away · {st.brand}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.navMiniBtn, { backgroundColor: colors.primaryContainer }]}
                onPress={() => {
                  haptics.light();
                  Alert.alert('Navigate', `Routing to ${st.name}`);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Route to ${st.name}`}>
                <Navigation size={14} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.fuelPricesRow}>
              <View style={[styles.fuelPriceItem, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.fuelType, { color: colors.onSurfaceVariant }]}>Petrol</Text>
                <Text style={[styles.fuelPrice, { color: colors.onSurface }]}>{st.petrol}</Text>
              </View>
              <View style={[styles.fuelPriceItem, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.fuelType, { color: colors.onSurfaceVariant }]}>Diesel</Text>
                <Text style={[styles.fuelPrice, { color: colors.onSurface }]}>{st.diesel}</Text>
              </View>
            </View>

            <View style={styles.amenitiesRow}>
              {st.amenities.map((a, i) => (
                <View key={i} style={[styles.amenityChip, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.amenityText, { color: colors.onSurfaceVariant }]}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  ), [colors]);

  const renderDiningContent = useCallback(() => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Highway Dining & Dhabas"
        subtitle="FSSAI Hygiene Rated · Clean Toilets"
      />
      {DINING_PLACES.map((place, idx) => (
        <Animated.View
          key={place.id}
          entering={FadeInDown.delay(idx * 50).duration(260).springify().damping(18)}>
          <Card variant="flat" padding="md" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{place.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  {place.cuisine}
                </Text>
              </View>
              <View style={[styles.ratingPill, { backgroundColor: colors.surfaceContainerLow }]}>
                <Star size={12} color="#FF9800" fill="#FF9800" />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>{place.rating}</Text>
              </View>
            </View>

            <View style={styles.amenitiesRow}>
              {place.tags.map((t, i) => (
                <View key={i} style={[styles.amenityChip, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.amenityText, { color: colors.onSurfaceVariant }]}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
              <Text style={[styles.statusText, { color: colors.secondary }]}>{place.hygiene}</Text>
              <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>{place.distance}</Text>
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  ), [colors]);

  const renderPharmacyContent = useCallback(() => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="24/7 Pharmacies & Healthcare"
        subtitle="Emergency Dispensaries · First Aid"
      />
      {PHARMACY_PLACES.map((ph, idx) => (
        <Animated.View
          key={ph.id}
          entering={FadeInDown.delay(idx * 50).duration(260).springify().damping(18)}>
          <Card variant="flat" padding="md" style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{ph.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  {ph.type} · {ph.distance}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.navMiniBtn, { backgroundColor: colors.secondaryContainer }]}
                onPress={() => {
                  haptics.medium();
                  Linking.openURL(`tel:${ph.phone}`);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Call ${ph.name}`}>
                <Phone size={14} color={colors.onSecondaryContainer} />
              </TouchableOpacity>
            </View>

            <View style={styles.amenitiesRow}>
              {ph.amenities.map((a, i) => (
                <View key={i} style={[styles.amenityChip, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.amenityText, { color: colors.onSurfaceVariant }]}>{a}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
              <View style={styles.metaRow}>
                <ShieldCheck size={12} color={colors.secondary} />
                <Text style={[styles.statusText, { color: colors.secondary }]}>{ph.status}</Text>
              </View>
              <View style={[styles.ratingPill, { backgroundColor: colors.surfaceContainerLow }]}>
                <Star size={12} color="#FF9800" fill="#FF9800" />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>{ph.rating}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      ))}
    </View>
  ), [colors]);

  const activeContent = useMemo(() => {
    switch (activeCategory) {
      case 'ev':
        return renderEVContent();
      case 'transit':
        return renderTransitContent();
      case 'fuel':
        return renderFuelContent();
      case 'food':
        return renderDiningContent();
      case 'pharmacy':
        return renderPharmacyContent();
      default:
        return renderEVContent();
    }
  }, [
    activeCategory,
    renderEVContent,
    renderTransitContent,
    renderFuelContent,
    renderDiningContent,
    renderPharmacyContent,
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Explore Nearby POIs"
        subtitle="EV Fast Chargers · Public Transit · Dhabas · Pharmacies"
        showBack={false}
      />

      {/* Category Selection Bar using Virtualized FlatList */}
      <Animated.View entering={FadeInDown.duration(280).springify().damping(18)} style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={renderCategoryChip}
          keyExtractor={categoryKeyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        />
      </Animated.View>

      {/* Dynamic Main Body Content */}
      <FlatList
        data={[1]}
        renderItem={() => activeContent}
        keyExtractor={() => 'active_body'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: Spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs + 2,
  },
  categoryChip: {
    marginRight: 4,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  sectionContainer: {
    gap: Spacing.md,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  availBadgeText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  connectorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  connectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  connectorText: {
    ...Typography.labelSmall,
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceHighlight: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  statusText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  ratingText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  transitLineBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 10,
    gap: 6,
  },
  transitStopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transitFrom: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  transitArrowLine: {
    flex: 1,
    height: 1.5,
  },
  transitTo: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.bodySmall,
  },
  frequencyText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  fareCard: {
    marginTop: Spacing.xs,
  },
  fareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  fareItem: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: Radius.md,
  },
  fareLabel: {
    ...Typography.labelSmall,
  },
  fareValue: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginTop: 2,
  },
  fareEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  fareEstLabel: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  fareAuthority: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  fareEstValue: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  navMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelPricesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  fuelPriceItem: {
    flex: 1,
    padding: 8,
    borderRadius: Radius.md,
  },
  fuelType: {
    ...Typography.labelSmall,
  },
  fuelPrice: {
    ...Typography.titleMedium,
    fontWeight: '800',
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  amenityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  amenityText: {
    ...Typography.labelSmall,
    fontSize: 11,
  },
});
