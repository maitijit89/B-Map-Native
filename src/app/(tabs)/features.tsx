import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';

type FeatureCategory = 'all' | 'transit' | 'smart' | 'safety';

interface FeatureItem {
  id: string;
  category: 'transit' | 'smart' | 'safety';
  route: string;
  title: string;
  desc: string;
  icon: string;
  iconSet: 'MaterialCommunityIcons' | 'Ionicons';
  color: string;
  badge: string;
}

const CATEGORY_TABS = [
  { id: 'all' as FeatureCategory, label: 'All Tools' },
  { id: 'transit' as FeatureCategory, label: '🛣️ Transit & Toll' },
  { id: 'smart' as FeatureCategory, label: '⚡ Energy & Grid' },
  { id: 'safety' as FeatureCategory, label: '🚨 Safety & ERSS' },
];

const ECOSYSTEM_FEATURES: FeatureItem[] = [
  {
    id: 'fastag',
    category: 'transit',
    route: '/features/fastag',
    title: 'FASTag Toll Calculator',
    desc: 'National Highways plaza map, vehicle rates & electronic toll collection',
    icon: 'card-account-details-outline',
    iconSet: 'MaterialCommunityIcons',
    color: BMapColors.fastagPurple,
    badge: '100% ETC',
  },
  {
    id: 'route-planner',
    category: 'transit',
    route: '/navigate/route-planner',
    title: 'Multi-Modal Route Planner',
    desc: 'Distance matrix for Car, 2W, Walk & Bicycle with GLOSA green wave',
    icon: 'navigate',
    iconSet: 'Ionicons',
    color: BMapColors.primary,
    badge: 'GLOSA Wave',
  },
  {
    id: 'fare-estimator',
    category: 'transit',
    route: '/features/fare-estimator',
    title: 'Metered Auto & Cab Tariff',
    desc: 'Official Govt. RTA metered fare calculator with night surcharge',
    icon: 'rickshaw',
    iconSet: 'MaterialCommunityIcons',
    color: '#CA8A04',
    badge: 'Govt RTA',
  },
  {
    id: 'ev-charging',
    category: 'smart',
    route: '/features/ev-charging',
    title: 'EV Charging & Battery Radar',
    desc: 'Tata Power, Ather Grid & Jio-bp real-time ports & fast DC speeds',
    icon: 'flash',
    iconSet: 'Ionicons',
    color: BMapColors.evCyan,
    badge: 'Live Radar',
  },
  {
    id: 'digipin',
    category: 'smart',
    route: '/features/digipin',
    title: 'India Post DIGIPIN Grid',
    desc: '4m × 4m digital address encoding & unstructured landmark parsing',
    icon: 'grid',
    iconSet: 'MaterialCommunityIcons',
    color: BMapColors.digipinOrange,
    badge: 'India Post',
  },
  {
    id: 'environment',
    category: 'smart',
    route: '/features/environment',
    title: 'IMD Weather & AQI Dashboard',
    desc: 'Dense winter fog visibility in meters, AQI scores & monsoon alerts',
    icon: 'weather-hazy',
    iconSet: 'MaterialCommunityIcons',
    color: '#0284C7',
    badge: 'IMD Telemetry',
  },
  {
    id: 'sos',
    category: 'safety',
    route: '/features/sos',
    title: '112 National SOS & Highway ERSS',
    desc: 'Instant GPS dispatch broadcast, NHAI 1033 & trauma helpline',
    icon: 'alert-octagon',
    iconSet: 'MaterialCommunityIcons',
    color: BMapColors.emergencyRed,
    badge: 'High Alert',
  },
  {
    id: 'report-hazard',
    category: 'safety',
    route: '/features/report-hazard',
    title: 'Community Hazard Reporter',
    desc: 'Report speed breakers, waterlogging & potholes to earn karma points',
    icon: 'warning',
    iconSet: 'Ionicons',
    color: BMapColors.warningAmber,
    badge: 'Crowdsourced',
  },
];

export default function FeaturesHubScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [activeTab, setActiveTab] = useState<FeatureCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = useMemo(() => {
    let list = ECOSYSTEM_FEATURES;
    if (activeTab !== 'all') {
      list = list.filter(f => f.category === activeTab);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        f =>
          f.title.toLowerCase().includes(q) ||
          f.desc.toLowerCase().includes(q) ||
          f.badge.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery]);

  const renderFeatureItem = useCallback(
    ({ item }: { item: FeatureItem }) => {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(item.route as any)}
          style={[
            styles.featureCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
              {item.iconSet === 'Ionicons' ? (
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              ) : (
                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
              )}
            </View>

            <View style={[styles.badgePill, { backgroundColor: `${item.color}18` }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>{item.badge}</Text>
            </View>
          </View>

          <Text
            style={[
              styles.cardTitle,
              BMapTypography.titleMedium,
              { color: colors.text, fontSize: moderateScale(isSmallDevice ? 15 : 16) },
            ]}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.cardDesc,
              { color: colors.textSecondary, fontSize: moderateScale(isSmallDevice ? 11 : 12) },
            ]}
            numberOfLines={2}
          >
            {item.desc}
          </Text>

          <View style={styles.cardArrowRow}>
            <Text style={[styles.openLinkText, { color: item.color }]}>Launch Tool</Text>
            <Ionicons name="arrow-forward" size={13} color={item.color} />
          </View>
        </TouchableOpacity>
      );
    },
    [colors, router]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Cluster */}
      <View style={styles.headerCluster}>
        <Text
          style={[
            styles.screenTitle,
            BMapTypography.headlineMedium,
            { color: colors.text, fontSize: moderateScale(isSmallDevice ? 19 : 22) },
          ]}
        >
          Indian Mobility Ecosystem
        </Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          Specialized regional transit and highway intelligence tools
        </Text>

        {/* Quick Search Input */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Filter tools: FASTag, EV, SOS..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Tabs */}
        <View style={styles.tabBar}>
          {CATEGORY_TABS.map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isSelected
                      ? BMapColors.primary
                      : isDark
                      ? '#16222F'
                      : '#FFFFFF',
                    borderColor: isSelected ? BMapColors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Virtualized Cards List - Only renders visible items */}
      <FlatList
        data={filteredFeatures}
        renderItem={renderFeatureItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No matching tools found for "{searchQuery}"
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCluster: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  screenTitle: {
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tabPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: moderateScale(11),
  },
  listContent: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingBottom: 32,
    gap: isSmallDevice ? 8 : 10,
  },
  featureCard: {
    borderRadius: 16,
    padding: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    gap: 6,
    ...BMapElevation.level1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
    lineHeight: 16,
  },
  cardArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  openLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
