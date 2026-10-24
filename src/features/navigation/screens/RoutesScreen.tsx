import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Navigation,
  Car,
  Bike,
  Footprints,
  TrainFront,
  ArrowDownUp,
  MapPin,
  Leaf,
  IndianRupee,
  CornerDownRight,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Button,
  SectionHeader,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

type RouteProfile = 'drive' | 'bike' | 'walk' | 'transit';

interface RouteAlternativeItem {
  id: string;
  label: string;
  via: string;
  time: string;
  distance: string;
  toll: string;
  tollPlazas: number;
  ecoScore: number;
  color: string;
  trafficColor: string;
  trafficLabel: string;
  isRecommended: boolean;
}

const ROUTE_ALTERNATIVES: RouteAlternativeItem[] = [
  {
    id: '1',
    label: 'Fastest',
    via: 'via NH-48 & Yamuna Expressway',
    time: '2h 14m',
    distance: '168.3 km',
    toll: '₹435',
    tollPlazas: 3,
    ecoScore: 72,
    color: '#0096FF',
    trafficColor: '#00C06D',
    trafficLabel: 'Light Traffic',
    isRecommended: true,
  },
  {
    id: '2',
    label: 'Eco-Friendly',
    via: 'via SH-14 & State Highway',
    time: '2h 42m',
    distance: '182.1 km',
    toll: '₹0',
    tollPlazas: 0,
    ecoScore: 94,
    color: '#00C06D',
    trafficColor: '#FF9800',
    trafficLabel: 'Moderate Traffic',
    isRecommended: false,
  },
  {
    id: '3',
    label: 'Shortest',
    via: 'via Eastern Peripheral Expy',
    time: '2h 28m',
    distance: '154.7 km',
    toll: '₹620',
    tollPlazas: 5,
    ecoScore: 58,
    color: '#FF9800',
    trafficColor: '#F44336',
    trafficLabel: 'Heavy Traffic',
    isRecommended: false,
  },
];

const TOLL_BREAKDOWN = [
  { id: 't_1', plaza: 'Kherki Daula Toll', highway: 'NH-48', fee: '₹155', vehicleClass: 'Car/Jeep' },
  { id: 't_2', plaza: 'Manesar Toll Gate', highway: 'NH-48', fee: '₹130', vehicleClass: 'Car/Jeep' },
  { id: 't_3', plaza: 'Palwal Junction Toll', highway: 'NE-4', fee: '₹150', vehicleClass: 'Car/Jeep' },
];

const TURN_STEPS = [
  { id: 's_1', icon: 'depart', instruction: 'Head northeast on MG Road', distance: '1.2 km', lane: 'Keep center' },
  { id: 's_2', icon: 'turn-right', instruction: 'Turn right onto NH-48 Expressway', distance: '42.6 km', lane: 'Merge right 2 lanes' },
  { id: 's_3', icon: 'ramp', instruction: 'Take exit 14A for Yamuna Expy', distance: '0.8 km', lane: 'Exit right lane' },
  { id: 's_4', icon: 'straight', instruction: 'Continue on Yamuna Expressway', distance: '84.2 km', lane: 'Keep left 2 lanes' },
  { id: 's_5', icon: 'arrive', instruction: 'Arrive at destination', distance: '—', lane: '' },
];

const IMD_WEATHER = {
  level: 'YELLOW',
  color: '#FF9800',
  title: 'Dense Fog Advisory — NH-48 Corridor',
  description: 'Visibility may drop below 200m between 04:00–08:00 AM. Reduce speed. Use fog lamps.',
  validUntil: 'Valid until 12 Oct 2026 09:00 IST',
};

export default function RoutesScreen() {
  const colors = useThemeColors();

  const [activeProfile, setActiveProfile] = useState<RouteProfile>('drive');
  const [selectedRoute, setSelectedRoute] = useState('1');
  const [origin, setOrigin] = useState('Cyber Hub, Gurugram');
  const [destination, setDestination] = useState('Agra Fort, Uttar Pradesh');

  const handleSwap = useCallback(() => {
    haptics.selection();
    setOrigin((prev) => {
      setDestination(prev);
      return destination;
    });
  }, [destination]);

  const handleProfileSelect = useCallback((key: RouteProfile) => {
    haptics.selection();
    setActiveProfile(key);
  }, []);

  const handleRouteSelect = useCallback((id: string) => {
    haptics.selection();
    setSelectedRoute(id);
  }, []);

  const handleStartNavigation = useCallback(() => {
    haptics.medium();
    router.push('/modal');
  }, []);

  const profiles = useMemo(() => [
    {
      key: 'drive' as RouteProfile,
      label: 'Drive',
      icon: (focused: boolean) => (
        <Car size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'bike' as RouteProfile,
      label: 'Rider',
      icon: (focused: boolean) => (
        <Bike size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'walk' as RouteProfile,
      label: 'Walk',
      icon: (focused: boolean) => (
        <Footprints size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'transit' as RouteProfile,
      label: 'Transit',
      icon: (focused: boolean) => (
        <TrainFront size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
  ], [colors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Header
        title="Route Planner"
        subtitle="OSRM Multi-Modal Routing · NavIC Telematics"
        showBack={false}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Origin → Destination Input Card */}
        <Animated.View entering={FadeInDown.duration(280).springify().damping(18)}>
          <Card variant="flat" padding="md" style={styles.routeInputCard}>
            <TouchableOpacity
              style={styles.routeInputRow}
              onPress={() => {
                haptics.light();
                router.push('/search');
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit origin"
              activeOpacity={0.7}>
              <View style={[styles.dotIndicator, { backgroundColor: colors.primaryContainer }]} />
              <View style={styles.routeInputField}>
                <Text style={[styles.routeInputLabel, { color: colors.onSurfaceVariant }]}>
                  FROM (TAP TO EDIT)
                </Text>
                <Text style={[styles.routeInputValue, { color: colors.onSurface }]}>{origin}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.routeInputDivider}>
              <View style={[styles.dottedLine, { borderColor: colors.outlineVariant }]} />
              <TouchableOpacity
                style={[
                  styles.swapButton,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}
                onPress={handleSwap}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Swap origin and destination"
                activeOpacity={0.8}>
                <ArrowDownUp size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.routeInputRow}
              onPress={() => {
                haptics.light();
                router.push('/search');
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit destination"
              activeOpacity={0.7}>
              <View style={[styles.dotIndicator, { backgroundColor: colors.error }]} />
              <View style={styles.routeInputField}>
                <Text style={[styles.routeInputLabel, { color: colors.onSurfaceVariant }]}>
                  TO (TAP TO EDIT)
                </Text>
                <Text style={[styles.routeInputValue, { color: colors.onSurface }]}>{destination}</Text>
              </View>
            </TouchableOpacity>

            {/* DigiPIN Code */}
            <TouchableOpacity
              style={[
                styles.digiPinRow,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={() => {
                haptics.light();
                router.push('/digipin-explorer');
              }}>
              <MapPin size={14} color={colors.primary} />
              <Text style={[styles.digiPinText, { color: colors.onSurface }]}>
                DigiPIN: <Text style={{ fontWeight: '800' }}>28J4-M1K9-7P</Text>
              </Text>
              <ChevronRight size={14} color={colors.onSurfaceVariant} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Transport Mode Profile Bar */}
        <Animated.View entering={FadeInDown.delay(50).duration(280).springify().damping(18)} style={styles.profileRow}>
          {profiles.map((p) => {
            const isSelected = activeProfile === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.profileTab,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryContainer
                      : colors.surfaceContainerLow,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.surfaceContainerHigh,
                  },
                ]}
                onPress={() => handleProfileSelect(p.key)}
                accessibilityRole="button"
                accessibilityLabel={`${p.label} route profile`}
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.8}>
                {p.icon(isSelected)}
                <Text
                  style={[
                    styles.profileTabLabel,
                    {
                      color: isSelected
                        ? colors.onPrimary
                        : colors.onSurfaceVariant,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* IMD Weather Alert */}
        <Animated.View entering={FadeInDown.delay(100).duration(280).springify().damping(18)}>
          <Card
            variant="flat"
            padding="sm"
            style={[styles.weatherCard, { backgroundColor: colors.tertiaryContainer }]}>
            <View style={styles.weatherRow}>
              <AlertTriangle size={18} color={IMD_WEATHER.color} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.weatherTitle, { color: colors.onTertiaryContainer }]}>
                  {IMD_WEATHER.title}
                </Text>
                <Text style={[styles.weatherDesc, { color: colors.onTertiaryContainer }]}>
                  {IMD_WEATHER.description}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Route Alternatives */}
        <SectionHeader
          title="Route Alternatives"
          subtitle="Real-Time Congestion & FASTag Toll Estimates"
        />

        {ROUTE_ALTERNATIVES.map((item, idx) => {
          const isSelected = selectedRoute === item.id;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(idx * 60).duration(280).springify().damping(18)}>
              <TouchableOpacity
                onPress={() => handleRouteSelect(item.id)}
                activeOpacity={0.85}>
                <Card
                  variant={isSelected ? 'elevated' : 'flat'}
                  padding="md"
                  style={[
                    styles.routeCard,
                    isSelected && {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}>
                  <View style={styles.routeHeader}>
                    <View style={styles.routeTitleGroup}>
                      <View
                        style={[
                          styles.badgePill,
                          {
                            backgroundColor: isSelected
                              ? colors.primaryContainer
                              : colors.surfaceContainerHigh,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color: isSelected
                                ? colors.onPrimary
                                : colors.onSurface,
                            },
                          ]}>
                          {item.label}
                        </Text>
                      </View>
                      <Text style={[styles.viaText, { color: colors.onSurfaceVariant }]}>
                        {item.via}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.trafficBadge,
                        { backgroundColor: item.trafficColor + '20' },
                      ]}>
                      <View
                        style={[
                          styles.trafficDot,
                          { backgroundColor: item.trafficColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.trafficLabel,
                          { color: item.trafficColor },
                        ]}>
                        {item.trafficLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routeMetricsRow}>
                    <View>
                      <Text style={[styles.timeText, { color: colors.onSurface }]}>
                        {item.time}
                      </Text>
                      <Text style={[styles.distText, { color: colors.onSurfaceVariant }]}>
                        {item.distance}
                      </Text>
                    </View>

                    <View style={styles.tollPill}>
                      <IndianRupee size={12} color={colors.primary} />
                      <Text style={[styles.tollText, { color: colors.onSurface }]}>
                        FASTag: {item.toll} ({item.tollPlazas} plazas)
                      </Text>
                    </View>

                    <View style={styles.ecoPill}>
                      <Leaf size={12} color="#00C06D" />
                      <Text style={[styles.ecoText, { color: '#00C06D' }]}>
                        Eco {item.ecoScore}/100
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* NHAI FASTag Toll Plaza Breakdown */}
        <SectionHeader
          title="NHAI FASTag Toll Breakdown"
          subtitle="Electronic Toll Collection Plaza Fees"
        />

        <Card variant="flat" padding="md" style={styles.tollBreakdownCard}>
          {TOLL_BREAKDOWN.map((plaza, i) => (
            <View
              key={plaza.id}
              style={[
                styles.plazaRow,
                i > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: colors.surfaceContainerHigh,
                  paddingTop: 8,
                  marginTop: 8,
                },
              ]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.plazaName, { color: colors.onSurface }]}>
                  {plaza.plaza}
                </Text>
                <Text style={[styles.plazaSub, { color: colors.onSurfaceVariant }]}>
                  {plaza.highway} · {plaza.vehicleClass}
                </Text>
              </View>
              <Text style={[styles.plazaFee, { color: colors.primary }]}>{plaza.fee}</Text>
            </View>
          ))}
        </Card>

        {/* Turn-by-Turn Key Steps */}
        <SectionHeader
          title="Major Guidance Steps"
          subtitle="High-level Turn Preview"
        />

        <Card variant="flat" padding="md" style={styles.stepsCard}>
          {TURN_STEPS.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={[styles.stepIconBox, { backgroundColor: colors.surfaceContainerLow }]}>
                <CornerDownRight size={14} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.stepInst, { color: colors.onSurface }]}>
                  {step.instruction}
                </Text>
                {step.lane ? (
                  <Text style={[styles.stepLane, { color: colors.onSurfaceVariant }]}>
                    {step.lane}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.stepDist, { color: colors.onSurfaceVariant }]}>
                {step.distance}
              </Text>
            </View>
          ))}
        </Card>

        {/* Start Route Navigation CTA */}
        <View style={styles.ctaContainer}>
          <Button
            title="Start Turn-by-Turn Guidance"
            onPress={handleStartNavigation}
            size="lg"
            variant="primary"
            fullWidth
            leftIcon={<Navigation size={20} color={colors.onPrimary} />}
          />
        </View>
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
    paddingBottom: 100,
    gap: Spacing.md,
  },
  routeInputCard: {
    borderRadius: Radius.xl,
  },
  routeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  routeInputField: {
    flex: 1,
  },
  routeInputLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  routeInputValue: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginTop: 1,
  },
  routeInputDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: Spacing.sm,
  },
  digiPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 10,
    borderWidth: 1,
  },
  digiPinText: {
    ...Typography.bodySmall,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  profileTabLabel: {
    ...Typography.labelMedium,
  },
  weatherCard: {
    borderRadius: Radius.lg,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weatherTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  weatherDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  routeCard: {
    marginBottom: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  viaText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  trafficBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  trafficDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trafficLabel: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  routeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeText: {
    ...Typography.titleLarge,
    fontWeight: '800',
  },
  distText: {
    ...Typography.bodySmall,
  },
  tollPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tollText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  ecoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ecoText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  tollBreakdownCard: {
    borderRadius: Radius.lg,
  },
  plazaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plazaName: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  plazaSub: {
    ...Typography.bodySmall,
  },
  plazaFee: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  stepsCard: {
    borderRadius: Radius.lg,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInst: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  stepLane: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  stepDist: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  ctaContainer: {
    marginTop: Spacing.sm,
  },
});
