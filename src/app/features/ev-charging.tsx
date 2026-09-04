import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { BMapView, BMapMarkerItem } from '@/components/BMapView';
import { EVStation } from '@/types';
import { EV_STATIONS_DATA } from '@/services/evData';
import { SCREEN_WIDTH, isSmallDevice, moderateScale } from '@/utils/responsive';

const CARD_WIDTH = isSmallDevice ? SCREEN_WIDTH * 0.88 : SCREEN_WIDTH * 0.82;
const CARD_SPACING = 12;

type ConnectorType = 'CCS2' | 'Type2_AC' | 'CHAdeMO' | 'GB/T' | '2W_3W_Swap';

const CONNECTOR_OPTIONS: { id: ConnectorType; label: string; desc: string }[] = [
  { id: 'CCS2', label: 'CCS-2 Combo', desc: 'Fast DC Charging (Cars/SUVs)' },
  { id: 'Type2_AC', label: 'Type-2 AC', desc: 'Standard AC Slow Charging' },
  { id: 'CHAdeMO', label: 'CHAdeMO', desc: 'Japanese Standard DC Fast' },
  { id: 'GB/T', label: 'GB/T Fast DC', desc: 'Commercial Fleets & Cabs' },
  { id: '2W_3W_Swap', label: '2W / 3W Battery Swap', desc: 'Ather / Bounce / Battery Smart' },
];

export default function EVChargingRadarScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorType[]>([
    'CCS2',
    'Type2_AC',
    '2W_3W_Swap',
  ]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  // Filter stations based on selected connectors
  const filteredStations = useMemo(() => {
    if (selectedConnectors.length === 0) return EV_STATIONS_DATA;
    return EV_STATIONS_DATA.filter(station =>
      station.connectors.some(c => selectedConnectors.includes(c as ConnectorType))
    );
  }, [selectedConnectors]);

  const mapMarkers: BMapMarkerItem[] = useMemo(() => {
    return filteredStations.map((station, idx) => ({
      id: station.id,
      coordinate: station.coordinates,
      title: `${station.availablePorts}/${station.totalPorts} Ports`,
      category: 'ev',
      data: station,
    }));
  }, [filteredStations]);

  const toggleConnector = (connector: ConnectorType) => {
    if (selectedConnectors.includes(connector)) {
      setSelectedConnectors(selectedConnectors.filter(c => c !== connector));
    } else {
      setSelectedConnectors([...selectedConnectors, connector]);
    }
  };

  const handleMarkerPress = (marker: BMapMarkerItem) => {
    const station = marker.data as EVStation;
    const idx = filteredStations.findIndex(s => s.id === station.id);
    if (idx >= 0) {
      setSelectedStationIndex(idx);
      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="EV Charging Radar"
        subtitle="Live Indian charging stations & battery swap"
        accentColor={BMapColors.evCyan}
        rightActionIcon="filter"
        onRightActionPress={() => setIsFilterModalVisible(true)}
      />

      {/* Split Layout: Top 60% Map with EV pins */}
      <View style={styles.topMapContainer}>
        <BMapView
          mapStyleType={isDark ? 'dark' : 'daylight'}
          markers={mapMarkers}
          onMarkerPress={handleMarkerPress}
        />

        {/* Floating Active Filter Summary Badge */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsFilterModalVisible(true)}
          style={[styles.floatingFilterBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="options-outline" size={16} color={BMapColors.evCyan} />
          <Text style={[styles.filterBadgeText, { color: colors.text }]}>
            {selectedConnectors.length} Connector Types Selected
          </Text>
        </TouchableOpacity>
      </View>

      {/* Split Layout: Bottom 40% Horizontally Paged FlatList with Station Cards */}
      <View style={[styles.bottomListContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.listHeader}>
          <Text style={[styles.listHeaderTitle, BMapTypography.titleMedium, { color: colors.text }]}>
            Nearby Charging Hubs ({filteredStations.length})
          </Text>
          <Text style={[styles.liveStatusBadge, { color: '#00875A' }]}>● Live Telemetry</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredStations}
          horizontal={true}
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
          keyExtractor={item => item.id}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item, index }) => {
            const isAvailable = item.availablePorts > 0;

            return (
              <View
                style={[
                  styles.stationCard,
                  {
                    width: CARD_WIDTH,
                    backgroundColor: isDark ? '#16222F' : '#FFFFFF',
                    borderColor: index === selectedStationIndex ? BMapColors.evCyan : colors.border,
                    borderWidth: index === selectedStationIndex ? 2 : 1,
                  },
                ]}
              >
                {/* Station Top Row: Brand & Distance */}
                <View style={styles.stationTopRow}>
                  <View style={styles.brandCluster}>
                    <View style={[styles.brandIconBox, { backgroundColor: '#E0F7FA' }]}>
                      <Ionicons name="flash" size={16} color={BMapColors.evCyan} />
                    </View>
                    <View>
                      <Text style={[styles.brandName, { color: BMapColors.evCyan }]}>{item.network}</Text>
                      <Text style={[styles.stationTitle, BMapTypography.titleSmall, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{item.distanceKm} km</Text>
                  </View>
                </View>

                {/* Real-Time Available Ports Badge in Green */}
                <View style={styles.portsAvailabilityRow}>
                  <View
                    style={[
                      styles.portBadge,
                      { backgroundColor: isAvailable ? '#E8F5E9' : '#FFEBEE' },
                    ]}
                  >
                    <Ionicons
                      name={isAvailable ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={isAvailable ? '#2E7D32' : '#C62828'}
                    />
                    <Text
                      style={[
                        styles.portBadgeText,
                        { color: isAvailable ? '#2E7D32' : '#C62828' },
                      ]}
                    >
                      {item.availablePorts}/{item.totalPorts} Available
                    </Text>
                  </View>

                  <View style={styles.powerPill}>
                    <Text style={styles.powerText}>{item.maxPowerKw} kW DC Fast</Text>
                  </View>
                </View>

                {/* Connector Tags */}
                <View style={styles.connectorsCluster}>
                  {item.connectors.map((c: string) => (
                    <View key={c} style={[styles.connectorChip, { backgroundColor: colors.surfaceVariant }]}>
                      <Text style={[styles.connectorChipText, { color: colors.textSecondary }]}>
                        {c.replace('_', ' ')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Bottom Action: Navigate */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: '/navigate/route-planner' as any,
                      params: {
                        destTitle: item.name,
                        destLat: item.coordinates.latitude.toString(),
                        destLng: item.coordinates.longitude.toString(),
                      },
                    });
                  }}
                  style={[styles.navigateBtn, { backgroundColor: BMapColors.evCyan }]}
                >
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                  <Text style={styles.navigateBtnText}>Navigate to EV Charger (₹{item.costPerKwh}/kWh)</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {/* Filter Modal for Connector Types */}
      <Modal visible={isFilterModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                EV Connector Filters
              </Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              {CONNECTOR_OPTIONS.map(opt => {
                const isSelected = selectedConnectors.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => toggleConnector(opt.id)}
                    style={[
                      styles.connectorOptionRow,
                      {
                        backgroundColor: isSelected ? '#E0F7FA' : colors.surfaceVariant,
                        borderColor: isSelected ? BMapColors.evCyan : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.connectorOptionTextGroup}>
                      <Text style={[styles.connectorOptionTitle, { color: colors.text }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.connectorOptionDesc, { color: colors.textSecondary }]}>
                        {opt.desc}
                      </Text>
                    </View>

                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={isSelected ? BMapColors.evCyan : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setIsFilterModalVisible(false)}
              style={[styles.applyBtn, { backgroundColor: BMapColors.evCyan }]}
            >
              <Text style={styles.applyBtnText}>Apply EV Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topMapContainer: {
    flex: 6, // Top 60%
    position: 'relative',
  },
  floatingFilterBadge: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    ...BMapElevation.level2,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomListContainer: {
    flex: 4, // Bottom 40%
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    gap: 8,
    ...BMapElevation.level3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  listHeaderTitle: {
    fontWeight: '700',
  },
  liveStatusBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardsScroll: {
    paddingHorizontal: 16,
    gap: CARD_SPACING,
    paddingBottom: 16,
  },
  stationCard: {
    borderRadius: 20,
    padding: 14,
    gap: 10,
    ...BMapElevation.level1,
  },
  stationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  stationTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  distanceBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
  portsAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  portBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  powerPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  powerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  connectorsCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  connectorChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  connectorChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  navigateBtn: {
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    gap: 10,
  },
  connectorOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  connectorOptionTextGroup: {
    flex: 1,
    gap: 2,
  },
  connectorOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  connectorOptionDesc: {
    fontSize: 12,
  },
  applyBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
