import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Navigation,
  Car,
  Bike,
  Footprints,
  TrainFront,
  ArrowDownUp,
  Clock,
  MapPin,
  Leaf,
  IndianRupee,
  Shield,
  Milestone,
  CornerDownRight,
  AlertTriangle,
  Zap,
  RotateCw,
  ChevronRight,
} from 'lucide-react-native';
import { BMapColors } from '@/shared';

type RouteProfile = 'drive' | 'bike' | 'walk' | 'transit';

const ROUTE_ALTERNATIVES = [
  {
    id: '1',
    label: 'Fastest',
    via: 'via NH-48 & Yamuna Expressway',
    time: '2h 14m',
    distance: '168.3 km',
    toll: '₹435',
    tollPlazas: 3,
    ecoScore: 72,
    color: '#0096FF',
    trafficColor: '#00C06D',
    trafficLabel: 'Light Traffic',
    isRecommended: true,
  },
  {
    id: '2',
    label: 'Eco-Friendly',
    via: 'via SH-14 & State Highway',
    time: '2h 42m',
    distance: '182.1 km',
    toll: '₹0',
    tollPlazas: 0,
    ecoScore: 94,
    color: '#00C06D',
    trafficColor: '#FF9800',
    trafficLabel: 'Moderate Traffic',
    isRecommended: false,
  },
  {
    id: '3',
    label: 'Shortest',
    via: 'via Eastern Peripheral Expy',
    time: '2h 28m',
    distance: '154.7 km',
    toll: '₹620',
    tollPlazas: 5,
    ecoScore: 58,
    color: '#FF9800',
    trafficColor: '#F44336',
    trafficLabel: 'Heavy Traffic',
    isRecommended: false,
  },
];

const TOLL_BREAKDOWN = [
  { plaza: 'Kherki Daula Toll', highway: 'NH-48', fee: '₹155', vehicleClass: 'Car/Jeep' },
  { plaza: 'Manesar Toll Gate', highway: 'NH-48', fee: '₹130', vehicleClass: 'Car/Jeep' },
  { plaza: 'Palwal Junction Toll', highway: 'NE-4', fee: '₹150', vehicleClass: 'Car/Jeep' },
];

const TURN_STEPS = [
  { icon: 'depart', instruction: 'Head northeast on MG Road', distance: '1.2 km', lane: 'Keep center' },
  { icon: 'turn-right', instruction: 'Turn right onto NH-48 Expressway', distance: '42.6 km', lane: 'Merge right 2 lanes' },
  { icon: 'ramp', instruction: 'Take exit 14A for Yamuna Expy', distance: '0.8 km', lane: 'Exit right lane' },
  { icon: 'straight', instruction: 'Continue on Yamuna Expressway', distance: '84.2 km', lane: 'Keep left 2 lanes' },
  { icon: 'arrive', instruction: 'Arrive at destination', distance: '—', lane: '' },
];

const IMD_WEATHER = {
  level: 'YELLOW',
  color: '#FF9800',
  title: 'Dense Fog Advisory — NH-48 Corridor',
  description: 'Visibility may drop below 200m between 04:00–08:00 AM. Reduce speed. Use fog lamps.',
  validUntil: 'Valid until 12 Oct 2026 09:00 IST',
};

export default function RoutesScreen() {
  const [activeProfile, setActiveProfile] = React.useState<RouteProfile>('drive');
  const [selectedRoute, setSelectedRoute] = React.useState('1');
  const [origin, setOrigin] = React.useState('Cyber Hub, Gurugram');
  const [destination, setDestination] = React.useState('Agra Fort, Uttar Pradesh');

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const profiles: { key: RouteProfile; label: string; icon: React.ReactNode }[] = [
    { key: 'drive', label: 'Drive', icon: <Car size={18} color={activeProfile === 'drive' ? '#fff' : BMapColors.onSurfaceVariant} /> },
    { key: 'bike', label: 'Rider', icon: <Bike size={18} color={activeProfile === 'bike' ? '#fff' : BMapColors.onSurfaceVariant} /> },
    { key: 'walk', label: 'Walk', icon: <Footprints size={18} color={activeProfile === 'walk' ? '#fff' : BMapColors.onSurfaceVariant} /> },
    { key: 'transit', label: 'Transit', icon: <TrainFront size={18} color={activeProfile === 'transit' ? '#fff' : BMapColors.onSurfaceVariant} /> },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Route Planner</Text>
        <Text style={styles.subtitle}>OSRM Multi-Modal Intelligent Routing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Origin → Destination Input */}
        <View style={styles.routeInputCard}>
          <TouchableOpacity
            style={styles.routeInputRow}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}>
            <View style={[styles.dotIndicator, { backgroundColor: '#0096FF' }]} />
            <View style={styles.routeInputField}>
              <Text style={styles.routeInputLabel}>FROM (TAP TO EDIT)</Text>
              <Text style={styles.routeInputValue}>{origin}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.routeInputDivider}>
            <View style={styles.dottedLine} />
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap} activeOpacity={0.8}>
              <ArrowDownUp size={16} color="#0096FF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.routeInputRow}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}>
            <View style={[styles.dotIndicator, { backgroundColor: '#F44336' }]} />
            <View style={styles.routeInputField}>
              <Text style={styles.routeInputLabel}>TO (TAP TO EDIT)</Text>
              <Text style={styles.routeInputValue}>{destination}</Text>
            </View>
          </TouchableOpacity>
          {/* DigiPIN */}
          <TouchableOpacity
            style={styles.digiPinRow}
            onPress={() => router.push('/digipin-explorer')}
            activeOpacity={0.8}>
            <View style={styles.digiPinBadge}>
              <Text style={styles.digiPinLabel}>DigiPIN</Text>
            </View>
            <Text style={styles.digiPinCode}>28J4-K8M2-9P</Text>
            <Text style={styles.digiPinDesc}>4m×4m grid (Tap to inspect)</Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Modal Profile Selector */}
        <View style={styles.profileRow}>
          {profiles.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.profileChip, activeProfile === p.key && styles.profileChipActive]}
              onPress={() => setActiveProfile(p.key)}>
              {p.icon}
              <Text style={[styles.profileChipText, activeProfile === p.key && styles.profileChipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* If Transit selected, show Multimodal Transit Planner Shortcut */}
        {activeProfile === 'transit' && (
          <TouchableOpacity
            style={[styles.tspActionCard, { backgroundColor: '#F3E5F5', borderColor: '#CE93D8' }]}
            onPress={() => router.push('/transit-planner')}
            activeOpacity={0.85}>
            <View style={styles.tspActionLeft}>
              <View style={[styles.tspIconBadge, { backgroundColor: '#9C27B0' }]}>
                <TrainFront size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.tspActionTitle}>DMRC Metro & Bus Schedules</Text>
                <Text style={styles.tspActionSub}>Yellow/Blue lines, feeder buses & QR tokens</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9C27B0" />
          </TouchableOpacity>
        )}

        {/* Multi-Stop TSP Delivery Optimizer */}
        <TouchableOpacity
          style={styles.tspActionCard}
          onPress={() => router.push('/tsp-optimizer')}
          activeOpacity={0.85}>
          <View style={styles.tspActionLeft}>
            <View style={styles.tspIconBadge}>
              <RotateCw size={16} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.tspActionTitle}>Multi-Stop Delivery Optimizer (TSP)</Text>
              <Text style={styles.tspActionSub}>Greedy 2-Opt edge exchange · Up to 25 stops</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#0096FF" />
        </TouchableOpacity>

        {/* IMD Weather Advisory Banner */}
        <View style={[styles.weatherBanner, { borderLeftColor: IMD_WEATHER.color }]}>
          <View style={styles.weatherBannerHeader}>
            <View style={[styles.weatherLevelBadge, { backgroundColor: IMD_WEATHER.color }]}>
              <AlertTriangle size={12} color="#fff" />
              <Text style={styles.weatherLevelText}>{IMD_WEATHER.level}</Text>
            </View>
            <Text style={styles.weatherValid}>{IMD_WEATHER.validUntil}</Text>
          </View>
          <Text style={styles.weatherTitle}>{IMD_WEATHER.title}</Text>
          <Text style={styles.weatherDesc}>{IMD_WEATHER.description}</Text>
        </View>

        {/* Route Alternatives */}
        <Text style={styles.sectionTitle}>Route Alternatives</Text>
        {ROUTE_ALTERNATIVES.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeCard,
              selectedRoute === route.id && styles.routeCardSelected,
            ]}
            onPress={() => setSelectedRoute(route.id)}
            activeOpacity={0.8}>
            <View style={styles.routeCardHeader}>
              <View style={styles.routeCardLeft}>
                <View style={[styles.routeLabelBadge, { backgroundColor: route.color }]}>
                  <Text style={styles.routeLabelText}>{route.label}</Text>
                </View>
                {route.isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Zap size={10} color="#0096FF" />
                    <Text style={styles.recommendedText}>AI Recommended</Text>
                  </View>
                )}
              </View>
              <View style={[styles.trafficPill, { backgroundColor: route.trafficColor + '20' }]}>
                <View style={[styles.trafficDot, { backgroundColor: route.trafficColor }]} />
                <Text style={[styles.trafficText, { color: route.trafficColor }]}>{route.trafficLabel}</Text>
              </View>
            </View>

            <Text style={styles.routeVia}>{route.via}</Text>

            <View style={styles.routeMetrics}>
              <View style={styles.metric}>
                <Clock size={14} color={BMapColors.onSurfaceVariant} />
                <Text style={styles.metricValue}>{route.time}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <MapPin size={14} color={BMapColors.onSurfaceVariant} />
                <Text style={styles.metricValue}>{route.distance}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <IndianRupee size={14} color={BMapColors.onSurfaceVariant} />
                <Text style={styles.metricValue}>{route.toll}</Text>
                <Text style={styles.metricSub}>({route.tollPlazas} tolls)</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Leaf size={14} color={route.ecoScore > 80 ? '#00C06D' : '#FF9800'} />
                <Text style={[styles.metricValue, { color: route.ecoScore > 80 ? '#00C06D' : '#FF9800' }]}>{route.ecoScore}</Text>
              </View>
            </View>

            {selectedRoute === route.id && (
              <TouchableOpacity
                style={styles.startNavButton}
                onPress={() => router.push('/modal')}>
                <Navigation size={18} color="#fff" />
                <Text style={styles.startNavText}>Start Navigation</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {/* FASTag NHAI Toll Breakdown */}
        <Text style={styles.sectionTitle}>FASTag Toll Breakdown</Text>
        <View style={styles.tollCard}>
          <TouchableOpacity
            style={styles.tollHeader}
            onPress={() => router.push('/vehicle-fleet')}
            activeOpacity={0.8}>
            <View style={styles.tollHeaderLeft}>
              <View style={styles.fastagBadge}>
                <Text style={styles.fastagText}>FASTag</Text>
              </View>
              <Text style={styles.tollVehicleClass}>Vehicle: Car/Jeep (Class 4) · Manage Fleet</Text>
            </View>
            <Text style={styles.tollTotal}>₹435 ➔</Text>
          </TouchableOpacity>
          {TOLL_BREAKDOWN.map((toll, index) => (
            <View key={index} style={styles.tollRow}>
              <View style={styles.tollRowLeft}>
                <View style={styles.tollDot} />
                <View>
                  <Text style={styles.tollPlazaName}>{toll.plaza}</Text>
                  <Text style={styles.tollHighway}>{toll.highway}</Text>
                </View>
              </View>
              <Text style={styles.tollFee}>{toll.fee}</Text>
            </View>
          ))}
          <View style={styles.tollLaneHint}>
            <Shield size={14} color="#0096FF" />
            <Text style={styles.tollLaneText}>Use FASTag dedicated lanes for cashless express passage</Text>
          </View>
        </View>

        {/* Turn-by-Turn Preview */}
        <Text style={styles.sectionTitle}>Turn-by-Turn Preview</Text>
        <View style={styles.stepsCard}>
          {TURN_STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIconCol}>
                <View style={[styles.stepIconCircle, index === TURN_STEPS.length - 1 && { backgroundColor: '#F44336' }]}>
                  {index === TURN_STEPS.length - 1 ? (
                    <MapPin size={14} color="#fff" />
                  ) : (
                    <CornerDownRight size={14} color="#fff" />
                  )}
                </View>
                {index < TURN_STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
                <View style={styles.stepMeta}>
                  <Text style={styles.stepDistance}>{step.distance}</Text>
                  {step.lane ? (
                    <View style={styles.laneBadge}>
                      <Milestone size={10} color="#0096FF" />
                      <Text style={styles.laneText}>{step.lane}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Eco-Routing Info */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Leaf size={20} color="#00C06D" />
            <Text style={styles.ecoTitle}>Green Eco-Routing</Text>
          </View>
          <Text style={styles.ecoDesc}>
            The Eco-Friendly route saves ~1.8 kg CO₂ by reducing acceleration events and toll stop-and-go idling. 
            EV vehicles gain +12 km range from regenerative braking on downhill gradients.
          </Text>
          <View style={styles.ecoMetrics}>
            <View style={styles.ecoMetricItem}>
              <Text style={styles.ecoMetricValue}>-23%</Text>
              <Text style={styles.ecoMetricLabel}>Carbon</Text>
            </View>
            <View style={styles.ecoMetricItem}>
              <Text style={styles.ecoMetricValue}>+12 km</Text>
              <Text style={styles.ecoMetricLabel}>EV Range</Text>
            </View>
            <View style={styles.ecoMetricItem}>
              <Text style={styles.ecoMetricValue}>₹0</Text>
              <Text style={styles.ecoMetricLabel}>Toll Fees</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8EEFF' },
  title: { fontSize: 22, fontWeight: '800', color: '#111C2D' },
  subtitle: { fontSize: 11, color: '#707884', marginTop: 2, letterSpacing: 0.3 },
  scroll: { padding: 16, gap: 14 },

  routeInputCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  routeInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dotIndicator: { width: 12, height: 12, borderRadius: 6 },
  routeInputField: { flex: 1 },
  routeInputLabel: { fontSize: 10, fontWeight: '700', color: '#707884', letterSpacing: 1 },
  routeInputValue: { fontSize: 15, fontWeight: '600', color: '#111C2D', marginTop: 2 },
  routeInputDivider: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: 5 },
  dottedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 0.8, borderColor: '#BFC7D5' },
  swapButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  digiPinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F3FF', gap: 8 },
  digiPinBadge: { backgroundColor: '#0096FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  digiPinLabel: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  digiPinCode: { fontSize: 14, fontWeight: '700', color: '#111C2D', fontFamily: 'monospace' },
  digiPinDesc: { fontSize: 10, color: '#707884' },

  profileRow: { flexDirection: 'row', gap: 8 },
  tspActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#D0E4FF',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tspActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tspIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tspActionTitle: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  tspActionSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  profileChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  profileChipActive: { backgroundColor: '#0096FF', shadowColor: '#0096FF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  profileChipText: { fontSize: 12, fontWeight: '700', color: '#3F4753' },
  profileChipTextActive: { color: '#fff' },

  weatherBanner: { backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, borderLeftWidth: 4 },
  weatherBannerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  weatherLevelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  weatherLevelText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  weatherValid: { fontSize: 9, color: '#707884' },
  weatherTitle: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  weatherDesc: { fontSize: 12, color: '#3F4753', lineHeight: 17, marginTop: 3 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111C2D', marginTop: 4 },

  routeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  routeCardSelected: { borderColor: '#0096FF', shadowColor: '#0096FF', shadowOpacity: 0.15 },
  routeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeLabelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  routeLabelText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  recommendedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E8F4FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  recommendedText: { fontSize: 9, fontWeight: '700', color: '#0096FF' },
  trafficPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  trafficDot: { width: 6, height: 6, borderRadius: 3 },
  trafficText: { fontSize: 10, fontWeight: '600' },
  routeVia: { fontSize: 12, color: '#707884', marginTop: 6 },
  routeMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricValue: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  metricSub: { fontSize: 10, color: '#707884' },
  metricDivider: { width: 1, height: 14, backgroundColor: '#E8EEFF' },
  startNavButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0096FF', borderRadius: 12, paddingVertical: 12, marginTop: 12, shadowColor: '#0096FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  startNavText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  tollCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  tollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tollHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fastagBadge: { backgroundColor: '#6A1B9A', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  fastagText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tollVehicleClass: { fontSize: 11, color: '#707884' },
  tollTotal: { fontSize: 20, fontWeight: '800', color: '#111C2D' },
  tollRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  tollRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tollDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6A1B9A' },
  tollPlazaName: { fontSize: 13, fontWeight: '600', color: '#111C2D' },
  tollHighway: { fontSize: 10, color: '#707884', marginTop: 1 },
  tollFee: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  tollLaneHint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F4FF', borderRadius: 10, padding: 10, marginTop: 10 },
  tollLaneText: { flex: 1, fontSize: 11, color: '#0061A7', lineHeight: 15 },

  stepsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepIconCol: { alignItems: 'center', width: 28 },
  stepIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0096FF', alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E8EEFF', marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: 16 },
  stepInstruction: { fontSize: 13, fontWeight: '600', color: '#111C2D', lineHeight: 18 },
  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stepDistance: { fontSize: 12, fontWeight: '700', color: '#707884' },
  laneBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E8F4FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  laneText: { fontSize: 10, fontWeight: '600', color: '#0096FF' },

  ecoCard: { backgroundColor: '#E8F8EE', borderRadius: 16, padding: 16 },
  ecoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ecoTitle: { fontSize: 15, fontWeight: '700', color: '#006D3B' },
  ecoDesc: { fontSize: 12, color: '#1B5E20', lineHeight: 18 },
  ecoMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#C8E6C9' },
  ecoMetricItem: { alignItems: 'center' },
  ecoMetricValue: { fontSize: 18, fontWeight: '800', color: '#006D3B' },
  ecoMetricLabel: { fontSize: 10, fontWeight: '600', color: '#2E7D32', marginTop: 2 },
});
