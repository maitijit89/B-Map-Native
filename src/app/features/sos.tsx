import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { useTelemetry } from '@/services/telemetry';

const EMERGENCY_DIRECTORY = [
  {
    id: 'erss-112',
    name: '112 Unified National ERSS',
    subtext: 'Police, Fire, Ambulance & Women Safety',
    phone: '112',
    icon: 'shield-alert' as const,
    color: '#D32F2F',
  },
  {
    id: 'nhai-1033',
    name: '1033 NHAI Highway Emergency',
    subtext: 'Road Accident, Crane Towing & Ambulance',
    phone: '1033',
    icon: 'car-emergency' as const,
    color: '#E65100',
  },
  {
    id: 'trauma-centre',
    name: 'Nearest Level-1 Trauma Centre',
    subtext: 'Safdarjung Emergency Hospital',
    phone: '01126165060',
    icon: 'hospital-building' as const,
    color: '#00875A',
  },
  {
    id: 'police-control',
    name: 'State Police Control Room',
    subtext: 'Traffic Highway Interceptor Units',
    phone: '100',
    icon: 'police-badge' as const,
    color: '#1565C0',
  },
];

export default function NationalSOSScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const telemetry = useTelemetry();

  const [isSosActive, setIsSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Pulsing scale animation via Reanimated
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  const handleTriggerSOS = () => {
    setIsSosActive(true);
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        Linking.openURL('tel:112');
      }
    }, 1000);
  };

  const handleCancelSOS = () => {
    setIsSosActive(false);
    setCountdown(5);
  };

  const handleCall = (phoneNumber: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Dialing emergency number: ${phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${phoneNumber}`),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="112 National SOS"
        subtitle="Highway Emergency & Fast ERSS Dispatch"
        accentColor={BMapColors.emergencyRed}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* High-Contrast Alert Header */}
        <View style={styles.alertHeader}>
          <Text style={[styles.alertTitle, BMapTypography.headlineMedium, { color: '#D32F2F' }]}>
            Emergency SOS Dispatch
          </Text>
          <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
            Press the button below to broadcast your live GPS telemetry to 112 ERSS responders.
          </Text>
        </View>

        {/* Center Massive Pulsing Red SOS Trigger Button */}
        <View style={styles.sosButtonContainer}>
          <Animated.View style={[styles.pulseRing, animatedRingStyle]} />
          <Pressable
            onPress={isSosActive ? handleCancelSOS : handleTriggerSOS}
            style={({ pressed }) => [
              styles.sosCircle,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            {isSosActive ? (
              <View style={styles.activeSosCluster}>
                <Text style={styles.countdownNumber}>{countdown}</Text>
                <Text style={styles.cancellingText}>TAP TO CANCEL</Text>
              </View>
            ) : (
              <View style={styles.sosInnerCluster}>
                <MaterialCommunityIcons name="alert-octagon" size={48} color="#FFFFFF" />
                <Text style={styles.sosMainText}>SOS</Text>
                <Text style={styles.sosSubText}>112 DISPATCH</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Location Broadcast Card for Dispatch Readout */}
        <View style={[styles.locationCard, { backgroundColor: isDark ? '#2B1212' : '#FFEBEE', borderColor: '#EF5350' }]}>
          <View style={styles.locationHeaderRow}>
            <Ionicons name="radio" size={20} color="#D32F2F" />
            <Text style={styles.locationCardTitle}>LIVE DISPATCH TELEMETRY READOUT</Text>
          </View>

          <Text style={[styles.dispatchHint, { color: colors.textSecondary }]}>
            Read these coordinates to the emergency phone operator:
          </Text>

          <View style={[styles.coordsPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.coordsText, { color: colors.text }]}>
              {telemetry.latitude.toFixed(6)}° N, {telemetry.longitude.toFixed(6)}° E
            </Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#D32F2F" />
            <Text style={[styles.addressString, { color: colors.text }]}>
              {telemetry.addressString || 'Connaught Place, New Delhi, Delhi 110001'}
            </Text>
          </View>
        </View>

        {/* Emergency Directory Quick-Access List */}
        <View style={styles.directorySection}>
          <Text style={[styles.sectionTitle, BMapTypography.titleMedium, { color: colors.text }]}>
            Direct Emergency Call Lines
          </Text>

          <View style={styles.directoryList}>
            {EMERGENCY_DIRECTORY.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleCall(item.phone, item.name)}
                style={[styles.directoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.itemIconCircle, { backgroundColor: `${item.color}15` }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                </View>

                <View style={styles.itemTextCluster}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemSubtext, { color: colors.textSecondary }]}>{item.subtext}</Text>
                </View>

                <View style={[styles.callBtn, { backgroundColor: item.color }]}>
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>Call {item.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  alertHeader: {
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
  },
  alertTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  alertSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  sosButtonContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(211, 47, 47, 0.4)',
  },
  sosCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFCDD2',
    ...BMapElevation.level3,
  },
  sosInnerCluster: {
    alignItems: 'center',
    gap: 2,
  },
  sosMainText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sosSubText: {
    color: '#FFCDD2',
    fontSize: 9,
    fontWeight: '800',
  },
  activeSosCluster: {
    alignItems: 'center',
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
  },
  cancellingText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  locationCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    gap: 10,
    ...BMapElevation.level1,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C62828',
    letterSpacing: 0.5,
  },
  dispatchHint: {
    fontSize: 12,
  },
  coordsPill: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  coordsText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressString: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  directorySection: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '800',
  },
  directoryList: {
    gap: 10,
  },
  directoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    ...BMapElevation.level1,
  },
  itemIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCluster: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemSubtext: {
    fontSize: 11,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
