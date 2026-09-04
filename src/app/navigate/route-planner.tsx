import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { RouteOption } from '@/types';
import { moderateScale, isSmallDevice } from '@/utils/responsive';

type TransportMode = 'Car' | 'Two-Wheeler' | 'Walking' | 'Bicycle';

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: any; multiplier: number }[] = [
  { id: 'Car', label: 'Car', icon: 'car', multiplier: 1.0 },
  { id: 'Two-Wheeler', label: '2W Bike', icon: 'motorcycle', multiplier: 0.8 },
  { id: 'Walking', label: 'Walk', icon: 'walking', multiplier: 4.5 },
  { id: 'Bicycle', label: 'Bicycle', icon: 'bicycle', multiplier: 2.2 },
];

const MOCK_ROUTES: RouteOption[] = [
  {
    id: 'route-fastest',
    name: 'Via Delhi-Gurugram Expressway & NH-48',
    durationMinutes: 38,
    distanceKm: 24.2,
    eta: '04:15 PM',
    hasFastagToll: true,
    tollFee: 85,
    tollPlazaCount: 1,
    glosaAdvisedSpeedKmh: 50,
    trafficLevel: 'moderate',
    viaRoad: 'NH-48 • Fastest Route with FASTag',
    coordinates: [
      { latitude: 28.6139, longitude: 77.2090 },
      { latitude: 28.4952, longitude: 77.0891 },
    ],
  },
  {
    id: 'route-no-toll',
    name: 'Via Mehrauli-Gurgaon Road (Toll-Free)',
    durationMinutes: 52,
    distanceKm: 27.8,
    eta: '04:29 PM',
    hasFastagToll: false,
    tollFee: 0,
    tollPlazaCount: 0,
    glosaAdvisedSpeedKmh: 40,
    trafficLevel: 'heavy',
    viaRoad: 'MG Road • Avoids All Toll Plazas',
    coordinates: [
      { latitude: 28.6139, longitude: 77.2090 },
      { latitude: 28.4812, longitude: 77.1021 },
    ],
  },
  {
    id: 'route-alternate',
    name: 'Via Dwarka Expressway (NH-248BB)',
    durationMinutes: 44,
    distanceKm: 29.5,
    eta: '04:21 PM',
    hasFastagToll: true,
    tollFee: 70,
    tollPlazaCount: 1,
    glosaAdvisedSpeedKmh: 60,
    trafficLevel: 'low',
    viaRoad: 'Dwarka Expressway • Less Traffic',
    coordinates: [
      { latitude: 28.6139, longitude: 77.2090 },
      { latitude: 28.5200, longitude: 77.0200 },
    ],
  },
];

export default function RoutePlannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destTitle?: string;
    destLat?: string;
    destLng?: string;
    destDigipin?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [origin, setOrigin] = useState('Your Current Location (Connaught Place)');
  const [destination, setDestination] = useState(params.destTitle || 'DLF CyberCity Hub, Gurugram');
  const [selectedMode, setSelectedMode] = useState<TransportMode>('Car');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-fastest');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const activeModeMultiplier = TRANSPORT_MODES.find(m => m.id === selectedMode)?.multiplier || 1.0;

  const handleStartNavigation = (route: RouteOption) => {
    router.push({
      pathname: '/navigate/live' as any,
      params: {
        routeId: route.id,
        routeName: route.name,
        durationMinutes: Math.round(route.durationMinutes * activeModeMultiplier).toString(),
        distanceKm: route.distanceKm.toString(),
        hasFastagToll: route.hasFastagToll ? 'true' : 'false',
        tollFee: (route.tollFee || 0).toString(),
        transportMode: selectedMode,
        destTitle: destination,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar title="Route Planner" subtitle="Multi-modal distance matrix" />

      {/* Input Block with Vertical Route Line Graphic & Swap Button */}
      <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.routeGraphicContainer}>
          <View style={[styles.dotCircle, { backgroundColor: '#1E88E5' }]} />
          <View style={[styles.connectingLine, { backgroundColor: colors.border }]} />
          <View style={[styles.dotCircle, { backgroundColor: BMapColors.primary }]} />
        </View>

        <View style={styles.inputsColumn}>
          {/* Origin Input */}
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={origin}
              onChangeText={setOrigin}
              placeholder="Choose starting point"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Destination Input */}
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={destination}
              onChangeText={setDestination}
              placeholder="Choose destination"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSwap}
          style={[styles.swapButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
        >
          <Ionicons name="swap-vertical" size={20} color={BMapColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Transport Mode Selector (Segmented Bar) */}
      <View style={styles.modeBarContainer}>
        {TRANSPORT_MODES.map(mode => {
          const isSelected = selectedMode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              activeOpacity={0.8}
              onPress={() => setSelectedMode(mode.id)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: isSelected ? BMapColors.primary : colors.surface,
                  borderColor: isSelected ? BMapColors.primary : colors.border,
                },
              ]}
            >
              <FontAwesome5
                name={mode.icon}
                size={16}
                color={isSelected ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Route Cards List */}
      <FlatList
        data={MOCK_ROUTES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.routesList}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={({ item }) => {
          const isSelected = selectedRouteId === item.id;
          const adjustedDuration = Math.round(item.durationMinutes * activeModeMultiplier);

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedRouteId(item.id)}
              style={[
                styles.routeCard,
                {
                  backgroundColor: isSelected ? (isDark ? '#1C2834' : '#FFF9F5') : colors.surface,
                  borderColor: isSelected ? BMapColors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View style={styles.routeCardHeader}>
                <View style={styles.timeCluster}>
                  <Text style={[styles.durationText, BMapTypography.headlineMedium, { color: colors.text }]}>
                    {adjustedDuration} mins
                  </Text>
                  <Text style={[styles.distanceText, BMapTypography.bodyMedium, { color: colors.textSecondary }]}>
                    ({item.distanceKm} km)
                  </Text>
                </View>

                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>ETA {item.eta}</Text>
                </View>
              </View>

              <Text style={[styles.viaRoadText, { color: colors.text }]}>
                {item.name}
              </Text>

              {/* FASTag Toll Warning Tag */}
              <View style={styles.tagsRow}>
                {item.hasFastagToll ? (
                  <View style={[styles.tagPill, { backgroundColor: BMapColors.fastagPurpleLight }]}>
                    <MaterialCommunityIcons name="card-bulleted" size={14} color={BMapColors.fastagPurple} />
                    <Text style={[styles.tagPillText, { color: BMapColors.fastagPurple }]}>
                      FASTag Required: ₹{item.tollFee} ({item.tollPlazaCount} Toll Plaza)
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.tagPill, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                    <Text style={[styles.tagPillText, { color: '#2E7D32' }]}>Toll-Free Route</Text>
                  </View>
                )}

                {/* GLOSA Green Wave Tag */}
                {item.glosaAdvisedSpeedKmh && (
                  <View style={[styles.tagPill, { backgroundColor: BMapColors.glosaGreenBg }]}>
                    <Ionicons name="speedometer" size={14} color={BMapColors.glosaGreen} />
                    <Text style={[styles.tagPillText, { color: BMapColors.glosaGreen }]}>
                      GLOSA: {item.glosaAdvisedSpeedKmh} km/h
                    </Text>
                  </View>
                )}
              </View>

              {/* Action: Start Navigation */}
              {isSelected && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleStartNavigation(item)}
                  style={[styles.startButton, { backgroundColor: BMapColors.primary }]}
                >
                  <Ionicons name="navigate" size={18} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Start Turn-by-Turn Navigation</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputCard: {
    margin: 16,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...BMapElevation.level2,
  },
  routeGraphicContainer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dotCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectingLine: {
    width: 2,
    height: 28,
  },
  inputsColumn: {
    flex: 1,
    gap: 10,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 13,
    fontWeight: '500',
  },
  swapButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 10 : 16,
    gap: isSmallDevice ? 4 : 8,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 4 : 6,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 18 : 20,
    borderWidth: 1,
    paddingHorizontal: 2,
  },
  modeLabel: {
    fontSize: moderateScale(isSmallDevice ? 10 : 12),
  },
  routesList: {
    padding: isSmallDevice ? 12 : 16,
    gap: isSmallDevice ? 10 : 14,
  },
  routeCard: {
    borderRadius: 18,
    padding: isSmallDevice ? 12 : 16,
    gap: 10,
    ...BMapElevation.level2,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeCluster: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  durationText: {
    fontWeight: '800',
  },
  distanceText: {
    fontSize: 14,
  },
  etaBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etaText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  viaRoadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  startButton: {
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    ...BMapElevation.level2,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
