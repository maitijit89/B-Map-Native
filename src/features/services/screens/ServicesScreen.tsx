import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Satellite,
  Shield,
  Phone,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Siren,
  Heart,
  TriangleAlert,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Button,
  StatusBadge,
  SectionHeader,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

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
  { id: 'sc_1', location: 'NH-48 km 36.2', limit: '120 km/h', distance: '2.4 km', type: 'Fixed Radar' },
  { id: 'sc_2', location: 'Sohna Road Elevated', limit: '80 km/h', distance: '5.1 km', type: 'Interceptor Zone' },
  { id: 'sc_3', location: 'Golf Course Extension', limit: '60 km/h', distance: '0.8 km', type: 'Red Light Camera' },
];

export default function ServicesScreen() {
  const colors = useThemeColors();

  const [hazards, setHazards] = useState(INITIAL_HAZARD_REPORTS);
  const [votedMap, setVotedMap] = useState<Record<number, 'up' | 'down'>>({});

  const handleVote = useCallback((id: number, direction: 'up' | 'down') => {
    haptics.selection();
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const currentVote = votedMap[id];
          if (currentVote === direction) {
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
  }, [votedMap]);

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
        <Animated.View entering={FadeInDown.duration(280).springify().damping(18)}>
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
                style={[styles.navicDopBadge, { backgroundColor: colors.primaryFixed }]}
                onPress={() => {
                  haptics.light();
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

            {NAVIC_SATELLITES.map((sat, idx) => (
              <View
                key={sat.id}
                style={[
                  styles.satRow,
                  {
                    borderBottomColor: colors.surfaceContainerHigh,
                    borderBottomWidth: idx < NAVIC_SATELLITES.length - 1 ? 1 : 0,
                  },
                ]}
                accessible
                accessibilityLabel={`Satellite ${sat.id}, ${sat.band} band, ${sat.signal} decibels, ${sat.elevation} elevation, ${sat.status}`}>
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
        </Animated.View>

        {/* SOS Emergency Console */}
        <Animated.View entering={FadeInDown.delay(60).duration(280).springify().damping(18)}>
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
                  haptics.heavy();
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
                  haptics.light();
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
                  haptics.light();
                  Alert.alert('Ambulance Dispatch', 'Requesting nearest medical team. Real-time GPS coordinates shared.');
                }}
                style={styles.sosFlexBtn}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Real-Time Community Hazards */}
        <Animated.View entering={FadeInDown.delay(100).duration(280).springify().damping(18)}>
          <SectionHeader
            title="Community Hazard Reports"
            subtitle="Crowdsourced Highway Telematics"
            actionText="+ Report"
            actionIcon={<TriangleAlert size={14} color={colors.primary} />}
            onActionPress={() => {
              haptics.medium();
              router.push('/hazard-report');
            }}
          />

          <Card variant="flat" padding="md" style={styles.cardContainer}>
            {hazards.map((h, idx) => {
              const isUpvoted = votedMap[h.id] === 'up';
              const isDownvoted = votedMap[h.id] === 'down';
              return (
                <View
                  key={h.id}
                  style={[
                    styles.hazardRow,
                    {
                      borderBottomColor: colors.surfaceContainerHigh,
                      borderBottomWidth: idx < hazards.length - 1 ? 1 : 0,
                    },
                  ]}>
                  <View style={[styles.severityDot, { backgroundColor: h.color }]} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.hazardType, { color: colors.onSurface }]}>{h.type}</Text>
                    <Text style={[styles.hazardLocation, { color: colors.onSurfaceVariant }]}>
                      {h.location} · {h.time}
                    </Text>
                  </View>
                  <View style={styles.voteControls}>
                    <TouchableOpacity
                      onPress={() => handleVote(h.id, 'up')}
                      style={[
                        styles.voteBtn,
                        { backgroundColor: isUpvoted ? colors.primaryContainer : colors.surfaceContainerLow },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Upvote hazard report">
                      <ThumbsUp size={12} color={isUpvoted ? colors.primary : colors.onSurfaceVariant} />
                    </TouchableOpacity>

                    <Text style={[styles.upvoteCount, { color: colors.onSurface }]}>{h.upvotes}</Text>

                    <TouchableOpacity
                      onPress={() => handleVote(h.id, 'down')}
                      style={[
                        styles.voteBtn,
                        { backgroundColor: isDownvoted ? colors.errorContainer : colors.surfaceContainerLow },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Downvote hazard report">
                      <ThumbsDown size={12} color={isDownvoted ? colors.error : colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </Card>
        </Animated.View>

        {/* ADAS Speed Camera Radar */}
        <Animated.View entering={FadeInDown.delay(150).duration(280).springify().damping(18)}>
          <SectionHeader
            title="ADAS Speed Camera Radar"
            subtitle="Fixed Speed Guns & Interceptor Zones"
          />

          <Card variant="flat" padding="md" style={styles.cardContainer}>
            {SPEED_CAMERAS.map((cam, idx) => (
              <View
                key={cam.id}
                style={[
                  styles.cameraRow,
                  {
                    borderBottomColor: colors.surfaceContainerHigh,
                    borderBottomWidth: idx < SPEED_CAMERAS.length - 1 ? 1 : 0,
                  },
                ]}
                accessible
                accessibilityLabel={`Speed radar at ${cam.location}, speed limit ${cam.limit}, ${cam.distance} away`}>
                <View style={[styles.cameraIconBox, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Camera size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.cameraLoc, { color: colors.onSurface }]}>{cam.location}</Text>
                  <Text style={[styles.cameraType, { color: colors.onSurfaceVariant }]}>
                    {cam.type} · {cam.distance}
                  </Text>
                </View>
                <View style={[styles.limitBadge, { backgroundColor: colors.errorContainer }]}>
                  <Text style={[styles.limitText, { color: colors.onErrorContainer }]}>{cam.limit}</Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>
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
  cardContainer: {
    borderRadius: Radius.xl,
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
    width: 36,
    height: 36,
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
  },
  navicDopBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  navicDopLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  navicDopValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  navicAccuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: Radius.lg,
    marginVertical: 12,
  },
  accItem: {
    alignItems: 'center',
  },
  accValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  accLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  accDivider: {
    width: 1,
    height: 24,
  },
  satRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  satId: {
    ...Typography.labelSmall,
    fontWeight: '700',
    width: 70,
  },
  satBandBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  satBandText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
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
    ...Typography.labelSmall,
    fontWeight: '600',
    width: 38,
    textAlign: 'right',
  },
  satElev: {
    ...Typography.labelSmall,
    fontSize: 10,
    width: 30,
    textAlign: 'right',
  },
  sosDescription: {
    ...Typography.bodySmall,
    marginTop: 8,
    marginBottom: 12,
  },
  sosButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sosFlexBtn: {
    flex: 1,
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hazardType: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  hazardLocation: {
    ...Typography.bodySmall,
  },
  voteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvoteCount: {
    ...Typography.labelSmall,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cameraIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLoc: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  cameraType: {
    ...Typography.bodySmall,
  },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  limitText: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
});
