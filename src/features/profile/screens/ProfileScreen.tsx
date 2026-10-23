import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Car,
  Zap,
  CreditCard,
  Languages,
  Activity,
  Bookmark,
  MapPin,
  History,
  Satellite,
  DownloadCloud,
  Volume2,
  Copy,
  Navigation,
  LogOut,
  Leaf,
  CheckCircle2,
  EyeOff,
  Clock,
  Gauge,
  Phone,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Button,
  Badge,
  StatusBadge,
  Avatar,
  ListItem,
  MetricCard,
  SectionHeader,
} from '@/shared/components/ui';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', script: 'English' },
  { code: 'hi', name: 'Hindi', script: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা' },
  { code: 'mr', name: 'Marathi', script: 'मराठी' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ' },
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
    destination: 'Agra Fort via NH-48 & Yamuna Expy',
    date: 'Yesterday, 07:30 AM',
    distance: '168.3 km',
    duration: '2h 14m',
    toll: '₹435 (FASTag)',
    co2: 'Saved 2.4 kg CO₂',
  },
  {
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
  const [offlineSync, setOfflineSync] = useState(true);
  const [speedAlerts, setSpeedAlerts] = useState(true);

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleCopyDigiPin = (pin: string) => {
    triggerHaptic();
    Alert.alert('DigiPIN Copied', `Copied ${pin} to clipboard (4m × 4m sovereign grid code).`);
  };

  const handleLanguageSelect = (code: string) => {
    triggerHaptic();
    setSelectedLanguage(code);
  };

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
              triggerHaptic();
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
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: '84%', backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>

          {/* Overall Stats Row */}
          <View style={styles.metricsGrid}>
            <MetricCard
              label="KM Navigated"
              value="4,820"
              unit="km"
              style={styles.metricItem}
            />
            <MetricCard
              label="Total Trips"
              value="142"
              style={styles.metricItem}
            />
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard
              label="CO₂ Saved"
              value="68.4"
              unit="kg"
              trend={{ value: '+4.2 kg', positive: true }}
              style={styles.metricItem}
            />
            <MetricCard
              label="Trust Score"
              value="98.4"
              unit="%"
              style={styles.metricItem}
            />
          </View>
        </Card>

        {/* Live Activity Recognition State */}
        <Card variant="outlined" padding="md" style={styles.activityBanner}>
          <View style={styles.activityLeft}>
            <View
              style={[
                styles.activityIconRing,
                { backgroundColor: colors.primaryContainer },
              ]}>
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

        {/* Connected Vehicle & FASTag */}
        <Card variant="elevated" padding="md" style={styles.cardGap}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <Car size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>My Vehicle & FASTag</Text>
                <Text style={[styles.cardSubTitle, { color: colors.onSurfaceVariant }]}>Connected EV Telematics</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                router.push('/vehicle-fleet');
              }}
              accessibilityRole="button"
              accessibilityLabel="Manage vehicles and fleet">
              <Text style={[styles.cardHeaderAction, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleRow}>
              <View>
                <Text style={[styles.vehicleModel, { color: colors.onSurface }]}>
                  Tata Nexon EV Max
                </Text>
                <Text style={[styles.vehicleReg, { color: colors.onSurfaceVariant }]}>
                  DL 01 AB 1234 · Class 4 (Car/Jeep)
                </Text>
              </View>
              <Badge label="78% · 312 km" variant="success" size="sm" leftIcon={<Zap size={11} color={colors.secondary} />} />
            </View>

            <Card
              variant="outlined"
              padding="sm"
              onPress={() => {
                triggerHaptic();
                router.push('/vehicle-fleet');
              }}
              accessibilityLabel="Manage FASTag balance">
              <View style={styles.fastagBannerInner}>
                <View style={styles.fastagLeft}>
                  <CreditCard size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fastagTitle, { color: colors.onSurface }]}>
                      NHAI FASTag Linked
                    </Text>
                    <Text style={[styles.fastagNumber, { color: colors.onSurfaceVariant }]}>
                      Tag ID: 3416-8920-1102 (SBI Auto-Reload)
                    </Text>
                  </View>
                </View>
                <View style={[styles.fastagBalanceBox, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.fastagBalanceLabel, { color: colors.onSurfaceVariant }]}>BALANCE</Text>
                  <Text style={[styles.fastagBalance, { color: colors.onSurface }]}>₹1,450</Text>
                </View>
              </View>
            </Card>
          </View>
        </Card>

        {/* 12 Indian Languages Selector */}
        <Card variant="elevated" padding="md" style={styles.cardGap}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <Languages size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  Vernacular Voice & UI
                </Text>
                <Text style={[styles.cardSubTitle, { color: colors.onSurfaceVariant }]}>
                  Regional TTS & Navigation Signage
                </Text>
              </View>
            </View>
            <Badge label="12 Indic" variant="primary" size="sm" />
          </View>

          <View style={styles.langGrid}>
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
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
                  onPress={() => handleLanguageSelect(lang.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Language ${lang.name}`}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.langScript,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}>
                    {lang.script}
                  </Text>
                  <Text
                    style={[
                      styles.langName,
                      {
                        color: isSelected ? colors.primary : colors.onSurfaceVariant,
                      },
                    ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Saved Places with DigiPIN */}
        <Card variant="elevated" padding="md" style={styles.cardGap}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <Bookmark size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Saved Places with DigiPIN</Text>
                <Text style={[styles.cardSubTitle, { color: colors.onSurfaceVariant }]}>4m × 4m Sovereign Grid Addresses</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                Alert.alert('Add Place', 'Enter destination and resolve its 4m × 4m DigiPIN.');
              }}
              accessibilityRole="button"
              accessibilityLabel="Add new place">
              <Text style={[styles.cardHeaderAction, { color: colors.primary }]}>+ Add Place</Text>
            </TouchableOpacity>
          </View>

          {SAVED_PLACES.map((place) => (
            <View
              key={place.id}
              style={[styles.placeItem, { borderBottomColor: colors.surfaceContainerHigh }]}>
              <View
                style={[styles.placeIconCircle, { backgroundColor: colors.surfaceContainerLow }]}>
                <MapPin size={16} color={colors.primary} />
              </View>
              <View style={styles.placeInfo}>
                <Text style={[styles.placeLabel, { color: colors.onSurface }]}>{place.label}</Text>
                <Text style={[styles.placeAddress, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                  {place.address}
                </Text>
                <TouchableOpacity
                  style={[styles.placePinRow, { backgroundColor: colors.surfaceContainerLow }]}
                  onPress={() => {
                    triggerHaptic();
                    router.push('/digipin-explorer');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`DigiPIN ${place.digiPin}`}
                  activeOpacity={0.8}>
                  <View style={[styles.digiBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.digiBadgeText, { color: colors.onPrimary }]}>DigiPIN</Text>
                  </View>
                  <Text style={[styles.digiCode, { color: colors.primary }]}>{place.digiPin}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => handleCopyDigiPin(place.digiPin)}
                    accessibilityRole="button"
                    accessibilityLabel={`Copy DigiPIN for ${place.label}`}>
                    <Copy size={11} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.routePlaceBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  triggerHaptic();
                  router.push('/modal');
                }}
                accessibilityRole="button"
                accessibilityLabel={`Navigate to ${place.label}`}>
                <Navigation size={14} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* Recent Trip History */}
        <Card variant="elevated" padding="md" style={styles.cardGap}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
                <History size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Recent Trips</Text>
                <Text style={[styles.cardSubTitle, { color: colors.onSurfaceVariant }]}>Trip Logs & Toll Records</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                Alert.alert('Trip History', 'Viewing all 142 completed trips and mileage exports.');
              }}
              accessibilityRole="button"
              accessibilityLabel="View all trip history">
              <Text style={[styles.cardHeaderAction, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {RECENT_TRIPS.map((trip, idx) => (
            <View
              key={idx}
              style={[styles.tripItem, { borderBottomColor: colors.surfaceContainerHigh }]}>
              <View style={styles.tripTopRow}>
                <Text style={[styles.tripDest, { color: colors.onSurface }]}>{trip.destination}</Text>
                <Text style={[styles.tripDate, { color: colors.outline }]}>{trip.date}</Text>
              </View>
              <View style={styles.tripMetaRow}>
                <View style={[styles.tripBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Clock size={11} color={colors.onSurfaceVariant} />
                  <Text style={[styles.tripBadgeText, { color: colors.onSurfaceVariant }]}>
                    {trip.duration}
                  </Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Gauge size={11} color={colors.onSurfaceVariant} />
                  <Text style={[styles.tripBadgeText, { color: colors.onSurfaceVariant }]}>
                    {trip.distance}
                  </Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <CreditCard size={11} color={colors.onSurfaceVariant} />
                  <Text style={[styles.tripBadgeText, { color: colors.onSurfaceVariant }]}>
                    {trip.toll}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tripBadge,
                    { backgroundColor: colors.secondaryContainer },
                  ]}>
                  <Leaf size={11} color={colors.secondary} />
                  <Text style={[styles.tripBadgeText, { color: colors.onSecondaryContainer }]}>
                    {trip.co2}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Sovereign & Privacy Preferences */}
        <SectionHeader
          title="Sovereignty & Security"
          subtitle="Privacy boundaries & telemetry preferences"
        />
        <Card variant="elevated" padding="none">
          <ListItem
            leading={<Satellite size={20} color={colors.primary} />}
            title="ISRO NavIC Constellation Mode"
            subtitle="Dual-Band L5/S ionospheric delay cancellation"
            trailing={
              <Switch
                value={navicMode}
                onValueChange={(val) => {
                  triggerHaptic();
                  setNavicMode(val);
                }}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            divider
          />
          <ListItem
            leading={<EyeOff size={20} color={colors.tertiary} />}
            title="Differential Privacy Obfuscation"
            subtitle="200m spatial laplacian noise near defense zones"
            trailing={
              <Switch
                value={differentialPrivacy}
                onValueChange={(val) => {
                  triggerHaptic();
                  setDifferentialPrivacy(val);
                }}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            divider
          />
          <ListItem
            leading={<DownloadCloud size={20} color={colors.secondary} />}
            title="Offline Regional Vector Maps"
            subtitle="Delhi NCR & Yamuna Expressway (420 MB)"
            trailing={
              <Switch
                value={offlineSync}
                onValueChange={(val) => {
                  triggerHaptic();
                  setOfflineSync(val);
                }}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            divider
          />
          <ListItem
            leading={<Volume2 size={20} color={colors.primary} />}
            title="ADAS Speed & Camera Chimes"
            subtitle="Audio alerts when exceeding corridor limits"
            trailing={
              <Switch
                value={speedAlerts}
                onValueChange={(val) => {
                  triggerHaptic();
                  setSpeedAlerts(val);
                }}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </Card>

        {/* Logout Action */}
        <Button
          title="Sign Out of Session"
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<LogOut size={16} color={colors.error} />}
          onPress={() => {
            triggerHaptic();
            Alert.alert(
              'Sign Out?',
              'Are you sure you want to end your current sovereign navigation session?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => router.push('/auth'),
                },
              ]
            );
          }}
          style={[styles.logoutBtn, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
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
  cardGap: {
    gap: 12,
  },
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  sosQuickText: {
    fontSize: 11,
    fontWeight: '800',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
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
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  levelProgressContainer: {
    gap: 6,
    marginTop: 2,
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  levelPoints: {
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
    gap: 8,
  },
  metricItem: {
    flex: 1,
  },
  activityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.xs,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  activityIconRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  activitySub: {
    ...Typography.bodySmall,
    fontSize: 10,
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
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  cardSubTitle: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  cardHeaderAction: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  vehicleDetails: {
    gap: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleModel: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  vehicleReg: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  fastagBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xs,
  },
  fastagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fastagTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  fastagNumber: {
    ...Typography.bodySmall,
    fontSize: 10,
    marginTop: 1,
  },
  fastagBalanceBox: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginLeft: 8,
  },
  fastagBalanceLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  fastagBalance: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  langScript: {
    fontSize: 12,
  },
  langName: {
    fontSize: 10,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  placeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    flex: 1,
    gap: 2,
  },
  placeLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  placeAddress: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  placePinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    marginTop: 2,
  },
  digiBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  digiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  digiCode: {
    fontSize: 10,
    fontWeight: '700',
  },
  copyBtn: {
    padding: 2,
  },
  routePlaceBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripDest: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  tripDate: {
    fontSize: 10,
  },
  tripMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  tripBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 8,
  },
});
