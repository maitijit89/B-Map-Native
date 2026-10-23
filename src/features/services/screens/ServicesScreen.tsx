import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Satellite,
  Shield,
  Leaf,
  Phone,
  Camera,
  Radio,
  ThumbsUp,
  ThumbsDown,
  Car,
  Truck,
  Bus,
  Signal,
  Waves,
  Siren,
  Heart,
  TriangleAlert,
  CreditCard,
  ChevronRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Button,
  Badge,
  StatusBadge,
  SectionHeader,
  MetricCard,
} from '@/shared/components/ui';

const NAVIC_SATELLITES = [
  { id: 'IRNSS-1A', band: 'L5', signal: 42, status: 'Active', elevation: '55°' },
  { id: 'IRNSS-1B', band: 'S', signal: 38, status: 'Active', elevation: '38°' },
  { id: 'IRNSS-1C', band: 'L5', signal: 45, status: 'Active', elevation: '62°' },
  { id: 'IRNSS-1D', band: 'L5+S', signal: 48, status: 'Active', elevation: '71°' },
  { id: 'IRNSS-1G', band: 'L5', signal: 35, status: 'Active', elevation: '28°' },
];

const INITIAL_HAZARD_REPORTS = [
  { id: 1, type: 'Pothole', location: 'NH-48 km 42.3', time: '12 min ago', upvotes: 23, severity: 'high' as const, color: '#F44336' },
  { id: 2, type: 'Waterlogging', location: 'Sector 29 underpass', time: '28 min ago', upvotes: 45, severity: 'high' as const, color: '#2196F3' },
  { id: 3, type: 'Roadwork', location: 'MG Road junction', time: '1h ago', upvotes: 18, severity: 'medium' as const, color: '#FF9800' },
  { id: 4, type: 'Accident', location: 'Eastern Peripheral Expy km 18', time: '35 min ago', upvotes: 67, severity: 'high' as const, color: '#F44336' },
  { id: 5, type: 'Vehicle Breakdown', location: 'Yamuna Expy km 92', time: '45 min ago', upvotes: 12, severity: 'low' as const, color: '#9E9E9E' },
];

const SPEED_CAMERAS = [
  { location: 'NH-48 km 36.2', limit: '120 km/h', distance: '2.4 km', type: 'Fixed Radar' },
  { location: 'Sohna Road Elevated', limit: '80 km/h', distance: '5.1 km', type: 'Interceptor Zone' },
  { location: 'Golf Course Extension', limit: '60 km/h', distance: '0.8 km', type: 'Red Light Camera' },
];

const VEHICLE_CLASSES = [
  { label: 'Car / Jeep', class: 'Class 4', icon: Car, fee: '₹435', desc: 'Standard Passenger' },
  { label: 'LCV / Mini-Bus', class: 'Class 5', icon: Truck, fee: '₹700', desc: 'Light Commercial' },
  { label: 'Bus / Heavy Truck', class: 'Class 6', icon: Bus, fee: '₹1,460', desc: 'Commercial Axle' },
];

export default function ServicesScreen() {
  const colors = useThemeColors();

  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [hazards, setHazards] = useState(INITIAL_HAZARD_REPORTS);
  const [votedMap, setVotedMap] = useState<Record<number, 'up' | 'down'>>({});

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleVote = (id: number, direction: 'up' | 'down') => {
    triggerHaptic();
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const currentVote = votedMap[id];
          if (currentVote === direction) {
            // unvote
            const nextMap = { ...votedMap };
            delete nextMap[id];
            setVotedMap(nextMap);
            return { ...h, upvotes: direction === 'up' ? h.upvotes - 1 : h.upvotes + 1 };
          } else {
            setVotedMap({ ...votedMap, [id]: direction });
            const delta = currentVote ? (direction === 'up' ? 2 : -2) : (direction === 'up' ? 1 : -1);
            return { ...h, upvotes: h.upvotes + delta };
          }
        }
        return h;
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Shared Header Component */}
      <Header
        title="Intelligent Services"
        subtitle="ISRO NavIC · ADAS · V2X Telematics · NHAI FASTag · SOS"
        showBack={false}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* NavIC Satellite Status */}
        <Card variant="elevated" padding="md" style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <Satellite size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>ISRO NavIC Status</Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  Dual-Band L5 + S-Band Constellation
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.navicDopBadge,
                {
                  backgroundColor: colors.primaryFixed,
                },
              ]}
              onPress={() => {
                triggerHaptic();
                router.push('/digipin-explorer');
              }}
              accessibilityRole="button"
              accessibilityLabel="DigiPIN and HDOP Explorer"
              activeOpacity={0.8}>
              <Text style={[styles.navicDopLabel, { color: colors.onPrimaryFixedVariant }]}>
                DigiPIN / HDOP
              </Text>
              <Text style={[styles.navicDopValue, { color: colors.primary }]}>0.8</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.navicAccuracyRow, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.accItem}>
              <Text style={[styles.accValue, { color: colors.onSurface }]}>0.6m</Text>
              <Text style={[styles.accLabel, { color: colors.onSurfaceVariant }]}>Position Accuracy</Text>
            </View>
            <View style={[styles.accDivider, { backgroundColor: colors.outlineVariant }]} />
            <View style={styles.accItem}>
              <Text style={[styles.accValue, { color: colors.onSurface }]}>5/7</Text>
              <Text style={[styles.accLabel, { color: colors.onSurfaceVariant }]}>Satellites Locked</Text>
            </View>
            <View style={[styles.accDivider, { backgroundColor: colors.outlineVariant }]} />
            <View style={styles.accItem}>
              <StatusBadge status="success" label="3D Fix" size="sm" pulsing={true} />
              <Text style={[styles.accLabel, { color: colors.onSurfaceVariant, marginTop: 4 }]}>Fix Quality</Text>
            </View>
          </View>

          {NAVIC_SATELLITES.map((sat, i) => (
            <View
              key={i}
              style={[
                styles.satRow,
                { borderBottomColor: colors.surfaceContainerHigh },
              ]}>
              <Text style={[styles.satId, { color: colors.onSurface }]}>{sat.id}</Text>
              <View style={[styles.satBandBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.satBandText, { color: colors.primary }]}>{sat.band}</Text>
              </View>
              <View style={[styles.satSignalBar, { backgroundColor: colors.surfaceContainerHigh }]}>
                <View
                  style={[
                    styles.satSignalFill,
                    {
                      width: `${sat.signal * 2}%`,
                      backgroundColor: sat.signal > 40 ? colors.trafficGreen : colors.trafficOrange,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.satSignalVal, { color: colors.onSurface }]}>{sat.signal} dB</Text>
              <Text style={[styles.satElev, { color: colors.onSurfaceVariant }]}>{sat.elevation}</Text>
            </View>
          ))}
        </Card>

        {/* SOS Emergency Console */}
        <Card variant="elevated" padding="md" style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
                <Siren size={18} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  Emergency SOS Console
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  Instant distress beacon with live coordinates
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.sosDescription, { color: colors.onSurfaceVariant }]}>
            One-touch broadcast coordinates, vehicle details & active route to emergency responders.
          </Text>

          <View style={styles.sosButtonsRow}>
            <Button
              title="112 Emergency"
              variant="danger"
              size="sm"
              leftIcon={<Phone size={14} color="#fff" />}
              onPress={() => {
                triggerHaptic();
                router.push('/sos-distress');
              }}
              style={styles.sosFlexBtn}
            />
            <Button
              title="Patrol"
              variant="outline"
              size="sm"
              leftIcon={<Shield size={14} color={colors.primary} />}
              onPress={() => {
                triggerHaptic();
                Alert.alert('Highway Patrol', 'Contacting NHAI Highway Patrol for roadside assistance.');
              }}
              style={styles.sosFlexBtn}
            />
            <Button
              title="Ambulance"
              variant="secondary"
              size="sm"
              leftIcon={<Heart size={14} color={colors.onSecondary} />}
              onPress={() => {
                triggerHaptic();
                Alert.alert('Ambulance Dispatch', 'Requesting nearest medical team. Real-time GPS coordinates shared.');
              }}
              style={styles.sosFlexBtn}
            />
          </View>
        </Card>

        {/* FASTag Highway Calculator */}
        <Card variant="elevated" padding="md" style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <CreditCard size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  FASTag Highway Calculator
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  NH-48 · Yamuna Expressway Corridor
                </Text>
              </View>
            </View>
            <Badge label="NHAI Verified" variant="primary" size="sm" />
          </View>

          {/* Vehicle Class Selector */}
          <View style={styles.vehicleClassRow}>
            {VEHICLE_CLASSES.map((vc, idx) => {
              const IconComp = vc.icon;
              const isSelected = selectedVehicle === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.vehicleClassChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryContainer
                        : colors.surfaceContainerLow,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedVehicle(idx);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Vehicle class ${vc.label}`}
                  activeOpacity={0.8}>
                  <IconComp
                    size={18}
                    color={isSelected ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.vehicleClassLabel,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}>
                    {vc.label}
                  </Text>
                  <Text
                    style={[
                      styles.vehicleClassBadge,
                      {
                        color: isSelected ? colors.primary : colors.onSurfaceVariant,
                      },
                    ]}>
                    {vc.class}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Toll Fee Result Banner */}
          <Card
            variant="outlined"
            padding="sm"
            onPress={() => {
              triggerHaptic();
              router.push('/vehicle-fleet');
            }}
            accessibilityLabel="Manage FASTag fleet">
            <View style={styles.tollResultBannerInner}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tollResultLabel, { color: colors.onSurfaceVariant }]}>
                  Calculated Corridor Toll
                </Text>
                <Text style={[styles.tollResultDesc, { color: colors.onSurface }]}>
                  {VEHICLE_CLASSES[selectedVehicle].desc} across 3 NHAI Plazas
                </Text>
              </View>
              <View style={styles.tollFeeRow}>
                <Text style={[styles.tollResultFee, { color: colors.primary }]}>
                  {VEHICLE_CLASSES[selectedVehicle].fee}
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </View>
            </View>
          </Card>
        </Card>

        {/* ADAS Speed Camera Alerts */}
        <SectionHeader
          title="ADAS Speed Camera Alerts"
          subtitle="Live radar & interceptor detection"
        />
        {SPEED_CAMERAS.map((cam, i) => (
          <Card key={i} variant="outlined" padding="md" style={styles.cameraCard}>
            <View style={styles.cameraLeft}>
              <View style={[styles.cameraIconBox, { backgroundColor: colors.errorContainer }]}>
                <Camera size={16} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.cameraLocation, { color: colors.onSurface }]}>
                  {cam.location}
                </Text>
                <Text style={[styles.cameraType, { color: colors.onSurfaceVariant }]}>
                  {cam.type}
                </Text>
              </View>
            </View>
            <View style={styles.cameraRight}>
              <Badge label={cam.limit} variant="error" size="sm" />
              <Text style={[styles.cameraDistance, { color: colors.onSurfaceVariant }]}>
                {cam.distance}
              </Text>
            </View>
          </Card>
        ))}

        {/* Hazard Community Reports */}
        <SectionHeader
          title="Community Hazard Reports"
          subtitle="Crowdsourced · Trust-Score Verified"
          actionText="Report"
          actionIcon={<TriangleAlert size={14} color={colors.primary} />}
          onActionPress={() => {
            triggerHaptic();
            router.push('/hazard-report');
          }}
        />

        {hazards.map((hazard) => {
          const badgeVariant =
            hazard.severity === 'high' ? 'error' : hazard.severity === 'medium' ? 'warning' : 'neutral';
          return (
            <Card key={hazard.id} variant="outlined" padding="md" style={styles.hazardCard}>
              <View style={styles.hazardLeft}>
                <View style={[styles.hazardDot, { backgroundColor: hazard.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.hazardTitleRow}>
                    <Text style={[styles.hazardType, { color: colors.onSurface }]}>
                      {hazard.type}
                    </Text>
                    <Badge label={hazard.severity} variant={badgeVariant} size="sm" />
                  </View>
                  <Text style={[styles.hazardLocation, { color: colors.onSurfaceVariant }]}>
                    {hazard.location}
                  </Text>
                  <Text style={[styles.hazardTime, { color: colors.outline }]}>{hazard.time}</Text>
                </View>
              </View>
              <View style={styles.hazardVotes}>
                <TouchableOpacity
                  style={[
                    styles.voteBtn,
                    votedMap[hazard.id] === 'up' && { backgroundColor: colors.secondaryContainer },
                  ]}
                  onPress={() => handleVote(hazard.id, 'up')}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm hazard">
                  <ThumbsUp size={14} color={colors.secondary} />
                </TouchableOpacity>
                <Text style={[styles.voteCount, { color: colors.onSurface }]}>{hazard.upvotes}</Text>
                <TouchableOpacity
                  style={[
                    styles.voteBtn,
                    votedMap[hazard.id] === 'down' && { backgroundColor: colors.surfaceContainerHigh },
                  ]}
                  onPress={() => handleVote(hazard.id, 'down')}
                  accessibilityRole="button"
                  accessibilityLabel="Mark hazard resolved">
                  <ThumbsDown size={14} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}

        {/* Eco-Routing Dashboard */}
        <Card variant="elevated" padding="md" style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainerLow }]}>
                <Leaf size={18} color={colors.trafficGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  Eco-Routing & EV Energy
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  Fleet carbon footprint and battery optimization
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.ecoGrid}>
            <MetricCard
              label="CO₂ Saved"
              value="12.4"
              unit="kg"
              trend={{ value: '+2.1 kg', positive: true }}
              style={styles.ecoGridItem}
            />
            <MetricCard
              label="EV Battery"
              value="78"
              unit="%"
              style={styles.ecoGridItem}
            />
          </View>
          <View style={styles.ecoGrid}>
            <MetricCard
              label="Range"
              value="186"
              unit="km"
              style={styles.ecoGridItem}
            />
            <MetricCard
              label="Regen Braking"
              value="+18"
              unit="km"
              trend={{ value: '+3 km', positive: true }}
              style={styles.ecoGridItem}
            />
          </View>
        </Card>

        {/* V2X Connected Vehicle */}
        <Card variant="elevated" padding="md" style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <Radio size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  V2X Connected Vehicle
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                  Short-range vehicular mesh (DSRC/C-V2X)
                </Text>
              </View>
            </View>
            <StatusBadge status="success" label="Active" size="sm" pulsing={true} />
          </View>
          <Text style={[styles.sosDescription, { color: colors.onSurfaceVariant }]}>
            Broadcasting sovereign collision avoidance, braking events, and hazard alerts to nodes within 500m.
          </Text>
          <View style={styles.v2xStatsRow}>
            <View style={[styles.v2xStatChip, { backgroundColor: colors.surfaceContainerLow }]}>
              <Signal size={14} color={colors.primary} />
              <Text style={[styles.v2xStatText, { color: colors.onSurface }]}>
                4 vehicles in range
              </Text>
            </View>
            <View style={[styles.v2xStatChip, { backgroundColor: colors.surfaceContainerLow }]}>
              <Waves size={14} color={colors.trafficGreen} />
              <Text style={[styles.v2xStatText, { color: colors.onSurface }]}>12 events/min</Text>
            </View>
          </View>
        </Card>

        {/* Report a Hazard CTA Button */}
        <Button
          title="Report Road Hazard"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<TriangleAlert size={18} color="#fff" />}
          onPress={() => {
            triggerHaptic();
            router.push('/hazard-report');
          }}
          style={styles.reportButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.md,
    gap: 14,
  },
  cardContainer: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  navicDopBadge: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  navicDopLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  navicDopValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  navicAccuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  accItem: {
    alignItems: 'center',
  },
  accValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  accLabel: {
    fontSize: 9,
    marginTop: 2,
  },
  accDivider: {
    width: 1,
    height: 18,
  },
  satRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  satId: {
    ...Typography.bodySmall,
    fontWeight: '700',
    width: 76,
  },
  satBandBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  satBandText: {
    fontSize: 9,
    fontWeight: '800',
  },
  satSignalBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  satSignalFill: {
    height: '100%',
    borderRadius: 3,
  },
  satSignalVal: {
    fontSize: 10,
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },
  satElev: {
    fontSize: 10,
    width: 32,
    textAlign: 'right',
  },
  sosDescription: {
    ...Typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
  },
  sosButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  sosFlexBtn: {
    flex: 1,
  },
  vehicleClassRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleClassChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: 4,
  },
  vehicleClassLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  vehicleClassBadge: {
    fontSize: 9,
    fontWeight: '700',
  },
  tollResultBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xs,
  },
  tollResultLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tollResultDesc: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  tollFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  tollResultFee: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  cameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.xs,
  },
  cameraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cameraIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLocation: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  cameraType: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  cameraRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cameraDistance: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  hazardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.xs,
  },
  hazardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hazardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hazardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hazardType: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  hazardLocation: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  hazardTime: {
    fontSize: 9,
    marginTop: 1,
  },
  hazardVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  voteBtn: {
    padding: 6,
    borderRadius: Radius.sm,
  },
  voteCount: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
  ecoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  ecoGridItem: {
    flex: 1,
  },
  v2xStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  v2xStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  v2xStatText: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
  },
  reportButton: {
    marginTop: 6,
  },
});
