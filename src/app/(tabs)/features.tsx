import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography, BMapAnimation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { FadeInView, staggerDelay } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';

type FeatureCategory = 'all' | 'transit' | 'smart' | 'safety';

interface FeatureItem {
  id: string;
  category: 'transit' | 'smart' | 'safety';
  route: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge: string;
  badgeType?: 'live' | 'govt' | 'alert' | 'standard';
}

const CATEGORY_TABS: { id: FeatureCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All Tools', icon: 'apps-outline' },
  { id: 'transit', label: 'Transit & Toll', icon: 'map-outline' },
  { id: 'smart', label: 'Energy & Grid', icon: 'flash-outline' },
  { id: 'safety', label: 'Safety & ERSS', icon: 'shield-checkmark-outline' },
];

const ECOSYSTEM_FEATURES: FeatureItem[] = [
  {
    id: 'fastag',
    category: 'transit',
    route: '/features/fastag',
    title: 'FASTag Toll Calculator',
    desc: 'National Highways plaza map, vehicle rates & electronic toll collection',
    icon: 'card-outline',
    color: BMapColors.fastagPurple,
    badge: '100% ETC',
    badgeType: 'standard',
  },
  {
    id: 'route-planner',
    category: 'transit',
    route: '/navigate/route-planner',
    title: 'Multi-Modal Route Planner',
    desc: 'Distance matrix for Car, 2W, Walk & Bicycle with GLOSA green wave',
    icon: 'navigate-outline',
    color: BMapColors.primary,
    badge: 'GLOSA Wave',
    badgeType: 'live',
  },
  {
    id: 'fare-estimator',
    category: 'transit',
    route: '/features/fare-estimator',
    title: 'Metered Auto & Cab Tariff',
    desc: 'Official Govt. RTA metered fare calculator with night surcharge',
    icon: 'car-sport-outline',
    color: BMapColors.rtaGold,
    badge: 'Govt RTA',
    badgeType: 'govt',
  },
  {
    id: 'ev-charging',
    category: 'smart',
    route: '/features/ev-charging',
    title: 'EV Charging & Battery Radar',
    desc: 'Tata Power, Ather Grid & Jio-bp real-time ports & fast DC speeds',
    icon: 'flash-outline',
    color: BMapColors.evCyan,
    badge: 'Live Radar',
    badgeType: 'live',
  },
  {
    id: 'digipin',
    category: 'smart',
    route: '/features/digipin',
    title: 'India Post DIGIPIN Grid',
    desc: '4m × 4m digital address encoding & unstructured landmark parsing',
    icon: 'grid-outline',
    color: BMapColors.digipinOrange,
    badge: 'India Post',
    badgeType: 'govt',
  },
  {
    id: 'environment',
    category: 'smart',
    route: '/features/environment',
    title: 'IMD Weather & AQI Dashboard',
    desc: 'Dense winter fog visibility in meters, AQI scores & monsoon alerts',
    icon: 'cloudy-outline',
    color: BMapColors.weatherBlue,
    badge: 'IMD Telemetry',
    badgeType: 'live',
  },
  {
    id: 'sos',
    category: 'safety',
    route: '/features/sos',
    title: '112 National SOS & Highway ERSS',
    desc: 'Instant GPS dispatch broadcast, NHAI 1033 & trauma helpline',
    icon: 'alert-circle-outline',
    color: BMapColors.emergencyRed,
    badge: 'High Alert',
    badgeType: 'alert',
  },
  {
    id: 'report-hazard',
    category: 'safety',
    route: '/features/report-hazard',
    title: 'Community Hazard Reporter',
    desc: 'Report speed breakers, waterlogging & potholes to earn karma points',
    icon: 'warning-outline',
    color: BMapColors.warningAmber,
    badge: 'Crowdsourced',
    badgeType: 'standard',
  },
];

export default function FeaturesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    ({ item, index }: { item: FeatureItem; index: number }) => {
      const iconBg = isDark ? `${item.color}22` : `${item.color}14`;
      const badgeBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)';

      return (
        <FadeInView delay={staggerDelay(index, BMapAnimation.stagger.fast)} from="up" slideDistance={12}>
          <AnimatedPressableButton
            pressScale={0.98}
            onPress={() => router.push(item.route as any)}
            style={[
              styles.featureCard,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? colors.border : colors.border,
              },
            ]}
          >
            {/* Top Row: Icon + Badge + Chevron */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>

              <View style={styles.cardHeaderRight}>
                <View style={[styles.badgePill, { backgroundColor: badgeBg }]}>
                  <View style={[styles.badgeDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.badgeText, { color: isDark ? colors.textSecondary : colors.text }]}>
                    {item.badge}
                  </Text>
                </View>

                <View style={[styles.chevronCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </View>
              </View>
            </View>

            {/* Title & Description */}
            <View style={styles.cardBody}>
              <Text
                style={[
                  styles.cardTitle,
                  BMapTypography.titleMedium,
                  { color: colors.text },
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.cardDesc,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {item.desc}
              </Text>
            </View>

            {/* Bottom Action Hint */}
            <View style={styles.cardFooter}>
              <View style={styles.cardActionRow}>
                <Text style={[styles.openLinkText, { color: item.color }]}>Launch Tool</Text>
                <Ionicons name="arrow-forward" size={12} color={item.color} />
              </View>
            </View>
          </AnimatedPressableButton>
        </FadeInView>
      );
    },
    [colors, isDark, router]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Cluster */}
      <View style={styles.headerCluster}>
        <FadeInView delay={50} from="down" slideDistance={10}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: BMapColors.primary }]}>
                MOBILITY INTELLIGENCE
              </Text>
              <Text
                style={[
                  styles.screenTitle,
                  BMapTypography.headlineMedium,
                  { color: colors.text },
                ]}
              >
                Indian Mobility Ecosystem
              </Text>
            </View>

            {/* Subtle System Theme Indicator */}
            <View
              style={[
                styles.themePill,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={13}
                color={isDark ? '#A5B4FC' : '#D97706'}
              />
              <Text style={[styles.themePillText, { color: colors.textMuted }]}>
                {isDark ? 'Dark' : 'Light'}
              </Text>
            </View>
          </View>

          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Specialized regional transit and highway intelligence tools
          </Text>
        </FadeInView>

        {/* Minimalist Search Bar */}
        <FadeInView delay={120} from="up" slideDistance={8}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search-outline" size={17} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Filter tools: FASTag, EV, SOS, RTA..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </FadeInView>

        {/* Sleek Horizontal Category Filter Chips */}
        <FadeInView delay={180} from="up" slideDistance={6}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              const activeBg = BMapColors.primary;
              const inactiveBg = colors.surfaceVariant;

              return (
                <AnimatedPressableButton
                  key={tab.id}
                  pressScale={0.94}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabChip,
                    {
                      backgroundColor: isSelected ? activeBg : inactiveBg,
                      borderColor: isSelected ? activeBg : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabChipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </AnimatedPressableButton>
              );
            })}
          </ScrollView>
        </FadeInView>
      </View>

      {/* Feature Cards Virtualized List */}
      <FlatList
        data={filteredFeatures}
        renderItem={renderFeatureItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 85 },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
            >
              <Ionicons name="search-outline" size={28} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tools found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No ecosystem tools match "{searchQuery}". Try searching for EV, Toll, or SOS.
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
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: moderateScale(isSmallDevice ? 20 : 23),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  themePillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  screenSubtitle: {
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
    lineHeight: 18,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: isSmallDevice ? 42 : 46,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    height: '100%',
  },
  categoryScroll: {
    paddingVertical: 2,
    gap: 8,
    flexDirection: 'row',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: moderateScale(12),
  },
  listContent: {
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingTop: 8,
    gap: 12,
  },
  featureCard: {
    borderRadius: 20,
    padding: isSmallDevice ? 14 : 16,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  cardHeaderRow: {
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
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    marginTop: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: moderateScale(isSmallDevice ? 15 : 16),
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: moderateScale(isSmallDevice ? 11.5 : 12.5),
    lineHeight: 17,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
