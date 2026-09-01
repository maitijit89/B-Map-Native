import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';

const ECOSYSTEM_FEATURES = [
  {
    id: 'fastag',
    route: '/features/fastag',
    title: 'FASTag Toll Calculator',
    desc: 'National Highways plaza map, vehicle rates & electronic toll collection',
    icon: 'card-account-details-outline',
    iconSet: 'MaterialCommunityIcons' as const,
    color: BMapColors.fastagPurple,
    badge: '100% ETC',
  },
  {
    id: 'ev-charging',
    route: '/features/ev-charging',
    title: 'EV Charging & Battery Radar',
    desc: 'Tata Power, Ather Grid & Jio-bp real-time ports & fast DC speeds',
    icon: 'flash',
    iconSet: 'Ionicons' as const,
    color: BMapColors.evCyan,
    badge: 'Live Radar',
  },
  {
    id: 'digipin',
    route: '/features/digipin',
    title: 'India Post DIGIPIN Grid',
    desc: '4m × 4m digital address encoding & unstructured landmark parsing',
    icon: 'grid',
    iconSet: 'MaterialCommunityIcons' as const,
    color: BMapColors.digipinOrange,
    badge: 'India Post',
  },
  {
    id: 'fare-estimator',
    route: '/features/fare-estimator',
    title: 'Metered Auto & Cab Tariff',
    desc: 'Official Govt. RTA metered fare calculator with night surcharge',
    icon: 'rickshaw',
    iconSet: 'MaterialCommunityIcons' as const,
    color: '#CA8A04',
    badge: 'Govt RTA',
  },
  {
    id: 'sos',
    route: '/features/sos',
    title: '112 National SOS & Highway ERSS',
    desc: 'Instant GPS dispatch broadcast, NHAI 1033 & trauma helpline',
    icon: 'alert-octagon',
    iconSet: 'MaterialCommunityIcons' as const,
    color: BMapColors.emergencyRed,
    badge: 'High Alert',
  },
  {
    id: 'environment',
    route: '/features/environment',
    title: 'IMD Weather & AQI Dashboard',
    desc: 'Dense winter fog visibility in meters, AQI scores & monsoon alerts',
    icon: 'weather-hazy',
    iconSet: 'MaterialCommunityIcons' as const,
    color: '#0284C7',
    badge: 'IMD Telemetry',
  },
  {
    id: 'report-hazard',
    route: '/features/report-hazard',
    title: 'Community Hazard Reporter',
    desc: 'Report speed breakers, waterlogging & potholes to earn karma points',
    icon: 'warning',
    iconSet: 'Ionicons' as const,
    color: BMapColors.warningAmber,
    badge: 'Crowdsourced',
  },
  {
    id: 'route-planner',
    route: '/navigate/route-planner',
    title: 'Multi-Modal Route Planner',
    desc: 'Distance matrix for Car, 2W, Walk & Bicycle with GLOSA green wave',
    icon: 'navigate',
    iconSet: 'Ionicons' as const,
    color: BMapColors.primary,
    badge: 'GLOSA Wave',
  },
];

export default function FeaturesHubScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerCluster}>
          <Text style={[styles.screenTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
            Indian Mobility Ecosystem
          </Text>
          <Text style={[styles.screenSubtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
            Regional navigation tools tailored for Indian road networks
          </Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.cardsGrid}>
          {ECOSYSTEM_FEATURES.map(feature => (
            <TouchableOpacity
              key={feature.id}
              activeOpacity={0.8}
              onPress={() => router.push(feature.route as any)}
              style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: `${feature.color}15` }]}>
                  {feature.iconSet === 'Ionicons' ? (
                    <Ionicons name={feature.icon as any} size={22} color={feature.color} />
                  ) : (
                    <MaterialCommunityIcons name={feature.icon as any} size={22} color={feature.color} />
                  )}
                </View>

                <View style={[styles.badgePill, { backgroundColor: `${feature.color}15` }]}>
                  <Text style={[styles.badgeText, { color: feature.color }]}>{feature.badge}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                {feature.title}
              </Text>

              <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {feature.desc}
              </Text>

              <View style={styles.cardArrowRow}>
                <Text style={[styles.openLinkText, { color: feature.color }]}>Open Feature</Text>
                <Ionicons name="arrow-forward" size={14} color={feature.color} />
              </View>
            </TouchableOpacity>
          ))}
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
    gap: 18,
  },
  headerCluster: {
    gap: 4,
  },
  screenTitle: {
    fontWeight: '800',
  },
  screenSubtitle: {
    lineHeight: 18,
  },
  cardsGrid: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    ...BMapElevation.level1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  openLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
