import React, { useState, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Phone,
  ShieldAlert,
  Heart,
  Send,
  Radio,
} from 'lucide-react-native';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/hooks';
import { Header, Card, Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

const EMERGENCY_SERVICES = [
  {
    code: '112',
    name: 'National Emergency Response (All India)',
    sub: 'Police · Fire · Disaster Management',
    color: '#D32F2F',
    desc: 'Instant geolocated dispatch to nearest police control room',
  },
  {
    code: '1033',
    name: 'NHAI National Highway Patrol',
    sub: 'Toll Roadside Assistance · Towing Crane · Corridor Security',
    color: '#FF9800',
    desc: 'Dedicated rapid patrol vehicle dispatched within 12 min',
  },
  {
    code: '108',
    name: 'Medical Ambulance Dispatch',
    sub: 'Paramedic & Trauma Transport',
    color: '#00C06D',
    desc: 'Nearest ICU trauma ambulance with GPS telemetry link',
  },
  {
    code: '1091',
    name: 'Women Safety 24/7 Helpline',
    sub: 'Dedicated Police Assistance Unit',
    color: '#9C27B0',
    desc: 'High-priority priority response & active tracking',
  },
];

export default function SosDistressModal() {
  const colors = useThemeColors();
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [beaconDispatched, setBeaconDispatched] = useState(false);

  const radarPulse = useSharedValue(1);

  useEffect(() => {
    radarPulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  }, [radarPulse]);

  const radarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: radarPulse.value }],
    };
  });

  useEffect(() => {
    if (!isCountdownActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountdownActive(false);
          setBeaconDispatched(true);
          haptics.heavy();
          return 0;
        }
        haptics.warning();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdownActive]);

  const handleCancelCountdown = () => {
    haptics.medium();
    setIsCountdownActive(false);
    setBeaconDispatched(false);
    Alert.alert('Auto-Dispatch Paused', 'Emergency dispatch canceled. You can still call emergency services directly.');
  };

  const handleCall = (service: typeof EMERGENCY_SERVICES[0]) => {
    haptics.heavy();
    Alert.alert(
      `Dial ${service.code}?`,
      `Calling ${service.name}. Your exact DigiPIN coordinates (28J4-K8M2-9P) will be transmitted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Dial ${service.code}`, style: 'destructive' },
      ]
    );
  };

  const handleSendContactSms = () => {
    haptics.heavy();
    Alert.alert(
      'Emergency Alert Broadcasted! 📲',
      'Distress SMS containing live GPS tracking link and 4m × 4m DigiPIN sent to Emergency Contact: Dr. Priya Sharma (+91 98111 22334).'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceDim }]} edges={['top', 'bottom']}>
      {/* Urgent Emergency Header */}
      <Header
        title="112 EMERGENCY SOS"
        onBackPress={() => {
          haptics.light();
          router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pulsing Countdown Radar Box */}
        <Animated.View entering={FadeInDown.duration(350).springify().damping(16)}>
          <View style={[styles.countdownCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.error }]}>
            <Animated.View style={[styles.radarHalo, radarAnimatedStyle]} />

            <View style={styles.countdownCenter}>
              <ShieldAlert size={36} color="#F44336" />
              {isCountdownActive ? (
                <>
                  <Text style={[styles.countdownNumber, { color: colors.error }]}>{countdown}</Text>
                  <Text style={[styles.countdownLabel, { color: colors.onSurface }]}>Seconds until auto-dispatch to 112</Text>
                  <TouchableOpacity
                    style={[styles.cancelCountdownBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}
                    onPress={handleCancelCountdown}
                    activeOpacity={0.8}>
                    <Text style={[styles.cancelCountdownText, { color: colors.onSurface }]}>CANCEL AUTO-DISPATCH</Text>
                  </TouchableOpacity>
                </>
              ) : beaconDispatched ? (
                <>
                  <Text style={[styles.dispatchedTitle, { color: colors.trafficGreen }]}>DISTRESS BEACON DISPATCHED</Text>
                  <Text style={[styles.dispatchedSub, { color: colors.onSurfaceVariant }]}>
                    Coordinates & vehicle telemetry streamed to 112 National Control Room
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.pausedTitle, { color: colors.onSurface }]}>Emergency Standby Active</Text>
                  <Text style={[styles.pausedSub, { color: colors.onSurfaceVariant }]}>Tap any service below to connect immediately</Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Live GPS & DigiPIN Coordinates Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(350).springify().damping(16)}>
          <Card variant="flat" padding="md" style={[styles.telematicsCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
            <View style={styles.telematicsHeader}>
              <Radio size={16} color={colors.primary} />
              <Text style={[styles.telematicsTitle, { color: colors.primary }]}>Live Emergency Telematics Broadcast</Text>
              <View style={[styles.pulsingGreen, { backgroundColor: colors.trafficGreen }]} />
            </View>

            <View style={styles.telematicsGrid}>
              <View style={styles.telematicsCol}>
                <Text style={[styles.telematicsLabel, { color: colors.onSurfaceVariant }]}>LOCATION</Text>
                <Text style={[styles.telematicsVal, { color: colors.onSurface }]}>NH-48 km 42.4, Gurugram</Text>
              </View>
              <View style={styles.telematicsCol}>
                <Text style={[styles.telematicsLabel, { color: colors.onSurfaceVariant }]}>DIGIPIN (4m×4m)</Text>
                <Text style={[styles.telematicsVal, { color: colors.primary, fontFamily: 'monospace' }]}>
                  28J4-K8M2-9P
                </Text>
              </View>
            </View>

            <View style={[styles.vehicleRow, { borderTopColor: colors.outlineVariant }]}>
              <Text style={[styles.vehicleInfo, { color: colors.onSurfaceVariant }]}>
                Vehicle: Tata Nexon EV Max (DL 01 AB 1234) · Speed: 0 km/h · Heading: 185°
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* One-Touch Emergency Call Helplines */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Direct Official Helplines</Text>
        {EMERGENCY_SERVICES.map((serv, idx) => (
          <Animated.View
            key={serv.code}
            entering={FadeInDown.delay(150 + idx * 70).duration(350).springify().damping(16)}>
            <TouchableOpacity
              style={[styles.serviceCard, { borderLeftColor: serv.color, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
              onPress={() => handleCall(serv)}
              activeOpacity={0.8}>
              <View style={{ flex: 1 }}>
                <View style={styles.serviceHeaderRow}>
                  <Text style={[styles.serviceName, { color: colors.onSurface }]}>{serv.name}</Text>
                  <View style={[styles.codeBadge, { backgroundColor: serv.color }]}>
                    <Text style={styles.codeBadgeText}>{serv.code}</Text>
                  </View>
                </View>
                <Text style={[styles.serviceSub, { color: colors.onSurfaceVariant }]}>{serv.sub}</Text>
                <Text style={[styles.serviceDesc, { color: colors.outline }]}>{serv.desc}</Text>
              </View>

              <View style={[styles.callBtnCircle, { backgroundColor: serv.color }]}>
                <Phone size={18} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Emergency Medical & ICE Contact Card */}
        <Animated.View entering={FadeInDown.delay(450).duration(350).springify().damping(16)}>
          <Card variant="flat" padding="md" style={[styles.iceCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
            <View style={styles.iceHeader}>
              <Heart size={16} color={colors.error} />
              <Text style={[styles.iceTitle, { color: colors.error }]}>ICE (In Case of Emergency) Profile</Text>
            </View>

            <View style={styles.iceDetails}>
              <Text style={[styles.iceItem, { color: colors.onSurfaceVariant }]}>• Blood Group: <Text style={[styles.iceBold, { color: colors.onSurface }]}>O+ Positive</Text></Text>
              <Text style={[styles.iceItem, { color: colors.onSurfaceVariant }]}>• Emergency Contact: <Text style={[styles.iceBold, { color: colors.onSurface }]}>Dr. Priya Sharma (+91 98111 22334)</Text></Text>
              <Text style={[styles.iceItem, { color: colors.onSurfaceVariant }]}>• Organ Donor Card: <Text style={[styles.iceBold, { color: colors.onSurface }]}>Registered (ABHA Linked)</Text></Text>
            </View>

            <Button
              title="Send Live SOS SMS to ICE Contact"
              variant="danger"
              size="md"
              fullWidth
              leftIcon={<Send size={15} color="#fff" />}
              onPress={handleSendContactSms}
              style={{ marginTop: 10 }}
            />
          </Card>
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, gap: Spacing.md },

  countdownCard: {
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  radarHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  countdownCenter: { alignItems: 'center', zIndex: 1, gap: 6 },
  countdownNumber: { fontSize: 54, fontWeight: '900' },
  countdownLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  cancelCountdownBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 8,
    borderWidth: 1,
  },
  cancelCountdownText: { ...Typography.labelSmall, fontWeight: '800' },
  dispatchedTitle: { ...Typography.titleMedium, fontWeight: '900', marginTop: 8 },
  dispatchedSub: { ...Typography.bodySmall, textAlign: 'center', marginTop: 2 },
  pausedTitle: { ...Typography.titleMedium, fontWeight: '800', marginTop: 8 },
  pausedSub: { ...Typography.bodySmall, textAlign: 'center', marginTop: 2 },

  telematicsCard: {
    borderWidth: 1,
  },
  telematicsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  telematicsTitle: { ...Typography.labelSmall, fontWeight: '700', flex: 1 },
  pulsingGreen: { width: 8, height: 8, borderRadius: 4 },
  telematicsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  telematicsCol: { flex: 1 },
  telematicsLabel: { fontSize: 9, fontWeight: '700' },
  telematicsVal: { ...Typography.labelMedium, fontWeight: '700', marginTop: 2 },
  vehicleRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  vehicleInfo: { ...Typography.bodySmall, fontSize: 10 },

  sectionTitle: { ...Typography.titleSmall, fontWeight: '700', marginTop: 4 },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    gap: 12,
  },
  serviceHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceName: { ...Typography.labelLarge, fontWeight: '800', flex: 1 },
  codeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.xs },
  codeBadgeText: { fontSize: 10, fontWeight: '900', color: '#ffffff' },
  serviceSub: { ...Typography.bodySmall, marginTop: 2 },
  serviceDesc: { ...Typography.bodySmall, fontSize: 10, marginTop: 4 },
  callBtnCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  iceCard: { borderWidth: 1 },
  iceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  iceTitle: { ...Typography.labelMedium, fontWeight: '700' },
  iceDetails: { gap: 4 },
  iceItem: { ...Typography.bodySmall },
  iceBold: { fontWeight: '700' },
});
