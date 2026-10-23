import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  CornerUpRight,
  Volume2,
  VolumeX,
  X,
  Satellite,
  AlertTriangle,
  Camera,
  Compass,
  RotateCcw,
  Flag,
  Share2,
  Phone,
} from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  G,
  Circle,
  Polygon,
} from 'react-native-svg';
import { Button } from '@/shared/components/ui';
import { speechService } from '@/shared/services';

export default function ActiveNavigationModal() {
  const [isMuted, setIsMuted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(74);
  const [xtdMeters] = useState(2.3);

  // Speak initial turn prompt on route start & fluctuate live speed
  useEffect(() => {
    speechService.speak('Starting route to Company. In 350 meters, turn right onto Outer Ring Road Expressway.');
    const speedInterval = setInterval(() => {
      setCurrentSpeed((prev) => Math.min(Math.max(prev + Math.floor(Math.random() * 5) - 2, 68), 82));
    }, 2500);

    return () => {
      speechService.stop();
      clearInterval(speedInterval);
    };
  }, []);

  const toggleMute = () => {
    triggerHaptic();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
    if (!nextMuted) {
      speechService.speak('Voice guidance unmuted.');
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleEndNavigation = () => {
    triggerHaptic();
    Alert.alert(
      'End Navigation?',
      'Are you sure you want to stop active turn-by-turn route guidance?',
      [
        { text: 'Resume Route', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleReportHazard = () => {
    triggerHaptic();
    router.push('/hazard-report');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Stylized Active Navigation Vector Map Canvas */}
      <View style={styles.mapCanvas}>
        <Svg width="100%" height="100%" viewBox="0 0 400 700">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0B132B" />
              <Stop offset="0.5" stopColor="#1C2541" />
              <Stop offset="1" stopColor="#0B132B" />
            </LinearGradient>
            <LinearGradient id="routeGlow" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#0096FF" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#00E5FF" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          {/* Background Map Fill */}
          <Rect x="0" y="0" width="400" height="700" fill="url(#bgGrad)" />

          {/* Secondary Roads Grid */}
          <Path d="M 0,180 L 400,210" stroke="#25324D" strokeWidth="6" strokeLinecap="round" />
          <Path d="M 0,380 L 400,340" stroke="#25324D" strokeWidth="8" strokeLinecap="round" />
          <Path d="M 0,560 L 400,590" stroke="#25324D" strokeWidth="6" strokeLinecap="round" />
          <Path d="M 80,0 L 110,700" stroke="#1F2A42" strokeWidth="8" />
          <Path d="M 310,0 L 290,700" stroke="#1F2A42" strokeWidth="8" />

          {/* River / Green corridor */}
          <Path
            d="M 330,0 Q 360,350 340,700"
            stroke="#15363D"
            strokeWidth="32"
            fill="none"
            strokeOpacity="0.4"
          />

          {/* Active Primary Highway Route Corridor (Glow + Core) */}
          <Path
            d="M 200,660 L 200,420 Q 200,350 250,310 L 310,260 L 320,80"
            stroke="#005B9E"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 200,660 L 200,420 Q 200,350 250,310 L 310,260 L 320,80"
            stroke="#0096FF"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 200,660 L 200,420 Q 200,350 250,310 L 310,260 L 320,80"
            stroke="#E0F7FF"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10, 10"
          />

          {/* Ahead Maneuver Turn Arrow on Road */}
          <G transform="translate(210, 325)">
            <Circle cx="0" cy="0" r="16" fill="#00E5FF" fillOpacity="0.3" />
            <Path
              d="M -6,6 L 6,-6 M 6,-6 L 0,-6 M 6,-6 L 6,0"
              stroke="#00E5FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </G>

          {/* Speed Radar Marker */}
          <G transform="translate(290, 240)">
            <Circle cx="0" cy="0" r="14" fill="#F44336" fillOpacity="0.3" />
            <Circle cx="0" cy="0" r="8" fill="#F44336" />
            <Circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          </G>

          {/* Vehicle Position Radar Halo & Chevron */}
          <G transform="translate(200, 500)">
            <Circle cx="0" cy="0" r="32" fill="#0096FF" fillOpacity="0.2" />
            <Circle cx="0" cy="0" r="18" fill="#0096FF" fillOpacity="0.4" />
            <Polygon points="0,-16 12,12 0,6 -12,12" fill="#FFFFFF" />
            <Polygon points="0,-13 9,9 0,4 -9,9" fill="#0096FF" />
          </G>
        </Svg>
      </View>

      {/* Top Floating Cockpit Header */}
      <SafeAreaView style={styles.topHud} edges={['top']}>
        <View style={styles.hudTopBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleEndNavigation}
            activeOpacity={0.8}>
            <X size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navicStatusPill}
            onPress={() => router.push('/digipin-explorer')}
            activeOpacity={0.8}>
            <Satellite size={14} color="#00C06D" />
            <Text style={styles.navicStatusText}>NavIC L5+S · HDOP 0.7 · 0.6m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.muteBtn}
            onPress={toggleMute}
            activeOpacity={0.8}>
            {isMuted ? <VolumeX size={18} color="#FF9800" /> : <Volume2 size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        {/* Turn-by-Turn Maneuver Card */}
        <View style={styles.maneuverCard}>
          <View style={styles.maneuverLeft}>
            <View style={styles.turnIconCircle}>
              <CornerUpRight size={32} color="#0096FF" strokeWidth={3} />
            </View>
            <View style={styles.maneuverDistanceBlock}>
              <Text style={styles.turnDistance}>350</Text>
              <Text style={styles.turnDistanceUnit}>meters</Text>
            </View>
          </View>

          <View style={styles.maneuverRight}>
            <Text style={styles.maneuverRoadName} numberOfLines={1}>
              NH-48 Jaipur Expressway
            </Text>
            <Text style={styles.maneuverSubText} numberOfLines={1}>
              Take ramp on right toward Manesar / Jaipur
            </Text>

            {/* HD Lane Guidance Component */}
            <View style={styles.laneGuidanceRow}>
              <View style={[styles.laneArrow, styles.laneArrowInactive]}>
                <Text style={styles.laneText}>↑</Text>
              </View>
              <View style={[styles.laneArrow, styles.laneArrowInactive]}>
                <Text style={styles.laneText}>↑</Text>
              </View>
              <View style={[styles.laneArrow, styles.laneArrowActive]}>
                <Text style={[styles.laneText, styles.laneTextActive]}>↗</Text>
              </View>
              <View style={[styles.laneArrow, styles.laneArrowActive]}>
                <Text style={[styles.laneText, styles.laneTextActive]}>↗</Text>
              </View>
              <Text style={styles.laneInstruction}>Keep Right</Text>
            </View>
          </View>
        </View>

        {/* Vernacular Voice TTS Banner */}
        <View style={styles.vernacularBanner}>
          <Text style={styles.vernacularBadge}>हिन्दी TTS</Text>
          <Text style={styles.vernacularPrompt} numberOfLines={1}>
            {'“350 मीटर बाद दाएँ मुड़ें और NH-48 एक्सप्रेसवे पर रहें”'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Floating Speedometer Cluster & ADAS Warning */}
      <View style={styles.leftFloatingCluster}>
        {/* Speedometer Circle */}
        <View style={styles.speedometer}>
          <Text style={styles.speedValue}>{currentSpeed}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>

        {/* Speed Limit Sign */}
        <View style={styles.speedLimitSign}>
          <Text style={styles.speedLimitSignText}>80</Text>
        </View>

        {/* Speed Camera ADAS Alert */}
        <View style={styles.cameraAlert}>
          <Camera size={14} color="#F44336" />
          <Text style={styles.cameraAlertText}>Radar 750m</Text>
        </View>
      </View>

      {/* Right Floating FAB Controls */}
      <View style={styles.rightFloatingControls}>
        <TouchableOpacity
          style={styles.floatingFab}
          onPress={() => Alert.alert('Recalculate', 'Re-computing optimal route via OSRM state machine.')}>
          <RotateCcw size={20} color="#0096FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingFab}
          onPress={() => Alert.alert('Trip Overview', 'Viewing 168 km route profile.')}>
          <Compass size={20} color="#0096FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingFab, { backgroundColor: '#FFF0F0', borderColor: '#FFCDD2' }]}
          onPress={handleReportHazard}>
          <AlertTriangle size={20} color="#F44336" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingFab, { backgroundColor: '#F0FFF4', borderColor: '#C8E6C9' }]}
          onPress={() => Alert.alert('Share ETA', 'Shared live location & ETA via WhatsApp.')}>
          <Share2 size={20} color="#00C06D" />
        </TouchableOpacity>
      </View>

      {/* Telematics Cross-Track Error (XTD) Banner */}
      <View style={styles.xtdBanner}>
        <View style={styles.xtdDot} />
        <Text style={styles.xtdText}>
          Cross-Track Error: {xtdMeters}m · Status: ON ROUTE · Max Tolerance: 40m
        </Text>
      </View>

      {/* Bottom Route Progress Sheet */}
      <View style={styles.bottomHud}>
        {/* Upcoming Toll Alert */}
        <View style={styles.tollUpcomingBanner}>
          <View style={styles.tollUpcomingLeft}>
            <View style={styles.tollIconBadge}>
              <Text style={styles.tollIconBadgeText}>FASTag</Text>
            </View>
            <Text style={styles.tollUpcomingName}>Manesar Plaza in 18 km</Text>
          </View>
          <Text style={styles.tollUpcomingFee}>₹130</Text>
        </View>

        {/* Time, Distance, ETA Row */}
        <View style={styles.etaRow}>
          <View style={styles.etaItem}>
            <Text style={styles.etaTime}>1h 48m</Text>
            <Text style={styles.etaSub}>REMAINING</Text>
          </View>

          <View style={styles.etaDivider} />

          <View style={styles.etaItem}>
            <Text style={styles.etaDist}>142 km</Text>
            <Text style={styles.etaSub}>DISTANCE</Text>
          </View>

          <View style={styles.etaDivider} />

          <View style={styles.etaItem}>
            <Text style={styles.etaArrival}>01:42 AM</Text>
            <Text style={styles.etaSub}>EST. ARRIVAL</Text>
          </View>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <Button
            title="SOS 112"
            variant="danger"
            size="md"
            leftIcon={<Phone size={16} color="#fff" />}
            onPress={() => router.push('/sos-distress')}
            style={styles.bottomActionFlex}
          />
          <Button
            title="End Navigation"
            variant="primary"
            size="md"
            leftIcon={<Flag size={16} color="#fff" />}
            onPress={handleEndNavigation}
            style={styles.bottomActionFlex}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  mapCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* Top HUD */
  topHud: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  hudTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(17, 28, 45, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  navicStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(17, 28, 45, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 109, 0.4)',
  },
  navicStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0F7FF',
  },
  muteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(17, 28, 45, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  /* Maneuver Card */
  maneuverCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  maneuverLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E8EEFF',
    paddingRight: 12,
  },
  turnIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  maneuverDistanceBlock: {
    alignItems: 'center',
  },
  turnDistance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111C2D',
  },
  turnDistanceUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#707884',
    textTransform: 'uppercase',
  },
  maneuverRight: {
    flex: 1,
    justifyContent: 'center',
  },
  maneuverRoadName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111C2D',
  },
  maneuverSubText: {
    fontSize: 12,
    color: '#707884',
    marginTop: 2,
  },
  laneGuidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  laneArrow: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laneArrowInactive: {
    backgroundColor: '#EEF2F6',
  },
  laneArrowActive: {
    backgroundColor: '#0096FF',
  },
  laneText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0A8B4',
  },
  laneTextActive: {
    color: '#ffffff',
  },
  laneInstruction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0096FF',
    marginLeft: 6,
  },

  /* Vernacular Voice Banner */
  vernacularBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(17, 28, 45, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 255, 0.4)',
  },
  vernacularBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0096FF',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vernacularPrompt: {
    flex: 1,
    fontSize: 11,
    color: '#E0F7FF',
    fontWeight: '500',
  },

  /* Floating Left Speedometer */
  leftFloatingCluster: {
    position: 'absolute',
    left: 16,
    top: 250,
    gap: 10,
    alignItems: 'center',
  },
  speedometer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(17, 28, 45, 0.92)',
    borderWidth: 3,
    borderColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  speedValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  speedUnit: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0096FF',
    marginTop: -2,
  },
  speedLimitSign: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  speedLimitSignText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111C2D',
  },
  cameraAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cameraAlertText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F44336',
  },

  /* Floating Right FABs */
  rightFloatingControls: {
    position: 'absolute',
    right: 16,
    top: 250,
    gap: 10,
  },
  floatingFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  /* XTD Banner */
  xtdBanner: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(17, 28, 45, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  xtdDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C06D',
  },
  xtdText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E0F7FF',
  },

  /* Bottom HUD */
  bottomHud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    gap: 12,
  },
  tollUpcomingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F4FC',
    borderWidth: 1,
    borderColor: '#EBD8F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tollUpcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tollIconBadge: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tollIconBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  tollUpcomingName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A154B',
  },
  tollUpcomingFee: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6A1B9A',
  },

  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  etaItem: {
    flex: 1,
    alignItems: 'center',
  },
  etaTime: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0096FF',
  },
  etaDist: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  etaArrival: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  etaSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#707884',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  etaDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E8EEFF',
  },

  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  bottomActionFlex: {
    flex: 1,
  },
});
