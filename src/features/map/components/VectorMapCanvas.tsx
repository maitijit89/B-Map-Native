import React, { memo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, type ViewStyle, type StyleProp } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  G,
  Circle,
  Polygon,
} from 'react-native-svg';
import { Zap, ShoppingBag, Coffee, Star, Briefcase } from 'lucide-react-native';
import { BMapColors } from '@/shared';

const SVG_VIEW_WIDTH = 420;
const SVG_VIEW_HEIGHT = 860;

export type MapLayerType = 'standard' | 'satellite' | 'night' | 'navic';

interface VectorMapCanvasProps {
  onPoiPress?: (poiName: string) => void;
  showTraffic?: boolean;
  mapLayer?: MapLayerType;
  style?: StyleProp<ViewStyle>;
}

/**
 * 1. Static Landmass & Water Layer (Base Land, Parks, Rivers)
 */
const StaticLandmassLayer = memo<{ mapLayer?: MapLayerType }>(({ mapLayer = 'standard' }) => {
  const getLandColor = () => {
    switch (mapLayer) {
      case 'satellite':
        return '#141E2B';
      case 'night':
        return '#0D1117';
      case 'navic':
        return '#05192C';
      default:
        return '#F4F7FB';
    }
  };

  const getParkOpacity = () => {
    if (mapLayer === 'night') return 0.35;
    if (mapLayer === 'satellite') return 0.25;
    if (mapLayer === 'navic') return 0.4;
    return 0.85;
  };

  return (
    <>
      {/* Base Landmass */}
      <Rect width="420" height="860" fill={getLandColor()} />

      {/* Large Urban Park Feature */}
      <Path
        d="M -20,240 C 40,210 110,230 140,290 C 160,330 130,400 90,430 C 40,460 -20,440 -20,380 Z"
        fill="url(#parkGrad)"
        opacity={getParkOpacity()}
      />
      <Path
        d="M 280,110 C 340,90 390,130 430,160 L 430,20 C 370,10 320,50 280,110 Z"
        fill="url(#parkGrad)"
        opacity={getParkOpacity() * 0.9}
      />
      <Path
        d="M 270,590 C 330,560 390,580 430,620 L 430,730 C 360,740 310,680 270,590 Z"
        fill="url(#parkGrad)"
        opacity={getParkOpacity() * 0.7}
      />

      {/* Winding River System */}
      <Path
        d="M -40,160 Q 90,190 180,150 T 360,110 T 450,130"
        fill="none"
        stroke="url(#riverGrad)"
        strokeLinecap="round"
        strokeWidth={32}
      />
      <Path
        d="M 180,150 Q 230,260 210,390 T 260,610 T 230,880"
        fill="none"
        stroke="url(#riverGrad)"
        strokeLinecap="round"
        strokeWidth={26}
      />

      {/* NavIC Satellite Precision Grid Overlay */}
      {mapLayer === 'navic' && (
        <G stroke="#0096FF" strokeWidth={0.5} opacity={0.35} strokeDasharray="4 4">
          <Path d="M 0,100 L 420,100" />
          <Path d="M 0,200 L 420,200" />
          <Path d="M 0,300 L 420,300" />
          <Path d="M 0,400 L 420,400" />
          <Path d="M 0,500 L 420,500" />
          <Path d="M 0,600 L 420,600" />
          <Path d="M 0,700 L 420,700" />
          <Path d="M 0,800 L 420,800" />
          <Path d="M 100,0 L 100,860" />
          <Path d="M 200,0 L 200,860" />
          <Path d="M 300,0 L 300,860" />
          <Path d="M 400,0 L 400,860" />
        </G>
      )}
    </>
  );
});
StaticLandmassLayer.displayName = 'StaticLandmassLayer';

/**
 * 2. Street Grid & 3D Building Footprints Layer
 */
const StreetNetworkLayer = memo<{ mapLayer?: MapLayerType }>(({ mapLayer = 'standard' }) => {
  const getSecondaryStreetColor = () => {
    switch (mapLayer) {
      case 'satellite':
        return '#253346';
      case 'night':
        return '#21262D';
      case 'navic':
        return '#0E304F';
      default:
        return '#E3E8F0';
    }
  };

  const getBuildingFill = () => {
    switch (mapLayer) {
      case 'satellite':
        return '#1E293B';
      case 'night':
        return '#161B22';
      case 'navic':
        return '#0A2540';
      default:
        return '#EAEEF6';
    }
  };

  const getBuildingStroke = () => {
    switch (mapLayer) {
      case 'satellite':
        return '#334155';
      case 'night':
        return '#30363D';
      case 'navic':
        return '#005596';
      default:
        return '#DDE3EF';
    }
  };

  const getMainAvenueColor = () => {
    switch (mapLayer) {
      case 'satellite':
        return '#38475D';
      case 'night':
        return '#30363D';
      case 'navic':
        return '#0070CC';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <>
      {/* Residential & Secondary Street Network */}
      <G stroke={getSecondaryStreetColor()} strokeLinecap="round" strokeWidth={5}>
        <Path d="M -20,90 L 440,90" />
        <Path d="M -20,330 L 440,330" />
        <Path d="M -20,490 L 440,470" />
        <Path d="M -20,670 L 440,680" />
        <Path d="M 60,-20 L 70,880" />
        <Path d="M 150,-20 L 140,880" />
        <Path d="M 290,-20 L 300,880" />
        <Path d="M 370,-20 L 360,880" />
        <Path d="M 0,220 L 260,390" />
        <Path d="M 120,540 L 400,370" />
        <Path d="M 50,740 L 380,560" />
      </G>

      {/* 3D Isometric Building Block Footprints */}
      <G fill={getBuildingFill()} stroke={getBuildingStroke()} strokeWidth={0.8} opacity={0.55}>
        <Rect x="80" y="110" width="30" height="22" rx="3" />
        <Rect x="80" y="255" width="26" height="28" rx="3" />
        <Rect x="160" y="275" width="32" height="20" rx="3" />
        <Rect x="235" y="235" width="22" height="28" rx="3" />
        <Rect x="325" y="215" width="30" height="22" rx="3" />
        <Rect x="88" y="475" width="24" height="26" rx="3" />
        <Rect x="158" y="435" width="28" height="22" rx="3" />
        <Rect x="315" y="445" width="36" height="30" rx="3" />
        <Rect x="85" y="605" width="26" height="22" rx="3" />
        <Rect x="165" y="635" width="34" height="24" rx="3" />
        <Rect x="325" y="635" width="28" height="22" rx="3" />
        {/* Extra small detail buildings for realism */}
        <Rect x="130" y="140" width="18" height="14" rx="2" />
        <Rect x="280" y="320" width="20" height="16" rx="2" />
        <Rect x="200" y="500" width="22" height="18" rx="2" />
        <Rect x="360" y="350" width="16" height="20" rx="2" />
        <Rect x="50" y="380" width="18" height="16" rx="2" />
        <Rect x="250" y="560" width="20" height="14" rx="2" />
      </G>

      {/* Main Arterial Avenues (White with Crisp Border) */}
      <G stroke={getMainAvenueColor()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={10}>
        <Path d="M -20,270 L 440,270" />
        <Path d="M -20,570 L 440,550" />
        <Path d="M 110,-20 L 110,880" />
        <Path d="M 330,-20 L 330,880" />
        <Path d="M 10,790 L 430,510" />
      </G>
    </>
  );
});
StreetNetworkLayer.displayName = 'StreetNetworkLayer';

/**
 * 3. Dynamic Real-Time Traffic Congestion Layer
 */
const TrafficOverlayLayer = memo<{ showTraffic: boolean }>(({ showTraffic }) => {
  if (!showTraffic) return null;
  return (
    <>
      {/* Smooth Flow (Green #00C06D) */}
      <G stroke="#00C06D" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}>
        <Path d="M -10,270 L 140,270" />
        <Path d="M 260,270 L 430,270" />
        <Path d="M 110,60 L 110,380" />
        <Path d="M 110,540 L 110,790" />
        <Path d="M 330,20 L 330,460" />
        <Path d="M 40,770 L 220,650" />
      </G>

      {/* Moderate Congestion (Amber/Orange #FF9800) */}
      <G stroke="#FF9800" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}>
        <Path d="M 140,270 L 260,270" />
        <Path d="M 110,380 L 110,480" />
        <Path d="M 220,650 L 330,580" />
      </G>

      {/* Heavy Congestion (Red #F44336) */}
      <G stroke="#F44336" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}>
        <Path d="M 110,480 L 110,540" />
      </G>
    </>
  );
});
TrafficOverlayLayer.displayName = 'TrafficOverlayLayer';

/**
 * 4. Expressway & Navigation Polyline Track Layer
 */
const ExpresswayAndNavLayer = memo(() => (
  <>
    {/* Elevated Expressway / Highway 4 Polyline */}
    <Path
      d="M -20,410 C 120,400 180,360 270,300 S 390,210 440,190"
      stroke="#FFE7BA"
      strokeLinecap="round"
      strokeWidth={12}
    />
    <Path
      d="M -20,410 C 120,400 180,360 270,300 S 390,210 440,190"
      stroke="#FF9D42"
      strokeLinecap="round"
      strokeWidth={7}
    />

    {/* Active Recommended GPS Navigation Polyline Track */}
    <Path
      d="M 210,520 L 210,460 L 110,460 L 110,320 L 270,300 L 330,190"
      opacity={0.95}
      stroke="#0096FF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={8}
    />
    <Path
      d="M 210,520 L 210,460 L 110,460 L 110,320 L 270,300 L 330,190"
      stroke="#FFFFFF"
      strokeDasharray="7 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
    />

    {/* Metro Line 2 Ribbon */}
    <Path
      d="M 10,720 Q 180,680 230,500 T 380,240"
      fill="none"
      opacity={0.6}
      stroke="#9C27B0"
      strokeDasharray="6 4"
      strokeWidth={3}
    />

    {/* GPS User Location Radar Beam */}
    <G x="210" y="520">
      <Path d="M 0,0 L -45,-90 A 100 100 0 0 1 45,-90 Z" fill="url(#radarCone)" />
      <Circle r="36" fill="#0096FF" opacity={0.12} />
      <Circle r="24" fill="#0096FF" opacity={0.22} />
      <Circle r="13" fill="#FFFFFF" />
      <Circle r="8" fill="#0096FF" />
      <Polygon points="0,-16 -4,-9 4,-9" fill="#0096FF" />
    </G>
  </>
));
ExpresswayAndNavLayer.displayName = 'ExpresswayAndNavLayer';

/**
 * High-performance VectorMapCanvas with isolated layer decomposition
 */
export const VectorMapCanvas: React.FC<VectorMapCanvasProps> = memo(({
  onPoiPress,
  showTraffic = true,
  mapLayer = 'standard',
  style,
}) => {
  const handleGrandMetroPress = useCallback(() => onPoiPress?.('Grand Metro Stn'), [onPoiPress]);
  const handleEvStationPress = useCallback(() => onPoiPress?.('B-Power 120kW'), [onPoiPress]);
  const handleMallPress = useCallback(() => onPoiPress?.('IFC Mall'), [onPoiPress]);
  const handleCafePress = useCallback(() => onPoiPress?.('Blue Oasis Cafe'), [onPoiPress]);
  const handleTechParkPress = useCallback(() => onPoiPress?.('Tech Innovation Park'), [onPoiPress]);

  return (
    <View style={[styles.container, style]}>
      {/* Scaled SVG Vector Map */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E2F6EA" />
            <Stop offset="100%" stopColor="#D0EEDC" />
          </LinearGradient>

          <LinearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D8EEFE" />
            <Stop offset="100%" stopColor="#C2E4FD" />
          </LinearGradient>

          <RadialGradient id="radarCone" cx="50%" cy="100%" r="90%">
            <Stop offset="0%" stopColor="#0096FF" stopOpacity="0.38" />
            <Stop offset="60%" stopColor="#0096FF" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#0096FF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <StaticLandmassLayer mapLayer={mapLayer} />
        <StreetNetworkLayer mapLayer={mapLayer} />
        <TrafficOverlayLayer showTraffic={showTraffic} />
        <ExpresswayAndNavLayer />
      </Svg>

      {/* POI Overlay Badges */}
      {/* 1. Metro Station */}
      <TouchableOpacity
        style={[styles.poiBadge, { top: '38%', left: 16 }]}
        onPress={handleGrandMetroPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Grand Metro Station map pin"
        activeOpacity={0.8}>
        <View style={styles.metroIcon}>
          <Text style={styles.metroIconText}>M</Text>
        </View>
        <Text style={styles.poiTitle}>Grand Metro Stn</Text>
      </TouchableOpacity>

      {/* 2. EV Supercharger */}
      <TouchableOpacity
        style={[styles.poiBadge, { top: '48%', right: 16 }]}
        onPress={handleEvStationPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="B-Power 120kW EV Supercharger map pin"
        activeOpacity={0.8}>
        <Zap size={14} color="#0096FF" fill="#0096FF" />
        <Text style={styles.poiTitle}>B-Power 120kW</Text>
        <View style={styles.greenTag}>
          <Text style={styles.greenTagText}>6 free</Text>
        </View>
      </TouchableOpacity>

      {/* 3. IFC Mall */}
      <TouchableOpacity
        style={[styles.mallCardContainer, { top: '26%', right: 16 }]}
        onPress={handleMallPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="IFC Mall map pin"
        activeOpacity={0.8}>
        <View style={styles.mallCard}>
          <ShoppingBag size={15} color={BMapColors.tertiaryContainer} />
          <View>
            <Text style={styles.mallTitle}>IFC Mall</Text>
            <View style={styles.mallRatingRow}>
              <Star size={10} color="#FF9800" fill="#FF9800" />
              <Text style={styles.mallRatingText}>4.8 · Popular</Text>
            </View>
          </View>
        </View>
        <View style={styles.mallCardArrow} />
      </TouchableOpacity>

      {/* 4. Specialty Coffee */}
      <TouchableOpacity
        style={[styles.poiBadge, { top: '58%', left: '25%' }]}
        onPress={handleCafePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Blue Oasis Cafe map pin"
        activeOpacity={0.8}>
        <Coffee size={13} color="#8B5000" />
        <Text style={[styles.poiTitle, { fontSize: 11 }]}>Blue Oasis Cafe</Text>
      </TouchableOpacity>

      {/* 5. Destination Pin Flag (Tech Innovation Park) */}
      <TouchableOpacity
        style={[styles.destinationContainer, { top: '22%', right: '24%' }]}
        onPress={handleTechParkPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Tech Innovation Park destination map pin"
        activeOpacity={0.8}>
        <View style={styles.destinationPill}>
          <Briefcase size={12} color="#ffffff" />
          <Text style={styles.destinationText}>Tech Innovation Park</Text>
        </View>
        <View style={styles.destinationArrow} />
        <View style={styles.destinationShadow} />
      </TouchableOpacity>
    </View>
  );
});

VectorMapCanvas.displayName = 'VectorMapCanvas';

export default VectorMapCanvas;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4F7FB',
    position: 'relative',
    overflow: 'hidden',
  },
  poiBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  metroIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00743F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroIconText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  poiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: BMapColors.onSurface,
  },
  greenTag: {
    backgroundColor: '#66FEA3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  greenTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00210E',
  },
  mallCardContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  mallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  mallTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: BMapColors.onSurface,
  },
  mallRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  mallRatingText: {
    fontSize: 10,
    fontWeight: '600',
    color: BMapColors.onSurfaceVariant,
  },
  mallCardArrow: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },
  destinationContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
  },
  destinationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BMapColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  destinationArrow: {
    width: 10,
    height: 10,
    backgroundColor: BMapColors.primary,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
  },
  destinationShadow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(17, 28, 45, 0.25)',
    marginTop: 2,
  },
});
