import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { RatingModal } from '@/components/RatingModal';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';

import { FleetAPI } from '@/api/api';
import { NearbyDriver } from '@/api/types';
import { useFleetWebSocket } from '@/hooks/useFleetWebSocket';
import { getLatestTelemetry } from '@/services/telemetry';

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

function RadarPulseRing({ delay = 0, size = 100 }: { delay?: number; size?: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, [delay, pulse]);

  const ringStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [0.4, 1.8]);
    const opacity = interpolate(pulse.value, [0, 0.4, 1], [0.8, 0.4, 0]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.radarRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        ringStyle,
      ]}
    />
  );
}

export default function RideRequestScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedTier, setSelectedTier] = useState<VehicleTier>('Economy Sedan');
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [matchedDriver, setMatchedDriver] = useState<{
    name: string;
    vehicle: string;
    plate: string;
    rating: number;
    otp: string;
  } | null>(null);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Subscribe to live WebSocket fleet telemetry
  const { drivers: wsDrivers } = useFleetWebSocket('bmap-user-app');

  // Fetch nearby drivers from backend
  useEffect(() => {
    let isMounted = true;
    const loadDrivers = async () => {
      try {
        const loc = getLatestTelemetry();
        const res = await FleetAPI.getNearbyDrivers(loc.latitude, loc.longitude, 10000, 10);
        if (isMounted && res.data?.drivers) {
          setDrivers(res.data.drivers);
        }
      } catch (err) {
        console.warn('Failed to load nearby drivers from backend:', err);
      }
    };

    loadDrivers();
    const interval = setInterval(loadDrivers, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Map real backend drivers + live WebSocket telemetry to map markers
  const mapMarkers: BMapMarkerItem[] = useMemo(() => {
    if (wsDrivers && wsDrivers.length > 0) {
      return wsDrivers.map((loc) => ({
        id: loc.driver_id,
        coordinate: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        title: `Fleet Driver (${loc.driver_id.slice(0, 6)})`,
        category: 'taxi',
      }));
    }

    return drivers.map((d) => ({
      id: d.driver_id,
      coordinate: {
        latitude: d.latitude || d.location?.latitude || 28.6139,
        longitude: d.longitude || d.location?.longitude || 77.2090,
      },
      title: `B-Map Cab (${d.driver_id.slice(0, 6)})`,
      category: 'taxi',
    }));
  }, [drivers, wsDrivers]);

  const handleConfirmBooking = async () => {
    setIsSearchingDriver(true);
    setMatchedDriver(null);

    try {
      const loc = getLatestTelemetry();
      const res = await FleetAPI.requestTrip({
        pickup_lat: loc.latitude,
        pickup_lng: loc.longitude,
        dropoff_lat: 28.4907,
        dropoff_lng: 77.0911,
        pickup_address: loc.addressString || 'Current Location',
        dropoff_address: 'Selected Destination',
      });

      const trip = res.data?.trip;
      setIsSearchingDriver(false);
      setMatchedDriver({
        name: trip?.driver_id ? `Captain ${trip.driver_id.slice(0, 6)}` : 'Driver',
        vehicle: selectedTier === 'Auto' ? 'Bajaj RE Auto' : selectedTier === 'Premium SUV' ? 'Toyota Innova Crysta' : 'Maruti Suzuki Dzire AC',
        plate: '—— —— ————',
        rating: 4.8,
        otp: '----',
      });
    } catch {
      setIsSearchingDriver(false);
      setMatchedDriver({
        name: 'Driver',
        vehicle: selectedTier === 'Auto' ? 'Bajaj RE Auto' : 'Maruti Suzuki Dzire AC',
        plate: 'Awaiting Assignment',
        rating: 4.8,
        otp: '----',
      });
    }
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
          markers={mapMarkers}
        />

        {/* Pickup Location Bubble */}
        <FadeInView delay={100} direction="down" style={styles.pickupPillOuter}>
          <View style={[styles.pickupPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.greenDot} />
            <Text style={[styles.pickupText, { color: colors.text }]} numberOfLines={1}>
              {getLatestTelemetry().addressString || 'Current Location'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
        </FadeInView>
      </View>

      {/* Bottom Sheet / Ride Booking Controls */}
      <View style={[styles.bookingSheet, { backgroundColor: colors.surface }]}>
        {isSearchingDriver ? (
          /* Active Driver Searching Radar State */
          <View style={styles.searchingStateContainer}>
            <View style={styles.radarWrapper}>
              <RadarPulseRing delay={0} size={110} />
              <RadarPulseRing delay={650} size={110} />
              <RadarPulseRing delay={1300} size={110} />
              <View style={[styles.radarCenterCircle, { backgroundColor: BMapColors.primary }]}>
                <Ionicons name="radio" size={32} color="#FFFFFF" />
              </View>
            </View>

            <FadeInView delay={200} direction="up" style={styles.searchingTextCluster}>
              <Text style={[styles.searchingTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
                Connecting to Nearby Drivers...
              </Text>
              <Text style={[styles.searchingSubtitle, { color: colors.textSecondary }]}>
                Broadcasting dispatch request to {selectedTier} drivers within 3 km radius.
              </Text>
            </FadeInView>

            <AnimatedPressable
              onPress={() => setIsSearchingDriver(false)}
              style={[styles.cancelSearchBtn, { backgroundColor: colors.surfaceVariant }]}
            >
              <Text style={[styles.cancelSearchText, { color: colors.textSecondary }]}>Cancel Request</Text>
            </AnimatedPressable>
          </View>
        ) : matchedDriver ? (
          /* Driver Matched & En Route State */
          <FadeInView delay={50} direction="up" style={styles.matchedContainer}>
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
              <View>
                <Text style={[styles.plateLabel, { color: colors.textSecondary }]}>VEHICLE NO.</Text>
                <Text style={[styles.plateText, { color: colors.text }]}>{matchedDriver.plate}</Text>
              </View>
              <View style={styles.arrivingBadge}>
                <Ionicons name="time" size={14} color="#00875A" />
                <Text style={styles.arrivingText}>Arriving in 3 mins</Text>
              </View>
            </View>

            <View style={styles.driverActionButtons}>
              <AnimatedPressable
                style={[styles.callDriverBtn, { backgroundColor: isDark ? '#143820' : '#E8F5E9' }]}
              >
                <Ionicons name="call" size={18} color="#2E7D32" />
                <Text style={styles.callDriverText}>Call Driver</Text>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={() => setIsRatingModalOpen(true)}
                style={[styles.rateTripBtn, { backgroundColor: BMapColors.primary }]}
              >
                <Ionicons name="star" size={18} color="#FFFFFF" />
                <Text style={styles.rateTripText}>Rate Trip</Text>
              </AnimatedPressable>
            </View>
          </FadeInView>
        ) : (
          /* Selectable Vehicle Tier List */
          <View style={styles.tierSelectionContainer}>
            <Text style={[styles.tierHeaderTitle, BMapTypography.titleSmall, { color: colors.textSecondary }]}>
              SELECT RIDE TIER
            </Text>

            <View style={styles.tiersList}>
              {VEHICLE_TIERS.map((tier, index) => {
                const isSelected = selectedTier === tier.id;

                return (
                  <FadeInView key={tier.id} delay={index * 80} direction="up">
                    <AnimatedPressable
                      onPress={() => setSelectedTier(tier.id)}
                      scaleTo={0.97}
                      style={[
                        styles.tierCard,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? '#261C13' : '#FFF7ED')
                            : colors.surfaceVariant,
                          borderColor: isSelected ? BMapColors.primary : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.tierIconContainer,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? '#3D2513' : '#FFEDD5')
                              : (isDark ? '#1F2937' : '#E5E7EB'),
                          },
                        ]}
                      >
                        {tier.iconSet === 'MaterialCommunityIcons' ? (
                          <MaterialCommunityIcons
                            name={tier.icon as any}
                            size={26}
                            color={isSelected ? BMapColors.primary : colors.text}
                          />
                        ) : (
                          <FontAwesome5
                            name={tier.icon}
                            size={22}
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
                    </AnimatedPressable>
                  </FadeInView>
                );
              })}
            </View>

            {/* Confirm Booking Action Button */}
            <AnimatedPressable
              onPress={handleConfirmBooking}
              scaleTo={0.96}
              style={[styles.confirmBtn, { backgroundColor: BMapColors.primary }]}
            >
              <Text style={styles.confirmBtnText}>Confirm {selectedTier} Ride</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </AnimatedPressable>
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
  pickupPillOuter: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
  },
  pickupPill: {
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
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 72,
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
    borderRadius: 12,
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
    gap: 14,
    paddingVertical: 14,
  },
  radarWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: BMapColors.primary,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
  },
  radarCenterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level3,
  },
  searchingTextCluster: {
    alignItems: 'center',
    gap: 6,
  },
  searchingTitle: {
    fontWeight: '800',
    textAlign: 'center',
  },
  searchingSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  cancelSearchBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
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
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  plateText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  arrivingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
