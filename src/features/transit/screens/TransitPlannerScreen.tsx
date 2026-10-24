import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TrainFront,
  Bus,
  CarTaxiFront,
  Footprints,
  Clock,
  Leaf,
  QrCode,
  ArrowRight,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

interface TransitSegment {
  type: 'metro' | 'bus' | 'walk' | 'auto';
  lineName: string;
  lineColor: string;
  duration: string;
  stationsCount?: number;
  notes?: string;
}

interface TransitPlan {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  duration: string;
  fare: string;
  co2Saved: string;
  segments: TransitSegment[];
}

const TRANSIT_PLANS: TransitPlan[] = [
  {
    id: '1',
    title: 'Metro Express + Rapid Metro',
    tag: 'Fastest Route',
    tagColor: '#0096FF',
    duration: '38 min',
    fare: '₹42',
    co2Saved: '1.4 kg',
    segments: [
      {
        type: 'walk',
        lineName: 'Walk to Rajiv Chowk Gate 4',
        lineColor: '#707884',
        duration: '3 min',
        notes: '220 meters',
      },
      {
        type: 'metro',
        lineName: 'DMRC Yellow Line (Toward HUDA City)',
        lineColor: '#FFD600',
        duration: '26 min',
        stationsCount: 14,
        notes: 'Platform 2 · Train every 3 min',
      },
      {
        type: 'walk',
        lineName: 'Interchange at Sikanderpur',
        lineColor: '#707884',
        duration: '2 min',
        notes: 'Direct skywalk connector',
      },
      {
        type: 'metro',
        lineName: 'Rapid Metro (Loop Route)',
        lineColor: '#FF9800',
        duration: '7 min',
        stationsCount: 3,
        notes: 'Platform 1 to Cyber Hub',
      },
    ],
  },
  {
    id: '2',
    title: 'Direct DTC Electric AC Bus',
    tag: 'Lowest Cost',
    tagColor: '#00C06D',
    duration: '52 min',
    fare: '₹25',
    co2Saved: '0.9 kg',
    segments: [
      {
        type: 'walk',
        lineName: 'Walk to Shivaji Stadium Terminal',
        lineColor: '#707884',
        duration: '4 min',
      },
      {
        type: 'bus',
        lineName: 'DTC Electric AC Bus 412A',
        lineColor: '#4CAF50',
        duration: '46 min',
        stationsCount: 18,
        notes: 'High AC comfort · Every 10 min',
      },
      {
        type: 'walk',
        lineName: 'Walk to Cyber Hub Plaza',
        lineColor: '#707884',
        duration: '2 min',
      },
    ],
  },
  {
    id: '3',
    title: 'Metro + Last-Mile Electric Auto',
    tag: 'Doorstep Convenience',
    tagColor: '#9C27B0',
    duration: '31 min',
    fare: '₹68',
    co2Saved: '1.1 kg',
    segments: [
      {
        type: 'metro',
        lineName: 'Yellow Line to MG Road',
        lineColor: '#FFD600',
        duration: '22 min',
        stationsCount: 12,
      },
      {
        type: 'auto',
        lineName: 'EV Smart Auto-Rickshaw',
        lineColor: '#00C06D',
        duration: '9 min',
        notes: 'Fixed pre-paid meter fare ₹40',
      },
    ],
  },
];

const METRO_LINES_STATUS = [
  { id: 'ml_1', name: 'Yellow Line', status: 'Normal Flow', freq: 'Every 2.5 min', color: '#FFD600' },
  { id: 'ml_2', name: 'Blue Line', status: 'Normal Flow', freq: 'Every 3 min', color: '#2196F3' },
  { id: 'ml_3', name: 'Rapid Metro', status: 'Normal Flow', freq: 'Every 4 min', color: '#FF9800' },
  { id: 'ml_4', name: 'Airport Express', status: 'Super Fast', freq: 'Every 10 min', color: '#E91E63' },
];

export default function TransitPlannerScreen() {
  const colors = useThemeColors();
  const [selectedPlan, setSelectedPlan] = useState<string>('1');
  const [showQrTicket, setShowQrTicket] = useState(false);
  const [ticketCountdown, setTicketCountdown] = useState(179);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showQrTicket && ticketCountdown > 0) {
      interval = setInterval(() => {
        setTicketCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showQrTicket, ticketCountdown]);

  const activePlan = useMemo(() => {
    return TRANSIT_PLANS.find((p) => p.id === selectedPlan) || TRANSIT_PLANS[0];
  }, [selectedPlan]);

  const handleBuyQrTicket = useCallback(() => {
    haptics.success();
    setShowQrTicket(true);
    setTicketCountdown(180);
    Alert.alert(
      'Digital Metro QR Generated! 🎫',
      'Scan at DMRC / Rapid Metro automated entry gates within 3 hours. Fare ₹42 deducted via FASTag/UPI.'
    );
  }, []);

  const handleBackPress = useCallback(() => {
    haptics.light();
    router.back();
  }, []);

  const handleToggleQr = useCallback(() => {
    haptics.selection();
    setShowQrTicket((prev) => !prev);
  }, []);

  const getSegmentIcon = (type: TransitSegment['type']) => {
    switch (type) {
      case 'metro':
        return <TrainFront size={14} color="#ffffff" />;
      case 'bus':
        return <Bus size={14} color="#ffffff" />;
      case 'auto':
        return <CarTaxiFront size={14} color="#ffffff" />;
      case 'walk':
      default:
        return <Footprints size={14} color="#ffffff" />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="Multimodal Transit Planner"
        onBackPress={handleBackPress}
        rightAction={
          <TouchableOpacity
            style={[styles.qrHeaderBtn, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={handleToggleQr}
            accessibilityRole="button"
            accessibilityLabel="Toggle QR Ticket"
            activeOpacity={0.7}>
            <QrCode size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Origin & Destination Card */}
        <Animated.View entering={FadeInDown.duration(280).springify().damping(16)}>
          <Card variant="elevated" padding="md" style={styles.routeHeaderCard}>
            <View style={[styles.routePill, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.stationDot, { backgroundColor: '#FFD600' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.stationLabel, { color: colors.onSurfaceVariant }]}>ORIGIN METRO HUB</Text>
                <Text style={[styles.stationName, { color: colors.onSurface }]}>Rajiv Chowk (Central Delhi)</Text>
              </View>
            </View>
            <View style={styles.routeArrowRow}>
              <View style={[styles.routeLine, { backgroundColor: colors.surfaceContainerHigh }]} />
              <View style={[styles.arrowIconBox, { backgroundColor: colors.surfaceContainerLow }]}>
                <ArrowRight size={14} color={colors.primary} />
              </View>
              <View style={[styles.routeLine, { backgroundColor: colors.surfaceContainerHigh }]} />
            </View>
            <View style={[styles.routePill, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.stationDot, { backgroundColor: '#FF9800' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.stationLabel, { color: colors.onSurfaceVariant }]}>DESTINATION STATION</Text>
                <Text style={[styles.stationName, { color: colors.onSurface }]}>Cyber Hub, Gurugram (Rapid Metro)</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Live DMRC Network Status Bar */}
        <Animated.View entering={FadeInDown.delay(50).duration(280).springify().damping(16)}>
          <View style={styles.statusSection}>
            <Text style={[styles.statusSectionTitle, { color: colors.onSurface }]}>Live NCR Transit Feeds</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTrack}>
              {METRO_LINES_STATUS.map((line) => (
                <View
                  key={line.id}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: colors.surfaceContainerLowest,
                      borderColor: colors.surfaceContainerHigh,
                    },
                  ]}>
                  <View style={[styles.lineDot, { backgroundColor: line.color }]} />
                  <View>
                    <Text style={[styles.lineName, { color: colors.onSurface }]}>{line.name}</Text>
                    <Text style={[styles.lineFreq, { color: colors.onSurfaceVariant }]}>{line.freq}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Route Option Tabs */}
        <View style={styles.plansContainer}>
          {TRANSIT_PLANS.map((plan, idx) => {
            const isSelected = plan.id === selectedPlan;
            return (
              <Animated.View
                key={plan.id}
                entering={FadeInDown.delay(75 + idx * 40).duration(280).springify().damping(16)}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.selection();
                    setSelectedPlan(plan.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Transit route: ${plan.title}, duration ${plan.duration}, fare ${plan.fare}`}
                  accessibilityState={{ selected: isSelected }}>
                  <Card
                    variant={isSelected ? 'elevated' : 'flat'}
                    padding="md"
                    style={[
                      styles.planCard,
                      isSelected && { borderColor: colors.primary, borderWidth: 2 },
                    ]}>
                  <View style={styles.planHeader}>
                    <View style={[styles.planTag, { backgroundColor: plan.tagColor + '20' }]}>
                      <Text style={[styles.planTagText, { color: plan.tagColor }]}>{plan.tag}</Text>
                    </View>
                    <Text style={[styles.planFare, { color: colors.primary }]}>{plan.fare}</Text>
                  </View>

                  <Text style={[styles.planTitle, { color: colors.onSurface }]}>{plan.title}</Text>

                  <View style={styles.planMetricsRow}>
                    <View style={styles.metricPill}>
                      <Clock size={12} color={colors.onSurfaceVariant} />
                      <Text style={[styles.metricText, { color: colors.onSurface }]}>{plan.duration}</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Leaf size={12} color="#00C06D" />
                      <Text style={[styles.metricText, { color: '#00C06D' }]}>{plan.co2Saved} CO₂</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

        {/* Selected Plan Step-by-Step Breakdown */}
        <Animated.View entering={FadeInDown.delay(100).duration(280).springify().damping(16)}>
          <Card variant="flat" padding="md" style={styles.breakdownCard}>
            <Text style={[styles.breakdownTitle, { color: colors.onSurface }]}>Step-by-Step Navigation Legs</Text>

            {activePlan.segments.map((seg, i) => (
              <View key={i} style={styles.segmentRow}>
                <View style={[styles.segIconBox, { backgroundColor: seg.lineColor }]}>
                  {getSegmentIcon(seg.type)}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.segName, { color: colors.onSurface }]}>{seg.lineName}</Text>
                  {seg.notes ? <Text style={[styles.segNotes, { color: colors.onSurfaceVariant }]}>{seg.notes}</Text> : null}
                </View>
                <Text style={[styles.segDur, { color: colors.primary }]}>{seg.duration}</Text>
              </View>
            ))}

            <View style={{ marginTop: 14 }}>
              <Button
                title="Book QR Metro & Transit Ticket"
                onPress={handleBuyQrTicket}
                size="md"
                variant="primary"
                fullWidth
                leftIcon={<QrCode size={18} color={colors.onPrimary} />}
              />
            </View>
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
  qrHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeHeaderCard: {
    borderRadius: Radius.xl,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.lg,
    gap: 8,
  },
  stationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stationLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  stationName: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  routeArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeLine: {
    flex: 1,
    height: 1,
  },
  arrowIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  statusSection: {
    marginTop: 4,
  },
  statusSectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusTrack: {
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  lineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lineName: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  lineFreq: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    borderRadius: Radius.xl,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  planTagText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  planFare: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  planTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginTop: 6,
  },
  planMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  breakdownCard: {
    borderRadius: Radius.xl,
  },
  breakdownTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  segIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segName: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  segNotes: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  segDur: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
});
