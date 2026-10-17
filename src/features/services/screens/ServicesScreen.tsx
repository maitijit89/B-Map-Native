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
  Satellite,
  Shield,
  Leaf,
  Phone,
  Camera,
  Radio,
  ThumbsUp,
  ThumbsDown,
  Car,
  Truck,
  Bus,
  Signal,
  Waves,
  Siren,
  Heart,
  TriangleAlert,
  CreditCard,
} from 'lucide-react-native';

const NAVIC_SATELLITES = [
  { id: 'IRNSS-1A', band: 'L5', signal: 42, status: 'Active', elevation: '55°' },
  { id: 'IRNSS-1B', band: 'S', signal: 38, status: 'Active', elevation: '38°' },
  { id: 'IRNSS-1C', band: 'L5', signal: 45, status: 'Active', elevation: '62°' },
  { id: 'IRNSS-1D', band: 'L5+S', signal: 48, status: 'Active', elevation: '71°' },
  { id: 'IRNSS-1G', band: 'L5', signal: 35, status: 'Active', elevation: '28°' },
];

const HAZARD_REPORTS = [
  { type: 'Pothole', location: 'NH-48 km 42.3', time: '12 min ago', upvotes: 23, severity: 'high', color: '#F44336' },
  { type: 'Waterlogging', location: 'Sector 29 underpass', time: '28 min ago', upvotes: 45, severity: 'high', color: '#2196F3' },
  { type: 'Roadwork', location: 'MG Road junction', time: '1h ago', upvotes: 18, severity: 'medium', color: '#FF9800' },
  { type: 'Accident', location: 'Eastern Peripheral Expy km 18', time: '35 min ago', upvotes: 67, severity: 'high', color: '#F44336' },
  { type: 'Vehicle Breakdown', location: 'Yamuna Expy km 92', time: '45 min ago', upvotes: 12, severity: 'low', color: '#9E9E9E' },
];

const SPEED_CAMERAS = [
  { location: 'NH-48 km 36.2', limit: '120 km/h', distance: '2.4 km', type: 'Fixed Radar' },
  { location: 'Sohna Road Elevated', limit: '80 km/h', distance: '5.1 km', type: 'Interceptor Zone' },
  { location: 'Golf Course Extension', limit: '60 km/h', distance: '0.8 km', type: 'Red Light Camera' },
];

const VEHICLE_CLASSES = [
  { label: 'Car / Jeep', class: 'Class 4', icon: Car, fee: '₹435', desc: 'Standard Passenger' },
  { label: 'LCV / Mini-Bus', class: 'Class 5', icon: Truck, fee: '₹700', desc: 'Light Commercial' },
  { label: 'Bus / Heavy Truck', class: 'Class 6', icon: Bus, fee: '₹1,460', desc: 'Commercial Axle' },
];

export default function ServicesScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Intelligent Services</Text>
        <Text style={styles.subtitle}>NavIC · ADAS · V2X · Emergency · FASTag</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* NavIC Satellite Status */}
        <View style={styles.navicCard}>
          <View style={styles.navicHeader}>
            <View style={styles.navicHeaderLeft}>
              <Satellite size={20} color="#0096FF" />
              <View>
                <Text style={styles.navicTitle}>ISRO NavIC Status</Text>
                <Text style={styles.navicSub}>Dual-Band L5 + S-Band</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.navicDopBadge}
              onPress={() => router.push('/digipin-explorer')}
              activeOpacity={0.8}>
              <Text style={styles.navicDopLabel}>DigiPIN / HDOP</Text>
              <Text style={styles.navicDopValue}>0.8</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.navicAccuracy}>
            <View style={styles.navicAccItem}>
              <Text style={styles.navicAccValue}>0.6m</Text>
              <Text style={styles.navicAccLabel}>Position Accuracy</Text>
            </View>
            <View style={styles.navicAccDivider} />
            <View style={styles.navicAccItem}>
              <Text style={styles.navicAccValue}>5/7</Text>
              <Text style={styles.navicAccLabel}>Satellites Locked</Text>
            </View>
            <View style={styles.navicAccDivider} />
            <View style={styles.navicAccItem}>
              <Text style={[styles.navicAccValue, { color: '#00C06D' }]}>3D Fix</Text>
              <Text style={styles.navicAccLabel}>Fix Quality</Text>
            </View>
          </View>
          {NAVIC_SATELLITES.map((sat, i) => (
            <View key={i} style={styles.satRow}>
              <Text style={styles.satId}>{sat.id}</Text>
              <View style={styles.satBandBadge}>
                <Text style={styles.satBandText}>{sat.band}</Text>
              </View>
              <View style={styles.satSignalBar}>
                <View style={[styles.satSignalFill, { width: `${sat.signal * 2}%`, backgroundColor: sat.signal > 40 ? '#00C06D' : '#FF9800' }]} />
              </View>
              <Text style={styles.satSignalVal}>{sat.signal} dB</Text>
              <Text style={styles.satElev}>{sat.elevation}</Text>
            </View>
          ))}
        </View>

        {/* SOS Emergency Console */}
        <View style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <Siren size={22} color="#F44336" />
            <Text style={styles.sosTitle}>Emergency SOS Console</Text>
          </View>
          <Text style={styles.sosDesc}>One-touch broadcasts coordinates, vehicle details & active route to emergency services</Text>
          <View style={styles.sosButtons}>
            <TouchableOpacity
              style={[styles.sosBtn, { backgroundColor: '#F44336' }]}
              onPress={() => router.push('/sos-distress')}
              activeOpacity={0.8}>
              <Phone size={18} color="#fff" />
              <Text style={styles.sosBtnText}>112 Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sosBtn, { backgroundColor: '#FF9800' }]}
              onPress={() => Alert.alert('Highway Patrol', 'Contacting NHAI Highway Patrol for roadside assistance')}
              activeOpacity={0.8}>
              <Shield size={18} color="#fff" />
              <Text style={styles.sosBtnText}>Highway Patrol</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sosBtn, { backgroundColor: '#4CAF50' }]}
              onPress={() => Alert.alert('Ambulance', 'Requesting nearest ambulance. GPS coordinates shared.')}
              activeOpacity={0.8}>
              <Heart size={18} color="#fff" />
              <Text style={styles.sosBtnText}>Ambulance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FASTag Vehicle Class & Corridor Toll Estimator */}
        <View style={styles.tollEstimatorCard}>
          <View style={styles.tollEstimatorHeader}>
            <View style={styles.tollEstimatorHeaderLeft}>
              <CreditCard size={18} color="#6A1B9A" />
              <View>
                <Text style={styles.tollEstimatorTitle}>FASTag Highway Calculator</Text>
                <Text style={styles.tollEstimatorSub}>NH-48 · Yamuna Expressway Corridor</Text>
              </View>
            </View>
            <View style={styles.fastagTagBadge}>
              <Text style={styles.fastagTagText}>NHAI Verified</Text>
            </View>
          </View>

          {/* Vehicle Class Selector */}
          <View style={styles.vehicleClassRow}>
            {VEHICLE_CLASSES.map((vc, idx) => {
              const IconComp = vc.icon;
              const isSelected = selectedVehicle === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.vehicleClassChip, isSelected && styles.vehicleClassChipSelected]}
                  onPress={() => setSelectedVehicle(idx)}
                  activeOpacity={0.8}>
                  <IconComp size={18} color={isSelected ? '#fff' : '#0096FF'} />
                  <Text style={[styles.vehicleClassLabel, isSelected && styles.vehicleClassLabelSelected]}>
                    {vc.label}
                  </Text>
                  <Text style={[styles.vehicleClassBadge, isSelected && styles.vehicleClassBadgeSelected]}>
                    {vc.class}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Toll Fee Result Banner */}
          <TouchableOpacity
            style={styles.tollResultBanner}
            onPress={() => router.push('/vehicle-fleet')}
            activeOpacity={0.85}>
            <View>
              <Text style={styles.tollResultLabel}>Calculated Corridor Toll</Text>
              <Text style={styles.tollResultDesc}>
                {VEHICLE_CLASSES[selectedVehicle].desc} across 3 NHAI Plazas (Tap to manage fleet)
              </Text>
            </View>
            <Text style={styles.tollResultFee}>
              {VEHICLE_CLASSES[selectedVehicle].fee} ➔
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADAS Speed Camera Alerts */}
        <Text style={styles.sectionLabel}>ADAS Speed Camera Alerts</Text>
        {SPEED_CAMERAS.map((cam, i) => (
          <View key={i} style={styles.cameraCard}>
            <View style={styles.cameraLeft}>
              <Camera size={16} color="#F44336" />
              <View>
                <Text style={styles.cameraLocation}>{cam.location}</Text>
                <Text style={styles.cameraType}>{cam.type}</Text>
              </View>
            </View>
            <View style={styles.cameraRight}>
              <View style={styles.speedLimitBadge}>
                <Text style={styles.speedLimitText}>{cam.limit}</Text>
              </View>
              <Text style={styles.cameraDistance}>{cam.distance}</Text>
            </View>
          </View>
        ))}

        {/* Hazard Community Reports */}
        <Text style={styles.sectionLabel}>Community Hazard Reports</Text>
        <Text style={styles.sectionSub}>Crowdsourced · Trust-Score Verified</Text>
        {HAZARD_REPORTS.map((hazard, i) => (
          <View key={i} style={styles.hazardCard}>
            <View style={styles.hazardLeft}>
              <View style={[styles.hazardDot, { backgroundColor: hazard.color }]} />
              <View style={{ flex: 1 }}>
                <View style={styles.hazardTitleRow}>
                  <Text style={styles.hazardType}>{hazard.type}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: hazard.color + '20' }]}>
                    <Text style={[styles.severityText, { color: hazard.color }]}>{hazard.severity}</Text>
                  </View>
                </View>
                <Text style={styles.hazardLocation}>{hazard.location}</Text>
                <Text style={styles.hazardTime}>{hazard.time}</Text>
              </View>
            </View>
            <View style={styles.hazardVotes}>
              <TouchableOpacity style={styles.voteBtn}>
                <ThumbsUp size={14} color="#00C06D" />
              </TouchableOpacity>
              <Text style={styles.voteCount}>{hazard.upvotes}</Text>
              <TouchableOpacity style={styles.voteBtn}>
                <ThumbsDown size={14} color="#707884" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Eco-Routing Dashboard */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Leaf size={20} color="#00C06D" />
            <Text style={styles.ecoTitle}>Eco-Routing & EV Energy</Text>
          </View>
          <View style={styles.ecoGrid}>
            <View style={styles.ecoGridItem}>
              <Text style={styles.ecoGridValue}>12.4 kg</Text>
              <Text style={styles.ecoGridLabel}>CO₂ Saved Today</Text>
            </View>
            <View style={styles.ecoGridItem}>
              <Text style={styles.ecoGridValue}>78%</Text>
              <Text style={styles.ecoGridLabel}>EV Battery</Text>
            </View>
            <View style={styles.ecoGridItem}>
              <Text style={styles.ecoGridValue}>186 km</Text>
              <Text style={styles.ecoGridLabel}>Projected Range</Text>
            </View>
            <View style={styles.ecoGridItem}>
              <Text style={styles.ecoGridValue}>+18 km</Text>
              <Text style={styles.ecoGridLabel}>Regen Braking</Text>
            </View>
          </View>
        </View>

        {/* V2X Connected Vehicle */}
        <View style={styles.v2xCard}>
          <View style={styles.v2xHeader}>
            <Radio size={18} color="#0096FF" />
            <Text style={styles.v2xTitle}>V2X Connected Vehicle</Text>
            <View style={styles.v2xLiveDot} />
          </View>
          <Text style={styles.v2xDesc}>Broadcasting braking events and hazard alerts to connected nodes within 500m radius</Text>
          <View style={styles.v2xStats}>
            <View style={styles.v2xStatItem}>
              <Signal size={14} color="#0096FF" />
              <Text style={styles.v2xStatText}>4 vehicles in range</Text>
            </View>
            <View style={styles.v2xStatItem}>
              <Waves size={14} color="#00C06D" />
              <Text style={styles.v2xStatText}>12 events/min</Text>
            </View>
          </View>
        </View>

        {/* Report a Hazard CTA */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => router.push('/hazard-report')}
          activeOpacity={0.85}>
          <TriangleAlert size={20} color="#fff" />
          <Text style={styles.reportButtonText}>Report Road Hazard</Text>
        </TouchableOpacity>

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
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111C2D', marginTop: 4 },
  sectionSub: { fontSize: 11, color: '#707884', marginTop: -8 },

  navicCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  navicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navicHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navicTitle: { fontSize: 15, fontWeight: '700', color: '#111C2D' },
  navicSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  navicDopBadge: { alignItems: 'center', backgroundColor: '#E8F8EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  navicDopLabel: { fontSize: 8, fontWeight: '700', color: '#707884' },
  navicDopValue: { fontSize: 16, fontWeight: '800', color: '#00C06D' },
  navicAccuracy: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#F8FAFF', borderRadius: 12, marginBottom: 10 },
  navicAccItem: { alignItems: 'center' },
  navicAccValue: { fontSize: 16, fontWeight: '800', color: '#0096FF' },
  navicAccLabel: { fontSize: 9, color: '#707884', marginTop: 2 },
  navicAccDivider: { width: 1, backgroundColor: '#E8EEFF' },
  satRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  satId: { fontSize: 11, fontWeight: '600', color: '#111C2D', width: 70 },
  satBandBadge: { backgroundColor: '#E8F4FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  satBandText: { fontSize: 9, fontWeight: '700', color: '#0096FF' },
  satSignalBar: { flex: 1, height: 6, backgroundColor: '#F0F3FF', borderRadius: 3, overflow: 'hidden' },
  satSignalFill: { height: 6, borderRadius: 3 },
  satSignalVal: { fontSize: 10, fontWeight: '600', color: '#111C2D', width: 36, textAlign: 'right' },
  satElev: { fontSize: 10, color: '#707884', width: 30, textAlign: 'right' },

  sosCard: { backgroundColor: '#FFF5F5', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#FFCDD2' },
  sosHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sosTitle: { fontSize: 16, fontWeight: '700', color: '#C62828' },
  sosDesc: { fontSize: 12, color: '#795548', lineHeight: 17, marginBottom: 12 },
  sosButtons: { flexDirection: 'row', gap: 8 },
  sosBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  sosBtnText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  /* FASTag Calculator Card */
  tollEstimatorCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tollEstimatorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tollEstimatorHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tollEstimatorTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  tollEstimatorSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  fastagTagBadge: { backgroundColor: '#F9F4FC', borderWidth: 1, borderColor: '#EBD8F7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  fastagTagText: { fontSize: 9, fontWeight: '800', color: '#6A1B9A' },
  vehicleClassRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  vehicleClassChip: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E8EEFF', gap: 4 },
  vehicleClassChipSelected: { backgroundColor: '#0096FF', borderColor: '#0096FF' },
  vehicleClassLabel: { fontSize: 10, fontWeight: '700', color: '#111C2D', textAlign: 'center' },
  vehicleClassLabelSelected: { color: '#ffffff' },
  vehicleClassBadge: { fontSize: 8, fontWeight: '600', color: '#707884' },
  vehicleClassBadgeSelected: { color: '#E0F7FF' },
  tollResultBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F4FC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EBD8F7' },
  tollResultLabel: { fontSize: 11, fontWeight: '700', color: '#4A154B' },
  tollResultDesc: { fontSize: 10, color: '#7B5282', marginTop: 1 },
  tollResultFee: { fontSize: 20, fontWeight: '900', color: '#6A1B9A' },

  cameraCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cameraLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cameraLocation: { fontSize: 13, fontWeight: '600', color: '#111C2D' },
  cameraType: { fontSize: 10, color: '#707884', marginTop: 1 },
  cameraRight: { alignItems: 'flex-end', gap: 4 },
  speedLimitBadge: { backgroundColor: '#FFF3F0', borderWidth: 2, borderColor: '#F44336', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  speedLimitText: { fontSize: 11, fontWeight: '800', color: '#F44336' },
  cameraDistance: { fontSize: 10, color: '#707884' },

  hazardCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  hazardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  hazardDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  hazardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hazardType: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  severityText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  hazardLocation: { fontSize: 11, color: '#707884', marginTop: 2 },
  hazardTime: { fontSize: 10, color: '#BFC7D5', marginTop: 1 },
  hazardVotes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteBtn: { padding: 4 },
  voteCount: { fontSize: 12, fontWeight: '700', color: '#111C2D' },

  ecoCard: { backgroundColor: '#E8F8EE', borderRadius: 16, padding: 16 },
  ecoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ecoTitle: { fontSize: 15, fontWeight: '700', color: '#1B5E20' },
  ecoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ecoGridItem: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  ecoGridValue: { fontSize: 18, fontWeight: '800', color: '#006D3B' },
  ecoGridLabel: { fontSize: 10, color: '#2E7D32', marginTop: 2, textAlign: 'center' },

  v2xCard: { backgroundColor: '#E8F4FF', borderRadius: 16, padding: 14 },
  v2xHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  v2xTitle: { fontSize: 14, fontWeight: '700', color: '#0061A7', flex: 1 },
  v2xLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C06D' },
  v2xDesc: { fontSize: 12, color: '#0061A7', lineHeight: 17 },
  v2xStats: { flexDirection: 'row', gap: 16, marginTop: 10 },
  v2xStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  v2xStatText: { fontSize: 11, fontWeight: '600', color: '#0061A7' },

  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF9800', borderRadius: 14, paddingVertical: 14, shadowColor: '#FF9800', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  reportButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
