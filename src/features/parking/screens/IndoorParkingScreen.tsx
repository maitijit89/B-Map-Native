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
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Radio,
  Zap,
  Navigation as NavIcon,
  Layers,
  CheckCircle2,
  Wifi,
} from 'lucide-react-native';
import { storageService } from '@/shared/services';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

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
  const colors = useThemeColors();
  const [selectedFloor, setSelectedFloor] = useState(1); // B2
  const [selectedBay, setSelectedBay] = useState<ParkingBay | null>(BAYS_B2[3]); // B2-04 (150kW EV)

  const handleReserve = async () => {
    if (!selectedBay) return;
    haptics.success();
    await storageService.addSavedPlace({
      name: `Parked Vehicle: Slot ${selectedBay.code}`,
      address: `DLF Cyber Hub Parking Garage (${FLOORS[selectedFloor]})`,
      latitude: 28.4952,
      longitude: 77.0888,
      category: 'Parking',
    });

    Alert.alert(
      'Bay Reserved & Parked Spot Saved! 🚗',
      `Bay ${selectedBay.code} (${selectedBay.type.toUpperCase()}) held for 15 minutes. Location saved to your profile ("Find My Car").`,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="Multilevel Indoor Parking"
        onBackPress={() => {
          haptics.light();
          router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Facility Info Card */}
        <Animated.View entering={FadeInDown.duration(350).springify().damping(16)}>
          <Card variant="elevated" padding="md" style={styles.facilityCard}>
            <View style={styles.facilityTop}>
              <View>
                <Text style={[styles.facilityName, { color: colors.onSurface }]}>DLF Cyber Hub Parking Garage</Text>
                <Text style={[styles.facilityAddress, { color: colors.onSurfaceVariant }]}>DLF Cyber City, Sector 24, Gurugram</Text>
              </View>
              <View style={[styles.ratePill, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.rateText, { color: colors.primary }]}>₹50/hr</Text>
              </View>
            </View>

            <View style={[styles.facilityStats, { borderTopColor: colors.surfaceContainerHigh }]}>
              <View style={styles.facilityStat}>
                <Text style={[styles.statVal, { color: colors.onSurface }]}>148 / 320</Text>
                <Text style={[styles.statSub, { color: colors.onSurfaceVariant }]}>Total Bays Free</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: colors.surfaceContainerHigh }]} />
              <View style={styles.facilityStat}>
                <Text style={[styles.statVal, { color: colors.trafficGreen }]}>12 / 18</Text>
                <Text style={[styles.statSub, { color: colors.onSurfaceVariant }]}>EV Chargers Free</Text>
              </View>
              <View style={[styles.vDivider, { backgroundColor: colors.surfaceContainerHigh }]} />
              <View style={styles.facilityStat}>
                <Text style={[styles.statVal, { color: colors.primary }]}>Level B2</Text>
                <Text style={[styles.statSub, { color: colors.onSurfaceVariant }]}>Current Floor</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* BLE Beacon Trilateration Sensor Box */}
        <Animated.View entering={FadeInDown.delay(100).duration(350).springify().damping(16)}>
          <Card variant="flat" padding="md" style={styles.beaconCard}>
            <View style={styles.beaconHeader}>
              <Radio size={16} color={colors.primary} />
              <Text style={[styles.beaconTitle, { color: colors.primary }]}>Active BLE Beacons (Log-Distance Path Loss)</Text>
              <View style={[styles.liveDot, { backgroundColor: colors.trafficGreen }]} />
            </View>

            {BEACONS.map((b) => (
              <View key={b.id} style={[styles.beaconRow, { borderTopColor: colors.surfaceContainerHigh }]}>
                <View style={styles.beaconLeft}>
                  <Wifi size={13} color={colors.trafficGreen} />
                  <View>
                    <Text style={[styles.beaconName, { color: colors.onSurface }]}>{b.name}</Text>
                    <Text style={[styles.beaconId, { color: colors.onSurfaceVariant }]}>{b.id}</Text>
                  </View>
                </View>
                <View style={styles.beaconRight}>
                  <Text style={[styles.beaconDistance, { color: colors.primary }]}>{b.distance}</Text>
                  <Text style={[styles.beaconRssi, { color: colors.onSurfaceVariant }]}>{b.rssi} dBm</Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Floor Level Tabs */}
        <Animated.View entering={FadeInDown.delay(150).duration(350).springify().damping(16)}>
          <View style={styles.floorTabs}>
            {FLOORS.map((floor, idx) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.floorTab,
                  { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceContainerHigh },
                  selectedFloor === idx && {
                    backgroundColor: colors.primaryContainer,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => {
                  haptics.selection();
                  setSelectedFloor(idx);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select floor ${floor}`}
                accessibilityState={{ selected: selectedFloor === idx }}
                activeOpacity={0.8}>
                <Layers size={13} color={selectedFloor === idx ? colors.onPrimary : colors.onSurfaceVariant} />
                <Text
                  style={[
                    styles.floorTabText,
                    { color: colors.onSurfaceVariant },
                    selectedFloor === idx && { color: colors.onPrimary, fontWeight: '700' },
                  ]}>
                  {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Visual Parking Bays Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(350).springify().damping(16)}>
          <Card variant="elevated" padding="md" style={styles.baysCard}>
            <View style={styles.baysHeader}>
              <Text style={[styles.baysTitle, { color: colors.onSurface }]}>Select Parking Bay on Floor B2</Text>
              <View style={styles.baysLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.trafficGreen }]} />
                  <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Free</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>EV</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Occupied</Text>
                </View>
              </View>
            </View>

            {/* 3x4 Bay Grid */}
            <View style={styles.bayGrid}>
              {BAYS_B2.map((bay) => {
                const isSelected = selectedBay?.id === bay.id;
                let bayBg = colors.surfaceContainerLow;
                let bayBorder = colors.surfaceContainerHigh;

                if (!bay.isAvailable) {
                  bayBg = colors.errorContainer + '30';
                  bayBorder = colors.errorContainer;
                } else if (bay.type === 'ev') {
                  bayBg = colors.primaryContainer + '20';
                  bayBorder = colors.primary;
                } else {
                  bayBg = colors.surfaceContainerLow;
                  bayBorder = colors.outlineVariant;
                }

                if (isSelected) {
                  bayBorder = colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={bay.id}
                    style={[
                      styles.baySlot,
                      { backgroundColor: bayBg, borderColor: bayBorder },
                      isSelected && { borderWidth: 2.5, borderColor: colors.primary },
                    ]}
                    disabled={!bay.isAvailable}
                    onPress={() => {
                      haptics.selection();
                      setSelectedBay(bay);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Bay ${bay.code}, ${bay.type === 'ev' ? 'EV charger' : 'Standard'}, ${bay.isAvailable ? 'Available' : 'Occupied'}`}
                    accessibilityState={{ selected: isSelected, disabled: !bay.isAvailable }}
                    activeOpacity={0.8}>
                    {bay.type === 'ev' && <Zap size={11} color={colors.primary} />}
                    <Text
                      style={[
                        styles.bayCode,
                        { color: colors.onSurface },
                        isSelected && { color: colors.primary, fontWeight: '900' },
                      ]}>
                      {bay.code}
                    </Text>
                    <Text style={[styles.bayTypeLabel, { color: colors.onSurfaceVariant }]}>
                      {!bay.isAvailable ? 'Taken' : bay.type === 'ev' ? `${bay.powerKw}kW` : 'Free'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* Selected Bay Action Card */}
        {selectedBay && (
          <Animated.View entering={FadeInDown.duration(300).springify().damping(16)}>
            <Card
              variant="elevated"
              padding="md"
              style={[styles.selectedBayCard, { borderColor: colors.primary }]}>
              <View style={styles.selectedBayTop}>
                <View>
                  <Text style={[styles.selectedBayCode, { color: colors.onSurface }]}>Selected Bay: {selectedBay.code}</Text>
                  <Text style={[styles.selectedBaySub, { color: colors.onSurfaceVariant }]}>
                    Floor B2 · {selectedBay.type === 'ev' ? `EV Fast Charging (${selectedBay.powerKw} kW)` : 'Standard Bay'}
                  </Text>
                </View>
                <View style={[styles.availableTag, { backgroundColor: colors.surfaceContainerLow }]}>
                  <CheckCircle2 size={12} color={colors.trafficGreen} />
                  <Text style={[styles.availableTagText, { color: colors.trafficGreen }]}>Available</Text>
                </View>
              </View>

              <Button
                title="Reserve Bay & Start Indoor Routing"
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<NavIcon size={16} color={colors.onPrimary} />}
                onPress={handleReserve}
              />
            </Card>
          </Animated.View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 100 },
  facilityCard: { gap: Spacing.sm },
  facilityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  facilityName: { ...Typography.titleMedium, fontWeight: '800' },
  facilityAddress: { ...Typography.bodySmall, marginTop: 2 },
  ratePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  rateText: { ...Typography.labelSmall, fontWeight: '800' },
  facilityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  facilityStat: { alignItems: 'center' },
  statVal: { ...Typography.titleSmall, fontWeight: '800' },
  statSub: { ...Typography.labelSmall, fontSize: 10, marginTop: 2 },
  vDivider: { width: 1, height: 28 },

  beaconCard: { gap: Spacing.xs },
  beaconHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  beaconTitle: { ...Typography.labelSmall, fontWeight: '700', flex: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  beaconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  beaconLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  beaconName: { ...Typography.labelSmall, fontWeight: '700' },
  beaconId: { ...Typography.labelSmall, fontSize: 10, fontFamily: 'monospace' },
  beaconRight: { alignItems: 'flex-end' },
  beaconDistance: { ...Typography.labelSmall, fontWeight: '800' },
  beaconRssi: { ...Typography.labelSmall, fontSize: 10 },

  floorTabs: { flexDirection: 'row', gap: 8 },
  floorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  floorTabText: { ...Typography.labelSmall, fontWeight: '700' },

  baysCard: { gap: Spacing.sm },
  baysHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  baysTitle: { ...Typography.labelLarge, fontWeight: '700' },
  baysLegend: { flexDirection: 'row', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { ...Typography.labelSmall, fontSize: 10 },

  bayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  baySlot: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  bayCode: { ...Typography.labelSmall, fontWeight: '700' },
  bayTypeLabel: { ...Typography.labelSmall, fontSize: 9, marginTop: 1 },

  selectedBayCard: { gap: Spacing.md, borderWidth: 1.5 },
  selectedBayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedBayCode: { ...Typography.titleMedium, fontWeight: '800' },
  selectedBaySub: { ...Typography.bodySmall, marginTop: 2 },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  availableTagText: { ...Typography.labelSmall, fontWeight: '800' },
});
