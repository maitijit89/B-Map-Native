import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
  withDelay,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { useTelemetry } from '@/services/telemetry';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';
import { IndianEcosystemAPI } from '@/api/api';

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

function ConcentricPulseRing({ delay = 0, size = 180 }: { delay?: number; size?: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
    return () => cancelAnimation(pulse);
  }, [delay, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [0.85, 1.45]);
    const opacity = interpolate(pulse.value, [0, 0.4, 1], [0.6, 0.3, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function NationalSOSScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const telemetry = useTelemetry();

  const [isSosActive, setIsSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleTriggerSOS = () => {
    setIsSosActive(true);
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        IndianEcosystemAPI.triggerEmergencySOS({
          type: 'ACCIDENT_CRITICAL',
          current_location: { latitude: telemetry.latitude, longitude: telemetry.longitude },
          message: 'Highway emergency dispatch requested from B-Map Mobile Client',
        }).catch(() => {});
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* High-Contrast Alert Header */}
        <FadeInView delay={50} direction="down">
          <View style={styles.alertHeader}>
            <Text style={[styles.alertTitle, BMapTypography.headlineMedium, { color: '#D32F2F' }]}>
              Emergency SOS Dispatch
            </Text>
            <Text style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
              Press the button below to broadcast your live GPS telemetry to 112 ERSS responders.
            </Text>
          </View>
        </FadeInView>

        {/* Center Concentric Pulsing Red SOS Trigger Button */}
        <View style={styles.sosButtonContainer}>
          <ConcentricPulseRing delay={0} size={180} />
          <ConcentricPulseRing delay={500} size={180} />
          <ConcentricPulseRing delay={1000} size={180} />

          <Pressable
            onPress={isSosActive ? handleCancelSOS : handleTriggerSOS}
            style={({ pressed }) => [
              styles.sosCircle,
              { transform: [{ scale: pressed ? 0.94 : 1 }] },
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
        <FadeInView delay={180} direction="up">
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
        </FadeInView>

        {/* Emergency Directory Quick-Access List */}
        <View style={styles.directorySection}>
          <Text style={[styles.sectionTitle, BMapTypography.titleMedium, { color: colors.text }]}>
            Direct Emergency Call Lines
          </Text>

          <View style={styles.directoryList}>
            {EMERGENCY_DIRECTORY.map((item, index) => (
              <FadeInView key={item.id} delay={250 + index * 70} direction="up">
                <AnimatedPressable
                  onPress={() => handleCall(item.phone, item.name)}
                  scaleTo={0.96}
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
                </AnimatedPressable>
              </FadeInView>
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
  },
  alertTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  alertSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  sosButtonContainer: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: 'rgba(211, 47, 47, 0.35)',
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
    gap: 4,
  },
  countdownNumber: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },
  cancellingText: {
    color: '#FFCDD2',
    fontSize: 10,
    fontWeight: '800',
  },
  locationCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    gap: 10,
    ...BMapElevation.level2,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationCardTitle: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dispatchHint: {
    fontSize: 12,
  },
  coordsPill: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  coordsText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressString: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
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
    fontSize: 14,
    fontWeight: '700',
  },
  itemSubtext: {
    fontSize: 11,
  },
  callBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
