import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  TrainFront,
  Bus,
  CarTaxiFront,
  Footprints,
  Clock,
  IndianRupee,
  Leaf,
  QrCode,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';

interface TransitPlan {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  duration: string;
  fare: string;
  co2Saved: string;
  segments: {
    type: 'metro' | 'bus' | 'walk' | 'auto';
    lineName: string;
    lineColor: string;
    duration: string;
    stationsCount?: number;
    notes?: string;
  }[];
}

const TRANSIT_PLANS: TransitPlan[] = [
  {
    id: '1',
    title: 'Metro Express + Rapid Metro',
    tag: 'Fastest Route',
    tagColor: '#0096FF',
    duration: '38 min',
    fare: '₹42',
    co2Saved: '1.4 kg',
    segments: [
      {
        type: 'walk',
        lineName: 'Walk to Rajiv Chowk Gate 4',
        lineColor: '#707884',
        duration: '3 min',
        notes: '220 meters',
      },
      {
        type: 'metro',
        lineName: 'DMRC Yellow Line (Toward HUDA City)',
        lineColor: '#FFD600',
        duration: '26 min',
        stationsCount: 14,
        notes: 'Platform 2 · Train every 3 min',
      },
      {
        type: 'walk',
        lineName: 'Interchange at Sikanderpur',
        lineColor: '#707884',
        duration: '2 min',
        notes: 'Direct skywalk connector',
      },
      {
        type: 'metro',
        lineName: 'Rapid Metro (Loop Route)',
        lineColor: '#FF9800',
        duration: '7 min',
        stationsCount: 3,
        notes: 'Platform 1 to Cyber Hub',
      },
    ],
  },
  {
    id: '2',
    title: 'Direct DTC Electric AC Bus',
    tag: 'Lowest Cost',
    tagColor: '#00C06D',
    duration: '52 min',
    fare: '₹25',
    co2Saved: '0.9 kg',
    segments: [
      {
        type: 'walk',
        lineName: 'Walk to Shivaji Stadium Terminal',
        lineColor: '#707884',
        duration: '4 min',
      },
      {
        type: 'bus',
        lineName: 'DTC Electric AC Bus 412A',
        lineColor: '#4CAF50',
        duration: '46 min',
        stationsCount: 18,
        notes: 'High AC comfort · Every 10 min',
      },
      {
        type: 'walk',
        lineName: 'Walk to Cyber Hub Plaza',
        lineColor: '#707884',
        duration: '2 min',
      },
    ],
  },
  {
    id: '3',
    title: 'Metro + Last-Mile Electric Auto',
    tag: 'Doorstep Convenience',
    tagColor: '#9C27B0',
    duration: '31 min',
    fare: '₹68',
    co2Saved: '1.1 kg',
    segments: [
      {
        type: 'metro',
        lineName: 'Yellow Line to MG Road',
        lineColor: '#FFD600',
        duration: '22 min',
        stationsCount: 12,
      },
      {
        type: 'auto',
        lineName: 'EV Smart Auto-Rickshaw',
        lineColor: '#00C06D',
        duration: '9 min',
        notes: 'Fixed pre-paid meter fare ₹40',
      },
    ],
  },
];

const METRO_LINES_STATUS = [
  { name: 'Yellow Line', status: 'Normal Flow', freq: 'Every 2.5 min', color: '#FFD600' },
  { name: 'Blue Line', status: 'Normal Flow', freq: 'Every 3 min', color: '#2196F3' },
  { name: 'Rapid Metro', status: 'Normal Flow', freq: 'Every 4 min', color: '#FF9800' },
  { name: 'Airport Express', status: 'Super Fast', freq: 'Every 10 min', color: '#E91E63' },
];

export default function TransitPlannerScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('1');
  const [showQrTicket, setShowQrTicket] = useState(false);
  const [ticketCountdown, setTicketCountdown] = useState(179);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showQrTicket && ticketCountdown > 0) {
      interval = setInterval(() => {
        setTicketCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showQrTicket, ticketCountdown]);

  const activePlan = TRANSIT_PLANS.find((p) => p.id === selectedPlan) || TRANSIT_PLANS[0];

  const handleBuyQrTicket = () => {
    setShowQrTicket(true);
    setTicketCountdown(180);
    Alert.alert(
      'Digital Metro QR Generated! 🎫',
      'Scan at DMRC / Rapid Metro automated entry gates within 3 hours. Fare ₹42 deducted via FASTag/UPI.'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#111C2D" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Multimodal Transit Planner</Text>
          <Text style={styles.headerSub}>DMRC Metro · Feeder Buses · EV Auto Last-Mile</Text>
        </View>
        <TouchableOpacity
          style={styles.qrHeaderBtn}
          onPress={() => setShowQrTicket(!showQrTicket)}
          activeOpacity={0.7}>
          <QrCode size={18} color="#0096FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Origin & Destination Card */}
        <View style={styles.routeHeaderCard}>
          <View style={styles.routePill}>
            <View style={[styles.stationDot, { backgroundColor: '#FFD600' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stationLabel}>ORIGIN METRO HUB</Text>
              <Text style={styles.stationName}>Rajiv Chowk (Central Delhi)</Text>
            </View>
          </View>
          <View style={styles.routeArrowRow}>
            <View style={styles.routeLine} />
            <View style={styles.arrowIconBox}>
              <ArrowRight size={14} color="#0096FF" />
            </View>
            <View style={styles.routeLine} />
          </View>
          <View style={styles.routePill}>
            <View style={[styles.stationDot, { backgroundColor: '#FF9800' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stationLabel}>DESTINATION STATION</Text>
              <Text style={styles.stationName}>Cyber Hub, Gurugram (Rapid Metro)</Text>
            </View>
          </View>
        </View>

        {/* Live DMRC Network Status Bar */}
        <View style={styles.statusSection}>
          <Text style={styles.statusSectionTitle}>Live NCR Transit Feeds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTrack}>
            {METRO_LINES_STATUS.map((line, idx) => (
              <View key={idx} style={styles.statusChip}>
                <View style={[styles.statusColorStrip, { backgroundColor: line.color }]} />
                <View>
                  <Text style={styles.statusLineName}>{line.name}</Text>
                  <Text style={styles.statusLineFreq}>{line.freq}</Text>
                </View>
                <View style={styles.normalPulse}>
                  <View style={styles.greenDot} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Journey Plans Switcher */}
        <Text style={styles.sectionHeading}>Recommended Journey Plans</Text>
        {TRANSIT_PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlan;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}>
              <View style={styles.planCardTop}>
                <View style={[styles.planTagBadge, { backgroundColor: plan.tagColor + '20' }]}>
                  <Text style={[styles.planTagText, { color: plan.tagColor }]}>{plan.tag}</Text>
                </View>
                <View style={styles.planPriceRow}>
                  <IndianRupee size={14} color="#111C2D" />
                  <Text style={styles.planPriceText}>{plan.fare.replace('₹', '')}</Text>
                </View>
              </View>

              <Text style={styles.planTitle}>{plan.title}</Text>

              {/* Segment Icons Track */}
              <View style={styles.segmentIconsTrack}>
                {plan.segments.map((seg, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <View style={[styles.segIconBox, { borderColor: seg.lineColor }]}>
                      {seg.type === 'metro' && <TrainFront size={14} color={seg.lineColor} />}
                      {seg.type === 'bus' && <Bus size={14} color={seg.lineColor} />}
                      {seg.type === 'walk' && <Footprints size={14} color={seg.lineColor} />}
                      {seg.type === 'auto' && <CarTaxiFront size={14} color={seg.lineColor} />}
                    </View>
                    {sIdx < plan.segments.length - 1 && <View style={styles.segConnectorLine} />}
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.planMetaRow}>
                <View style={styles.planMetaBadge}>
                  <Clock size={12} color="#707884" />
                  <Text style={styles.planMetaText}>{plan.duration}</Text>
                </View>
                <View style={[styles.planMetaBadge, { backgroundColor: '#E8F8EE' }]}>
                  <Leaf size={12} color="#00C06D" />
                  <Text style={[styles.planMetaText, { color: '#00C06D' }]}>
                    Saved {plan.co2Saved} CO₂
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Selected Plan Step-by-Step Breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Itinerary Maneuver Details</Text>
            <Text style={styles.breakdownSub}>{activePlan.title}</Text>
          </View>

          {activePlan.segments.map((seg, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepDot, { backgroundColor: seg.lineColor }]} />
                {idx < activePlan.segments.length - 1 && <View style={styles.stepTrackLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepLineName}>{seg.lineName}</Text>
                  <Text style={styles.stepDuration}>{seg.duration}</Text>
                </View>
                {seg.stationsCount ? (
                  <Text style={styles.stepSubDetail}>{seg.stationsCount} stations en-route</Text>
                ) : null}
                {seg.notes ? <Text style={styles.stepNotes}>ℹ️ {seg.notes}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Digital QR Ticket Simulator */}
        {showQrTicket ? (
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <View style={styles.qrHeaderLeft}>
                <QrCode size={18} color="#0096FF" />
                <Text style={styles.qrTitle}>DMRC Digital QR Gate Pass</Text>
              </View>
              <Text style={styles.qrTimer}>Expires: {ticketCountdown}s</Text>
            </View>

            {/* Simulated QR Code Graphic */}
            <View style={styles.qrVisualWrapper}>
              <Svg width={140} height={140} viewBox="0 0 100 100">
                <Rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                {/* 3 Position Detection Patterns */}
                <Rect x="5" y="5" width="25" height="25" fill="#111C2D" />
                <Rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <Rect x="13" y="13" width="9" height="9" fill="#111C2D" />

                <Rect x="70" y="5" width="25" height="25" fill="#111C2D" />
                <Rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <Rect x="78" y="13" width="9" height="9" fill="#111C2D" />

                <Rect x="5" y="70" width="25" height="25" fill="#111C2D" />
                <Rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <Rect x="13" y="78" width="9" height="9" fill="#111C2D" />

                {/* Data modules pattern */}
                <Rect x="35" y="10" width="10" height="10" fill="#111C2D" />
                <Rect x="50" y="15" width="12" height="6" fill="#111C2D" />
                <Rect x="35" y="30" width="30" height="10" fill="#0096FF" />
                <Rect x="40" y="45" width="20" height="15" fill="#111C2D" />
                <Rect x="10" y="40" width="15" height="8" fill="#111C2D" />
                <Rect x="70" y="40" width="20" height="10" fill="#111C2D" />
                <Rect x="35" y="70" width="12" height="18" fill="#111C2D" />
                <Rect x="55" y="75" width="35" height="15" fill="#111C2D" />
              </Svg>
            </View>

            <Text style={styles.qrStationHint}>
              Valid for single journey: Rajiv Chowk ➔ Cyber Hub
            </Text>
            <View style={styles.qrGateVerified}>
              <CheckCircle2 size={14} color="#00C06D" />
              <Text style={styles.qrGateText}>NCMC Auto-Gate Tap Ready</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.buyTicketBtn}
            onPress={handleBuyQrTicket}
            activeOpacity={0.85}>
            <QrCode size={18} color="#ffffff" />
            <Text style={styles.buyTicketText}>
              Generate Metro QR Ticket ({activePlan.fare})
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3FF',
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111C2D',
  },
  headerSub: {
    fontSize: 10,
    color: '#707884',
    marginTop: 1,
  },
  qrHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },

  /* Origin Destination Card */
  routeHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#707884',
    letterSpacing: 0.5,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 1,
  },
  routeArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EEFF',
  },
  arrowIconBox: {
    paddingHorizontal: 8,
  },

  /* Status Chips */
  statusSection: {
    gap: 8,
  },
  statusSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  statusTrack: {
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingRight: 10,
    paddingVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusColorStrip: {
    width: 4,
    height: 28,
  },
  statusLineName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
  },
  statusLineFreq: {
    fontSize: 9,
    color: '#707884',
  },
  normalPulse: {
    marginLeft: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C06D',
  },

  /* Journey Plans */
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#0096FF',
    backgroundColor: '#F8FBFF',
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111C2D',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  segmentIconsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3FF',
    borderWidth: 1,
  },
  segConnectorLine: {
    width: 14,
    height: 2,
    backgroundColor: '#D8E3FB',
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  planMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3F4753',
  },

  /* Breakdown Card */
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  breakdownHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    paddingBottom: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  breakdownSub: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 16,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepTrackLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E8EEFF',
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLineName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  stepDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#707884',
  },
  stepSubDetail: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
  },
  stepNotes: {
    fontSize: 11,
    color: '#0096FF',
    fontWeight: '600',
    marginTop: 3,
  },

  /* QR Ticket */
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
    borderWidth: 1,
    borderColor: '#D8E3FB',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  qrHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  qrTimer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F44336',
  },
  qrVisualWrapper: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEFF',
  },
  qrStationHint: {
    fontSize: 11,
    color: '#707884',
    textAlign: 'center',
  },
  qrGateVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  qrGateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C06D',
  },

  /* Buy Ticket Button */
  buyTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyTicketText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
