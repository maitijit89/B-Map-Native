import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Activity,
  MapPin,
  Copy,
  CheckCircle2,
  Phone,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Badge,
  StatusBadge,
  Avatar,
  MetricCard,
  SectionHeader,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

interface LanguageItem {
  code: string;
  name: string;
  script: string;
}

const INDIAN_LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', script: 'English' },
  { code: 'hi', name: 'Hindi', script: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা' },
  { code: 'mr', name: 'Marathi', script: 'मराठी' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', script: 'கன்னட' },
  { code: 'ml', name: 'Malayalam', script: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', script: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', script: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', script: 'অসমীয়া' },
];

const SAVED_PLACES = [
  {
    id: '1',
    label: 'Home',
    address: 'Sector 56, Golf Course Ext Road, Gurugram',
    digiPin: '28J4-K8M2-9P',
    type: 'home',
  },
  {
    id: '2',
    label: 'Work',
    address: 'DLF Cyber City, Building 10, DLF Phase 2',
    digiPin: '28J4-L9N3-1B',
    type: 'work',
  },
  {
    id: '3',
    label: 'IGI Airport T3',
    address: 'Indira Gandhi International Airport, New Delhi',
    digiPin: '28J3-H7K1-8X',
    type: 'airport',
  },
];

const RECENT_TRIPS = [
  {
    id: 'rt_1',
    destination: 'Agra Fort via NH-48 & Yamuna Expy',
    date: 'Yesterday, 07:30 AM',
    distance: '168.3 km',
    duration: '2h 14m',
    toll: '₹435 (FASTag)',
    co2: 'Saved 2.4 kg CO₂',
  },
  {
    id: 'rt_2',
    destination: 'Connaught Place, Inner Circle',
    date: '10 Oct, 05:15 PM',
    distance: '28.6 km',
    duration: '52m',
    toll: '₹0 (Toll-Free)',
    co2: 'Saved 0.6 kg CO₂',
  },
];

export default function ProfileScreen() {
  const colors = useThemeColors();

  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [navicMode, setNavicMode] = useState(true);
  const [differentialPrivacy, setDifferentialPrivacy] = useState(false);
  const [speedAlerts, setSpeedAlerts] = useState(true);

  const handleCopyDigiPin = useCallback((pin: string) => {
    haptics.success();
    Alert.alert('DigiPIN Copied', `Copied ${pin} to clipboard (4m × 4m sovereign grid code).`);
  }, []);

  const handleLanguageSelect = useCallback((code: string) => {
    haptics.selection();
    setSelectedLanguage(code);
  }, []);

  const renderLangItem: ListRenderItem<LanguageItem> = useCallback(
    ({ item }) => {
      const isSelected = selectedLanguage === item.code;
      return (
        <TouchableOpacity
          style={[
            styles.langChip,
            {
              backgroundColor: isSelected
                ? colors.primaryContainer
                : colors.surfaceContainerLow,
              borderColor: isSelected
                ? colors.primary
                : colors.surfaceContainerHigh,
            },
          ]}
          onPress={() => handleLanguageSelect(item.code)}
          accessibilityRole="button"
          accessibilityLabel={`Select language ${item.name} (${item.script})`}
          accessibilityState={{ selected: isSelected }}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.langName,
              { color: isSelected ? colors.onPrimary : colors.onSurface },
            ]}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.langScript,
              { color: isSelected ? colors.onPrimary : colors.onSurfaceVariant },
            ]}>
            {item.script}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedLanguage, colors, handleLanguageSelect]
  );

  const langKeyExtractor = useCallback((item: LanguageItem) => item.code, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header with Emergency Quick Action */}
      <Header
        title="My Profile & Fleet"
        subtitle="Sovereign Identity · Telematics & Settings"
        showBack={false}
        rightAction={
          <TouchableOpacity
            style={[styles.sosQuickBtn, { backgroundColor: colors.errorContainer }]}
            onPress={() => {
              haptics.heavy();
              router.push('/sos-distress');
            }}
            accessibilityRole="button"
            accessibilityLabel="SOS 112 emergency quick dial"
            activeOpacity={0.8}>
            <Phone size={14} color={colors.error} />
            <Text style={[styles.sosQuickText, { color: colors.error }]}>112</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Animated.View entering={FadeInDown.duration(280).springify().damping(18)}>
          <Card variant="elevated" padding="md" style={styles.cardGap}>
            <View style={styles.profileTop}>
              <Avatar name="Aarav Sharma" size="lg" status="online" />
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.profileName, { color: colors.onSurface }]}>Aarav Sharma</Text>
                  <CheckCircle2 size={16} color={colors.primary} />
                </View>
                <Text style={[styles.profileContact, { color: colors.onSurfaceVariant }]}>
                  +91 98765 43210 · aarav.sharma@example.com
                </Text>
                <View style={styles.badgeRow}>
                  <Badge label="VIP Navigator Level 4" variant="primary" size="sm" showDot />
                </View>
              </View>
            </View>

            {/* Level Progress */}
            <View style={styles.levelProgressContainer}>
              <View style={styles.levelLabelRow}>
                <Text style={[styles.levelLabel, { color: colors.onSurface }]}>Level 4 Voyager</Text>
                <Text style={[styles.levelPoints, { color: colors.onSurfaceVariant }]}>
                  8,420 / 10,000 XP to Level 5
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
                <View style={[styles.progressBarFill, { width: '84%', backgroundColor: colors.primary }]} />
              </View>
            </View>

            {/* Overall Stats Row */}
            <View style={styles.metricsGrid}>
              <MetricCard label="KM Navigated" value="4,820" unit="km" style={styles.metricItem} />
              <MetricCard label="Total Trips" value="142" style={styles.metricItem} />
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="CO₂ Saved"
                value="68.4"
                unit="kg"
                trend={{ value: '+4.2 kg', positive: true }}
                style={styles.metricItem}
              />
              <MetricCard label="Trust Score" value="98.4" unit="%" style={styles.metricItem} />
            </View>
          </Card>
        </Animated.View>

        {/* Live Activity Recognition State */}
        <Animated.View entering={FadeInDown.delay(50).duration(280).springify().damping(18)}>
          <Card variant="outlined" padding="md" style={styles.activityBanner}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIconRing, { backgroundColor: colors.primaryContainer }]}>
                <Activity size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: colors.onSurface }]}>
                  AI Motion State: Driving
                </Text>
                <Text style={[styles.activitySub, { color: colors.onSurfaceVariant }]}>
                  Sensors calibrated · Confidence 96% · 48 km/h
                </Text>
              </View>
            </View>
            <StatusBadge status="success" label="Active" size="sm" pulsing={true} />
          </Card>
        </Animated.View>

        {/* Saved Places */}
        <Animated.View entering={FadeInDown.delay(100).duration(280).springify().damping(18)}>
          <SectionHeader title="Saved Waypoints & DigiPINs" subtitle="Synchronized Sovereign Coordinates" />

          <Card variant="flat" padding="md" style={styles.cardGap}>
            {SAVED_PLACES.map((place, i) => (
              <View
                key={place.id}
                style={[
                  styles.placeRow,
                  i > 0 && { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh, paddingTop: 10, marginTop: 10 },
                ]}>
                <View style={[styles.placeIconBox, { backgroundColor: colors.surfaceContainerLow }]}>
                  <MapPin size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.placeLabel, { color: colors.onSurface }]}>{place.label}</Text>
                  <Text style={[styles.placeAddr, { color: colors.onSurfaceVariant }]}>{place.address}</Text>
                  <TouchableOpacity
                    onPress={() => handleCopyDigiPin(place.digiPin)}
                    style={styles.digiCopyPill}
                    accessibilityRole="button"
                    accessibilityLabel={`Copy DigiPIN code ${place.digiPin}`}>
                    <Copy size={10} color={colors.primary} />
                    <Text style={[styles.digiCopyText, { color: colors.primary }]}>{place.digiPin}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Multilingual Voice Guidance */}
        <Animated.View entering={FadeInDown.delay(150).duration(280).springify().damping(18)}>
          <SectionHeader title="Multilingual Voice Guidance" subtitle="Supported Regional Dialects" />

          <FlatList
            horizontal
            data={INDIAN_LANGUAGES}
            renderItem={renderLangItem}
            keyExtractor={langKeyExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langScroll}
          />
        </Animated.View>

        {/* Recent Navigation Trips */}
        <Animated.View entering={FadeInDown.delay(200).duration(280).springify().damping(18)}>
          <SectionHeader title="Recent Telematics History" subtitle="Trip Logs & FASTag Deductions" />

          <Card variant="flat" padding="md" style={styles.cardGap}>
            {RECENT_TRIPS.map((trip, idx) => (
              <View
                key={trip.id}
                style={[
                  styles.tripRow,
                  {
                    borderBottomColor: colors.surfaceContainerHigh,
                    borderBottomWidth: idx < RECENT_TRIPS.length - 1 ? 1 : 0,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tripDest, { color: colors.onSurface }]}>{trip.destination}</Text>
                  <Text style={[styles.tripDate, { color: colors.onSurfaceVariant }]}>{trip.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.tripDist, { color: colors.primary }]}>{trip.distance}</Text>
                  <Text style={[styles.tripToll, { color: colors.secondary }]}>{trip.toll}</Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Preferences Toggles */}
        <Animated.View entering={FadeInDown.delay(250).duration(280).springify().damping(18)}>
          <SectionHeader title="Navigation & Privacy Toggles" subtitle="ISRO NavIC · Anonymized Telematics" />

          <Card variant="flat" padding="md" style={styles.cardGap}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>ISRO NavIC Dual-Band Priority</Text>
                <Text style={[styles.toggleSub, { color: colors.onSurfaceVariant }]}>Use L5 + S-Band over US GPS</Text>
              </View>
              <Switch
                value={navicMode}
                onValueChange={(val) => {
                  haptics.selection();
                  setNavicMode(val);
                }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>Differential Privacy Mesh</Text>
                <Text style={[styles.toggleSub, { color: colors.onSurfaceVariant }]}>Anonymize location telemetry</Text>
              </View>
              <Switch
                value={differentialPrivacy}
                onValueChange={(val) => {
                  haptics.selection();
                  setDifferentialPrivacy(val);
                }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>Speed Camera Radar Alerts</Text>
                <Text style={[styles.toggleSub, { color: colors.onSurfaceVariant }]}>Voice warnings near radar guns</Text>
              </View>
              <Switch
                value={speedAlerts}
                onValueChange={(val) => {
                  haptics.selection();
                  setSpeedAlerts(val);
                }}
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
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sosQuickText: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
  cardGap: {
    borderRadius: Radius.xl,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  profileContact: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  levelProgressContainer: {
    marginTop: 14,
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelLabel: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  levelPoints: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  metricItem: {
    flex: 1,
  },
  activityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityIconRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  activitySub: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeLabel: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  placeAddr: {
    ...Typography.bodySmall,
  },
  digiCopyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  digiCopyText: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
  langScroll: {
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langName: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  langScript: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tripDest: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  tripDate: {
    ...Typography.bodySmall,
  },
  tripDist: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  tripToll: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  toggleSub: {
    ...Typography.bodySmall,
  },
  toggleDivider: {
    height: 1,
    marginVertical: 12,
  },
});
