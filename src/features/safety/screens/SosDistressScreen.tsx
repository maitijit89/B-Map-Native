import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  Phone,
  Siren,
  ShieldAlert,
  Heart,
  Send,
  Radio,
} from 'lucide-react-native';

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
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [beaconDispatched, setBeaconDispatched] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (!isCountdownActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountdownActive(false);
          setBeaconDispatched(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdownActive]);

  const handleCancelCountdown = () => {
    setIsCountdownActive(false);
    setBeaconDispatched(false);
    Alert.alert('Auto-Dispatch Paused', 'Emergency dispatch canceled. You can still call emergency services directly.');
  };

  const handleCall = (service: typeof EMERGENCY_SERVICES[0]) => {
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
    Alert.alert(
      'Emergency Alert Broadcasted! 📲',
      'Distress SMS containing live GPS tracking link and 4m × 4m DigiPIN sent to Emergency Contact: Dr. Priya Sharma (+91 98111 22334).'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Urgent Emergency Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.sirenIconBox}>
            <Siren size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>112 EMERGENCY SOS</Text>
            <Text style={styles.headerSub}>Govt of India National Emergency Response</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pulsing Countdown Radar Box */}
        <View style={styles.countdownCard}>
          <Animated.View
            style={[
              styles.radarHalo,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          <View style={styles.countdownCenter}>
            <ShieldAlert size={36} color="#F44336" />
            {isCountdownActive ? (
              <>
                <Text style={styles.countdownNumber}>{countdown}</Text>
                <Text style={styles.countdownLabel}>Seconds until auto-dispatch to 112</Text>
                <TouchableOpacity style={styles.cancelCountdownBtn} onPress={handleCancelCountdown}>
                  <Text style={styles.cancelCountdownText}>CANCEL AUTO-DISPATCH</Text>
                </TouchableOpacity>
              </>
            ) : beaconDispatched ? (
              <>
                <Text style={styles.dispatchedTitle}>DISTRESS BEACON DISPATCHED</Text>
                <Text style={styles.dispatchedSub}>
                  Coordinates & vehicle telemetry streamed to 112 National Control Room
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.pausedTitle}>Emergency Standby Active</Text>
                <Text style={styles.pausedSub}>Tap any service below to connect immediately</Text>
              </>
            )}
          </View>
        </View>

        {/* Live GPS & DigiPIN Coordinates Card */}
        <View style={styles.telematicsCard}>
          <View style={styles.telematicsHeader}>
            <Radio size={16} color="#0096FF" />
            <Text style={styles.telematicsTitle}>Live Emergency Telematics Broadcast</Text>
            <View style={styles.pulsingGreen} />
          </View>

          <View style={styles.telematicsGrid}>
            <View style={styles.telematicsCol}>
              <Text style={styles.telematicsLabel}>LOCATION</Text>
              <Text style={styles.telematicsVal}>NH-48 km 42.4, Gurugram</Text>
            </View>
            <View style={styles.telematicsCol}>
              <Text style={styles.telematicsLabel}>DIGIPIN (4m×4m)</Text>
              <Text style={[styles.telematicsVal, { fontFamily: 'monospace', color: '#0096FF' }]}>
                28J4-K8M2-9P
              </Text>
            </View>
          </View>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleInfo}>
              Vehicle: Tata Nexon EV Max (DL 01 AB 1234) · Speed: 0 km/h · Heading: 185°
            </Text>
          </View>
        </View>

        {/* One-Touch Emergency Call Helplines */}
        <Text style={styles.sectionTitle}>Direct Official Helplines</Text>
        {EMERGENCY_SERVICES.map((serv) => (
          <TouchableOpacity
            key={serv.code}
            style={[styles.serviceCard, { borderLeftColor: serv.color }]}
            onPress={() => handleCall(serv)}
            activeOpacity={0.8}>
            <View style={{ flex: 1 }}>
              <View style={styles.serviceHeaderRow}>
                <Text style={styles.serviceName}>{serv.name}</Text>
                <View style={[styles.codeBadge, { backgroundColor: serv.color }]}>
                  <Text style={styles.codeBadgeText}>{serv.code}</Text>
                </View>
              </View>
              <Text style={styles.serviceSub}>{serv.sub}</Text>
              <Text style={styles.serviceDesc}>{serv.desc}</Text>
            </View>

            <View style={[styles.callBtnCircle, { backgroundColor: serv.color }]}>
              <Phone size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Emergency Medical & ICE Contact Card */}
        <View style={styles.iceCard}>
          <View style={styles.iceHeader}>
            <Heart size={16} color="#F44336" />
            <Text style={styles.iceTitle}>ICE (In Case of Emergency) Profile</Text>
          </View>

          <View style={styles.iceDetails}>
            <Text style={styles.iceItem}>• Blood Group: <Text style={styles.iceBold}>O+ Positive</Text></Text>
            <Text style={styles.iceItem}>• Emergency Contact: <Text style={styles.iceBold}>Dr. Priya Sharma (+91 98111 22334)</Text></Text>
            <Text style={styles.iceItem}>• Organ Donor Card: <Text style={styles.iceBold}>Registered (ABHA Linked)</Text></Text>
          </View>

          <TouchableOpacity style={styles.sendIceBtn} onPress={handleSendContactSms} activeOpacity={0.85}>
            <Send size={15} color="#fff" />
            <Text style={styles.sendIceBtnText}>Send Live SOS SMS to ICE Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sirenIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  headerSub: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { padding: 16, gap: 14 },

  countdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
    overflow: 'hidden',
  },
  radarHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  countdownCenter: { alignItems: 'center', zIndex: 1, gap: 6 },
  countdownNumber: { fontSize: 54, fontWeight: '900', color: '#EF4444' },
  countdownLabel: { fontSize: 12, fontWeight: '700', color: '#E2E8F0', textAlign: 'center' },
  cancelCountdownBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelCountdownText: { fontSize: 11, fontWeight: '800', color: '#F1F5F9' },
  dispatchedTitle: { fontSize: 16, fontWeight: '900', color: '#00C06D', marginTop: 8 },
  dispatchedSub: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 2 },
  pausedTitle: { fontSize: 16, fontWeight: '800', color: '#F1F5F9', marginTop: 8 },
  pausedSub: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 2 },

  telematicsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  telematicsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  telematicsTitle: { fontSize: 12, fontWeight: '700', color: '#38BDF8', flex: 1 },
  pulsingGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C06D' },
  telematicsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  telematicsCol: { flex: 1 },
  telematicsLabel: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  telematicsVal: { fontSize: 12, fontWeight: '700', color: '#F1F5F9', marginTop: 2 },
  vehicleRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  vehicleInfo: { fontSize: 10, color: '#94A3B8' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', marginTop: 4 },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  serviceHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceName: { fontSize: 13, fontWeight: '800', color: '#F1F5F9', flex: 1 },
  codeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  codeBadgeText: { fontSize: 10, fontWeight: '900', color: '#ffffff' },
  serviceSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  serviceDesc: { fontSize: 10, color: '#64748B', marginTop: 4 },
  callBtnCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  iceCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155' },
  iceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  iceTitle: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  iceDetails: { gap: 4 },
  iceItem: { fontSize: 11, color: '#94A3B8' },
  iceBold: { color: '#F1F5F9', fontWeight: '700' },
  sendIceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  sendIceBtnText: { fontSize: 12, fontWeight: '800', color: '#ffffff' },
});
