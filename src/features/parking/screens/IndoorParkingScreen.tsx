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
  X,
  Radio,
  SquareParking,
  Zap,
  Navigation,
  Layers,
  CheckCircle2,
  Wifi,
} from 'lucide-react-native';

interface ParkingBay {
  id: string;
  code: string;
  type: 'standard' | 'ev' | 'reserved';
  isAvailable: boolean;
  powerKw?: number;
}

const FLOORS = ['B1 (Express)', 'B2 (EV Hub)', 'B3 (Long Stay)'];

const BEACONS = [
  { id: 'BLE_BCN_01', name: 'West Ramp Pillar #14', rssi: -64, distance: '1.4m', status: 'Locked' },
  { id: 'BLE_BCN_02', name: 'East Elevator Shaft #3', rssi: -71, distance: '3.8m', status: 'Locked' },
  { id: 'BLE_BCN_03', name: 'Central EV Transformer', rssi: -78, distance: '7.2m', status: 'Locked' },
];

const BAYS_B2: ParkingBay[] = [
  { id: '1', code: 'B2-01', type: 'standard', isAvailable: false },
  { id: '2', code: 'B2-02', type: 'standard', isAvailable: false },
  { id: '3', code: 'B2-03', type: 'ev', isAvailable: true, powerKw: 60 },
  { id: '4', code: 'B2-04', type: 'ev', isAvailable: true, powerKw: 150 },
  { id: '5', code: 'B2-05', type: 'reserved', isAvailable: false },
  { id: '6', code: 'B2-06', type: 'standard', isAvailable: true },
  { id: '7', code: 'B2-07', type: 'standard', isAvailable: false },
  { id: '8', code: 'B2-08', type: 'ev', isAvailable: true, powerKw: 60 },
  { id: '9', code: 'B2-09', type: 'standard', isAvailable: true },
  { id: '10', code: 'B2-10', type: 'standard', isAvailable: false },
  { id: '11', code: 'B2-11', type: 'reserved', isAvailable: true },
  { id: '12', code: 'B2-12', type: 'ev', isAvailable: false, powerKw: 150 },
];

export default function IndoorParkingModal() {
  const [selectedFloor, setSelectedFloor] = useState(1); // B2
  const [selectedBay, setSelectedBay] = useState<ParkingBay | null>(BAYS_B2[3]); // B2-04 (150kW EV)

  const handleReserve = () => {
    if (!selectedBay) return;
    Alert.alert(
      'Bay Reserved & Indoor Route Active! 🚗',
      `Bay ${selectedBay.code} (${selectedBay.type.toUpperCase()}) held for 15 minutes. Follow the blue indoor beacon corridor on Floor B2.`,
      [
        {
          text: 'Start Indoor Navigation',
          onPress: () => {
            router.back();
            router.push('/modal');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <SquareParking size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Multilevel Indoor Parking</Text>
            <Text style={styles.headerSub}>BLE Beacon Trilateration & Live Bay Occupancy</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color="#111C2D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Facility Info Card */}
        <View style={styles.facilityCard}>
          <View style={styles.facilityTop}>
            <View>
              <Text style={styles.facilityName}>DLF Cyber Hub Parking Garage</Text>
              <Text style={styles.facilityAddress}>DLF Cyber City, Sector 24, Gurugram</Text>
            </View>
            <View style={styles.ratePill}>
              <Text style={styles.rateText}>₹50/hr</Text>
            </View>
          </View>

          <View style={styles.facilityStats}>
            <View style={styles.facilityStat}>
              <Text style={styles.statVal}>148 / 320</Text>
              <Text style={styles.statSub}>Total Bays Free</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.facilityStat}>
              <Text style={[styles.statVal, { color: '#00C06D' }]}>12 / 18</Text>
              <Text style={styles.statSub}>EV Chargers Free</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.facilityStat}>
              <Text style={[styles.statVal, { color: '#0096FF' }]}>Level B2</Text>
              <Text style={styles.statSub}>Current Floor</Text>
            </View>
          </View>
        </View>

        {/* BLE Beacon Trilateration Sensor Box */}
        <View style={styles.beaconCard}>
          <View style={styles.beaconHeader}>
            <Radio size={16} color="#0096FF" />
            <Text style={styles.beaconTitle}>Active BLE Beacons (Log-Distance Path Loss)</Text>
            <View style={styles.liveDot} />
          </View>

          {BEACONS.map((b) => (
            <View key={b.id} style={styles.beaconRow}>
              <View style={styles.beaconLeft}>
                <Wifi size={13} color="#00C06D" />
                <View>
                  <Text style={styles.beaconName}>{b.name}</Text>
                  <Text style={styles.beaconId}>{b.id}</Text>
                </View>
              </View>
              <View style={styles.beaconRight}>
                <Text style={styles.beaconDistance}>{b.distance}</Text>
                <Text style={styles.beaconRssi}>{b.rssi} dBm</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Floor Level Tabs */}
        <View style={styles.floorTabs}>
          {FLOORS.map((floor, idx) => (
            <TouchableOpacity
              key={floor}
              style={[styles.floorTab, selectedFloor === idx && styles.floorTabActive]}
              onPress={() => setSelectedFloor(idx)}
              activeOpacity={0.8}>
              <Layers size={13} color={selectedFloor === idx ? '#fff' : '#707884'} />
              <Text style={[styles.floorTabText, selectedFloor === idx && styles.floorTabTextActive]}>
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visual Parking Bays Grid */}
        <View style={styles.baysCard}>
          <View style={styles.baysHeader}>
            <Text style={styles.baysTitle}>Select Parking Bay on Floor B2</Text>
            <View style={styles.baysLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#00C06D' }]} />
                <Text style={styles.legendText}>Free</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0096FF' }]} />
                <Text style={styles.legendText}>EV</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>Occupied</Text>
              </View>
            </View>
          </View>

          {/* 3x4 Bay Grid */}
          <View style={styles.bayGrid}>
            {BAYS_B2.map((bay) => {
              const isSelected = selectedBay?.id === bay.id;
              let bayBg = '#F8FAFF';
              let bayBorder = '#E8EEFF';

              if (!bay.isAvailable) {
                bayBg = '#FFF0F0';
                bayBorder = '#FFCDD2';
              } else if (bay.type === 'ev') {
                bayBg = '#E8F4FF';
                bayBorder = '#90CAF9';
              } else {
                bayBg = '#E8F8EE';
                bayBorder = '#A5D6A7';
              }

              if (isSelected) {
                bayBorder = '#0096FF';
              }

              return (
                <TouchableOpacity
                  key={bay.id}
                  style={[
                    styles.baySlot,
                    { backgroundColor: bayBg, borderColor: bayBorder },
                    isSelected && styles.baySlotSelected,
                  ]}
                  disabled={!bay.isAvailable}
                  onPress={() => setSelectedBay(bay)}
                  activeOpacity={0.8}>
                  {bay.type === 'ev' && <Zap size={11} color="#0096FF" />}
                  <Text style={[styles.bayCode, isSelected && { color: '#0096FF', fontWeight: '900' }]}>
                    {bay.code}
                  </Text>
                  <Text style={styles.bayTypeLabel}>
                    {!bay.isAvailable ? 'Taken' : bay.type === 'ev' ? `${bay.powerKw}kW` : 'Free'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Bay Action Card */}
        {selectedBay && (
          <View style={styles.selectedBayCard}>
            <View style={styles.selectedBayTop}>
              <View>
                <Text style={styles.selectedBayCode}>Selected Bay: {selectedBay.code}</Text>
                <Text style={styles.selectedBaySub}>
                  Floor B2 · {selectedBay.type === 'ev' ? `EV Fast Charging (${selectedBay.powerKw} kW)` : 'Standard Bay'}
                </Text>
              </View>
              <View style={styles.availableTag}>
                <CheckCircle2 size={12} color="#00C06D" />
                <Text style={styles.availableTagText}>Available</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.reserveBtn} onPress={handleReserve} activeOpacity={0.85}>
              <Navigation size={16} color="#ffffff" />
              <Text style={styles.reserveBtnText}>Reserve Bay & Start Indoor Routing</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111C2D' },
  headerSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { padding: 16, gap: 14 },

  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  facilityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  facilityName: { fontSize: 15, fontWeight: '800', color: '#111C2D' },
  facilityAddress: { fontSize: 11, color: '#707884', marginTop: 2 },
  ratePill: { backgroundColor: '#E8F4FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rateText: { fontSize: 11, fontWeight: '800', color: '#0096FF' },
  facilityStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  facilityStat: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: '#111C2D' },
  statSub: { fontSize: 9, color: '#707884', marginTop: 2 },
  vDivider: { width: 1, height: 28, backgroundColor: '#E8EEFF' },

  beaconCard: { backgroundColor: '#E8F4FF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#D0E4FF' },
  beaconHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  beaconTitle: { fontSize: 12, fontWeight: '700', color: '#0061A7', flex: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C06D' },
  beaconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#D8E8FF' },
  beaconLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  beaconName: { fontSize: 11, fontWeight: '700', color: '#111C2D' },
  beaconId: { fontSize: 9, color: '#707884', fontFamily: 'monospace' },
  beaconRight: { alignItems: 'flex-end' },
  beaconDistance: { fontSize: 11, fontWeight: '800', color: '#0061A7' },
  beaconRssi: { fontSize: 9, color: '#707884' },

  floorTabs: { flexDirection: 'row', gap: 8 },
  floorTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEFF' },
  floorTabActive: { backgroundColor: '#0096FF', borderColor: '#0096FF' },
  floorTabText: { fontSize: 11, fontWeight: '700', color: '#3F4753' },
  floorTabTextActive: { color: '#ffffff' },

  baysCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E8EEFF' },
  baysHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  baysTitle: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  baysLegend: { flexDirection: 'row', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, color: '#707884' },

  bayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  baySlot: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  baySlotSelected: { borderWidth: 2.5, borderColor: '#0096FF' },
  bayCode: { fontSize: 11, fontWeight: '700', color: '#111C2D' },
  bayTypeLabel: { fontSize: 8, color: '#707884', marginTop: 1 },

  selectedBayCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#0096FF', shadowColor: '#0096FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  selectedBayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  selectedBayCode: { fontSize: 15, fontWeight: '800', color: '#111C2D' },
  selectedBaySub: { fontSize: 11, color: '#707884', marginTop: 2 },
  availableTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F8EE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  availableTagText: { fontSize: 10, fontWeight: '800', color: '#00C06D' },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    borderRadius: 14,
    paddingVertical: 14,
  },
  reserveBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
});
