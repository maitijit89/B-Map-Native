import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  ArrowLeft,
  X,
  Mic,
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
  TrendingUp,
} from 'lucide-react-native';

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
    name: 'Fortis Memorial Research Institute',
    address: 'Sector 44, Opp HUDA City Centre, Gurugram',
    category: 'Hospital & Emergency',
    distance: '3.6 km',
    digiPin: '28J4-M3N4-5P',
    pincode: '122002',
    rating: '4.7★',
    isOpen: true,
  },
  {
    id: '6',
    name: 'Mannat Haveli Pure Veg Dhaba',
    address: 'NH-48 Jaipur Highway, km 54, Dharuhera',
    category: 'Highway Dining',
    distance: '32.1 km',
    digiPin: '28J4-M1K9-7P',
    pincode: '123106',
    rating: '4.8★',
    isOpen: true,
  },
];

const CATEGORY_SHORTCUTS = [
  { label: 'EV Fast Charge', icon: Zap, color: '#0096FF' },
  { label: 'Fuel Pumps', icon: Fuel, color: '#FF9800' },
  { label: 'Metro Stations', icon: TrainFront, color: '#9C27B0' },
  { label: 'Highway Dining', icon: Utensils, color: '#F44336' },
  { label: 'Hospitals', icon: Hospital, color: '#E91E63' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [recentList, setRecentList] = useState(RECENT_SEARCHES);

  const filteredResults = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.address.toLowerCase().includes(query.toLowerCase()) ||
          item.pincode.includes(query) ||
          item.digiPin.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectResult = (result: SearchResult) => {
    // Add to recent searches
    if (!recentList.includes(result.name)) {
      setRecentList([result.name, ...recentList.slice(0, 4)]);
    }
    // Launch navigation
    router.push('/modal');
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Search Header Bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#111C2D" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#0096FF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search address, 6-digit Pincode, DigiPIN..."
            placeholderTextColor="#707884"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={handleClearQuery} style={styles.clearBtn}>
              <X size={16} color="#707884" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push('/ai-copilot')} style={styles.micBtn}>
              <Mic size={18} color="#0096FF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* If Query entered, show Search Results */}
        {query.trim().length > 0 ? (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Found {filteredResults.length} matching places in sovereign database
              </Text>
            </View>

            {filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultCard}
                  onPress={() => handleSelectResult(item)}
                  activeOpacity={0.8}>
                  <View style={styles.resultIconBox}>
                    <MapPin size={18} color="#0096FF" />
                  </View>

                  <View style={styles.resultInfo}>
                    <View style={styles.resultTitleRow}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      {item.rating && <Text style={styles.resultRating}>{item.rating}</Text>}
                    </View>
                    <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>

                    <View style={styles.resultMetaRow}>
                      <View style={styles.digiBadge}>
                        <Text style={styles.digiBadgeText}>DigiPIN: {item.digiPin}</Text>
                      </View>
                      <View style={styles.pinBadge}>
                        <Text style={styles.pinBadgeText}>PIN: {item.pincode}</Text>
                      </View>
                      <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.navActionBtn}
                    onPress={() => router.push('/modal')}>
                    <Navigation size={14} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {'No exact matching coordinates found for "' + query + '".'}
                </Text>
                <TouchableOpacity
                  style={styles.aiHelpBtn}
                  onPress={() => router.push('/ai-copilot')}>
                  <Sparkles size={16} color="#0096FF" />
                  <Text style={styles.aiHelpText}>Ask B-Map AI Voice Copilot</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Empty Search State: Categories & Recent Searches */
          <>
            {/* Quick Category Shortcuts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Find Nearby Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTrack}>
                {CATEGORY_SHORTCUTS.map((cat, idx) => {
                  const IconComp = cat.icon;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.categoryChip}
                      onPress={() => setQuery(cat.label)}
                      activeOpacity={0.8}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '15' }]}>
                        <IconComp size={16} color={cat.color} />
                      </View>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sovereign Address Formats Notice */}
            <View style={styles.sovereignNotice}>
              <Sparkles size={16} color="#0096FF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sovereignNoticeTitle}>Supported Sovereign Address Standards</Text>
                <Text style={styles.sovereignNoticeSub}>
                  Enter standard addresses, 6-digit postal PIN codes (e.g. 110001), or 10-char DigiPIN grid codes (e.g. 28J4-K8M2-9P).
                </Text>
              </View>
            </View>

            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <Clock size={16} color="#707884" />
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                </View>
                <TouchableOpacity onPress={() => setRecentList([])}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {recentList.map((recent, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.recentItem}
                  onPress={() => setQuery(recent.split(' ')[0])}
                  activeOpacity={0.7}>
                  <Clock size={14} color="#A0A8B4" />
                  <Text style={styles.recentText}>{recent}</Text>
                  <ChevronRight size={14} color="#D0E4FF" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Trending High-Traffic Corridors */}
            <View style={styles.section}>
              <View style={styles.sectionTitleWithIcon}>
                <TrendingUp size={16} color="#00C06D" />
                <Text style={styles.sectionTitle}>Trending Expressways & Corridors</Text>
              </View>

              {[
                { name: 'NH-48 Delhi-Jaipur Highway Corridor', toll: '₹435 · 3 Plazas', traffic: 'Moderate' },
                { name: 'Yamuna Expressway (Greater Noida to Agra)', toll: '₹415 · FASTag 100%', traffic: 'Light Fog' },
                { name: 'Delhi-Mumbai Expressway (NE-4 Sohna Segment)', toll: '₹220 · 120 km/h', traffic: 'Free Flow' },
              ].map((corridor, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.corridorCard}
                  onPress={() => setQuery(corridor.name)}
                  activeOpacity={0.8}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.corridorName}>{corridor.name}</Text>
                    <Text style={styles.corridorToll}>{corridor.toll}</Text>
                  </View>
                  <View style={styles.corridorTrafficBadge}>
                    <Text style={styles.corridorTrafficText}>{corridor.traffic}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111C2D',
    padding: 0,
  },
  clearBtn: { padding: 4 },
  micBtn: { padding: 4 },

  scroll: { padding: 16, gap: 16 },

  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  clearAllText: { fontSize: 11, fontWeight: '700', color: '#0096FF' },

  categoryTrack: { gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    gap: 8,
  },
  categoryIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#111C2D' },

  sovereignNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E8F4FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  sovereignNoticeTitle: { fontSize: 12, fontWeight: '700', color: '#0061A7' },
  sovereignNoticeSub: { fontSize: 11, color: '#326B99', marginTop: 2, lineHeight: 16 },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FF',
    gap: 10,
  },
  recentText: { flex: 1, fontSize: 13, color: '#3F4753' },

  corridorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    marginBottom: 6,
  },
  corridorName: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  corridorToll: { fontSize: 11, color: '#707884', marginTop: 2 },
  corridorTrafficBadge: { backgroundColor: '#E8F8EE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  corridorTrafficText: { fontSize: 10, fontWeight: '700', color: '#00C06D' },

  /* Search Results */
  resultsSection: { gap: 10 },
  resultsHeader: { paddingBottom: 4 },
  resultsCount: { fontSize: 11, fontWeight: '600', color: '#707884' },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  resultIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: 14, fontWeight: '700', color: '#111C2D' },
  resultRating: { fontSize: 11, fontWeight: '700', color: '#FF9800' },
  resultAddress: { fontSize: 11, color: '#707884', marginTop: 1 },
  resultMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  digiBadge: { backgroundColor: '#0096FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  digiBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', fontFamily: 'monospace' },
  pinBadge: { backgroundColor: '#F0F4FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  pinBadgeText: { fontSize: 8, fontWeight: '700', color: '#0061A7' },
  distanceText: { fontSize: 10, fontWeight: '700', color: '#707884' },
  navActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0096FF', alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyStateText: { fontSize: 13, color: '#707884', textAlign: 'center' },
  aiHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  aiHelpText: { fontSize: 12, fontWeight: '700', color: '#0096FF' },
});
