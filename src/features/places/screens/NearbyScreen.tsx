import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

type NearbyCategory = 'ev' | 'fuel' | 'transit' | 'parking' | 'food' | 'pharmacy';

const CATEGORIES: { key: NearbyCategory; label: string; icon: typeof Zap; color: string; count: string }[] = [
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
  { name: 'Indian Oil (IOCL) — NH-48', distance: '0.8 km', petrol: '₹104.21/L', diesel: '₹90.76/L', brand: 'IOCL', amenities: ['Air', 'Water', 'Restroom'] },
  { name: 'Bharat Petroleum — Sec 29', distance: '1.5 km', petrol: '₹104.56/L', diesel: '₹91.02/L', brand: 'BPCL', amenities: ['Air', 'Restroom', 'ATM'] },
  { name: 'HP Station — MG Road', distance: '2.1 km', petrol: '₹103.97/L', diesel: '₹90.88/L', brand: 'HPCL', amenities: ['Air', 'Water', 'CNG'] },
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
  const [activeCategory, setActiveCategory] = useState<NearbyCategory>('ev');

  const renderEVCharging = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>EV Charging Stations</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={14} color="#0096FF" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      {EV_STATIONS.map((station, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.evCard}
          onPress={() => router.push('/ev-station')}
          activeOpacity={0.8}>
          <View style={styles.evHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.evName}>{station.name}</Text>
              <Text style={styles.evNetwork}>{station.network} • {station.distance}</Text>
            </View>
            <View style={styles.evAvailBadge}>
              <CircleDot size={10} color={station.available > 2 ? '#00C06D' : '#FF9800'} />
              <Text style={styles.evAvailText}>{station.available}/{station.total} free</Text>
            </View>
          </View>
          <View style={styles.evConnectors}>
            {station.connectors.map((c, i) => (
              <View key={i} style={styles.connectorChip}>
                <Plug size={10} color="#0096FF" />
                <Text style={styles.connectorText}>{c}</Text>
              </View>
            ))}
          </View>
          <View style={styles.evFooter}>
            <View style={styles.evFooterLeft}>
              <Text style={styles.evPrice}>{station.price}</Text>
              <Text style={styles.evStatus}>{station.status}</Text>
            </View>
            <View style={styles.evRating}>
              <Star size={12} color="#FF9800" fill="#FF9800" />
              <Text style={styles.evRatingText}>{station.rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTransit = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Public Transit</Text>
        <Text style={styles.sectionSub}>Metro & Bus Schedules</Text>
      </View>
      {TRANSIT_ROUTES.map((route, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.transitCard}
          onPress={() => router.push('/transit-planner')}
          activeOpacity={0.8}>
          <View style={styles.transitHeader}>
            <View style={[styles.transitLineBadge, { backgroundColor: route.color }]}>
              {route.type === 'Metro' ? <TrainFront size={12} color="#111" /> : <Bus size={12} color="#fff" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.transitLine}>{route.line}</Text>
              <Text style={styles.transitNetwork}>{route.network}</Text>
            </View>
            <Text style={styles.transitFare}>{route.fare}</Text>
          </View>
          <View style={styles.transitRoute}>
            <View style={styles.transitStopDot} />
            <Text style={styles.transitFrom}>{route.from}</Text>
            <View style={styles.transitArrowLine} />
            <Text style={styles.transitTo}>{route.to}</Text>
            <View style={[styles.transitStopDot, { backgroundColor: '#F44336' }]} />
          </View>
          <View style={styles.transitMeta}>
            <View style={styles.transitMetaItem}>
              <Clock size={12} color="#707884" />
              <Text style={styles.transitMetaText}>{route.duration}</Text>
            </View>
            <Text style={styles.transitFreq}>{route.frequency}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Auto-Rickshaw Fare Card */}
      <View style={styles.fareCard}>
        <Text style={styles.fareTitle}>Auto-Rickshaw Fare Estimate</Text>
        <View style={styles.fareGrid}>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Base Fare</Text>
            <Text style={styles.fareValue}>{AUTO_FARE.baseFare}</Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Per Km Rate</Text>
            <Text style={styles.fareValue}>{AUTO_FARE.perKm}</Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Night (11pm–5am)</Text>
            <Text style={styles.fareValue}>{AUTO_FARE.nightSurcharge}</Text>
          </View>
          <View style={styles.fareItem}>
            <Text style={styles.fareLabel}>Waiting</Text>
            <Text style={styles.fareValue}>{AUTO_FARE.waitingCharge}</Text>
          </View>
        </View>
        <View style={styles.fareEstimate}>
          <View>
            <Text style={styles.fareEstLabel}>Estimated for {AUTO_FARE.distance}</Text>
            <Text style={styles.fareAuthority}>{AUTO_FARE.authority}</Text>
          </View>
          <Text style={styles.fareEstValue}>{AUTO_FARE.estimatedFare}</Text>
        </View>
      </View>
    </View>
  );

  const renderFuel = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fuel Stations</Text>
        <Text style={styles.sectionSub}>IOCL • BPCL • HPCL</Text>
      </View>
      {FUEL_STATIONS.map((st, idx) => (
        <TouchableOpacity key={idx} style={styles.fuelCard} activeOpacity={0.8}>
          <View style={styles.fuelHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fuelName}>{st.name}</Text>
              <Text style={styles.fuelDist}>{st.distance} away</Text>
            </View>
            <TouchableOpacity style={styles.navMiniBtn} onPress={() => Alert.alert('Navigate', `Routing to ${st.name}`)}>
              <Navigation size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.fuelPrices}>
            <View style={styles.fuelPriceItem}>
              <Text style={styles.fuelType}>Petrol</Text>
              <Text style={styles.fuelPrice}>{st.petrol}</Text>
            </View>
            <View style={styles.fuelPriceDivider} />
            <View style={styles.fuelPriceItem}>
              <Text style={styles.fuelType}>Diesel</Text>
              <Text style={styles.fuelPrice}>{st.diesel}</Text>
            </View>
          </View>
          <View style={styles.fuelAmenities}>
            {st.amenities.map((a, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderParking = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Smart & Multi-Level Parking</Text>
        <Text style={styles.sectionSub}>BLE Beacon Trilateration</Text>
      </View>

      <TouchableOpacity
        style={styles.indoorParkingCard}
        onPress={() => router.push('/indoor-parking')}
        activeOpacity={0.85}>
        <View style={styles.indoorParkingTop}>
          <View style={styles.indoorParkingBadge}>
            <Radio size={14} color="#0096FF" />
            <Text style={styles.indoorParkingBadgeText}>BLE TRILATERATION ACTIVE</Text>
          </View>
          <Text style={styles.indoorParkingRate}>₹50/hr</Text>
        </View>
        <Text style={styles.indoorParkingName}>DLF Cyber Hub Parking Garage (B1/B2/B3)</Text>
        <Text style={styles.indoorParkingSub}>148 free bays · 12 EV chargers · 3 BLE beacons calibrated</Text>

        <View style={styles.indoorParkingAction}>
          <Text style={styles.indoorParkingActionText}>Open Multi-Level Floor Navigator</Text>
          <ChevronRight size={16} color="#0096FF" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderDining = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Highway Dhabas & Restaurants</Text>
        <Text style={styles.sectionSub}>FSSAI 5★ Hygiene & Restrooms</Text>
      </View>
      {DINING_PLACES.map((place, idx) => (
        <TouchableOpacity key={idx} style={styles.diningCard} activeOpacity={0.8}>
          <View style={styles.diningHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.diningName}>{place.name}</Text>
              <Text style={styles.diningCuisine}>{place.cuisine} · {place.distance}</Text>
            </View>
            <View style={styles.hygieneBadge}>
              <ShieldCheck size={11} color="#00C06D" />
              <Text style={styles.hygieneText}>{place.hygiene}</Text>
            </View>
          </View>
          <View style={styles.diningTags}>
            {place.tags.map((t, i) => (
              <View key={i} style={styles.diningTagChip}>
                <Text style={styles.diningTagText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={styles.diningFooter}>
            <View style={styles.diningRating}>
              <Star size={12} color="#FF9800" fill="#FF9800" />
              <Text style={styles.diningRatingText}>{place.rating}</Text>
              <Text style={styles.diningStatus}>· {place.status}</Text>
            </View>
            <TouchableOpacity
              style={styles.navBtnMini}
              onPress={() => router.push('/modal')}>
              <Navigation size={12} color="#fff" />
              <Text style={styles.navBtnMiniText}>Route</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPharmacy = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>24/7 Emergency Pharmacies</Text>
        <Text style={styles.sectionSub}>Trauma & Medicine Centers</Text>
      </View>
      {PHARMACY_PLACES.map((pharm, idx) => (
        <TouchableOpacity key={idx} style={styles.pharmacyCard} activeOpacity={0.8}>
          <View style={styles.pharmacyHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pharmacyName}>{pharm.name}</Text>
              <Text style={styles.pharmacyType}>{pharm.type} · {pharm.distance}</Text>
            </View>
            <TouchableOpacity
              style={styles.callCircleBtn}
              onPress={() => Alert.alert('Call Pharmacy', `Dialing ${pharm.phone}`)}>
              <Phone size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.diningTags}>
            {pharm.amenities.map((a, i) => (
              <View key={i} style={[styles.diningTagChip, { backgroundColor: '#FCE4EC' }]}>
                <Text style={[styles.diningTagText, { color: '#C2185B' }]}>{a}</Text>
              </View>
            ))}
          </View>
          <View style={styles.diningFooter}>
            <View style={styles.diningRating}>
              <Clock size={12} color="#00C06D" />
              <Text style={[styles.diningStatus, { color: '#00C06D', fontWeight: '700' }]}>
                {pharm.status}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.navBtnMini}
              onPress={() => router.push('/modal')}>
              <Navigation size={12} color="#fff" />
              <Text style={styles.navBtnMiniText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'ev': return renderEVCharging();
      case 'transit': return renderTransit();
      case 'fuel': return renderFuel();
      case 'parking': return renderParking();
      case 'food': return renderDining();
      case 'pharmacy': return renderPharmacy();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Discovery</Text>
        <Text style={styles.headerSub}>Real-time POI search within 5 km radius</Text>
      </View>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryItem, isActive && styles.categoryItemActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}>
              <View style={[styles.categoryIcon, { backgroundColor: isActive ? cat.color : '#F0F3FF' }]}>
                <IconComp size={20} color={isActive ? '#fff' : cat.color} />
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{cat.label}</Text>
              <Text style={[styles.categoryCount, isActive && { color: cat.color }]}>{cat.count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8EEFF' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111C2D' },
  headerSub: { fontSize: 11, color: '#707884', marginTop: 2 },
  categoryGrid: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, gap: 6, backgroundColor: '#fff' },
  categoryItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: '#F8FAFF' },
  categoryItemActive: { backgroundColor: '#E8F4FF' },
  categoryIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  categoryLabel: { fontSize: 10, fontWeight: '700', color: '#3F4753', textAlign: 'center' },
  categoryLabelActive: { color: '#0096FF' },
  categoryCount: { fontSize: 9, fontWeight: '600', color: '#707884', marginTop: 1 },
  scrollContent: { padding: 16 },
  sectionContainer: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111C2D' },
  sectionSub: { fontSize: 11, color: '#707884' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#E8F4FF' },
  filterText: { fontSize: 11, fontWeight: '600', color: '#0096FF' },

  evCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  evHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  evName: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  evNetwork: { fontSize: 11, color: '#707884', marginTop: 2 },
  evAvailBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F8EE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  evAvailText: { fontSize: 11, fontWeight: '700', color: '#00C06D' },
  evConnectors: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  connectorChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  connectorText: { fontSize: 10, fontWeight: '600', color: '#0061A7' },
  evFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  evFooterLeft: { gap: 2 },
  evPrice: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  evStatus: { fontSize: 10, color: '#707884' },
  evRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  evRatingText: { fontSize: 12, fontWeight: '700', color: '#FF9800' },

  transitCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  transitHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transitLineBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  transitLine: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  transitNetwork: { fontSize: 10, color: '#707884', marginTop: 1 },
  transitFare: { fontSize: 14, fontWeight: '800', color: '#0096FF' },
  transitRoute: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  transitStopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0096FF' },
  transitFrom: { fontSize: 11, fontWeight: '600', color: '#111C2D' },
  transitArrowLine: { flex: 1, height: 2, backgroundColor: '#E8EEFF', borderRadius: 1 },
  transitTo: { fontSize: 11, fontWeight: '600', color: '#111C2D' },
  transitMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  transitMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  transitMetaText: { fontSize: 11, fontWeight: '600', color: '#707884' },
  transitFreq: { fontSize: 10, fontWeight: '600', color: '#00C06D' },

  fareCard: { backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14 },
  fareTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D', marginBottom: 10 },
  fareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fareItem: { width: '47%', backgroundColor: '#fff', borderRadius: 10, padding: 10 },
  fareLabel: { fontSize: 10, color: '#707884' },
  fareValue: { fontSize: 14, fontWeight: '700', color: '#111C2D', marginTop: 2 },
  fareEstimate: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FFE082' },
  fareEstLabel: { fontSize: 12, fontWeight: '600', color: '#111C2D' },
  fareAuthority: { fontSize: 9, color: '#707884', marginTop: 1 },
  fareEstValue: { fontSize: 18, fontWeight: '800', color: '#0096FF' },

  fuelCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  fuelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fuelName: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  fuelDist: { fontSize: 11, color: '#707884', marginTop: 1 },
  navMiniBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0096FF', alignItems: 'center', justifyContent: 'center' },
  fuelPrices: { flexDirection: 'row', marginTop: 10, gap: 12 },
  fuelPriceItem: { flex: 1, backgroundColor: '#F8FAFF', borderRadius: 10, padding: 10, alignItems: 'center' },
  fuelType: { fontSize: 10, fontWeight: '600', color: '#707884' },
  fuelPrice: { fontSize: 14, fontWeight: '700', color: '#111C2D', marginTop: 2 },
  fuelPriceDivider: { width: 1, backgroundColor: '#E8EEFF' },
  fuelAmenities: { flexDirection: 'row', gap: 6, marginTop: 8 },
  amenityChip: { backgroundColor: '#F0F3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  amenityText: { fontSize: 10, fontWeight: '600', color: '#0061A7' },

  indoorParkingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D0E4FF',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  indoorParkingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  indoorParkingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  indoorParkingBadgeText: { fontSize: 9, fontWeight: '800', color: '#0096FF', letterSpacing: 0.5 },
  indoorParkingRate: { fontSize: 13, fontWeight: '800', color: '#0096FF' },
  indoorParkingName: { fontSize: 15, fontWeight: '800', color: '#111C2D' },
  indoorParkingSub: { fontSize: 11, color: '#707884' },
  indoorParkingAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  indoorParkingActionText: { fontSize: 12, fontWeight: '700', color: '#0096FF' },

  diningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  diningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  diningName: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  diningCuisine: { fontSize: 11, color: '#707884', marginTop: 2 },
  hygieneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F8EE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  hygieneText: { fontSize: 10, fontWeight: '700', color: '#00C06D' },
  diningTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  diningTagChip: { backgroundColor: '#F0F4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diningTagText: { fontSize: 10, fontWeight: '600', color: '#0061A7' },
  diningFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  diningRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diningRatingText: { fontSize: 12, fontWeight: '700', color: '#FF9800' },
  diningStatus: { fontSize: 11, color: '#707884' },
  navBtnMini: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0096FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  navBtnMiniText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  pharmacyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  pharmacyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pharmacyName: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  pharmacyType: { fontSize: 11, color: '#707884', marginTop: 2 },
  callCircleBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E91E63', alignItems: 'center', justifyContent: 'center' },

  placeholderContainer: { paddingVertical: 40, alignItems: 'center' },
  placeholderText: { fontSize: 14, color: '#707884' },
});
