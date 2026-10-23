import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  Radio,
  ChevronRight,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Chip,
  Card,
  SectionHeader,
} from '@/shared/components/ui';

type NearbyCategory = 'ev' | 'fuel' | 'transit' | 'parking' | 'food' | 'pharmacy';

const CATEGORIES: {
  key: NearbyCategory;
  label: string;
  icon: typeof Zap;
  color: string;
  count: string;
}[] = [
  { key: 'ev', label: 'EV Charge', icon: Zap, color: '#0096FF', count: '42' },
  { key: 'fuel', label: 'Fuel', icon: Fuel, color: '#FF9800', count: '28' },
  { key: 'transit', label: 'Transit', icon: TrainFront, color: '#9C27B0', count: '12' },
  { key: 'parking', label: 'Parking', icon: SquareParking, color: '#00C06D', count: '18' },
  { key: 'food', label: 'Dining', icon: Utensils, color: '#F44336', count: '65' },
  { key: 'pharmacy', label: 'Pharmacy', icon: Pill, color: '#E91E63', count: '9' },
];

const EV_STATIONS = [
  {
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
    name: 'Indian Oil (IOCL) — NH-48',
    distance: '0.8 km',
    petrol: '₹104.21/L',
    diesel: '₹90.76/L',
    brand: 'IOCL',
    amenities: ['Air', 'Water', 'Restroom'],
  },
  {
    name: 'Bharat Petroleum — Sec 29',
    distance: '1.5 km',
    petrol: '₹104.56/L',
    diesel: '₹91.02/L',
    brand: 'BPCL',
    amenities: ['Air', 'Restroom', 'ATM'],
  },
  {
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

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleCategoryChange = (key: NearbyCategory) => {
    triggerHaptic();
    setActiveCategory(key);
  };

  const renderEVCharging = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="EV Charging Stations"
        subtitle="Live OCPP 2.0.1 Connector Availability"
        actionText="Filter"
        actionIcon={<Filter size={14} color={colors.primary} />}
        onActionPress={() => {
          triggerHaptic();
          Alert.alert('Filter EV Stations', 'Filter by CCS2, Type 2, fast charging speed (>50kW), or 24/7 access.');
        }}
      />

      {EV_STATIONS.map((station, idx) => (
        <Card
          key={idx}
          variant="flat"
          padding="md"
          style={styles.card}
          onPress={() => {
            triggerHaptic();
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
      ))}
    </View>
  );

  const renderTransit = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Public Transit"
        subtitle="Metro & DTC Bus Real-Time Telematics"
      />

      {TRANSIT_ROUTES.map((route, idx) => (
        <Card
          key={idx}
          variant="flat"
          padding="md"
          style={styles.card}
          onPress={() => {
            triggerHaptic();
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
      ))}

      {/* Auto-Rickshaw Fare Card */}
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

        <View
          style={[
            styles.fareEstimateRow,
            {
              backgroundColor: colors.primaryFixed,
            },
          ]}>
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
    </View>
  );

  const renderFuel = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Fuel Stations"
        subtitle="IOCL · BPCL · HPCL Real-Time Prices"
      />

      {FUEL_STATIONS.map((st, idx) => (
        <Card
          key={idx}
          variant="flat"
          padding="md"
          style={styles.card}>
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
                triggerHaptic();
                Alert.alert('Navigate', `Routing to ${st.name}`);
              }}
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
              <View
                key={i}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={[styles.amenityText, { color: colors.onSurfaceVariant }]}>{a}</Text>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </View>
  );

  const renderParking = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Smart Parking"
        subtitle="BLE Beacon Trilateration & Live Bays"
      />

      <Card
        variant="flat"
        padding="md"
        style={styles.indoorParkingCard}
        onPress={() => {
          triggerHaptic();
          router.push('/indoor-parking');
        }}>
        <View style={styles.cardHeader}>
          <View style={[styles.indoorBadge, { backgroundColor: colors.primaryFixed }]}>
            <Radio size={12} color={colors.primary} />
            <Text style={[styles.indoorBadgeText, { color: colors.primary }]}>
              BLE INDOOR TRILATERATION
            </Text>
          </View>
          <Text style={[styles.priceHighlight, { color: colors.primary }]}>₹50/hr</Text>
        </View>

        <Text style={[styles.cardTitle, { color: colors.onSurface, marginTop: 4 }]}>
          DLF Cyber Hub Parking Garage (B1/B2/B3)
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
          148 free bays · 12 EV chargers · 3 BLE beacons calibrated
        </Text>

        <View
          style={[
            styles.indoorActionRow,
            {
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}>
          <Text style={[styles.indoorActionText, { color: colors.primary }]}>
            Open Multi-Level Floor Navigator
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </View>
      </Card>
    </View>
  );

  const renderDining = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Highway Dhabas & Restaurants"
        subtitle="FSSAI 5★ Hygiene & Verified Restrooms"
      />

      {DINING_PLACES.map((place, idx) => (
        <Card
          key={idx}
          variant="flat"
          padding="md"
          style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{place.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                {place.cuisine} · {place.distance}
              </Text>
            </View>
            <View style={[styles.hygieneBadge, { backgroundColor: colors.secondaryContainer }]}>
              <ShieldCheck size={12} color={colors.secondary} />
              <Text style={[styles.hygieneText, { color: colors.onSecondaryContainer }]}>
                {place.hygiene}
              </Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            {place.tags.map((t, i) => (
              <View
                key={i}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={[styles.tagText, { color: colors.onSurface }]}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
            <Text style={[styles.digiPinPill, { color: colors.primary }]}>
              📍 DigiPIN: {place.digiPin}
            </Text>
            <View style={[styles.ratingPill, { backgroundColor: colors.surfaceContainerLow }]}>
              <Star size={12} color="#FF9800" fill="#FF9800" />
              <Text style={[styles.ratingText, { color: colors.onSurface }]}>{place.rating}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderPharmacy = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="24/7 Pharmacies"
        subtitle="Emergency Medical & Oxygen Supplies"
      />

      {PHARMACY_PLACES.map((pharm, idx) => (
        <Card
          key={idx}
          variant="flat"
          padding="md"
          style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{pharm.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                {pharm.type} · {pharm.distance}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.phoneBtn, { backgroundColor: colors.primaryFixed }]}
              onPress={() => {
                triggerHaptic();
                Linking.openURL(`tel:${pharm.phone}`);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Call ${pharm.name}`}>
              <Phone size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsRow}>
            {pharm.amenities.map((a, i) => (
              <View
                key={i}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={[styles.tagText, { color: colors.onSurface }]}>{a}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.surfaceContainerHigh }]}>
            <Text style={[styles.statusOpen, { color: colors.secondary }]}>{pharm.status}</Text>
            <Text style={[styles.digiPinPill, { color: colors.primary }]}>
              📍 {pharm.digiPin}
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Nearby Places</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Verified Infrastructure · ISRO GIS Telematics
        </Text>
      </View>

      {/* Category Carousel Track */}
      <View
        style={[
          styles.categoryTrackWrapper,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTrack}>
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.key;
            return (
              <Chip
                key={cat.key}
                label={cat.label}
                selected={isSelected}
                onPress={() => handleCategoryChange(cat.key)}
                icon={<IconComp size={16} color={isSelected ? colors.onPrimaryContainer : colors.primary} />}
                badgeCount={parseInt(cat.count, 10)}
                size="md"
              />
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeCategory === 'ev' && renderEVCharging()}
        {activeCategory === 'transit' && renderTransit()}
        {activeCategory === 'fuel' && renderFuel()}
        {activeCategory === 'parking' && renderParking()}
        {activeCategory === 'food' && renderDining()}
        {activeCategory === 'pharmacy' && renderPharmacy()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Shadows.xs,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  categoryTrackWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  categoryTrack: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.xs,
  },
  categoryPillText: {
    ...Typography.labelMedium,
    fontSize: 12,
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    padding: Spacing.md,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  sectionSub: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 10,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  availBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  connectorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  connectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  connectorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceHighlight: {
    ...Typography.labelMedium,
    fontWeight: '800',
  },
  statusText: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  transitLineBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  transitStopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transitFrom: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  transitArrowLine: {
    flex: 1,
    height: 1,
  },
  transitTo: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  frequencyText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  fareCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 10,
    ...Shadows.sm,
  },
  fareGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  fareItem: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  fareValue: {
    ...Typography.labelMedium,
    fontWeight: '800',
    marginTop: 2,
  },
  fareEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  fareEstLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  fareAuthority: {
    fontSize: 9,
    marginTop: 1,
  },
  fareEstValue: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  navMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelPricesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fuelPriceItem: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  fuelType: {
    fontSize: 10,
    fontWeight: '600',
  },
  fuelPrice: {
    ...Typography.labelMedium,
    fontWeight: '800',
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  amenityChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  indoorParkingCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 8,
    ...Shadows.sm,
  },
  indoorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  indoorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  indoorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: 4,
  },
  indoorActionText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  hygieneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  hygieneText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  digiPinPill: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  phoneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOpen: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
});
