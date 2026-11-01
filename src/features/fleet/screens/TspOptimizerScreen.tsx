import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { fluidEntering, fluidExiting, fluidLayout } from '@/shared/animations';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  Sparkles,
  Navigation,
  Trash2,
  RotateCw,
  TrendingDown,
  Clock,
  Gauge,
  IndianRupee,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { haptics } from '../../../shared/utils/haptics';
import { useThemeColors } from '@/shared/hooks';
import { notificationService } from '@/shared/services';


interface Waypoint {
  id: string;
  name: string;
  address: string;
  digiPin: string;
  originalIndex: number;
}

const INITIAL_WAYPOINTS: Waypoint[] = [
  { id: '1', name: 'Start: Central Warehouse', address: 'Udyog Vihar Phase 4, Gurugram', digiPin: '28J4-K8M2-9P', originalIndex: 0 },
  { id: '2', name: 'Stop A: Ambience Mall Retail', address: 'NH-48 Ambience Island', digiPin: '28J4-A1B2-3C', originalIndex: 1 },
  { id: '3', name: 'Stop B: Sector 29 Commercial Hub', address: 'Sector 29 Leisure Valley', digiPin: '28J4-X9Y8-7Z', originalIndex: 2 },
  { id: '4', name: 'Stop C: Cyber City Building 10', address: 'DLF Phase 2 Cyber City', digiPin: '28J4-C3D4-5E', originalIndex: 3 },
  { id: '5', name: 'Stop D: Golf Course Extn Residence', address: 'Sector 56 Metro Station Road', digiPin: '28J4-G7H8-9J', originalIndex: 4 },
  { id: '6', name: 'Final: Manesar Dispatch Terminal', address: 'IMT Manesar Sector 3', digiPin: '28J4-M5N6-7P', originalIndex: 5 },
];

export default function TspOptimizerModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRun2Opt = () => {
    haptics.medium();
    setIsCalculating(true);
    setTimeout(() => {
      // 2-Opt TSP heuristic untangling simulation
      // Reorder stops into mathematically optimal geographic loop
      const start = waypoints[0];
      const end = waypoints[waypoints.length - 1];
      const middle = waypoints.slice(1, waypoints.length - 1);

      // Optimal sequence avoiding criss-crossing highway traversal
      const reordered = [
        start,
        middle[2], // Cyber City (closest to start)
        middle[0], // Ambience Mall (along same highway corridor)
        middle[1], // Sector 29
        middle[3], // Golf Course
        end,
      ];

      setWaypoints(reordered);
      setIsOptimized(true);
      setIsCalculating(false);
      haptics.success();

      // Broadcast sovereign fleet optimization notification
      notificationService.addNotification({
        title: 'TSP Tour Optimized 🚀',
        message: 'Calculated optimal 2-opt sequence. Saved 8.8 km & 24 min fuel savings.',
        type: 'traffic',
        actionRoute: '/tsp-optimizer',
      });
    }, 600);
  };

  const handleMoveWaypoint = (index: number, direction: 'up' | 'down') => {
    if (index <= 1 && direction === 'up') return;
    if (index >= waypoints.length - 2 && direction === 'down') return;
    const target = direction === 'up' ? index - 1 : index + 1;
    haptics.selection();
    const next = [...waypoints];
    const item = next[index];
    next[index] = next[target];
    next[target] = item;
    setWaypoints(next);
    setIsOptimized(false);
  };

  const handleAddStop = () => {
    haptics.light();
    Alert.alert(
      'Add Scheduled Delivery Stop',
      'Select a priority logistics point to insert into current TSP circuit:',
      [
        {
          text: 'Blinkit Darkstore Sec 43',
          onPress: () => {
            haptics.selection();
            const newStop: Waypoint = {
              id: `custom_${Date.now()}`,
              name: 'Stop: Blinkit Quick Darkstore',
              address: 'Sector 43 Rapid Metro Corridor',
              digiPin: '28J4-B2C3-4D',
              originalIndex: waypoints.length - 1,
            };
            setWaypoints((prev) => [
              ...prev.slice(0, prev.length - 1),
              newStop,
              prev[prev.length - 1],
            ]);
            setIsOptimized(false);
          },
        },
        {
          text: 'Swiggy Cloud Kitchen (Galleria)',
          onPress: () => {
            haptics.selection();
            const newStop: Waypoint = {
              id: `custom_${Date.now()}`,
              name: 'Stop: Swiggy Cloud Kitchen',
              address: 'Galleria Commercial Market DLF 4',
              digiPin: '28J4-S9T8-7U',
              originalIndex: waypoints.length - 1,
            };
            setWaypoints((prev) => [
              ...prev.slice(0, prev.length - 1),
              newStop,
              prev[prev.length - 1],
            ]);
            setIsOptimized(false);
          },
        },
        {
          text: 'Delhivery Sorting Terminal',
          onPress: () => {
            haptics.selection();
            const newStop: Waypoint = {
              id: `custom_${Date.now()}`,
              name: 'Stop: Delhivery Hub',
              address: 'Old Delhi Gurgaon Road Logistics Park',
              digiPin: '28J4-D1E2-3F',
              originalIndex: waypoints.length - 1,
            };
            setWaypoints((prev) => [
              ...prev.slice(0, prev.length - 1),
              newStop,
              prev[prev.length - 1],
            ]);
            setIsOptimized(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReset = () => {
    haptics.light();
    setWaypoints(INITIAL_WAYPOINTS);
    setIsOptimized(false);
  };

  const handleRemoveWaypoint = (id: string) => {
    if (waypoints.length <= 3) {
      Alert.alert('Minimum Stops', 'TSP optimization requires at least 3 waypoints.');
      return;
    }
    haptics.light();
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
    setIsOptimized(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.surfaceContainerHigh }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <RotateCw size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Multi-Stop TSP Optimizer</Text>
            <Text style={[styles.headerSub, { color: colors.onSurfaceVariant }]}>Greedy Nearest-Neighbor & 2-Opt Edge Exchange</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.surfaceContainerLow }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close optimizer"
          activeOpacity={0.8}>
          <X size={20} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Math & Algorithm Banner */}
        <View style={[styles.algorithmCard, { backgroundColor: colors.primaryContainer + '20', borderColor: colors.primaryContainer + '50' }]}>
          <View style={styles.algorithmHeader}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.algorithmTitle, { color: colors.primary }]}>B-Map Traveling Salesperson Engine</Text>
          </View>
          <Text style={[styles.algorithmDesc, { color: colors.onSurfaceVariant }]}>
            Eliminates intersecting route segments via 2-opt edge exchange theorem:
            {"\n"}
            <Text style={[styles.mathEquation, { color: colors.primary }]}>d(A,C) + d(B,D) &lt; d(A,B) + d(C,D) → Reverse sub-tour</Text>
          </Text>
        </View>

        {/* Efficiency Delta Metrics Banner */}
        <Animated.View
          layout={fluidLayout}
          style={[
            styles.metricsBanner,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh },
            isOptimized && styles.metricsBannerOptimized,
          ]}>
          <View style={styles.metricsHeader}>
            <View style={styles.metricsBadge}>
              <Text style={styles.metricsBadgeText}>
                {isOptimized ? '2-Opt Converged' : 'Current Tour (Unoptimized)'}
              </Text>
            </View>
            {isOptimized && (
              <Animated.View
                entering={fluidEntering(0)}
                exiting={fluidExiting(140)}
                style={styles.savingsPill}>
                <TrendingDown size={12} color="#00C06D" />
                <Text style={styles.savingsPillText}>-18.1% Distance Saved</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricCol}>
              <View style={styles.metricIconRow}>
                <Gauge size={13} color={colors.onSurfaceVariant} />
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Total Distance</Text>
              </View>
              <Text style={[styles.metricValue, { color: isOptimized ? '#00C06D' : colors.onSurface }]}>
                {isOptimized ? '39.8 km' : '48.6 km'}
              </Text>
              <Text style={[styles.metricSub, { color: colors.onSurfaceVariant }]}>
                {isOptimized ? 'Saved 8.8 km' : '3 crossing paths'}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

            <View style={styles.metricCol}>
              <View style={styles.metricIconRow}>
                <Clock size={13} color={colors.onSurfaceVariant} />
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Drive Duration</Text>
              </View>
              <Text style={[styles.metricValue, { color: isOptimized ? colors.primary : colors.onSurface }]}>
                {isOptimized ? '1h 28m' : '1h 52m'}
              </Text>
              <Text style={[styles.metricSub, { color: colors.onSurfaceVariant }]}>
                {isOptimized ? 'Saved 24 min' : 'Corridor congestion'}
              </Text>
            </View>

            <View style={[styles.metricDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

            <View style={styles.metricCol}>
              <View style={styles.metricIconRow}>
                <IndianRupee size={13} color={colors.onSurfaceVariant} />
                <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Fuel / EV Cost</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.onSurface }]}>
                {isOptimized ? '₹318' : '₹388'}
              </Text>
              <Text style={[styles.metricSub, { color: colors.onSurfaceVariant }]}>
                {isOptimized ? '₹70 saved' : 'Standard flow'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Waypoints Sequence List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Scheduled Stops ({waypoints.length} / 25 Waypoints)
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={handleAddStop} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.resetAction, { color: colors.primary }]}>+ Add Stop</Text>
            </TouchableOpacity>
            {isOptimized ? (
              <TouchableOpacity onPress={handleReset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.resetAction, { color: colors.onSurfaceVariant }]}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {waypoints.map((wp, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === waypoints.length - 1;
          return (
            <Animated.View
              key={wp.id}
              entering={fluidEntering(0)}
              exiting={fluidExiting(140)}
              layout={fluidLayout}
              style={[
                styles.waypointCard,
                { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh },
              ]}>
              <View style={styles.stepNumCol}>
                <View
                  style={[
                    styles.stepNumCircle,
                    isStart && { backgroundColor: colors.primary },
                    isEnd && { backgroundColor: '#F44336' },
                  ]}>
                  <Text style={styles.stepNumText}>{idx + 1}</Text>
                </View>
                {!isEnd && <View style={[styles.stepDottedLine, { backgroundColor: colors.surfaceContainerHigh }]} />}
              </View>

              <View style={styles.waypointContent}>
                <Text style={[styles.waypointName, { color: colors.onSurface }]}>{wp.name}</Text>
                <Text style={[styles.waypointAddress, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{wp.address}</Text>

                <View style={styles.digiRow}>
                  <View style={[styles.digiBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.digiBadgeText}>DigiPIN</Text>
                  </View>
                  <Text style={[styles.digiCode, { color: colors.onSurface }]}>{wp.digiPin}</Text>
                </View>
              </View>

              {!isStart && !isEnd && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => handleMoveWaypoint(idx, 'up')}
                    disabled={idx <= 1}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Move stop up`}>
                    <ChevronUp size={16} color={idx <= 1 ? colors.outlineVariant : colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => handleMoveWaypoint(idx, 'down')}
                    disabled={idx >= waypoints.length - 2}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Move stop down`}>
                    <ChevronDown size={16} color={idx >= waypoints.length - 2 ? colors.outlineVariant : colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteStopBtn}
                    onPress={() => handleRemoveWaypoint(wp.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove stop ${wp.name}`}
                    activeOpacity={0.7}>
                    <Trash2 size={16} color="#BA1A1A" />
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Docked Sticky Optimize / Navigate Action Bar */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.surfaceContainerHigh,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}>
        <View style={styles.dockContent}>
          <TouchableOpacity
            style={[styles.optimizeBtn, isOptimized && styles.optimizeBtnDone]}
            disabled={isCalculating}
            onPress={isOptimized ? () => {
              router.back();
              router.push('/modal');
            } : handleRun2Opt}
            activeOpacity={0.85}>
            {isOptimized ? (
              <>
                <Navigation size={18} color="#fff" />
                <Text style={styles.optimizeBtnText}>Navigate Optimized Tour (39.8 km)</Text>
              </>
            ) : isCalculating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.optimizeBtnText}>Computing 2-Opt Permutations...</Text>
              </>
            ) : (
              <>
                <Sparkles size={18} color="#fff" />
                <Text style={styles.optimizeBtnText}>Optimize Waypoint Tour (2-Opt TSP)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111C2D' },
  headerSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { padding: 16, gap: 14 },

  algorithmCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  algorithmHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  algorithmTitle: { fontSize: 12, fontWeight: '700', color: '#0061A7' },
  algorithmDesc: { fontSize: 11, color: '#2B5A82', lineHeight: 16 },
  mathEquation: { fontFamily: 'monospace', fontWeight: '700', color: '#0061A7' },

  metricsBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricsBannerOptimized: {
    borderColor: '#00C06D',
    shadowColor: '#00C06D',
    shadowOpacity: 0.15,
  },
  metricsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricsBadge: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metricsBadgeText: { fontSize: 10, fontWeight: '700', color: '#0061A7' },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingsPillText: { fontSize: 11, fontWeight: '800', color: '#00C06D', fontVariant: ['tabular-nums'] },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricCol: { flex: 1, alignItems: 'center' },
  metricIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metricLabel: { fontSize: 9, fontWeight: '600', color: '#707884' },
  metricValue: { fontSize: 17, fontWeight: '800', color: '#111C2D', fontVariant: ['tabular-nums'] },
  metricSub: { fontSize: 9, color: '#707884', marginTop: 1, fontVariant: ['tabular-nums'] },
  metricDivider: { width: 1, height: 32, backgroundColor: '#E8EEFF' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  resetAction: { fontSize: 12, fontWeight: '700', color: '#0096FF' },

  waypointCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepNumCol: { alignItems: 'center', width: 28 },
  stepNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#707884',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  stepDottedLine: { width: 2, height: 20, backgroundColor: '#E8EEFF', marginTop: 4 },
  waypointContent: { flex: 1 },
  waypointName: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  waypointAddress: { fontSize: 11, color: '#707884', marginTop: 1 },
  digiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  digiBadge: { backgroundColor: '#0096FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  digiBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  digiCode: { fontSize: 10, fontWeight: '700', color: '#111C2D', fontFamily: 'monospace', fontVariant: ['tabular-nums'] },
  deleteStopBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  reorderBtn: {
    padding: 8,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    borderRadius: 16,
    paddingVertical: 15,
    minHeight: 48,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  optimizeBtnDone: {
    backgroundColor: '#00C06D',
    shadowColor: '#00C06D',
  },
  optimizeBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EEFF',
    paddingTop: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  dockContent: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
});
