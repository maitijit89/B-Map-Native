import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { VehicleClass } from '@/types';
import {
  NATIONAL_TOLL_PLAZAS,
  getTollRateForVehicle,
  calculateTotalRouteTolls,
} from '@/services/fastagData';

const VEHICLE_CLASSES: { id: VehicleClass; label: string; icon: string }[] = [
  { id: 'car', label: 'Car / Jeep / Van (Class 4)', icon: 'car' },
  { id: 'lcv', label: 'Light Commercial Vehicle (LCV)', icon: 'shuttle-van' },
  { id: 'bus_truck', label: 'Bus / 2-Axle Truck (Class 6)', icon: 'bus' },
  { id: 'multi_axle', label: 'Multi-Axle Heavy Truck (>3 Axle)', icon: 'truck-moving' },
];

export default function FastagScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleClass>('car');
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);

  const totalTollAmount = calculateTotalRouteTolls(NATIONAL_TOLL_PLAZAS, selectedVehicle);
  const selectedVehicleConfig = VEHICLE_CLASSES.find(v => v.id === selectedVehicle);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="FASTag Toll Calculator"
        subtitle="National Highways & Expressway Tolls"
        accentColor={BMapColors.fastagPurple}
      />

      {/* Vehicle Class Selector Button */}
      <View style={styles.selectorContainer}>
        <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>VEHICLE CLASSIFICATION</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsPickerModalVisible(true)}
          style={[styles.pickerTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.triggerInner}>
            <View style={[styles.vehicleIconCircle, { backgroundColor: BMapColors.fastagPurpleLight }]}>
              <FontAwesome5 name={selectedVehicleConfig?.icon || 'car'} size={16} color={BMapColors.fastagPurple} />
            </View>
            <View style={styles.triggerTextCluster}>
              <Text style={[styles.triggerTitle, { color: colors.text }]}>{selectedVehicleConfig?.label}</Text>
              <Text style={[styles.triggerSub, { color: colors.textSecondary }]}>Tap to change vehicle type</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color={BMapColors.fastagPurple} />
        </TouchableOpacity>
      </View>

      {/* Total Toll Summary Card */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: isDark ? '#1C152B' : '#F3E8FF',
            borderColor: isDark ? '#4A148C' : '#D8B4FE',
          },
        ]}
      >
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.summaryHeaderLabel, { color: BMapColors.fastagPurple }]}>
              TOTAL ROUTE TOLL FEE
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>₹{totalTollAmount}</Text>
          </View>

          <View style={styles.fastagLogoBadge}>
            <MaterialCommunityIcons name="card-account-details-star" size={28} color="#FFFFFF" />
            <Text style={styles.fastagLogoText}>FASTag ETC</Text>
          </View>
        </View>

        <View style={[styles.summaryFooter, { borderTopColor: isDark ? '#3B1F54' : '#E9D5FF' }]}>
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Plazas Covered</Text>
            <Text style={[styles.footerValue, { color: colors.text }]}>{NATIONAL_TOLL_PLAZAS.length} Plazas</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Lane Mode</Text>
            <Text style={[styles.footerValue, { color: '#00875A' }]}>100% Dedicated Fast Lanes</Text>
          </View>
        </View>
      </View>

      {/* Plaza Timeline Header */}
      <View style={styles.timelineHeader}>
        <Text style={[styles.timelineTitle, BMapTypography.titleMedium, { color: colors.text }]}>
          Route Plaza Timeline
        </Text>
        <Text style={[styles.timelineSubtitle, { color: colors.textSecondary }]}>
          Ordered from Origin to Destination
        </Text>
      </View>

      {/* Vertical Timeline FlatList */}
      <FlatList
        data={NATIONAL_TOLL_PLAZAS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.timelineList}
        renderItem={({ item, index }) => {
          const rate = getTollRateForVehicle(item, selectedVehicle);
          const isLast = index === NATIONAL_TOLL_PLAZAS.length - 1;

          return (
            <View style={styles.timelineItem}>
              {/* Left Timeline Indicator */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: BMapColors.fastagPurple }]}>
                  <Text style={styles.timelineNumber}>{index + 1}</Text>
                </View>
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
              </View>

              {/* Plaza Info Card */}
              <View style={[styles.plazaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.plazaHeaderRow}>
                  <View style={styles.plazaTitleGroup}>
                    <Text style={[styles.plazaName, BMapTypography.titleMedium, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.highwayName, { color: colors.textSecondary }]}>
                      {item.highway} • {item.chainageKm}
                    </Text>
                  </View>

                  <View style={styles.rateBadge}>
                    <Text style={styles.rateAmount}>₹{rate}</Text>
                  </View>
                </View>

                {/* FASTag Lane Status Pill */}
                <View style={styles.plazaFooterRow}>
                  <View style={styles.laneStatusPill}>
                    <Ionicons name="flash" size={12} color="#00875A" />
                    <Text style={styles.laneStatusText}>FASTag Auto-Debit Enabled</Text>
                  </View>
                  <Text style={[styles.coordsText, { color: colors.textMuted }]}>
                    GPS: {item.coordinates.latitude.toFixed(2)}°, {item.coordinates.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Vehicle Class Modal Picker */}
      <Modal visible={isPickerModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                Select Vehicle Class
              </Text>
              <TouchableOpacity
                onPress={() => setIsPickerModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={selectedVehicle}
              onValueChange={itemValue => {
                setSelectedVehicle(itemValue as VehicleClass);
              }}
              style={{ color: colors.text }}
            >
              {VEHICLE_CLASSES.map(v => (
                <Picker.Item key={v.id} label={v.label} value={v.id} />
              ))}
            </Picker>

            <TouchableOpacity
              onPress={() => setIsPickerModalVisible(false)}
              style={[styles.modalDoneButton, { backgroundColor: BMapColors.fastagPurple }]}
            >
              <Text style={styles.modalDoneText}>Confirm Vehicle Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vehicleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerTextCluster: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  triggerSub: {
    fontSize: 12,
  },
  summaryCard: {
    margin: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    gap: 14,
    ...BMapElevation.level2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  fastagLogoBadge: {
    backgroundColor: BMapColors.fastagPurple,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    gap: 2,
  },
  fastagLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  footerItem: {
    gap: 2,
  },
  footerLabel: {
    fontSize: 11,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  timelineTitle: {
    fontWeight: '700',
  },
  timelineSubtitle: {
    fontSize: 12,
  },
  timelineList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNumber: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  plazaCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
    ...BMapElevation.level1,
  },
  plazaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plazaTitleGroup: {
    flex: 1,
    marginRight: 8,
  },
  plazaName: {
    fontWeight: '700',
  },
  highwayName: {
    fontSize: 12,
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rateAmount: {
    color: BMapColors.fastagPurple,
    fontSize: 16,
    fontWeight: '800',
  },
  plazaFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  laneStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  laneStatusText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  coordsText: {
    fontSize: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSheetTitle: {
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
