import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LatLng, PlaceCategory } from '@/types';
import { BMapColors, BMapAnimation } from '@/constants/bmap-theme';

export interface BMapMarkerItem {
  id: string;
  coordinate: LatLng;
  title: string;
  description?: string;
  category?: PlaceCategory;
  pinColor?: string;
  data?: any;
}

export interface BMapPolylineItem {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  isDashed?: boolean;
}

interface BMapViewProps {
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: BMapMarkerItem[];
  polylines?: BMapPolylineItem[];
  mapStyleType?: 'daylight' | 'dark' | 'satellite' | 'terrain';
  showTrafficOverlay?: boolean;
  onMarkerPress?: (marker: BMapMarkerItem) => void;
  onMapPress?: () => void;
  style?: any;
  showCenterControl?: boolean;
  onCenterPress?: () => void;
}

export const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.2090,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface MarkerPinProps {
  marker: BMapMarkerItem;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isDark: boolean;
  onPress?: (marker: BMapMarkerItem) => void;
}

const getMarkerIcon = (category?: PlaceCategory) => {
  switch (category) {
    case 'ev':
      return <Ionicons name="flash" size={16} color="#FFFFFF" />;
    case 'toll':
      return <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#FFFFFF" />;
    case 'hazard':
      return <Ionicons name="warning" size={16} color="#FFFFFF" />;
    case 'sos':
    case 'hospital':
      return <Ionicons name="medical" size={16} color="#FFFFFF" />;
    case 'taxi':
      return <FontAwesome5 name="taxi" size={14} color="#000000" />;
    case 'user':
      return <Ionicons name="navigate" size={16} color="#FFFFFF" />;
    default:
      return <Ionicons name="location" size={16} color="#FFFFFF" />;
  }
};

const getMarkerBgColor = (category?: PlaceCategory) => {
  switch (category) {
    case 'ev':
      return BMapColors.evCyan;
    case 'toll':
      return BMapColors.fastagPurple;
    case 'hazard':
      return BMapColors.warningAmber;
    case 'sos':
    case 'hospital':
      return BMapColors.emergencyRed;
    case 'taxi':
      return '#FFD700';
    case 'user':
      return '#1E88E5';
    default:
      return BMapColors.primary;
  }
};

const MapMarkerPin = React.memo(function MapMarkerPin({
  marker,
  region,
  isDark,
  onPress,
}: MarkerPinProps) {
  const latDiff = (marker.coordinate.latitude - region.latitude) / region.latitudeDelta;
  const lngDiff = (marker.coordinate.longitude - region.longitude) / region.longitudeDelta;

  const topPercent = Math.max(10, Math.min(85, 50 - latDiff * 35));
  const leftPercent = Math.max(10, Math.min(85, 50 + lngDiff * 35));
  const isTaxi = marker.category === 'taxi';

  // Animated bounce on mount
  const markerScale = useSharedValue(0);

  useEffect(() => {
    markerScale.value = withSpring(1, BMapAnimation.bounceSpring);
  }, [markerScale]);

  const markerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markerScale.value * (isTaxi ? 0.9 : 1) }],
  }));

  const handlePress = () => {
    markerScale.value = withSequence(
      withSpring(1.25, { damping: 6, stiffness: 400 }),
      withSpring(1, BMapAnimation.pressSpring)
    );
    onPress?.(marker);
  };

  return (
    <Animated.View
      style={[
        styles.markerPin,
        {
          top: `${topPercent}%` as any,
          left: `${leftPercent}%` as any,
          backgroundColor: getMarkerBgColor(marker.category),
        },
        markerAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.markerTouchable}
      >
        {getMarkerIcon(marker.category)}
      </TouchableOpacity>
      {marker.title ? (
        <View style={[styles.markerCallout, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <Text
            numberOfLines={1}
            style={[styles.markerTitle, { color: isDark ? '#FFFFFF' : '#1E293B' }]}
          >
            {marker.title}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
});

/** Animated user location pulse ring */
function UserLocationPulse() {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [pulseOpacity, pulseScale]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.userLocationMarker} pointerEvents="none">
      <Animated.View style={[styles.userPulseRing, pulseAnimatedStyle]} />
      <View style={styles.userCoreDot}>
        <Ionicons name="navigate" size={12} color="#FFFFFF" />
      </View>
    </View>
  );
}

// Universal high-fidelity map visualizer (Memoized for 60fps performance on 3GB RAM devices)
function BMapViewComponent({
  region = DEFAULT_REGION,
  markers = [],
  polylines = [],
  mapStyleType = 'daylight',
  showTrafficOverlay = false,
  onMarkerPress,
  onMapPress,
  style,
}: BMapViewProps) {
  const isDark = mapStyleType === 'dark';
  const isSatellite = mapStyleType === 'satellite';
  const isTerrain = mapStyleType === 'terrain';

  const getBackgroundColor = () => {
    if (isDark) return '#0D1B2A';
    if (isSatellite) return '#1A2F1E';
    if (isTerrain) return '#E8E4D9';
    return '#EBF2F7'; // Daylight crisp map tone
  };

  const getGridRoadColor = () => {
    if (isDark) return 'rgba(65, 90, 119, 0.4)';
    if (isSatellite) return 'rgba(255, 255, 255, 0.15)';
    if (isTerrain) return 'rgba(180, 160, 130, 0.5)';
    return '#FFFFFF';
  };

  const getArterialRoadColor = () => {
    if (isDark) return '#FF8A08';
    if (isSatellite) return '#FFB74D';
    if (isTerrain) return '#E0A96D';
    return '#FFD54F';
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      {/* Stylized Vector Grid / Map Terrain Visual */}
      <View style={styles.gridLayer} pointerEvents="none">
        {/* River/Water body decorative curve */}
        <View
          style={[
            styles.waterBody,
            { backgroundColor: isDark ? 'rgba(11, 37, 69, 0.85)' : isSatellite ? 'rgba(13, 59, 102, 0.85)' : 'rgba(187, 222, 251, 0.85)' },
          ]}
        />

        {/* Arterial Highways */}
        <View style={[styles.highwayHorizontal, { backgroundColor: getArterialRoadColor() }]}>
          {showTrafficOverlay && (
            <View style={styles.trafficFlowRow}>
              <View style={[styles.trafficFlowSegment, { flex: 0.45, backgroundColor: '#10B981' }]} />
              <View style={[styles.trafficFlowSegment, { flex: 0.35, backgroundColor: '#F59E0B' }]} />
              <View style={[styles.trafficFlowSegment, { flex: 0.20, backgroundColor: '#EF4444' }]} />
            </View>
          )}
        </View>

        <View style={[styles.highwayVertical, { backgroundColor: getArterialRoadColor() }]}>
          {showTrafficOverlay && (
            <View style={styles.trafficFlowCol}>
              <View style={[styles.trafficFlowSegment, { flex: 0.60, backgroundColor: '#10B981' }]} />
              <View style={[styles.trafficFlowSegment, { flex: 0.25, backgroundColor: '#F59E0B' }]} />
              <View style={[styles.trafficFlowSegment, { flex: 0.15, backgroundColor: '#10B981' }]} />
            </View>
          )}
        </View>

        <View style={[styles.highwayDiagonal, { backgroundColor: getGridRoadColor() }]}>
          {showTrafficOverlay && (
            <View style={styles.trafficFlowRow}>
              <View style={[styles.trafficFlowSegment, { flex: 0.70, backgroundColor: '#10B981' }]} />
              <View style={[styles.trafficFlowSegment, { flex: 0.30, backgroundColor: '#F59E0B' }]} />
            </View>
          )}
        </View>

        {/* Road Grid Patterns */}
        <View style={[styles.gridLineH1, { backgroundColor: getGridRoadColor() }]} />
        <View style={[styles.gridLineH2, { backgroundColor: getGridRoadColor() }]} />
        <View style={[styles.gridLineV1, { backgroundColor: getGridRoadColor() }]} />
        <View style={[styles.gridLineV2, { backgroundColor: getGridRoadColor() }]} />

        {/* Green Parks */}
        <View
          style={[
            styles.park1,
            { backgroundColor: isDark ? '#132A13' : isSatellite ? '#2D6A4F' : '#C8E6C9' },
          ]}
        >
          <Text style={[styles.areaLabel, { color: isDark ? '#74C69D' : '#2E7D32' }]}>Lodi Gardens</Text>
        </View>

        <View
          style={[
            styles.park2,
            { backgroundColor: isDark ? '#132A13' : isSatellite ? '#2D6A4F' : '#C8E6C9' },
          ]}
        >
          <Text style={[styles.areaLabel, { color: isDark ? '#74C69D' : '#2E7D32' }]}>Central Park</Text>
        </View>

        {/* Active Route Polylines visual */}
        {polylines.map((poly, idx) => (
          <View
            key={`poly-${idx}`}
            style={[
              styles.routePolylineGraphic,
              {
                borderColor: poly.strokeColor || BMapColors.primary,
                borderWidth: poly.strokeWidth || 4,
                borderStyle: poly.isDashed ? 'dashed' : 'solid',
              },
            ]}
          />
        ))}
      </View>

      {/* Interactive Markers */}
      <View style={styles.markerContainer} pointerEvents="box-none">
        {markers.map((marker, index) => (
          <MapMarkerPin
            key={marker.id || `marker-${index}`}
            marker={marker}
            region={region}
            isDark={isDark}
            onPress={onMarkerPress}
          />
        ))}

        {/* Animated User Pulse Location Marker */}
        <UserLocationPulse />
      </View>

      {/* Map Mode Badge */}
      <View style={styles.styleBadge}>
        <Text style={styles.styleBadgeText}>
          {mapStyleType.toUpperCase()} • INDIA SPATIAL GRID{showTrafficOverlay ? ' • TRAFFIC LIVE 🟢' : ''}
        </Text>
      </View>
    </View>
  );
}

export const BMapView = React.memo(BMapViewComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gridLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waterBody: {
    position: 'absolute',
    top: '15%',
    left: '-10%',
    width: '120%',
    height: 70,
    borderRadius: 35,
    transform: [{ rotate: '-18deg' }],
  },
  highwayHorizontal: {
    position: 'absolute',
    top: '48%',
    width: '100%',
    height: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  highwayVertical: {
    position: 'absolute',
    left: '52%',
    height: '100%',
    width: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  highwayDiagonal: {
    position: 'absolute',
    top: '20%',
    left: '-20%',
    width: '140%',
    height: 8,
    transform: [{ rotate: '35deg' }],
  },
  gridLineH1: {
    position: 'absolute',
    top: '28%',
    width: '100%',
    height: 6,
  },
  gridLineH2: {
    position: 'absolute',
    top: '72%',
    width: '100%',
    height: 6,
  },
  gridLineV1: {
    position: 'absolute',
    left: '25%',
    height: '100%',
    width: 6,
  },
  gridLineV2: {
    position: 'absolute',
    left: '78%',
    height: '100%',
    width: 6,
  },
  park1: {
    position: 'absolute',
    top: '55%',
    left: '12%',
    width: 110,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  park2: {
    position: 'absolute',
    top: '25%',
    right: '12%',
    width: 95,
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  areaLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  routePolylineGraphic: {
    position: 'absolute',
    top: '40%',
    left: '22%',
    width: '56%',
    height: '25%',
    borderRadius: 30,
    transform: [{ rotate: '12deg' }],
  },
  markerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  markerTouchable: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCallout: {
    position: 'absolute',
    bottom: 38,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  markerTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  userLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  userPulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 136, 229, 0.3)',
  },
  userCoreDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E88E5',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  styleBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  styleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trafficFlowRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trafficFlowCol: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trafficFlowSegment: {
    opacity: 0.95,
  },
});
