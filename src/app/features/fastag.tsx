import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  Modal,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { BMapView, BMapMarkerItem, BMapPolylineItem } from '@/components/BMapView';
import { ToastBanner } from '@/components/ToastBanner';
import { VehicleClass, TollPlaza } from '@/types';
import { isSmallDevice, moderateScale } from '@/utils/responsive';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';
import { IndianEcosystemAPI } from '@/api/api';
import { getLatestTelemetry } from '@/services/telemetry';
import {
  NATIONAL_TOLL_PLAZAS,
  getTollRateForVehicle,
} from '@/services/fastagData';

type JourneyType = 'single' | 'return24h' | 'monthly';

const VEHICLE_CLASSES: { id: VehicleClass; label: string; shortLabel: string; icon: string; desc: string }[] = [
  { id: 'car', label: 'Car / Jeep', shortLabel: 'Car / SUV', icon: 'car', desc: 'Class 4 • Personal & Taxi' },
  { id: 'lcv', label: 'LCV / Van', shortLabel: 'LCV', icon: 'shuttle-van', desc: 'Class 5 • Light Goods & Mini-bus' },
  { id: 'bus_truck', label: 'Bus / 2-Axle', shortLabel: 'Bus / Truck', icon: 'bus', desc: 'Class 6 • Commercial heavy' },
  { id: 'multi_axle', label: 'Multi-Axle', shortLabel: 'Multi-Axle', icon: 'truck-moving', desc: '>3 Axle • Heavy Cargo' },
];

const JOURNEY_MODES: { id: JourneyType; label: string; sub: string; multiplier: number }[] = [
  { id: 'single', label: 'Single Trip', sub: 'Standard rate', multiplier: 1.0 },
  { id: 'return24h', label: '24h Return', sub: '25% return off', multiplier: 1.75 },
  { id: 'monthly', label: 'Monthly Pass', sub: '50 local trips', multiplier: 25.0 },
];

const CORRIDOR_REGION = {
  latitude: 28.5500,
  longitude: 77.2500,
  latitudeDelta: 0.8,
  longitudeDelta: 0.8,
};

const CORRIDOR_POLYLINES: BMapPolylineItem[] = [
  {
    coordinates: NATIONAL_TOLL_PLAZAS.map(p => p.coordinates),
    strokeColor: BMapColors.fastagPurple,
    strokeWidth: 4,
    isDashed: false,
  },
];

export default function FastagScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleClass>('car');
  const [journeyMode, setJourneyMode] = useState<JourneyType>('single');
  const [selectedPlazaId, setSelectedPlazaId] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(true);

  // Live Toll Plazas from Backend
  const [tollPlazas, setTollPlazas] = useState<TollPlaza[]>(NATIONAL_TOLL_PLAZAS);

  // Virtual FASTag Wallet State
  const [fastagBalance, setFastagBalance] = useState(650.0);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('500');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Fetch live toll plazas from backend
  useEffect(() => {
    let isMounted = true;
    const fetchTolls = async () => {
      try {
        const loc = getLatestTelemetry();
        const res = await IndianEcosystemAPI.getNearbyTolls(loc.latitude, loc.longitude, 100);
        const remotePlazas = res.data?.data?.plazas;
        if (isMounted && remotePlazas && remotePlazas.length > 0) {
          const mapped = remotePlazas.map((p: any) => ({
            id: p.id,
            name: p.name,
            highway: p.highway || 'NH-48',
            chainageKm: 'KM 42.0',
            carRate: p.single_trip_inr || 80,
            lcvRate: Math.round((p.single_trip_inr || 80) * 1.6),
            busTruckRate: Math.round((p.single_trip_inr || 80) * 3.3),
            multiAxleRate: Math.round((p.single_trip_inr || 80) * 5.2),
            hasDedicatedFastagLanes: p.is_fastag_active ?? true,
            coordinates: {
              latitude: p.location?.lat || p.location?.latitude || 28.4067,
              longitude: p.location?.lng || p.location?.longitude || 76.9854,
            },
          }));
          setTollPlazas(mapped);
        }
      } catch (err) {
        console.warn('Failed to load toll plazas from backend:', err);
      }
    };

    fetchTolls();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeModeMultiplier = useMemo(() => {
    return JOURNEY_MODES.find(m => m.id === journeyMode)?.multiplier || 1.0;
  }, [journeyMode]);

  // Total calculated toll across the corridor
  const totalBaseToll = useMemo(() => {
    return tollPlazas.reduce(
      (sum, plaza) => sum + getTollRateForVehicle(plaza, selectedVehicle),
      0
    );
  }, [tollPlazas, selectedVehicle]);

  const totalEffectiveToll = useMemo(() => {
    return Math.round(totalBaseToll * activeModeMultiplier);
  }, [totalBaseToll, activeModeMultiplier]);

  // Calculation of savings for return journey
  const returnSavings = useMemo(() => {
    if (journeyMode === 'return24h') {
      return Math.round(totalBaseToll * 2 - totalEffectiveToll);
    }
    return 0;
  }, [journeyMode, totalBaseToll, totalEffectiveToll]);

  const balanceDeficit = Math.max(0, totalEffectiveToll - fastagBalance);
  const isBalanceSufficient = fastagBalance >= totalEffectiveToll;

  // Map markers for toll plazas
  const mapMarkers: BMapMarkerItem[] = useMemo(() => {
    return tollPlazas.map(plaza => {
      const rate = Math.round(getTollRateForVehicle(plaza, selectedVehicle) * activeModeMultiplier);
      return {
        id: plaza.id,
        coordinate: plaza.coordinates,
        title: `${plaza.name} • ₹${rate}`,
        category: 'toll',
        data: plaza,
      };
    });
  }, [tollPlazas, selectedVehicle, activeModeMultiplier]);

  const handleMarkerPress = useCallback((marker: BMapMarkerItem) => {
    if (marker.id) {
      setSelectedPlazaId(marker.id);
      const index = tollPlazas.findIndex(p => p.id === marker.id);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
      }
    }
  }, [tollPlazas]);

  const handleExecuteRecharge = (amountToAdd: number) => {
    if (amountToAdd <= 0) return;
    setFastagBalance(prev => prev + amountToAdd);
    setIsRechargeModalOpen(false);
    setToastMessage(`₹${amountToAdd} added to FASTag Wallet (Tag: NETC-DL01-99824)`);
  };

  const handleNavigateToPlaza = (plaza: TollPlaza) => {
    router.push({
      pathname: '/navigate/route-planner' as any,
      params: {
        destTitle: plaza.name,
        destLat: plaza.coordinates.latitude.toString(),
        destLng: plaza.coordinates.longitude.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="FASTag Toll Radar"
        subtitle="National Highways & Expressway NETC"
        accentColor={BMapColors.fastagPurple}
        rightActionIcon={isMapVisible ? 'map' : 'map-outline'}
        rightActionLabel={isMapVisible ? 'Hide Map' : 'Show Map'}
        onRightActionPress={() => setIsMapVisible(prev => !prev)}
      />

      {toastMessage && (
        <ToastBanner
          visible={!!toastMessage}
          message={toastMessage}
          type="success"
          countdownSeconds={4}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Main Content Area */}
      <FlatList
        ref={flatListRef}
        data={tollPlazas}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollListContent}
        initialNumToRender={5}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Collapsible Interactive Corridor Map */}
            {isMapVisible && (
              <View style={[styles.mapCardContainer, { borderColor: colors.border }]}>
                <BMapView
                  mapStyleType={isDark ? 'dark' : 'daylight'}
                  region={CORRIDOR_REGION}
                  markers={mapMarkers}
                  polylines={CORRIDOR_POLYLINES}
                  onMarkerPress={handleMarkerPress}
                  style={styles.mapCanvas}
                />
                <View style={styles.mapFloatingBadge}>
                  <Ionicons name="git-network-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.mapBadgeText}>NHAI LIVE TOLL CORRIDOR</Text>
                </View>
              </View>
            )}

            {/* Instant Horizontal Vehicle Class Switcher */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SELECT VEHICLE CLASSIFICATION
              </Text>
              <Text style={[styles.sectionMeta, { color: BMapColors.fastagPurple }]}>
                Instant Recalculation
              </Text>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehicleScroll}
            >
              {VEHICLE_CLASSES.map(veh => {
                const isSelected = selectedVehicle === veh.id;
                return (
                  <AnimatedPressable
                    key={veh.id}
                    onPress={() => setSelectedVehicle(veh.id)}
                    scaleTo={0.95}
                    style={[
                      styles.vehiclePill,
                      {
                        backgroundColor: isSelected
                          ? BMapColors.fastagPurple
                          : colors.surface,
                        borderColor: isSelected
                          ? BMapColors.fastagPurple
                          : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.vehicleIconCircle,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255, 255, 255, 0.2)'
                            : BMapColors.fastagPurpleLight,
                        },
                      ]}
                    >
                      <FontAwesome5
                        name={veh.icon}
                        size={isSmallDevice ? 13 : 15}
                        color={isSelected ? '#FFFFFF' : BMapColors.fastagPurple}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.vehiclePillLabel,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {veh.shortLabel}
                      </Text>
                      <Text
                        style={[
                          styles.vehiclePillSub,
                          {
                            color: isSelected
                              ? 'rgba(255,255,255,0.8)'
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        Class {veh.id === 'car' ? '4' : veh.id === 'lcv' ? '5' : veh.id === 'bus_truck' ? '6' : '7+'}
                      </Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            {/* Journey Mode / Return Pass Discount Selector */}
            <View style={styles.journeyModeContainer}>
              {JOURNEY_MODES.map(mode => {
                const isSelected = journeyMode === mode.id;
                return (
                  <AnimatedPressable
                    key={mode.id}
                    onPress={() => setJourneyMode(mode.id)}
                    scaleTo={0.95}
                    style={[
                      styles.journeyModeTab,
                      {
                        backgroundColor: isSelected
                          ? isDark ? '#2E1A47' : '#F3E8FF'
                          : colors.surface,
                        borderColor: isSelected
                          ? BMapColors.fastagPurple
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.journeyModeLabel,
                        {
                          color: isSelected ? BMapColors.fastagPurple : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {mode.label}
                    </Text>
                    <Text
                      style={[
                        styles.journeyModeSub,
                        { color: isSelected ? BMapColors.fastagPurple : colors.textSecondary },
                      ]}
                    >
                      {mode.sub}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            {/* Savings Banner when 24h Return is Active */}
            {returnSavings > 0 && (
              <View style={styles.savingsBanner}>
                <Ionicons name="pricetag" size={14} color="#00875A" />
                <Text style={styles.savingsBannerText}>
                  NHAI 24-Hour Return Discount Applied: You save ₹{returnSavings}!
                </Text>
              </View>
            )}

            {/* Fintech Virtual FASTag Card & Toll Summary */}
            <View
              style={[
                styles.fintechCard,
                {
                  backgroundColor: isDark ? '#1C152B' : '#FAF5FF',
                  borderColor: isDark ? '#581C87' : '#E9D5FF',
                },
              ]}
            >
              {/* Card Header with NETC Branding & RFID Chip */}
              <View style={styles.fintechHeaderRow}>
                <View style={styles.netcBrandRow}>
                  <MaterialCommunityIcons name="integrated-circuit-chip" size={26} color="#E0A96D" />
                  <View style={styles.netcTextGroup}>
                    <Text style={[styles.netcTitle, { color: BMapColors.fastagPurple }]}>
                      IHMCL • NETC FASTag
                    </Text>
                    <Text style={[styles.netcTagId, { color: colors.textSecondary }]}>
                      DL 01 AB 1234 • ID: NETC-DL01-99824
                    </Text>
                  </View>
                </View>

                <View style={styles.rfidBadge}>
                  <Ionicons name="radio" size={14} color={BMapColors.fastagPurple} />
                  <Text style={styles.rfidText}>ETC 100%</Text>
                </View>
              </View>

              {/* Financial Balance & Total Toll Comparison */}
              <View style={styles.fintechMetricsRow}>
                {/* Total Toll */}
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    ROUTE TOLL COST
                  </Text>
                  <Text style={[styles.metricBigAmount, { color: colors.text }]}>
                    ₹{totalEffectiveToll}
                  </Text>
                  <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                    {tollPlazas.length} Plazas
                  </Text>
                </View>

                {/* Divider Line */}
                <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

                {/* Live FASTag Wallet Balance */}
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    FASTAG WALLET
                  </Text>
                  <Text
                    style={[
                      styles.metricBigAmount,
                      { color: isBalanceSufficient ? '#00875A' : '#DC2626' },
                    ]}
                  >
                    ₹{Math.round(fastagBalance)}
                  </Text>
                  <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                    Available Balance
                  </Text>
                </View>
              </View>

              {/* Balance Assessment Bar & Top-Up Action */}
              <View
                style={[
                  styles.balanceStatusRow,
                  {
                    backgroundColor: isBalanceSufficient
                      ? (isDark ? '#064E3B' : '#ECFDF5')
                      : (isDark ? '#7F1D1D' : '#FEF2F2'),
                    borderColor: isBalanceSufficient ? '#059669' : '#EF4444',
                  },
                ]}
              >
                <View style={styles.statusTextGroup}>
                  <Ionicons
                    name={isBalanceSufficient ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={isBalanceSufficient ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.statusNotice,
                      { color: isBalanceSufficient ? '#059669' : '#DC2626' },
                    ]}
                    numberOfLines={1}
                  >
                    {isBalanceSufficient
                      ? `Sufficient (₹${Math.round(fastagBalance - totalEffectiveToll)} surplus)`
                      : `Deficit of ₹${balanceDeficit} for journey`}
                  </Text>
                </View>

                <AnimatedPressable
                  onPress={() => setIsRechargeModalOpen(true)}
                  scaleTo={0.93}
                  style={[
                    styles.rechargeActionBtn,
                    { backgroundColor: BMapColors.fastagPurple },
                  ]}
                >
                  <Ionicons name="card-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.rechargeBtnText}>Recharge</Text>
                </AnimatedPressable>
              </View>
            </View>

            {/* Timeline Header */}
            <View style={styles.timelineHeaderRow}>
              <View>
                <Text style={[styles.timelineSectionTitle, { color: colors.text }]}>
                  Expressway Toll Plaza Timeline
                </Text>
                <Text style={[styles.timelineSectionSub, { color: colors.textSecondary }]}>
                  Toll rates adapted for {VEHICLE_CLASSES.find(v => v.id === selectedVehicle)?.shortLabel} ({JOURNEY_MODES.find(m => m.id === journeyMode)?.label})
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const baseRate = getTollRateForVehicle(item, selectedVehicle);
          const effectiveRate = Math.round(baseRate * activeModeMultiplier);
          const isLast = index === tollPlazas.length - 1;
          const isSelected = selectedPlazaId === item.id;

          return (
            <FadeInView delay={index * 40} direction="up">
              <AnimatedPressable
                onPress={() => setSelectedPlazaId(item.id)}
                scaleTo={0.98}
                style={styles.timelineItemContainer}
              >
                {/* Left Chronological Timeline Indicator */}
                <View style={styles.timelineLeftColumn}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: isSelected ? BMapColors.primary : BMapColors.fastagPurple,
                        transform: [{ scale: isSelected ? 1.15 : 1 }],
                      },
                    ]}
                  >
                    <Text style={styles.timelineNumberText}>{index + 1}</Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineConnectingLine,
                        { backgroundColor: isDark ? '#374151' : '#E5E7EB' },
                      ]}
                    />
                  )}
                </View>

                {/* Plaza Detail Card */}
                <View
                  style={[
                    styles.plazaCard,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? '#231B33' : '#FAF5FF')
                        : colors.surface,
                      borderColor: isSelected ? BMapColors.fastagPurple : colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.plazaCardTop}>
                    <View style={styles.plazaTitleCluster}>
                      <Text
                        style={[
                          styles.plazaTitleText,
                          BMapTypography.titleMedium,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.highwayChainageText, { color: colors.textSecondary }]}>
                        {item.highway} • {item.chainageKm}
                      </Text>
                    </View>

                    {/* Fee Amount Badge */}
                    <View style={styles.plazaFeeBadge}>
                      <Text style={styles.plazaFeeAmount}>₹{effectiveRate}</Text>
                    </View>
                  </View>

                  {/* Card Badges: ETC Lane & Coordinates */}
                  <View style={styles.plazaMetaRow}>
                    <View style={styles.etcLanePill}>
                      <Ionicons name="flash" size={12} color="#00875A" />
                      <Text style={styles.etcLaneText}>100% FASTag Dedicated</Text>
                    </View>

                    <AnimatedPressable
                      onPress={() => handleNavigateToPlaza(item)}
                      scaleTo={0.92}
                      style={styles.directNavBtn}
                    >
                      <Ionicons name="navigate" size={12} color={BMapColors.primary} />
                      <Text style={styles.directNavText}>Directions</Text>
                    </AnimatedPressable>
                  </View>
                </View>
              </AnimatedPressable>
            </FadeInView>
          );
        }}
      />

      {/* Quick UPI FASTag Recharge Modal */}
      <Modal
        visible={isRechargeModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRechargeModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleGroup}>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  FASTag Instant UPI Top-up
                </Text>
                <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>
                  National Electronic Toll Collection (NETC)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsRechargeModalOpen(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Vehicle & Tag Identifier */}
            <View style={[styles.modalTagCard, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.modalTagIdText, { color: colors.text }]}>
                Vehicle: DL 01 AB 1234
              </Text>
              <Text style={[styles.modalTagSubText, { color: colors.textSecondary }]}>
                Bank: SBI FASTag • Current Balance: ₹{Math.round(fastagBalance)}
              </Text>
            </View>

            {/* Preset Amount Chips */}
            <Text style={[styles.amountPresetLabel, { color: colors.textSecondary }]}>
              SELECT RECHARGE AMOUNT
            </Text>
            <View style={styles.presetAmountsRow}>
              {['200', '500', '1000', '2000'].map(amt => {
                const isSelected = customAmount === amt;
                return (
                  <AnimatedPressable
                    key={amt}
                    onPress={() => setCustomAmount(amt)}
                    scaleTo={0.93}
                    style={[
                      styles.presetAmountBtn,
                      {
                        backgroundColor: isSelected
                          ? BMapColors.fastagPurple
                          : colors.surfaceVariant,
                        borderColor: isSelected
                          ? BMapColors.fastagPurple
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetAmountText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      +₹{amt}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <View
              style={[
                styles.amountInputContainer,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
              <TextInput
                style={[styles.amountTextInput, { color: colors.text }]}
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* UPI Payment Provider Badges */}
            <View style={styles.upiBadgesRow}>
              <Text style={[styles.upiSupportedText, { color: colors.textSecondary }]}>
                Supported: GPay • PhonePe • Paytm • BHIM UPI
              </Text>
            </View>

            {/* Pay Button */}
            <AnimatedPressable
              onPress={() => handleExecuteRecharge(parseInt(customAmount || '0', 10))}
              scaleTo={0.95}
              style={[
                styles.paySubmitBtn,
                { backgroundColor: BMapColors.fastagPurple },
              ]}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={styles.paySubmitBtnText}>
                Pay ₹{customAmount || '0'} via UPI
              </Text>
            </AnimatedPressable>
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
  scrollListContent: {
    paddingBottom: 40,
  },
  headerComponent: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingTop: 8,
    gap: 12,
  },
  mapCardContainer: {
    height: isSmallDevice ? 180 : 210,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFloatingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(26, 16, 43, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionMeta: {
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleScroll: {
    gap: isSmallDevice ? 6 : 8,
    paddingVertical: 2,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 16,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  vehicleIconCircle: {
    width: isSmallDevice ? 28 : 32,
    height: isSmallDevice ? 28 : 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehiclePillLabel: {
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    fontWeight: '700',
  },
  vehiclePillSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  journeyModeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  journeyModeTab: {
    flex: 1,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  journeyModeLabel: {
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    textAlign: 'center',
  },
  journeyModeSub: {
    fontSize: 9,
    textAlign: 'center',
  },
  savingsBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savingsBannerText: {
    color: '#00875A',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  fintechCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: isSmallDevice ? 14 : 16,
    gap: 14,
    ...BMapElevation.level2,
  },
  fintechHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netcBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  netcTextGroup: {
    flex: 1,
  },
  netcTitle: {
    fontSize: moderateScale(isSmallDevice ? 13 : 15),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  netcTagId: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rfidBadge: {
    backgroundColor: BMapColors.fastagPurpleLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rfidText: {
    color: BMapColors.fastagPurple,
    fontSize: 10,
    fontWeight: '800',
  },
  fintechMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 38,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricBigAmount: {
    fontSize: moderateScale(isSmallDevice ? 20 : 24),
    fontWeight: '900',
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  balanceStatusRow: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  statusTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  statusNotice: {
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    fontWeight: '700',
    flex: 1,
  },
  rechargeActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rechargeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineHeaderRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  timelineSectionTitle: {
    fontSize: moderateScale(isSmallDevice ? 15 : 17),
    fontWeight: '800',
  },
  timelineSectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  timelineItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    gap: isSmallDevice ? 8 : 12,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    width: isSmallDevice ? 24 : 28,
  },
  timelineDot: {
    width: isSmallDevice ? 22 : 26,
    height: isSmallDevice ? 22 : 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineNumberText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '800',
  },
  timelineConnectingLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  plazaCard: {
    flex: 1,
    borderRadius: 18,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: 12,
    gap: 10,
    ...BMapElevation.level1,
  },
  plazaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  plazaTitleCluster: {
    flex: 1,
  },
  plazaTitleText: {
    fontWeight: '700',
  },
  highwayChainageText: {
    fontSize: 12,
    marginTop: 2,
  },
  plazaFeeBadge: {
    backgroundColor: BMapColors.fastagPurple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  plazaFeeAmount: {
    color: '#FFFFFF',
    fontSize: moderateScale(isSmallDevice ? 13 : 15),
    fontWeight: '800',
  },
  plazaMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 8,
  },
  etcLanePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etcLaneText: {
    color: '#00875A',
    fontSize: 11,
    fontWeight: '700',
  },
  directNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  directNavText: {
    color: BMapColors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderTitleGroup: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalHeaderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTagCard: {
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  modalTagIdText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalTagSubText: {
    fontSize: 11,
  },
  amountPresetLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  presetAmountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetAmountBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetAmountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  upiBadgesRow: {
    alignItems: 'center',
  },
  upiSupportedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paySubmitBtn: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...BMapElevation.level2,
  },
  paySubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
