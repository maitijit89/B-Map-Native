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
  ArrowLeft,
  Zap,
  Plug,
  Navigation,
  Clock,
  IndianRupee,
  ShieldCheck,
  BatteryCharging,
  Star,
  CircleDot,
  CheckCircle2,
  Copy,
  Coffee,
  Wifi,
} from 'lucide-react-native';
import { storageService } from '@/shared/services';

interface ConnectorBay {
  id: string;
  type: string;
  powerKw: number;
  availableGuns: number;
  totalGuns: number;
  pricePerKwh: number;
  voltageRange: string;
}

const CONNECTOR_BAYS: ConnectorBay[] = [
  {
    id: '1',
    type: 'CCS2 Dual Gun (DC Fast)',
    powerKw: 150,
    availableGuns: 2,
    totalGuns: 2,
    pricePerKwh: 18,
    voltageRange: '200V - 1000V DC',
  },
  {
    id: '2',
    type: 'CCS2 Single Gun (DC Standard)',
    powerKw: 60,
    availableGuns: 1,
    totalGuns: 2,
    pricePerKwh: 15,
    voltageRange: '150V - 750V DC',
  },
  {
    id: '3',
    type: 'Type 2 Mennekes (AC Fast)',
    powerKw: 22,
    availableGuns: 1,
    totalGuns: 2,
    pricePerKwh: 12,
    voltageRange: '415V Three-Phase AC',
  },
];

export default function EvStationScreen() {
  const [selectedBayId, setSelectedBayId] = useState<string>('1');
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const currentSoc = 22; // Current vehicle battery SoC %

  const activeBay = CONNECTOR_BAYS.find((b) => b.id === selectedBayId) || CONNECTOR_BAYS[0];

  // Battery simulation for 60 kWh battery pack
  const batteryCapacityKwh = 60;
  const energyNeededKwh = ((targetSoc - currentSoc) / 100) * batteryCapacityKwh;
  const chargingTimeMinutes = Math.round((energyNeededKwh / activeBay.powerKw) * 60 + 4);
  const totalCost = Math.round(energyNeededKwh * activeBay.pricePerKwh);

  const handleReserveSlot = async () => {
    const reservationId = `EZ-${Math.floor(1000 + Math.random() * 9000)}`;
    await storageService.savePreferences({
      evConnectorTypes: [activeBay.type],
    });

    Alert.alert(
      'Charging Gun Reserved! ⚡',
      `Gun #1 (${activeBay.type}) held for your vehicle for 15 minutes. Session token: #${reservationId}.\nEst. Cost: ₹${totalCost}`,
      [
        {
          text: 'Route to Station',
          onPress: () => router.push('/modal'),
        },
      ]
    );
  };

  const handleCopyDigiPin = () => {
    Alert.alert('DigiPIN Copied', '28J4-K8M2-9P copied to clipboard (4m × 4m charging bay centroid).');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#111C2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EV Supercharger Hub</Text>
        <TouchableOpacity
          style={styles.navTopBtn}
          onPress={() => router.push('/modal')}
          activeOpacity={0.7}>
          <Navigation size={18} color="#0096FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Station Banner Card */}
        <View style={styles.stationCard}>
          <View style={styles.stationHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandBadge}>
                <Zap size={12} color="#0096FF" />
                <Text style={styles.brandBadgeText}>TATA POWER EZ CHARGE</Text>
              </View>
              <Text style={styles.stationName}>Cyber City Multi-Modal EV Hub</Text>
              <Text style={styles.stationAddress}>Building 10, DLF Cyber City, Gurugram</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={14} color="#FF9800" fill="#FF9800" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* DigiPIN 4m x 4m Card */}
          <TouchableOpacity
            style={styles.digiRow}
            onPress={handleCopyDigiPin}
            activeOpacity={0.8}>
            <View style={styles.digiTag}>
              <Text style={styles.digiTagText}>DigiPIN</Text>
            </View>
            <Text style={styles.digiCode}>28J4-K8M2-9P</Text>
            <Text style={styles.digiHint}>Bay precision (Tap to copy)</Text>
            <Copy size={13} color="#707884" />
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View style={styles.availPill}>
              <CircleDot size={10} color="#00C06D" />
              <Text style={styles.availText}>4 of 6 Fast Guns Free</Text>
            </View>
            <Text style={styles.timingText}>Open 24/7 · Security Guarded</Text>
          </View>
        </View>

        {/* Connector Selection Grid */}
        <Text style={styles.sectionTitle}>Select Connector Standard</Text>
        <View style={styles.connectorList}>
          {CONNECTOR_BAYS.map((bay) => {
            const isSelected = bay.id === selectedBayId;
            return (
              <TouchableOpacity
                key={bay.id}
                style={[styles.connectorCard, isSelected && styles.connectorCardSelected]}
                onPress={() => setSelectedBayId(bay.id)}
                activeOpacity={0.85}>
                <View style={styles.connectorCardTop}>
                  <View style={styles.connectorTitleRow}>
                    <Plug size={16} color={isSelected ? '#0096FF' : '#707884'} />
                    <Text style={styles.connectorType}>{bay.type}</Text>
                  </View>
                  <View style={styles.powerBadge}>
                    <Text style={styles.powerText}>{bay.powerKw} kW</Text>
                  </View>
                </View>

                <View style={styles.connectorMetaRow}>
                  <Text style={styles.voltageText}>{bay.voltageRange}</Text>
                  <Text style={styles.priceText}>₹{bay.pricePerKwh} / kWh</Text>
                </View>

                <View style={styles.gunsAvailRow}>
                  <CheckCircle2 size={12} color="#00C06D" />
                  <Text style={styles.gunsAvailText}>
                    {bay.availableGuns} of {bay.totalGuns} guns available now
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Charging & Energy Estimator */}
        <View style={styles.estimatorCard}>
          <View style={styles.estimatorHeader}>
            <BatteryCharging size={20} color="#0096FF" />
            <Text style={styles.estimatorTitle}>Charge Duration & Cost Simulator</Text>
          </View>
          <Text style={styles.estimatorSub}>
            Estimated for 60 kWh EV Pack (Tata Nexon EV Max / MG ZS EV)
          </Text>

          {/* SoC Progress Bar */}
          <View style={styles.socContainer}>
            <View style={styles.socLabels}>
              <Text style={styles.socLabelText}>Current: {currentSoc}%</Text>
              <Text style={[styles.socLabelText, { color: '#0096FF', fontWeight: '700' }]}>
                Target: {targetSoc}%
              </Text>
            </View>

            <View style={styles.socBarTrack}>
              <View style={[styles.socBarFillCurrent, { width: `${currentSoc}%` }]} />
              <View
                style={[
                  styles.socBarFillTarget,
                  { width: `${targetSoc - currentSoc}%`, left: `${currentSoc}%` },
                ]}
              />
            </View>

            {/* Target Percentage Chips */}
            <View style={styles.socChipRow}>
              {[50, 80, 100].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={[styles.socChip, targetSoc === pct && styles.socChipActive]}
                  onPress={() => setTargetSoc(pct)}
                  activeOpacity={0.8}>
                  <Text
                    style={[styles.socChipText, targetSoc === pct && styles.socChipTextActive]}>
                    {pct}% SoC {pct === 80 ? '(Recommended)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimates Row */}
          <View style={styles.estimatesGrid}>
            <View style={styles.estimateBox}>
              <Clock size={16} color="#0096FF" />
              <Text style={styles.estimateVal}>{chargingTimeMinutes} min</Text>
              <Text style={styles.estimateLbl}>Est. Duration</Text>
            </View>

            <View style={styles.estimateDivider} />

            <View style={styles.estimateBox}>
              <Zap size={16} color="#00C06D" />
              <Text style={styles.estimateVal}>{energyNeededKwh.toFixed(1)} kWh</Text>
              <Text style={styles.estimateLbl}>Energy Output</Text>
            </View>

            <View style={styles.estimateDivider} />

            <View style={styles.estimateBox}>
              <IndianRupee size={16} color="#FF9800" />
              <Text style={styles.estimateVal}>₹{totalCost}</Text>
              <Text style={styles.estimateLbl}>Estimated Bill</Text>
            </View>
          </View>
        </View>

        {/* Amenities Grid */}
        <View style={styles.amenitiesCard}>
          <Text style={styles.amenitiesTitle}>Station Amenities</Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}>
              <Coffee size={18} color="#0096FF" />
              <Text style={styles.amenityLabel}>Café & Dining</Text>
            </View>
            <View style={styles.amenityItem}>
              <Wifi size={18} color="#0096FF" />
              <Text style={styles.amenityLabel}>Free Wi-Fi</Text>
            </View>
            <View style={styles.amenityItem}>
              <ShieldCheck size={18} color="#00C06D" />
              <Text style={styles.amenityLabel}>24/7 Security</Text>
            </View>
            <View style={styles.amenityItem}>
              <CheckCircle2 size={18} color="#FF9800" />
              <Text style={styles.amenityLabel}>Clean Restroom</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.reserveBtn}
            onPress={handleReserveSlot}
            activeOpacity={0.85}>
            <Clock size={18} color="#ffffff" />
            <Text style={styles.reserveBtnText}>Reserve Plug Bay (15 Min Hold)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push('/modal')}
            activeOpacity={0.85}>
            <Navigation size={18} color="#0096FF" />
            <Text style={styles.navBtnText}>Start Turn-by-Turn Route</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3FF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111C2D',
  },
  navTopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },

  /* Station Banner Card */
  stationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0096FF',
    letterSpacing: 0.5,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  stationAddress: {
    fontSize: 12,
    color: '#707884',
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9800',
  },
  digiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#D8E3FB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  digiTag: {
    backgroundColor: '#0096FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  digiTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  digiCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0096FF',
    letterSpacing: 0.6,
  },
  digiHint: {
    flex: 1,
    fontSize: 10,
    color: '#707884',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C06D',
  },
  timingText: {
    fontSize: 11,
    color: '#707884',
  },

  /* Connector List */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  connectorList: {
    gap: 10,
  },
  connectorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    gap: 8,
  },
  connectorCardSelected: {
    borderColor: '#0096FF',
    backgroundColor: '#F8FBFF',
  },
  connectorCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectorType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  powerBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  powerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0096FF',
  },
  connectorMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voltageText: {
    fontSize: 11,
    color: '#707884',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  gunsAvailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  gunsAvailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06D',
  },

  /* Estimator Card */
  estimatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  estimatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimatorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  estimatorSub: {
    fontSize: 11,
    color: '#707884',
    marginTop: -6,
  },
  socContainer: {
    gap: 8,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 12,
  },
  socLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socLabelText: {
    fontSize: 11,
    color: '#707884',
  },
  socBarTrack: {
    height: 10,
    backgroundColor: '#E8EEFF',
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  socBarFillCurrent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#00C06D',
  },
  socBarFillTarget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#0096FF',
    opacity: 0.7,
  },
  socChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  socChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D8E3FB',
  },
  socChipActive: {
    backgroundColor: '#0096FF',
    borderColor: '#0096FF',
  },
  socChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707884',
  },
  socChipTextActive: {
    color: '#ffffff',
  },
  estimatesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  estimateBox: {
    alignItems: 'center',
    gap: 4,
  },
  estimateVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  estimateLbl: {
    fontSize: 10,
    color: '#707884',
  },
  estimateDivider: {
    width: 1,
    backgroundColor: '#E8EEFF',
  },

  /* Amenities */
  amenitiesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  amenitiesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amenityItem: {
    alignItems: 'center',
    gap: 6,
  },
  amenityLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3F4753',
  },

  /* Action Buttons */
  actionButtonGroup: {
    gap: 10,
    marginTop: 4,
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F3FF',
    borderWidth: 1.5,
    borderColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 14,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0096FF',
  },
});
