import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Car,
  Bike,
  Truck,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Zap,
  History,
  IndianRupee,
} from 'lucide-react-native';

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
  const [selectedVehicleId, setSelectedVehicleId] = useState('1');
  const [fastagBalance, setFastagBalance] = useState(1840);
  const [autoRecharge, setAutoRecharge] = useState(true);

  const activeVehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];

  const handleInstantRecharge = (amount: number) => {
    setFastagBalance((prev) => prev + amount);
    Alert.alert(
      'Recharge Successful! 💳',
      `₹${amount} added to FASTag Wallet via UPI. Fresh NETC balance: ₹${fastagBalance + amount}.`
    );
  };

  const handleAddNewVehicle = () => {
    Alert.alert(
      'Register New Vehicle',
      'Enter Registration Certificate (RC) details and link NPCI FASTag RFID barcode.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Scan RC Card', onPress: () => Alert.alert('Camera Scanning', 'Scanning VAHAN QR Code on RC card...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#111C2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Fleet & FASTag</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddNewVehicle} activeOpacity={0.7}>
          <Plus size={18} color="#0096FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* FASTag Balance Master Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.fastagLogoTag}>
              <Text style={styles.fastagLogoText}>FASTag</Text>
            </View>
            <View style={styles.kycBadge}>
              <CheckCircle2 size={12} color="#00C06D" />
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
                activeOpacity={0.8}>
                <Text style={styles.rechargeChipText}>+₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fleet Vehicles Switcher */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Linked Vehicles</Text>
          <TouchableOpacity onPress={handleAddNewVehicle}>
            <Text style={styles.sectionAction}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleList}>
          {VEHICLES.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                onPress={() => setSelectedVehicleId(v.id)}
                activeOpacity={0.85}>
                <View style={styles.vehicleCardLeft}>
                  <View
                    style={[
                      styles.vehicleIconCircle,
                      isSelected ? { backgroundColor: '#0096FF' } : { backgroundColor: '#F0F3FF' },
                    ]}>
                    {v.type === 'car' && (
                      <Car size={20} color={isSelected ? '#ffffff' : '#0096FF'} />
                    )}
                    {v.type === 'bike' && (
                      <Bike size={20} color={isSelected ? '#ffffff' : '#0096FF'} />
                    )}
                    {v.type === 'commercial' && (
                      <Truck size={20} color={isSelected ? '#ffffff' : '#0096FF'} />
                    )}
                  </View>

                  <View>
                    <View style={styles.vehicleTitleRow}>
                      <Text style={styles.vehicleName}>{v.name}</Text>
                      {v.powertrain === 'EV' && (
                        <View style={styles.evChip}>
                          <Zap size={10} color="#00C06D" />
                          <Text style={styles.evChipText}>EV</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.numberPlate}>{v.numberPlate}</Text>
                    <Text style={styles.vehicleClass}>{v.vehicleClass}</Text>
                  </View>
                </View>

                {isSelected ? (
                  <View style={styles.activeCheckBadge}>
                    <CheckCircle2 size={18} color="#0096FF" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Auto Recharge Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <ShieldCheck size={18} color="#0096FF" />
              <Text style={styles.settingsTitle}>NHAI Corridor Auto-Passage Rule</Text>
            </View>
            <Switch
              value={autoRecharge}
              onValueChange={setAutoRecharge}
              trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
              thumbColor="#ffffff"
            />
          </View>
          <Text style={styles.settingsDesc}>
            Ensures FASTag never incurs blacklisting penalty. Auto-triggers UPI mandate recharge
            of ₹1,000 whenever wallet falls below ₹300.
          </Text>
          <View style={styles.activeRuleRow}>
            <View
              style={[
                styles.ruleStatusDot,
                { backgroundColor: autoRecharge ? '#00C06D' : '#A0A8B4' },
              ]}
            />
            <Text
              style={[
                styles.ruleStatusText,
                { color: autoRecharge ? '#00C06D' : '#707884' },
              ]}>
              {autoRecharge
                ? 'Auto-Recharge Active via UPI AutoPay'
                : 'Auto-Recharge Paused (Manual Mode)'}
            </Text>
          </View>
        </View>

        {/* Recent Toll Transactions */}
        <View style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <View style={styles.txHeaderLeft}>
              <History size={16} color="#0096FF" />
              <Text style={styles.txTitle}>Recent Toll Crossings</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('All Transactions', 'Full NHAI electronic receipt log exported.')}>
              <Text style={styles.txViewAll}>View Slips</Text>
            </TouchableOpacity>
          </View>

          {RECENT_TOLL_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <Text style={styles.txPlaza}>{tx.plaza}</Text>
                <Text style={styles.txHighway}>{tx.highway} · {tx.lane}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>-{tx.amount}</Text>
                <View style={styles.txSuccessBadge}>
                  <Text style={styles.txSuccessText}>CLEARED</Text>
                </View>
              </View>
            </View>
          ))}
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
  addBtn: {
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

  /* FASTag Wallet Card */
  walletCard: {
    backgroundColor: '#0052CC',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fastagLogoTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fastagLogoText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052CC',
    letterSpacing: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  walletBalanceLabel: {
    fontSize: 11,
    color: '#D8E3FB',
    marginTop: 4,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  walletBalanceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  walletBalanceDec: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D8E3FB',
  },
  tagMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 8,
  },
  tagMetaText: {
    fontSize: 10,
    color: '#D8E3FB',
  },
  rechargeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  rechargeChipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rechargeChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rechargeChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* Fleet Vehicles */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0096FF',
  },
  vehicleList: {
    gap: 10,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
  },
  vehicleCardSelected: {
    borderColor: '#0096FF',
    backgroundColor: '#F8FBFF',
  },
  vehicleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  evChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  evChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00C06D',
  },
  numberPlate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0096FF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  vehicleClass: {
    fontSize: 10,
    color: '#707884',
    marginTop: 1,
  },
  activeCheckBadge: {
    paddingRight: 4,
  },

  /* Settings Card */
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  settingsDesc: {
    fontSize: 11,
    color: '#707884',
    lineHeight: 16,
  },
  activeRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ruleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C06D',
  },
  ruleStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C06D',
  },

  /* Transactions Card */
  transactionsCard: {
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
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    paddingBottom: 8,
  },
  txHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  txViewAll: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0096FF',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFF',
    paddingBottom: 8,
  },
  txLeft: {
    flex: 1,
  },
  txPlaza: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  txHighway: {
    fontSize: 10,
    color: '#707884',
    marginTop: 1,
  },
  txDate: {
    fontSize: 10,
    color: '#A0A8B4',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#BA1A1A',
  },
  txSuccessBadge: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txSuccessText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00C06D',
  },
});
