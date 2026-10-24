import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { haptics } from '@/shared/utils/haptics';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  Fuel,
  Zap,
  TrainFront,
  Utensils,
  Hospital,
  Sparkles,
  ChevronRight,
  Search,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Card,
  Chip,
  Badge,
  SearchBar,
  SectionHeader,
  EmptyState,
} from '@/shared/components/ui';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  category: string;
  distance: string;
  digiPin: string;
  pincode: string;
  rating?: string;
  isOpen?: boolean;
}

const RECENT_SEARCHES = [
  'Cyber Hub, Gurugram',
  'Connaught Place, New Delhi',
  '110001 (Pincode Central Delhi)',
  '28J4-K8M2-9P (DigiPIN)',
  'Murthal Dhabas NH-44',
];

const SEARCH_DATABASE: SearchResult[] = [
  {
    id: '1',
    name: 'DLF Cyber Hub',
    address: 'DLF Phase 2, Sector 24, Gurugram, Haryana',
    category: 'Commercial & Dining',
    distance: '1.2 km',
    digiPin: '28J4-K8M2-9P',
    pincode: '122002',
    rating: '4.8★',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Connaught Place (Rajiv Chowk)',
    address: 'Central Delhi, New Delhi',
    category: 'Metro & Heritage Hub',
    distance: '24.8 km',
    digiPin: '28J4-C2M1-4K',
    pincode: '110001',
    rating: '4.7★',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Indian Oil Petrol Pump & EV Supercharger',
    address: 'NH-48 Corridor, Sector 31, Gurugram',
    category: 'Fuel & EV Hub',
    distance: '2.8 km',
    digiPin: '28J4-F9G8-1H',
    pincode: '122001',
    rating: '4.6★',
    isOpen: true,
  },
  {
    id: '4',
    name: 'Indira Gandhi International Airport (T3)',
    address: 'Palam, New Delhi',
    category: 'Airport & Transit',
    distance: '11.4 km',
    digiPin: '28J3-H7K1-8X',
    pincode: '110037',
    rating: '4.9★',
    isOpen: true,
  },
  {
    id: '5',
    name: 'Apollo Hospital & 24/7 Trauma Center',
    address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi',
    category: 'Hospital & Emergency',
    distance: '18.2 km',
    digiPin: '28J3-M4N5-2A',
    pincode: '110076',
    rating: '4.7★',
    isOpen: true,
  },
  {
    id: '6',
    name: 'Amrik Sukhdev Dhaba',
    address: 'NH-44 GT Karnal Road, Murthal, Haryana',
    category: 'Highway Dining',
    distance: '62.0 km',
    digiPin: '29K1-B5C6-9D',
    pincode: '131027',
    rating: '4.6★',
    isOpen: true,
  },
];

const CATEGORY_SHORTCUTS = [
  { label: 'EV Superchargers', icon: Zap },
  { label: 'Petrol & Diesel', icon: Fuel },
  { label: 'Metro Stations', icon: TrainFront },
  { label: 'Highway Dhabas', icon: Utensils },
  { label: '24/7 Hospitals', icon: Hospital },
];

export default function SearchScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [recentList, setRecentList] = useState(RECENT_SEARCHES);

  const handleSelectResult = (_result: SearchResult) => {
    haptics.selection();
    router.push('/(tabs)/routes');
  };

  const filteredResults = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.address.toLowerCase().includes(query.toLowerCase()) ||
          item.pincode.includes(query) ||
          item.digiPin.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Search Header */}
      <View
        style={[
          styles.searchHeader,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            haptics.light();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search places, PIN, DigiPIN..."
            autoFocus
            variant="flat"
            onClear={() => setQuery('')}
            onMicPress={() => {
              haptics.medium();
              router.push('/ai-copilot');
            }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Results List */}
        {query.trim().length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsCount, { color: colors.onSurfaceVariant }]}>
              {filteredResults.length} Sovereign Location Match
              {filteredResults.length === 1 ? '' : 'es'}
            </Text>

            {filteredResults.map((result, idx) => (
              <Animated.View
                key={result.id}
                entering={FadeInDown.delay(Math.min(idx * 50, 300)).duration(300).springify().damping(16)}>
                <Card
                  variant="outlined"
                  padding="md"
                  onPress={() => handleSelectResult(result)}
                  accessibilityLabel={`Select ${result.name}`}
                  style={styles.resultCard}>
                  <View style={styles.resultLeft}>
                    <View
                      style={[
                        styles.resultIconBox,
                        { backgroundColor: colors.surfaceContainerLow },
                      ]}>
                      <MapPin size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.resultTitleRow}>
                        <Text style={[styles.resultName, { color: colors.onSurface }]}>
                          {result.name}
                        </Text>
                        {result.rating && (
                          <Badge label={result.rating} variant="warning" size="sm" />
                        )}
                      </View>
                      <Text
                        style={[styles.resultAddress, { color: colors.onSurfaceVariant }]}
                        numberOfLines={1}>
                        {result.address}
                      </Text>

                      <View style={styles.resultMetaRow}>
                        <Badge
                          label={`DigiPIN: ${result.digiPin}`}
                          variant="primary"
                          size="sm"
                        />
                        <Text style={[styles.metaDistance, { color: colors.onSurfaceVariant }]}>
                          {result.distance}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.routeActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleSelectResult(result)}
                    accessibilityRole="button"
                    accessibilityLabel={`Route to ${result.name}`}>
                    <Navigation size={14} color={colors.onPrimary} />
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            ))}

            {filteredResults.length === 0 && (
              <EmptyState
                icon={<Search size={28} color={colors.outline} />}
                title="No Results Found"
                message="Try entering a nearby landmark, postal PIN code, or 10-character DigiPIN sovereign grid code."
                actionLabel="Explore DigiPINs"
                onAction={() => router.push('/digipin-explorer')}
              />
            )}
          </View>
        ) : (
          <>
            {/* Quick Category Carousel */}
            <View style={styles.section}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTrack}>
                {CATEGORY_SHORTCUTS.map((cat, idx) => {
                  const IconComp = cat.icon;
                  return (
                    <Chip
                      key={idx}
                      label={cat.label}
                      icon={<IconComp size={16} color={colors.primary} />}
                      onPress={() => {
                        haptics.selection();
                        setQuery(cat.label);
                      }}
                      size="md"
                    />
                  );
                })}
              </ScrollView>
            </View>

            {/* Sovereign Address Formats Notice */}
            <Card variant="outlined" padding="md" style={styles.sovereignNotice}>
              <Sparkles size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sovereignNoticeTitle, { color: colors.onSurface }]}>
                  Supported Sovereign Address Standards
                </Text>
                <Text style={[styles.sovereignNoticeSub, { color: colors.onSurfaceVariant }]}>
                  Enter standard addresses, 6-digit postal PIN codes (e.g. 110001), or 10-char DigiPIN grid codes (e.g. 28J4-K8M2-9P).
                </Text>
              </View>
            </Card>

            {/* Recent Searches */}
            <View style={styles.section}>
              <SectionHeader
                title="Recent Searches"
                actionText="Clear All"
                onActionPress={() => {
                  haptics.selection();
                  setRecentList([]);
                }}
              />

              <View style={styles.recentListContainer}>
                {recentList.map((recent, idx) => (
                  <Animated.View
                    key={recent}
                    entering={FadeInDown.delay(Math.min(idx * 40, 240)).duration(260).springify().damping(18)}>
                    <TouchableOpacity
                      style={[
                        styles.recentItem,
                        {
                          backgroundColor: colors.surfaceContainerLowest,
                          borderColor: colors.surfaceContainerHigh,
                        },
                      ]}
                      onPress={() => {
                        haptics.selection();
                        setQuery(recent.split(' ')[0]);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Search recent: ${recent}`}
                      activeOpacity={0.7}>
                      <Clock size={14} color={colors.outline} />
                      <Text style={[styles.recentText, { color: colors.onSurface }]}>{recent}</Text>
                      <ChevronRight size={14} color={colors.outline} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Trending High-Traffic Corridors */}
            <View style={styles.section}>
              <SectionHeader
                title="Trending Expressways & Corridors"
                subtitle="Live status & FASTag tolls"
              />

              {[
                { name: 'NH-48 Delhi-Jaipur Highway Corridor', toll: '₹435 · 3 Plazas', traffic: 'Moderate' },
                { name: 'Yamuna Expressway (Greater Noida to Agra)', toll: '₹415 · FASTag 100%', traffic: 'Light Fog' },
                { name: 'Delhi-Mumbai Expressway (NE-4 Sohna Segment)', toll: '₹220 · 120 km/h', traffic: 'Free Flow' },
              ].map((corridor, idx) => (
                <Card
                  key={idx}
                  variant="outlined"
                  padding="md"
                  onPress={() => {
                    haptics.selection();
                    setQuery(corridor.name);
                  }}
                  accessibilityLabel={`Corridor ${corridor.name}`}
                  style={styles.corridorCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.corridorName, { color: colors.onSurface }]}>
                      {corridor.name}
                    </Text>
                    <Text style={[styles.corridorToll, { color: colors.onSurfaceVariant }]}>
                      {corridor.toll}
                    </Text>
                  </View>
                  <Badge label={corridor.traffic} variant="primary" size="sm" />
                </Card>
              ))}
            </View>
          </>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Shadows.xs,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  categoryTrack: {
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sovereignNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sovereignNoticeTitle: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  sovereignNoticeSub: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  recentListContainer: {
    gap: Spacing.xs + 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  recentText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  corridorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  corridorName: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  corridorToll: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  resultsContainer: {
    gap: 10,
  },
  resultsCount: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultName: {
    ...Typography.titleSmall,
    fontWeight: '700',
    flex: 1,
  },
  resultAddress: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 1,
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaDistance: {
    ...Typography.bodySmall,
    fontSize: 10,
    fontWeight: '600',
  },
  routeActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
