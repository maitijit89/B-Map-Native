import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Navigation,
  Car,
  Bike,
  Footprints,
  TrainFront,
  ArrowDownUp,
  Clock,
  MapPin,
  Leaf,
  IndianRupee,
  Shield,
  Milestone,
  CornerDownRight,
  AlertTriangle,
  Zap,
  RotateCw,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme, useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Chip,
  Card,
  Button,
  SectionHeader,
  MetricCard,
} from '@/shared/components/ui';

type RouteProfile = 'drive' | 'bike' | 'walk' | 'transit';

const ROUTE_ALTERNATIVES = [
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
  { plaza: 'Kherki Daula Toll', highway: 'NH-48', fee: '₹155', vehicleClass: 'Car/Jeep' },
  { plaza: 'Manesar Toll Gate', highway: 'NH-48', fee: '₹130', vehicleClass: 'Car/Jeep' },
  { plaza: 'Palwal Junction Toll', highway: 'NE-4', fee: '₹150', vehicleClass: 'Car/Jeep' },
];

const TURN_STEPS = [
  { icon: 'depart', instruction: 'Head northeast on MG Road', distance: '1.2 km', lane: 'Keep center' },
  { icon: 'turn-right', instruction: 'Turn right onto NH-48 Expressway', distance: '42.6 km', lane: 'Merge right 2 lanes' },
  { icon: 'ramp', instruction: 'Take exit 14A for Yamuna Expy', distance: '0.8 km', lane: 'Exit right lane' },
  { icon: 'straight', instruction: 'Continue on Yamuna Expressway', distance: '84.2 km', lane: 'Keep left 2 lanes' },
  { icon: 'arrive', instruction: 'Arrive at destination', distance: '—', lane: '' },
];

const IMD_WEATHER = {
  level: 'YELLOW',
  color: '#FF9800',
  title: 'Dense Fog Advisory — NH-48 Corridor',
  description: 'Visibility may drop below 200m between 04:00–08:00 AM. Reduce speed. Use fog lamps.',
  validUntil: 'Valid until 12 Oct 2026 09:00 IST',
};

export default function RoutesScreen() {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const [activeProfile, setActiveProfile] = useState<RouteProfile>('drive');
  const [selectedRoute, setSelectedRoute] = useState('1');
  const [origin, setOrigin] = useState('Cyber Hub, Gurugram');
  const [destination, setDestination] = useState('Agra Fort, Uttar Pradesh');

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleSwap = () => {
    triggerHaptic();
    setOrigin(destination);
    setDestination(origin);
  };

  const handleProfileSelect = (key: RouteProfile) => {
    triggerHaptic();
    setActiveProfile(key);
  };

  const handleRouteSelect = (id: string) => {
    triggerHaptic();
    setSelectedRoute(id);
  };

  const handleStartNavigation = () => {
    triggerHaptic();
    router.push('/modal');
  };

  const profiles: { key: RouteProfile; label: string; icon: (focused: boolean) => React.ReactNode }[] = [
    {
      key: 'drive',
      label: 'Drive',
      icon: (focused) => (
        <Car size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'bike',
      label: 'Rider',
      icon: (focused) => (
        <Bike size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'walk',
      label: 'Walk',
      icon: (focused) => (
        <Footprints size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
    {
      key: 'transit',
      label: 'Transit',
      icon: (focused) => (
        <TrainFront size={18} color={focused ? colors.onPrimary : colors.onSurfaceVariant} />
      ),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Route Planner</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          OSRM Multi-Modal Intelligent Routing · NavIC Telematics
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Origin → Destination Input Card */}
        <Card variant="flat" padding="md" style={styles.routeInputCard}>
          <TouchableOpacity
            style={styles.routeInputRow}
            onPress={() => {
              triggerHaptic();
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
              accessibilityRole="button"
              accessibilityLabel="Swap origin and destination"
              activeOpacity={0.8}>
              <ArrowDownUp size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.routeInputRow}
            onPress={() => {
              triggerHaptic();
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
              triggerHaptic();
              router.push('/digipin-explorer');
            }}
            accessibilityRole="button"
            accessibilityLabel="DigiPIN 28J4-K8M2-9P Explorer"
            activeOpacity={0.8}>
            <View style={[styles.digiPinBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.digiPinLabel, { color: colors.onPrimary }]}>DigiPIN</Text>
            </View>
            <Text style={[styles.digiPinCode, { color: colors.primary }]}>28J4-K8M2-9P</Text>
            <Text style={[styles.digiPinDesc, { color: colors.onSurfaceVariant }]}>
              4m×4m sovereign grid
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Multi-Modal Profile Selector */}
        <View style={styles.profileRow}>
          {profiles.map((p) => {
            const isFocused = activeProfile === p.key;
            return (
              <Chip
                key={p.key}
                label={p.label}
                selected={isFocused}
                onPress={() => handleProfileSelect(p.key)}
                icon={p.icon(isFocused)}
                size="md"
              />
            );
          })}
        </View>

        {/* If Transit selected, show Multimodal Transit Planner Shortcut */}
        {activeProfile === 'transit' && (
          <Card
            variant="flat"
            padding="md"
            style={[
              styles.tspActionCard,
              {
                backgroundColor: isDark ? 'rgba(156, 39, 176, 0.15)' : '#F3E5F5',
                borderColor: '#CE93D8',
              },
            ]}
            onPress={() => {
              triggerHaptic();
              router.push('/transit-planner');
            }}>
            <View style={styles.tspActionLeft}>
              <View style={[styles.tspIconBadge, { backgroundColor: '#9C27B0' }]}>
                <TrainFront size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={[styles.tspActionTitle, { color: colors.onSurface }]}>
                  DMRC Metro & Bus Schedules
                </Text>
                <Text style={[styles.tspActionSub, { color: colors.onSurfaceVariant }]}>
                  Yellow/Blue lines, feeder buses & QR tokens
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9C27B0" />
          </Card>
        )}

        {/* Multi-Stop TSP Delivery Optimizer */}
        <Card
          variant="flat"
          padding="md"
          style={styles.tspActionCard}
          onPress={() => {
            triggerHaptic();
            router.push('/tsp-optimizer');
          }}>
          <View style={styles.tspActionLeft}>
            <View style={[styles.tspIconBadge, { backgroundColor: colors.primaryContainer }]}>
              <RotateCw size={16} color={colors.onPrimary} />
            </View>
            <View>
              <Text style={[styles.tspActionTitle, { color: colors.onSurface }]}>
                Multi-Stop Delivery Optimizer (TSP)
              </Text>
              <Text style={[styles.tspActionSub, { color: colors.onSurfaceVariant }]}>
                Greedy 2-Opt edge exchange · Up to 25 stops
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.primary} />
        </Card>

        {/* IMD Weather Advisory Banner */}
        <Card
          variant="flat"
          padding="md"
          style={[
            styles.weatherBanner,
            {
              borderLeftColor: IMD_WEATHER.color,
              borderColor: colors.surfaceContainerHigh,
            },
          ]}>
          <View style={styles.weatherBannerHeader}>
            <View style={[styles.weatherLevelBadge, { backgroundColor: IMD_WEATHER.color }]}>
              <AlertTriangle size={12} color="#fff" />
              <Text style={styles.weatherLevelText}>{IMD_WEATHER.level}</Text>
            </View>
            <Text style={[styles.weatherValid, { color: colors.onSurfaceVariant }]}>
              {IMD_WEATHER.validUntil}
            </Text>
          </View>
          <Text style={[styles.weatherTitle, { color: colors.onSurface }]}>
            {IMD_WEATHER.title}
          </Text>
          <Text style={[styles.weatherDesc, { color: colors.onSurfaceVariant }]}>
            {IMD_WEATHER.description}
          </Text>
        </Card>

        {/* Route Alternatives */}
        <SectionHeader title="Route Alternatives" />
        {ROUTE_ALTERNATIVES.map((route) => {
          const isSelected = selectedRoute === route.id;
          return (
            <Card
              key={route.id}
              variant={isSelected ? 'glass' : 'flat'}
              padding="md"
              style={[
                styles.routeCard,
                {
                  borderColor: isSelected ? colors.primary : colors.surfaceContainerHigh,
                },
                isSelected && styles.routeCardSelected,
              ]}
              onPress={() => handleRouteSelect(route.id)}>
              <View style={styles.routeCardHeader}>
                <View style={styles.routeCardLeft}>
                  <View style={[styles.routeLabelBadge, { backgroundColor: route.color }]}>
                    <Text style={styles.routeLabelText}>{route.label}</Text>
                  </View>
                  {route.isRecommended && (
                    <View
                      style={[
                        styles.recommendedBadge,
                        { backgroundColor: colors.primaryFixed },
                      ]}>
                      <Zap size={10} color={colors.primary} />
                      <Text style={[styles.recommendedText, { color: colors.primary }]}>
                        AI Recommended
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.trafficPill,
                    { backgroundColor: route.trafficColor + '20' },
                  ]}>
                  <View style={[styles.trafficDot, { backgroundColor: route.trafficColor }]} />
                  <Text style={[styles.trafficText, { color: route.trafficColor }]}>
                    {route.trafficLabel}
                  </Text>
                </View>
              </View>

              <Text style={[styles.routeVia, { color: colors.onSurfaceVariant }]}>
                {route.via}
              </Text>

              <View style={[styles.routeMetrics, { borderTopColor: colors.surfaceContainerHigh }]}>
                <View style={styles.metric}>
                  <Clock size={14} color={colors.onSurfaceVariant} />
                  <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                    {route.time}
                  </Text>
                </View>
                <View style={[styles.metricDivider, { backgroundColor: colors.outlineVariant }]} />
                <View style={styles.metric}>
                  <MapPin size={14} color={colors.onSurfaceVariant} />
                  <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                    {route.distance}
                  </Text>
                </View>
                <View style={[styles.metricDivider, { backgroundColor: colors.outlineVariant }]} />
                <View style={styles.metric}>
                  <IndianRupee size={14} color={colors.onSurfaceVariant} />
                  <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                    {route.toll}
                  </Text>
                  <Text style={[styles.metricSub, { color: colors.onSurfaceVariant }]}>
                    ({route.tollPlazas} tolls)
                  </Text>
                </View>
                <View style={[styles.metricDivider, { backgroundColor: colors.outlineVariant }]} />
                <View style={styles.metric}>
                  <Leaf size={14} color={route.ecoScore > 80 ? colors.trafficGreen : colors.trafficOrange} />
                  <Text
                    style={[
                      styles.metricValue,
                      { color: route.ecoScore > 80 ? colors.trafficGreen : colors.trafficOrange },
                    ]}>
                    {route.ecoScore}
                  </Text>
                </View>
              </View>

              {isSelected && (
                <Button
                  variant="primary"
                  size="md"
                  title="Start Navigation"
                  leftIcon={<Navigation size={18} color={colors.onPrimary} />}
                  onPress={handleStartNavigation}
                  style={{ marginTop: Spacing.md }}
                />
              )}
            </Card>
          );
        })}

        {/* FASTag NHAI Toll Breakdown */}
        <SectionHeader title="FASTag Toll Breakdown" />
        <Card variant="flat" padding="md" style={styles.tollCard}>
          <TouchableOpacity
            style={styles.tollHeader}
            onPress={() => {
              triggerHaptic();
              router.push('/vehicle-fleet');
            }}
            accessibilityRole="button"
            accessibilityLabel="Manage FASTag fleet"
            activeOpacity={0.8}>
            <View style={styles.tollHeaderLeft}>
              <View style={[styles.fastagBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.fastagText, { color: colors.onPrimary }]}>FASTag</Text>
              </View>
              <Text style={[styles.tollVehicleClass, { color: colors.onSurfaceVariant }]}>
                Car/Jeep (Class 4) · Manage Fleet
              </Text>
            </View>
            <Text style={[styles.tollTotal, { color: colors.primary }]}>₹435 ➔</Text>
          </TouchableOpacity>

          {TOLL_BREAKDOWN.map((toll, index) => (
            <View
              key={index}
              style={[styles.tollRow, { borderBottomColor: colors.surfaceContainerHigh }]}>
              <View style={styles.tollRowLeft}>
                <View style={[styles.tollDot, { backgroundColor: colors.primaryContainer }]} />
                <View>
                  <Text style={[styles.tollPlazaName, { color: colors.onSurface }]}>
                    {toll.plaza}
                  </Text>
                  <Text style={[styles.tollHighway, { color: colors.onSurfaceVariant }]}>
                    {toll.highway}
                  </Text>
                </View>
              </View>
              <Text style={[styles.tollFee, { color: colors.onSurface }]}>{toll.fee}</Text>
            </View>
          ))}

          <View style={[styles.tollLaneHint, { backgroundColor: colors.surfaceContainerLow }]}>
            <Shield size={14} color={colors.primary} />
            <Text style={[styles.tollLaneText, { color: colors.onSurfaceVariant }]}>
              Use FASTag dedicated lanes for cashless express passage
            </Text>
          </View>
        </Card>

        {/* Turn-by-Turn Preview Timeline */}
        <SectionHeader title="Turn-by-Turn Preview" />
        <Card variant="flat" padding="md" style={styles.stepsCard}>
          {TURN_STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIconCol}>
                <View
                  style={[
                    styles.stepIconCircle,
                    {
                      backgroundColor:
                        index === TURN_STEPS.length - 1
                          ? colors.error
                          : colors.primaryContainer,
                    },
                  ]}>
                  {index === TURN_STEPS.length - 1 ? (
                    <MapPin size={14} color="#ffffff" />
                  ) : (
                    <CornerDownRight size={14} color="#ffffff" />
                  )}
                </View>
                {index < TURN_STEPS.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: colors.outlineVariant }]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepInstruction, { color: colors.onSurface }]}>
                  {step.instruction}
                </Text>
                <View style={styles.stepMeta}>
                  <Text style={[styles.stepDistance, { color: colors.onSurfaceVariant }]}>
                    {step.distance}
                  </Text>
                  {step.lane ? (
                    <View
                      style={[
                        styles.laneBadge,
                        { backgroundColor: colors.surfaceContainerLow },
                      ]}>
                      <Milestone size={10} color={colors.primary} />
                      <Text style={[styles.laneText, { color: colors.primary }]}>{step.lane}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Eco-Routing Info Card */}
        <Card variant="flat" padding="md" style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Leaf size={20} color={colors.trafficGreen} />
            <Text style={[styles.ecoTitle, { color: colors.onSurface }]}>Green Eco-Routing</Text>
          </View>
          <Text style={[styles.ecoDesc, { color: colors.onSurfaceVariant }]}>
            The Eco-Friendly route saves ~1.8 kg CO₂ by reducing acceleration events and toll stop-and-go idling. 
            EV vehicles gain +12 km range from regenerative braking on downhill gradients.
          </Text>
          <View style={styles.ecoMetrics}>
            <MetricCard label="Carbon" value="-23%" style={{ flex: 1 }} />
            <MetricCard label="EV Range" value="+12 km" style={{ flex: 1 }} />
            <MetricCard label="Toll Fees" value="₹0" style={{ flex: 1 }} />
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Shadows.xs,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  scroll: {
    padding: Spacing.md,
    gap: 14,
  },
  routeInputCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
    gap: 10,
  },
  routeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeInputField: {
    flex: 1,
  },
  routeInputLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  routeInputValue: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginTop: 2,
  },
  routeInputDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: -2,
    paddingLeft: 5,
  },
  dottedLine: {
    width: 2,
    height: 20,
    borderStyle: 'dotted',
    borderLeftWidth: 2,
  },
  swapButton: {
    marginLeft: 14,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digiPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  digiPinBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  digiPinLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '800',
  },
  digiPinCode: {
    ...Typography.labelMedium,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  digiPinDesc: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.xs,
  },
  profileChipText: {
    ...Typography.labelMedium,
    fontSize: 12,
  },
  tspActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    ...Shadows.xs,
  },
  tspActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tspIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tspActionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  tspActionSub: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  weatherBanner: {
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
    ...Shadows.xs,
  },
  weatherBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  weatherLevelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  weatherValid: {
    fontSize: 10,
  },
  weatherTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  weatherDesc: {
    ...Typography.bodySmall,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontWeight: '800',
    marginTop: 6,
  },
  routeCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    gap: 10,
    ...Shadows.sm,
  },
  routeCardSelected: {
    borderWidth: 2,
    ...Shadows.md,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLabelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  routeLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  trafficPill: {
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
  trafficText: {
    fontSize: 10,
    fontWeight: '700',
  },
  routeVia: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  routeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 9,
  },
  metricDivider: {
    width: 1,
    height: 14,
  },
  startNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    marginTop: 4,
    ...Shadows.sm,
  },
  startNavText: {
    ...Typography.labelLarge,
    fontWeight: '700',
  },
  tollCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 10,
    ...Shadows.sm,
  },
  tollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  tollHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fastagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  fastagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tollVehicleClass: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  tollTotal: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  tollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tollRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tollPlazaName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  tollHighway: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  tollFee: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  tollLaneHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: 2,
  },
  tollLaneText: {
    ...Typography.bodySmall,
    fontSize: 10,
    flex: 1,
  },
  stepsCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIconCol: {
    alignItems: 'center',
    width: 24,
  },
  stepIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    height: 32,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepInstruction: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  stepDistance: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  laneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  laneText: {
    fontSize: 9,
    fontWeight: '600',
  },
  ecoCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 8,
    ...Shadows.sm,
  },
  ecoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ecoTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  ecoDesc: {
    ...Typography.bodySmall,
    fontSize: 11,
    lineHeight: 16,
  },
  ecoMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  ecoMetricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  ecoMetricValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  ecoMetricLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
    marginTop: 2,
  },
});
