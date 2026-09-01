import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { METRO_FARE_RATES, calculateMeteredFare } from '@/services/fareCalculator';

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

export default function FareEstimatorScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const [vehicleType, setVehicleType] = useState<'auto' | 'cab'>('auto');
  const [distanceKm, setDistanceKm] = useState<number>(8.5);
  const [isNightSurcharge, setIsNightSurcharge] = useState<boolean>(false);
  const [waitingMinutes, setWaitingMinutes] = useState<number>(10);
  const [luggageCount, setLuggageCount] = useState<number>(1);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState<boolean>(true);

  const fareResult = calculateMeteredFare(
    selectedCity,
    vehicleType,
    distanceKm,
    isNightSurcharge,
    waitingMinutes,
    luggageCount
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="Metered Fare Estimator"
        subtitle="Official RTA auto-rickshaw & taxi tariff rates"
        accentColor="#EAB308"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* City Selector Horizontal Bar */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SELECT INDIAN METRO</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
            {CITIES.map(city => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCity(city)}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: isSelected ? BMapColors.primary : colors.surface,
                      borderColor: isSelected ? BMapColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cityChipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Vehicle Mode Toggle: Auto vs Cab */}
        <View style={[styles.vehicleToggleCard, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVehicleType('auto')}
            style={[
              styles.vehicleTab,
              vehicleType === 'auto' && [styles.activeVehicleTab, { backgroundColor: colors.surface }],
            ]}
          >
            <MaterialCommunityIcons
              name="rickshaw"
              size={20}
              color={vehicleType === 'auto' ? '#CA8A04' : colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleTabText,
                {
                  color: vehicleType === 'auto' ? colors.text : colors.textSecondary,
                  fontWeight: vehicleType === 'auto' ? '700' : '600',
                },
              ]}
            >
              Metered Auto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVehicleType('cab')}
            style={[
              styles.vehicleTab,
              vehicleType === 'cab' && [styles.activeVehicleTab, { backgroundColor: colors.surface }],
            ]}
          >
            <FontAwesome5
              name="taxi"
              size={18}
              color={vehicleType === 'cab' ? '#CA8A04' : colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleTabText,
                {
                  color: vehicleType === 'cab' ? colors.text : colors.textSecondary,
                  fontWeight: vehicleType === 'cab' ? '700' : '600',
                },
              ]}
            >
              Metered Black & Yellow Cab
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calculated Fare Hero Card */}
        <View
          style={[
            styles.fareHeroCard,
            {
              backgroundColor: isDark ? '#1C1917' : '#FEFCE8',
              borderColor: '#FACC15',
            },
          ]}
        >
          <View style={styles.fareHeroTop}>
            <View>
              <Text style={styles.fareHeroLabel}>ESTIMATED RTA FARE</Text>
              <Text style={[styles.fareAmountText, { color: colors.text }]}>₹{fareResult.totalFare}</Text>
              <Text style={[styles.fareCityText, { color: colors.textSecondary }]}>
                Official {fareResult.city} Govt. Tariff Card
              </Text>
            </View>

            <View style={styles.meterBadge}>
              <MaterialCommunityIcons name="speedometer" size={24} color="#CA8A04" />
              <Text style={styles.meterBadgeText}>Digital Meter</Text>
            </View>
          </View>

          {/* Expandable Itemized Cost Breakdown */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
            style={[styles.breakdownHeader, { borderTopColor: isDark ? '#292524' : '#FEF08A' }]}
          >
            <Text style={[styles.breakdownTitle, { color: colors.text }]}>Itemized Cost Breakdown</Text>
            <Ionicons
              name={isBreakdownExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isBreakdownExpanded && (
            <View style={styles.breakdownDetails}>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownItemLabel, { color: colors.textSecondary }]}>
                  Base Minimum Fare (First {fareResult.baseKm} km)
                </Text>
                <Text style={[styles.breakdownItemValue, { color: colors.text }]}>₹{fareResult.baseFare}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownItemLabel, { color: colors.textSecondary }]}>
                  Distance Charge ({Math.max(0, distanceKm - fareResult.baseKm).toFixed(1)} km extra)
                </Text>
                <Text style={[styles.breakdownItemValue, { color: colors.text }]}>+₹{fareResult.distanceCharge}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownItemLabel, { color: colors.textSecondary }]}>
                  Waiting Time Charge ({waitingMinutes} mins)
                </Text>
                <Text style={[styles.breakdownItemValue, { color: colors.text }]}>+₹{fareResult.waitingFee}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownItemLabel, { color: colors.textSecondary }]}>
                  Luggage Handling Fee ({luggageCount} items)
                </Text>
                <Text style={[styles.breakdownItemValue, { color: colors.text }]}>+₹{fareResult.luggageCharge}</Text>
              </View>

              {fareResult.nightSurchargeApplied && (
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownItemLabel, { color: '#E11D48', fontWeight: '700' }]}>
                    Night Surcharge (+25-50% 11 PM - 5 AM)
                  </Text>
                  <Text style={[styles.breakdownItemValue, { color: '#E11D48', fontWeight: '700' }]}>
                    +₹{fareResult.nightSurchargeAmount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Interactive Controls Card: Distance, Night Surcharge, Waiting Time Slider */}
        <View style={[styles.controlsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Distance Slider */}
          <View style={styles.controlRow}>
            <View style={styles.controlLabelGroup}>
              <Text style={[styles.controlTitle, { color: colors.text }]}>Trip Distance</Text>
              <Text style={[styles.controlValueBadge, { color: BMapColors.primary }]}>
                {distanceKm.toFixed(1)} KM
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={40}
              step={0.5}
              value={distanceKm}
              onValueChange={setDistanceKm}
              minimumTrackTintColor={BMapColors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={BMapColors.primary}
            />
          </View>

          {/* Waiting Time Slider */}
          <View style={styles.controlRow}>
            <View style={styles.controlLabelGroup}>
              <Text style={[styles.controlTitle, { color: colors.text }]}>Waiting Time / Heavy Traffic Delay</Text>
              <Text style={[styles.controlValueBadge, { color: '#CA8A04' }]}>
                {waitingMinutes} MINS
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={60}
              step={5}
              value={waitingMinutes}
              onValueChange={setWaitingMinutes}
              minimumTrackTintColor="#CA8A04"
              maximumTrackTintColor={colors.border}
              thumbTintColor="#CA8A04"
            />
          </View>

          {/* Night Surcharge Toggle Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <View style={styles.switchTitleRow}>
                <Ionicons name="moon" size={16} color="#4F46E5" />
                <Text style={[styles.controlTitle, { color: colors.text }]}>Night Surcharge (11 PM - 5 AM)</Text>
              </View>
              <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                Applies standard 25% to 50% statutory night multiplier
              </Text>
            </View>
            <Switch
              value={isNightSurcharge}
              onValueChange={setIsNightSurcharge}
              trackColor={{ false: colors.border, true: '#4F46E5' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cityScroll: {
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  cityChipText: {
    fontSize: 13,
  },
  vehicleToggleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
  },
  vehicleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeVehicleTab: {
    ...BMapElevation.level1,
  },
  vehicleTabText: {
    fontSize: 13,
  },
  fareHeroCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    gap: 12,
    ...BMapElevation.level2,
  },
  fareHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fareHeroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  fareAmountText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  fareCityText: {
    fontSize: 12,
    marginTop: 2,
  },
  meterBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    gap: 2,
  },
  meterBadgeText: {
    color: '#854D0E',
    fontSize: 10,
    fontWeight: '800',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownDetails: {
    gap: 8,
    paddingTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownItemLabel: {
    fontSize: 12,
  },
  breakdownItemValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  controlsCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 18,
    ...BMapElevation.level1,
  },
  controlRow: {
    gap: 8,
  },
  controlLabelGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  controlValueBadge: {
    fontSize: 14,
    fontWeight: '800',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  switchTextGroup: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchSub: {
    fontSize: 11,
  },
});
