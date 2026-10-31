import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { fluidEntering, fluidLayout } from '@/shared/animations';

import {
  Car,
  Bike,
  Truck,
  Plus,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  SectionHeader,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';
import { notificationService } from '@/shared/services';

interface Vehicle {
  id: string;
  name: string;
  numberPlate: string;
  type: 'car' | 'bike' | 'commercial';
  powertrain: 'EV' | 'Petrol' | 'Diesel';
  vehicleClass: string;
  fastagTagId: string;
  isDefault: boolean;
}

const VEHICLES: Vehicle[] = [
  {
    id: '1',
    name: 'Tata Nexon EV Max',
    numberPlate: 'DL-1C-AB-4921',
    type: 'car',
    powertrain: 'EV',
    vehicleClass: 'Class 4 (Car/Jeep)',
    fastagTagId: 'NETC-IDBI-89240192',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Royal Enfield Hunter 350',
    numberPlate: 'HR-26-EQ-1904',
    type: 'bike',
    powertrain: 'Petrol',
    vehicleClass: 'Two-Wheeler (Toll Free)',
    fastagTagId: 'N/A',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Mahindra Bolero Pickup',
    numberPlate: 'UP-16-BX-7720',
    type: 'commercial',
    powertrain: 'Diesel',
    vehicleClass: 'Class 5 (LCV Commercial)',
    fastagTagId: 'NETC-ICICI-11029481',
    isDefault: false,
  },
];

const RECENT_TOLL_TRANSACTIONS = [
  {
    id: 'tx_1',
    plaza: 'Kherki Daula Toll Plaza',
    highway: 'NH-48 Delhi-Jaipur',
    amount: '₹155',
    date: 'Yesterday, 07:44 AM',
    lane: 'Lane 04 (Express RFID)',
    status: 'SUCCESS',
  },
  {
    id: 'tx_2',
    plaza: 'Jewar Toll Plaza',
    highway: 'Yamuna Expressway',
    amount: '₹165',
    date: '10 Oct, 06:12 PM',
    lane: 'Lane 02 (FASTag Ded.)',
    status: 'SUCCESS',
  },
  {
    id: 'tx_3',
    plaza: 'Manesar Toll Gate',
    highway: 'NH-48 km 42',
    amount: '₹130',
    date: '08 Oct, 09:30 AM',
    lane: 'Lane 06 (Express RFID)',
    status: 'SUCCESS',
  },
];

export default function VehicleFleetScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState('1');
  const [fastagBalance, setFastagBalance] = useState(1840);

  const activeVehicle = useMemo(() => {
    return vehiclesList.find((v) => v.id === selectedVehicleId) || vehiclesList[0];
  }, [vehiclesList, selectedVehicleId]);

  const handleInstantRecharge = useCallback((amount: number) => {
    haptics.medium();
    setFastagBalance((prev) => {
      const next = prev + amount;

      // Broadcast FASTag recharge notification
      notificationService.addNotification({
        title: 'FASTag Recharged 💳',
        message: `₹${amount} added to FASTag Wallet. New NETC balance: ₹${next.toLocaleString('en-IN')}`,
        type: 'toll',
        actionRoute: '/vehicle-fleet',
      });

      Alert.alert(
        'Recharge Successful! 💳',
        `₹${amount} added to FASTag Wallet via UPI. Fresh NETC balance: ₹${next}.`
      );
      return next;
    });
  }, []);

  const handleAddNewVehicle = useCallback(() => {
    haptics.light();
    Alert.alert(
      'Register Vehicle to Fleet',
      'Select a verified VAHAN vehicle profile to link NPCI FASTag:',
      [
        {
          text: 'Hyundai Ioniq 5 (EV)',
          onPress: () => {
            haptics.success();
            const newVeh: Vehicle = {
              id: `veh_${Date.now()}`,
              name: 'Hyundai Ioniq 5 Long Range',
              numberPlate: 'DL-3C-CC-7788',
              type: 'car',
              powertrain: 'EV',
              vehicleClass: 'Class 4 (Car/EV)',
              fastagTagId: 'NETC-HDFC-99201948',
              isDefault: false,
            };
            setVehiclesList((prev) => [...prev, newVeh]);
            setSelectedVehicleId(newVeh.id);
            notificationService.addNotification({
              title: 'Vehicle Linked 🚗',
              message: 'Hyundai Ioniq 5 linked with NETC FASTag wallet.',
              type: 'system',
              actionRoute: '/vehicle-fleet',
            });
          },
        },
        {
          text: 'Ather 450X (Smart EV Scooter)',
          onPress: () => {
            haptics.success();
            const newVeh: Vehicle = {
              id: `veh_${Date.now()}`,
              name: 'Ather 450X Gen 3',
              numberPlate: 'HR-26-AT-4509',
              type: 'bike',
              powertrain: 'EV',
              vehicleClass: 'Two-Wheeler (Toll Free)',
              fastagTagId: 'N/A',
              isDefault: false,
            };
            setVehiclesList((prev) => [...prev, newVeh]);
            setSelectedVehicleId(newVeh.id);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleBackPress = useCallback(() => {
    haptics.light();
    router.back();
  }, []);

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'bike':
        return <Bike size={20} color={colors.primary} />;
      case 'commercial':
        return <Truck size={20} color={colors.primary} />;
      case 'car':
      default:
        return <Car size={20} color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="Vehicle Fleet & FASTag"
        subtitle="NPCI NETC Switch · Multi-Vehicle Telematics"
        onBackPress={handleBackPress}
        rightAction={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primaryContainer }]}
            onPress={handleAddNewVehicle}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Add new vehicle"
            activeOpacity={0.7}>
            <Plus size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* FASTag Balance Master Card */}
        <Animated.View entering={fluidEntering(0)}>
          <Card
            variant="elevated"
            padding="lg"
            style={[
              styles.walletCard,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}>
            <View style={styles.walletHeader}>
              <View style={styles.fastagLogoTag}>
                <Text style={[styles.fastagLogoText, { color: colors.primary }]}>FASTag</Text>
              </View>
              <View style={styles.kycBadge}>
                <CheckCircle2 size={12} color="#ffffff" />
                <Text style={styles.kycText}>NPCI KYC VERIFIED</Text>
              </View>
            </View>

            <Text style={styles.walletBalanceLabel}>Total Available Highway Balance</Text>
            <View style={styles.walletBalanceRow}>
              <IndianRupee size={28} color="#ffffff" />
              <Text style={styles.walletBalanceValue}>{fastagBalance.toLocaleString('en-IN')}</Text>
              <Text style={styles.walletBalanceDec}>.50</Text>
            </View>

            <View style={styles.tagMetaRow}>
              <Text style={styles.tagMetaText}>Tag ID: {activeVehicle.fastagTagId}</Text>
              <Text style={styles.tagMetaText}>Bank: IDBI NETC Switch</Text>
            </View>

            {/* Quick UPI Recharge Chips */}
            <Text style={styles.rechargeLabel}>Instant UPI One-Tap Top-Up:</Text>
            <View style={styles.rechargeChipRow}>
              {[500, 1000, 2000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.rechargeChip}
                  onPress={() => handleInstantRecharge(amt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Top up ${amt} rupees`}
                  activeOpacity={0.8}>
                  <Text style={styles.rechargeChipText}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Fleet Vehicles Switcher */}
        <SectionHeader
          title="Linked Vehicles"
          subtitle="Select vehicle for route toll calculation"
          actionText="+ Add Vehicle"
          onActionPress={handleAddNewVehicle}
        />

        <View style={styles.vehicleList}>
          {vehiclesList.map((v, index) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <Animated.View
                key={v.id}
                entering={fluidEntering(20 * (index + 1))}
                layout={fluidLayout}>
                <Card
                  variant={isSelected ? 'glass' : 'flat'}
                  padding="md"
                  style={[
                    styles.vehicleCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.surfaceContainerHigh,
                      backgroundColor: isSelected ? colors.surfaceContainerLow : colors.surfaceContainerLowest,
                    },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedVehicleId(v.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${v.name}, ${v.numberPlate}, ${v.vehicleClass}${isSelected ? ', selected' : ''}`}>
                  <View style={styles.vehicleCardLeft}>
                    <View style={[styles.vehicleIconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                      {getVehicleIcon(v.type)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.vehicleName, { color: colors.onSurface }]}>{v.name}</Text>
                      <Text style={[styles.vehiclePlate, { color: colors.onSurfaceVariant }]}>
                        {v.numberPlate} · {v.vehicleClass}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.activeVehiclePill, { backgroundColor: colors.primaryContainer }]}>
                        <CheckCircle2 size={12} color={colors.primary} />
                        <Text style={[styles.activeVehiclePillText, { color: colors.primary }]}>Active</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Recent Toll Statement */}
        <SectionHeader
          title="Recent Toll Statement"
          subtitle="Real-time RFID Toll Deduction Feeds"
        />

        <Card variant="flat" padding="md" style={styles.statementCard}>
          {RECENT_TOLL_TRANSACTIONS.map((tx, idx) => (
            <Animated.View
              key={tx.id}
              entering={fluidEntering(idx * 25)}>
              <View
                style={[
                  styles.txRow,
                  {
                    borderBottomColor: colors.surfaceContainerHigh,
                    borderBottomWidth: idx < RECENT_TOLL_TRANSACTIONS.length - 1 ? 1 : 0,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.txPlaza, { color: colors.onSurface }]}>{tx.plaza}</Text>
                  <Text style={[styles.txMeta, { color: colors.onSurfaceVariant }]}>
                    {tx.highway} · {tx.date}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: colors.primary }]}>{tx.amount}</Text>
              </View>
            </Animated.View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCard: {
    borderRadius: Radius.xxl,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fastagLogoTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  fastagLogoText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kycText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  walletBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 16,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  walletBalanceValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  walletBalanceDec: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '700',
  },
  tagMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagMetaText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  rechargeLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 14,
  },
  rechargeChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  rechargeChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 10,
    minHeight: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  vehicleList: {
    gap: 10,
  },
  vehicleCard: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
  vehicleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  vehiclePlate: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  activeVehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  activeVehiclePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statementCard: {
    borderRadius: Radius.xl,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
  },
  txPlaza: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  txMeta: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  txAmount: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
});
