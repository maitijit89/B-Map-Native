import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { RatingModal } from '@/components/RatingModal';

type VehicleTier = 'Auto' | 'Economy Sedan' | 'Premium SUV';

interface TierOption {
  id: VehicleTier;
  name: string;
  desc: string;
  price: number;
  etaMins: number;
  icon: string;
  iconSet: 'MaterialCommunityIcons' | 'FontAwesome5';
  seats: number;
}

const VEHICLE_TIERS: TierOption[] = [
  {
    id: 'Auto',
    name: 'B Auto Rickshaw',
    desc: 'Quick regional hops • Open air',
    price: 95,
    etaMins: 3,
    icon: 'rickshaw',
    iconSet: 'MaterialCommunityIcons',
    seats: 3,
  },
  {
    id: 'Economy Sedan',
    name: 'B Sedan (AC)',
    desc: 'Dzire / Etios • Clean AC ride',
    price: 185,
    etaMins: 5,
    icon: 'car',
    iconSet: 'FontAwesome5',
    seats: 4,
  },
  {
    id: 'Premium SUV',
    name: 'B Prime SUV (6-Seater)',
    desc: 'Innova / Ertiga • Spacious luxury',
    price: 320,
    etaMins: 8,
    icon: 'shuttle-van',
    iconSet: 'FontAwesome5',
    seats: 6,
  },
];

const NEARBY_CABS: BMapMarkerItem[] = [
  {
    id: 'cab-1',
    coordinate: { latitude: 28.6189, longitude: 77.2140 },
    title: 'B Auto (DL 1R 8892)',
    category: 'taxi',
  },
  {
    id: 'cab-2',
    coordinate: { latitude: 28.6089, longitude: 77.2030 },
    title: 'B Sedan (DL 2C 4310)',
    category: 'taxi',
  },
  {
    id: 'cab-3',
    coordinate: { latitude: 28.6210, longitude: 77.2210 },
    title: 'B Prime SUV (HR 26 DQ 1009)',
    category: 'taxi',
  },
];

export default function RideRequestScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedTier, setSelectedTier] = useState<VehicleTier>('Economy Sedan');
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [matchedDriver, setMatchedDriver] = useState<{
    name: string;
    vehicle: string;
    plate: string;
    rating: number;
    otp: string;
  } | null>(null);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleConfirmBooking = () => {
    setIsSearchingDriver(true);
    setMatchedDriver(null);

    // Simulate driver matching radar
    setTimeout(() => {
      setIsSearchingDriver(false);
      setMatchedDriver({
        name: 'Vikram Singh',
        vehicle: selectedTier === 'Auto' ? 'Bajaj RE Auto' : 'Maruti Suzuki Dzire AC',
        plate: 'DL 1R AY 9421',
        rating: 4.89,
        otp: '4821',
      });
    }, 2800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="Fleet Dispatch & Ride"
        subtitle="On-demand regional cab & auto mobility"
        accentColor={BMapColors.primary}
        rightActionIcon="star-outline"
        onRightActionPress={() => setIsRatingModalOpen(true)}
      />

      {/* Top View: Map with moving nearby fleet vehicles */}
      <View style={styles.mapSection}>
        <BMapView
          mapStyleType={isDark ? 'dark' : 'daylight'}
          markers={NEARBY_CABS}
        />

        {/* Pickup Location Bubble */}
        <View style={[styles.pickupPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.greenDot} />
          <Text style={[styles.pickupText, { color: colors.text }]} numberOfLines={1}>
            Pickup: Connaught Place, Inner Circle
          </Text>
        </View>
      </View>

      {/* Bottom Sheet / Ride Booking Controls */}
      <View style={[styles.bookingSheet, { backgroundColor: colors.surface }]}>
        {isSearchingDriver ? (
          /* Active Driver Searching Radar State */
          <View style={styles.searchingStateContainer}>
            <View style={styles.radarCircle}>
              <ActivityIndicator size="large" color={BMapColors.primary} />
            </View>
            <Text style={[styles.searchingTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
              Connecting to Nearby Drivers...
            </Text>
            <Text style={[styles.searchingSubtitle, { color: colors.textSecondary }]}>
              Broadcasting dispatch request to {selectedTier} drivers within 3 km.
            </Text>
            <TouchableOpacity
              onPress={() => setIsSearchingDriver(false)}
              style={[styles.cancelSearchBtn, { backgroundColor: colors.surfaceVariant }]}
            >
              <Text style={[styles.cancelSearchText, { color: colors.textSecondary }]}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        ) : matchedDriver ? (
          /* Driver Matched & En Route State */
          <View style={styles.matchedContainer}>
            <View style={styles.matchedTopRow}>
              <View style={styles.driverInfoLeft}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.driverName, BMapTypography.titleMedium, { color: colors.text }]}>
                    {matchedDriver.name}
                  </Text>
                  <View style={styles.driverRatingCluster}>
                    <Ionicons name="star" size={14} color="#FFB300" />
                    <Text style={[styles.driverRatingText, { color: colors.textSecondary }]}>
                      {matchedDriver.rating} • {matchedDriver.vehicle}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.otpCluster}>
                <Text style={styles.otpLabel}>START OTP</Text>
                <Text style={styles.otpValue}>{matchedDriver.otp}</Text>
              </View>
            </View>

            <View style={[styles.plateRow, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.plateText, { color: colors.text }]}>{matchedDriver.plate}</Text>
              <Text style={styles.arrivingText}>Arriving in 3 mins</Text>
            </View>

            <View style={styles.driverActionButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.callDriverBtn, { backgroundColor: '#E8F5E9' }]}
              >
                <Ionicons name="call" size={18} color="#2E7D32" />
                <Text style={styles.callDriverText}>Call Driver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsRatingModalOpen(true)}
                style={[styles.rateTripBtn, { backgroundColor: BMapColors.primary }]}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={styles.rateTripText}>Rate Experience</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Selectable Vehicle Tier List */
          <View style={styles.tierSelectionContainer}>
            <Text style={[styles.tierHeaderTitle, BMapTypography.titleSmall, { color: colors.textSecondary }]}>
              SELECT RIDE TIER
            </Text>

            <View style={styles.tiersList}>
              {VEHICLE_TIERS.map(tier => {
                const isSelected = selectedTier === tier.id;

                return (
                  <TouchableOpacity
                    key={tier.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedTier(tier.id)}
                    style={[
                      styles.tierCard,
                      {
                        backgroundColor: isSelected ? (isDark ? '#231B15' : '#FFF7ED') : colors.surfaceVariant,
                        borderColor: isSelected ? BMapColors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.tierIconContainer}>
                      {tier.iconSet === 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons
                          name={tier.icon as any}
                          size={28}
                          color={isSelected ? BMapColors.primary : colors.text}
                        />
                      ) : (
                        <FontAwesome5
                          name={tier.icon}
                          size={24}
                          color={isSelected ? BMapColors.primary : colors.text}
                        />
                      )}
                    </View>

                    <View style={styles.tierTextCluster}>
                      <View style={styles.tierTitleRow}>
                        <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>
                        <View style={styles.seatsPill}>
                          <Ionicons name="person" size={11} color={colors.textSecondary} />
                          <Text style={[styles.seatsText, { color: colors.textSecondary }]}>{tier.seats}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.desc}</Text>
                    </View>

                    <View style={styles.tierPricingCluster}>
                      <Text style={[styles.tierPrice, { color: colors.text }]}>₹{tier.price}</Text>
                      <Text style={styles.tierEta}>{tier.etaMins} mins away</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm Booking Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleConfirmBooking}
              style={[styles.confirmBtn, { backgroundColor: BMapColors.primary }]}
            >
              <Text style={styles.confirmBtnText}>Confirm {selectedTier} Ride</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* App Rating & Feedback Modal Component */}
      <RatingModal
        visible={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSection: {
    flex: 5,
    position: 'relative',
  },
  pickupPill: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...BMapElevation.level2,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00875A',
  },
  pickupText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  bookingSheet: {
    flex: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    ...BMapElevation.level3,
  },
  tierSelectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  tierHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tiersList: {
    gap: 10,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
    ...BMapElevation.level1,
  },
  tierIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierTextCluster: {
    flex: 1,
    gap: 2,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '700',
  },
  seatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seatsText: {
    fontSize: 11,
  },
  tierDesc: {
    fontSize: 11,
  },
  tierPricingCluster: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  tierEta: {
    fontSize: 11,
    color: '#00875A',
    fontWeight: '700',
  },
  confirmBtn: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    ...BMapElevation.level2,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  searchingStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  radarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingTitle: {
    fontWeight: '800',
    textAlign: 'center',
  },
  searchingSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 20,
  },
  cancelSearchBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  cancelSearchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  matchedContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 14,
  },
  matchedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontWeight: '700',
  },
  driverRatingCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 12,
  },
  otpCluster: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
  },
  otpValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },
  plateRow: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  arrivingText: {
    color: '#00875A',
    fontSize: 13,
    fontWeight: '700',
  },
  driverActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callDriverBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  callDriverText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
  rateTripBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rateTripText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
