import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { BMapView, BMapPolylineItem } from '@/components/BMapView';
import { DraggableBottomSheet } from '@/components/DraggableBottomSheet';
import { RouteComparisonCard } from '@/components/RouteComparisonCard';
import { TransportComparison, IndianTransportMode, LatLng } from '@/types';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';
import { RoutesAPI, IndianEcosystemAPI } from '@/api/api';
import { RouteResponse } from '@/api/types';
import { getLatestTelemetry } from '@/services/telemetry';

function decodePolyline(encoded: string): LatLng[] {
  if (!encoded) return [];
  const points: LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export default function RoutePlannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destTitle?: string;
    destLat?: string;
    destLng?: string;
    destDigipin?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState(params.destTitle || '');
  const [selectedMode, setSelectedMode] = useState<IndianTransportMode>('cab');

  // Live route states
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [polylines, setPolylines] = useState<BMapPolylineItem[]>([]);
  const [fastagToll, setFastagToll] = useState<number | null>(null);
  const [meteredCab, setMeteredCab] = useState<number | null>(null);
  const [meteredAuto, setMeteredAuto] = useState<number | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  void isLoadingRoute; // used for future loading skeleton UI

  // Animated swap rotation
  const swapRotation = useSharedValue(0);

  const handleSwap = () => {
    swapRotation.value = withTiming(swapRotation.value + 180, {
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const swapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  // Populate origin from telemetry on mount
  useEffect(() => {
    const loc = getLatestTelemetry();
    setOrigin(loc.addressString || 'Current Location');
  }, []);

  // Fetch real route from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDirections = async () => {
      setIsLoadingRoute(true);
      try {
        const loc = getLatestTelemetry();
        const oLat = loc.latitude;
        const oLng = loc.longitude;
        const dLat = params.destLat ? parseFloat(params.destLat) : 28.4907;
        const dLng = params.destLng ? parseFloat(params.destLng) : 77.0911;

        const res = await RoutesAPI.getDirections({
          origin: `${oLat},${oLng}`,
          destination: `${dLat},${dLng}`,
          mode: 'driving',
        });

        const routeData = res.data?.route;
        if (isMounted && routeData) {
          setRoute(routeData);
          const decoded = decodePolyline(routeData.overview_polyline);
          const coords =
            decoded.length > 0
              ? decoded
              : [
                  { latitude: oLat, longitude: oLng },
                  { latitude: dLat, longitude: dLng },
                ];
          setPolylines([
            {
              coordinates: coords,
              strokeColor: BMapColors.navBlue,
              strokeWidth: 5,
            },
          ]);

          const distKm = Math.round((routeData.distance_meters / 1000) * 10) / 10;

          // Fetch FASTag toll for this corridor
          try {
            const tollRes = await IndianEcosystemAPI.calculateFASTagToll({
              route_coordinates: coords,
              vehicle_type: 'CAR_JEEP_VAN',
            });
            if (isMounted && tollRes.data?.data?.total_toll_inr !== undefined) {
              setFastagToll(tollRes.data.data.total_toll_inr);
            }
          } catch {}

          // Fetch live metered fares from backend
          try {
            const fareRes = await IndianEcosystemAPI.estimateMeteredFare({
              city: 'DELHI',
              distance_km: distKm,
              duration_minutes: Math.round(routeData.duration_seconds / 60),
            });
            const options = fareRes.data?.data?.fare_options;
            if (isMounted && options && options.length > 0) {
              const cabOpt = options.find((o: any) => o.vehicle_category.toLowerCase().includes('cab') || o.vehicle_category.toLowerCase().includes('sedan') || o.vehicle_category.toLowerCase().includes('taxi'));
              const autoOpt = options.find((o: any) => o.vehicle_category.toLowerCase().includes('auto'));
              if (cabOpt) setMeteredCab(cabOpt.total_estimated_inr);
              if (autoOpt) setMeteredAuto(autoOpt.total_estimated_inr);
            }
          } catch {}
        }
      } catch (e) {
        console.warn('Failed to fetch directions from backend:', e);
      } finally {
        if (isMounted) setIsLoadingRoute(false);
      }
    };

    fetchDirections();
    return () => {
      isMounted = false;
    };
  }, [params.destLat, params.destLng]);

  const distanceKm = route ? Math.round((route.distance_meters / 1000) * 10) / 10 : 24.2;
  const durationMinutes = route ? Math.max(1, Math.round(route.duration_seconds / 60)) : 38;
  const summaryRoad = route?.summary || 'NH-48 • Fastest Route with FASTag';

  const etaString = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + durationMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [durationMinutes]);

  const transportComparisons: TransportComparison[] = useMemo(() => {
    const cab = meteredCab ?? 310;
    const auto = meteredAuto ?? 180;
    return [
      {
        mode: 'two-wheeler',
        label: 'Two-Wheeler',
        labelHi: 'बाइक',
        etaMinutes: Math.round(durationMinutes * 0.8),
        fareEstimate: Math.round(cab * 0.35),
        distanceKm,
        trafficLevel: 'moderate',
        isAvailable: true,
      },
      {
        mode: 'auto',
        label: 'Auto Rickshaw',
        labelHi: 'ऑटो',
        etaMinutes: Math.round(durationMinutes * 1.1),
        fareEstimate: auto,
        distanceKm,
        trafficLevel: 'moderate',
        isAvailable: true,
      },
      {
        mode: 'cab',
        label: 'Cab',
        labelHi: 'कैब',
        etaMinutes: durationMinutes,
        fareEstimate: cab,
        distanceKm,
        trafficLevel: 'moderate',
        isAvailable: true,
        surgeMultiplier: 1.1,
      },
      {
        mode: 'metro-bus',
        label: 'Metro + Bus',
        labelHi: 'मेट्रो',
        etaMinutes: Math.round(durationMinutes * 1.5),
        fareEstimate: 45,
        distanceKm,
        trafficLevel: 'low',
        isAvailable: true,
      },
      {
        mode: 'walking',
        label: 'Walking',
        labelHi: 'पैदल',
        etaMinutes: Math.round(distanceKm * 12),
        fareEstimate: 0,
        distanceKm,
        trafficLevel: 'low',
        isAvailable: distanceKm < 5,
      },
    ];
  }, [distanceKm, durationMinutes, meteredCab, meteredAuto]);

  const handleStartNavigation = useCallback(
    (mode: IndianTransportMode) => {
      const comparison = transportComparisons.find(c => c.mode === mode);
      const safeToll = fastagToll ?? 0;
      router.push({
        pathname: '/navigate/live' as any,
        params: {
          routeId: 'live-route',
          routeName: summaryRoad,
          durationMinutes: (comparison?.etaMinutes ?? durationMinutes).toString(),
          distanceKm: distanceKm.toString(),
          hasFastagToll: safeToll > 0 ? 'true' : 'false',
          tollFee: safeToll.toString(),
          transportMode: mode,
          destTitle: destination,
          overviewPolyline: route?.overview_polyline || '',
        },
      });
    },
    [transportComparisons, summaryRoad, durationMinutes, distanceKm, fastagToll, destination, route, router]
  );

  return (
    <View style={styles.container}>
      {/* Full-screen map background with live route polyline */}
      <BMapView
        mapStyleType={isDark ? 'dark' : 'daylight'}
        polylines={polylines}
      />

      {/* Floating origin/destination input card */}
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <FadeInView delay={50} from="down" slideDistance={15}>
          <View style={[styles.inputCard, { backgroundColor: isDark ? 'rgba(17,19,26,0.95)' : 'rgba(255,255,255,0.96)', borderColor: colors.border }]}>
            {/* Back button */}
            <AnimatedPressable
              onPress={() => router.back()}
              scaleTo={0.85}
              style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}
            >
              <Ionicons name="arrow-back" size={isSmallDevice ? 18 : 20} color={colors.text} />
            </AnimatedPressable>

            {/* Route graphic + inputs */}
            <View style={styles.routeInputRow}>
              <View style={styles.routeGraphicContainer}>
                <View style={[styles.dotCircle, { backgroundColor: '#1E88E5' }]} />
                <View style={[styles.connectingLine, { backgroundColor: colors.border }]} />
                <View style={[styles.dotCircle, { backgroundColor: BMapColors.primary }]} />
              </View>

              <View style={styles.inputsColumn}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={origin}
                    onChangeText={setOrigin}
                    placeholder="Choose starting point"
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Origin"
                  />
                </View>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Choose destination"
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Destination"
                  />
                </View>
              </View>

              {/* Swap Button */}
              <AnimatedPressable
                onPress={handleSwap}
                scaleTo={0.9}
                style={[styles.swapButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Swap origin and destination"
              >
                <Animated.View style={swapAnimatedStyle}>
                  <Ionicons name="swap-vertical" size={20} color={BMapColors.primary} />
                </Animated.View>
              </AnimatedPressable>
            </View>
          </View>
        </FadeInView>
      </SafeAreaView>

      {/* Bottom Sheet: Route Comparison */}
      <DraggableBottomSheet
        snapPoints={['22%', '55%', '90%']}
        initialIndex={1}
        scrollable
      >
        {/* Route info header */}
        <FadeInView delay={100} from="up" slideDistance={10}>
          <View style={styles.routeInfoHeader}>
            <View style={styles.routeInfoLeft}>
              <Text style={[BMapTypography.headlineMedium, { color: colors.text }]}>
                {durationMinutes} min
              </Text>
              <Text style={[styles.routeDistance, { color: colors.textSecondary }]}>
                {distanceKm} km via {summaryRoad.split('•')[0].trim()}
              </Text>
            </View>
            <View style={[styles.etaBadge]}>
              <Text style={styles.etaText}>ETA {etaString}</Text>
            </View>
          </View>
        </FadeInView>

        {/* FASTag / Toll info */}
        <FadeInView delay={150} from="up" slideDistance={8}>
          <View style={styles.tagsRow}>
            {fastagToll !== null && fastagToll > 0 ? (
              <View style={[styles.tagPill, { backgroundColor: BMapColors.fastagPurpleLight }]}>
                <MaterialCommunityIcons name="card-bulleted" size={14} color={BMapColors.fastagPurple} />
                <Text style={[styles.tagPillText, { color: BMapColors.fastagPurple }]}>
                  FASTag: ₹{fastagToll} (1 Toll Plaza)
                </Text>
              </View>
            ) : fastagToll === null ? (
              <View style={[styles.tagPill, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.tagPillText, { color: colors.textMuted }]}>Calculating toll...</Text>
              </View>
            ) : (
              <View style={[styles.tagPill, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                <Text style={[styles.tagPillText, { color: '#2E7D32' }]}>Toll-Free Route</Text>
              </View>
            )}

            <View style={[styles.tagPill, { backgroundColor: BMapColors.glosaGreenBg }]}>
              <Ionicons name="speedometer" size={14} color={BMapColors.glosaGreen} />
              <Text style={[styles.tagPillText, { color: BMapColors.glosaGreen }]}>
                GLOSA: 50 km/h
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Transport Mode Comparison */}
        <RouteComparisonCard
          comparisons={transportComparisons}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartNavigation={handleStartNavigation}
        />

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </DraggableBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: isSmallDevice ? 10 : 14,
  },
  inputCard: {
    borderRadius: 22,
    padding: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    gap: 10,
    ...BMapElevation.level3,
  },
  backBtn: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeGraphicContainer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dotCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectingLine: {
    width: 2,
    height: 24,
  },
  inputsColumn: {
    flex: 1,
    gap: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: isSmallDevice ? 38 : 42,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
    fontWeight: '500',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sheet content
  routeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 4,
  },
  routeInfoLeft: {
    flex: 1,
  },
  routeDistance: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  etaBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  etaText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
});
