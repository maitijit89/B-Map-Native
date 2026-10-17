import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Award,
  Car,
  Zap,
  CreditCard,
  Languages,
  Activity,
  Bookmark,
  MapPin,
  History,
  Satellite,
  ShieldCheck,
  DownloadCloud,
  Volume2,
  Copy,
  Navigation,
  LogOut,
  Sparkles,
  Leaf,
  CheckCircle2,
  EyeOff,
  Clock,
  Gauge,
  Phone,
} from 'lucide-react-native';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', script: 'English' },
  { code: 'hi', name: 'Hindi', script: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', script: 'தமிழ்' },
  { code: 'te', name: 'Telugu', script: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', script: 'বাংলা' },
  { code: 'mr', name: 'Marathi', script: 'मराठी' },
  { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', script: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', script: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', script: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', script: 'অসমীয়া' },
];

const SAVED_PLACES = [
  {
    id: '1',
    label: 'Home',
    address: 'Sector 56, Golf Course Ext Road, Gurugram',
    digiPin: '28J4-K8M2-9P',
    type: 'home',
  },
  {
    id: '2',
    label: 'Work',
    address: 'DLF Cyber City, Building 10, DLF Phase 2',
    digiPin: '28J4-L9N3-1B',
    type: 'work',
  },
  {
    id: '3',
    label: 'IGI Airport T3',
    address: 'Indira Gandhi International Airport, New Delhi',
    digiPin: '28J3-H7K1-8X',
    type: 'airport',
  },
];

const RECENT_TRIPS = [
  {
    destination: 'Agra Fort via NH-48 & Yamuna Expy',
    date: 'Yesterday, 07:30 AM',
    distance: '168.3 km',
    duration: '2h 14m',
    toll: '₹435 (FASTag)',
    co2: 'Saved 2.4 kg CO₂',
  },
  {
    destination: 'Connaught Place, Inner Circle',
    date: '10 Oct, 05:15 PM',
    distance: '28.6 km',
    duration: '52m',
    toll: '₹0 (Toll-Free)',
    co2: 'Saved 0.6 kg CO₂',
  },
];

export default function MineScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [navicMode, setNavicMode] = useState(true);
  const [differentialPrivacy, setDifferentialPrivacy] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [speedAlerts, setSpeedAlerts] = useState(true);

  const handleCopyDigiPin = (pin: string) => {
    Alert.alert('DigiPIN Copied', `Copied ${pin} to clipboard (4m × 4m sovereign grid code).`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Profile & Fleet</Text>
          <Text style={styles.subtitle}>Sovereign Identity · Telematics & Settings</Text>
        </View>
        <TouchableOpacity
          style={styles.sosQuickBtn}
          onPress={() => router.push('/sos-distress')}>
          <Phone size={16} color="#F44336" />
          <Text style={styles.sosQuickText}>112</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <User size={32} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>Aarav Sharma</Text>
                <CheckCircle2 size={16} color="#0096FF" />
              </View>
              <Text style={styles.profileContact}>+91 98765 43210 · aarav.sharma@example.com</Text>
              <View style={styles.vipBadge}>
                <Award size={12} color="#D57E00" />
                <Text style={styles.vipText}>VIP Navigator Level 4</Text>
                <Sparkles size={11} color="#D57E00" />
              </View>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelLabelRow}>
              <Text style={styles.levelLabel}>Level 4 Voyager</Text>
              <Text style={styles.levelPoints}>8,420 / 10,000 XP to Level 5</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '84%' }]} />
            </View>
          </View>

          {/* Overall Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>4,820</Text>
              <Text style={styles.statLabel}>KM Navigated</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={styles.ecoStatRow}>
                <Leaf size={12} color="#00C06D" />
                <Text style={[styles.statValue, { color: '#00C06D' }]}>68.4 kg</Text>
              </View>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>98.4%</Text>
              <Text style={styles.statLabel}>Trust Score</Text>
            </View>
          </View>
        </View>

        {/* Live Activity Recognition State */}
        <View style={styles.activityBanner}>
          <View style={styles.activityLeft}>
            <View style={styles.activityIconRing}>
              <Activity size={16} color="#0096FF" />
            </View>
            <View>
              <Text style={styles.activityTitle}>AI Motion State: Driving</Text>
              <Text style={styles.activitySub}>Sensors calibrated · Confidence 96% · 48 km/h</Text>
            </View>
          </View>
          <View style={styles.activityLiveBadge}>
            <View style={styles.pulsingGreenDot} />
            <Text style={styles.activityLiveText}>Active</Text>
          </View>
        </View>

        {/* Connected Vehicle & FASTag */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Car size={18} color="#0096FF" />
              <Text style={styles.cardTitle}>My Vehicle & FASTag</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/vehicle-fleet')}>
              <Text style={styles.cardHeaderAction}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleRow}>
              <View>
                <Text style={styles.vehicleModel}>Tata Nexon EV Max</Text>
                <Text style={styles.vehicleReg}>DL 01 AB 1234 · Class 4 (Car/Jeep)</Text>
              </View>
              <View style={styles.batteryPill}>
                <Zap size={12} color="#00C06D" />
                <Text style={styles.batteryText}>78% · 312 km</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.fastagBanner}
              onPress={() => router.push('/vehicle-fleet')}
              activeOpacity={0.85}>
              <View style={styles.fastagLeft}>
                <CreditCard size={18} color="#6A1B9A" />
                <View>
                  <Text style={styles.fastagTitle}>NHAI FASTag Linked</Text>
                  <Text style={styles.fastagNumber}>Tag ID: 3416-8920-1102 (SBI Auto-Reload)</Text>
                </View>
              </View>
              <View style={styles.fastagBalanceBox}>
                <Text style={styles.fastagBalanceLabel}>BALANCE</Text>
                <Text style={styles.fastagBalance}>₹1,450</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 12 Indian Languages Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Languages size={18} color="#0096FF" />
              <Text style={styles.cardTitle}>Vernacular Voice & UI (12 Languages)</Text>
            </View>
            <View style={styles.langCountBadge}>
              <Text style={styles.langCountText}>12 Indic</Text>
            </View>
          </View>
          <Text style={styles.cardSub}>
            Select your preferred regional voice TTS navigation & signage language:
          </Text>

          <View style={styles.langGrid}>
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, isSelected && styles.langChipActive]}
                  onPress={() => setSelectedLanguage(lang.code)}
                  activeOpacity={0.8}>
                  <Text style={[styles.langScript, isSelected && styles.langScriptActive]}>
                    {lang.script}
                  </Text>
                  <Text style={[styles.langName, isSelected && styles.langNameActive]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Saved Places with DigiPIN */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Bookmark size={18} color="#0096FF" />
              <Text style={styles.cardTitle}>Saved Places with DigiPIN</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Add Place', 'Enter destination and resolve its 4m × 4m DigiPIN.')}>
              <Text style={styles.cardHeaderAction}>+ Add Place</Text>
            </TouchableOpacity>
          </View>

          {SAVED_PLACES.map((place) => (
            <View key={place.id} style={styles.placeItem}>
              <View style={styles.placeIconCircle}>
                <MapPin size={16} color="#0096FF" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeLabel}>{place.label}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                <TouchableOpacity
                  style={styles.placePinRow}
                  onPress={() => router.push('/digipin-explorer')}
                  activeOpacity={0.8}>
                  <View style={styles.digiBadge}>
                    <Text style={styles.digiBadgeText}>DigiPIN</Text>
                  </View>
                  <Text style={styles.digiCode}>{place.digiPin}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => handleCopyDigiPin(place.digiPin)}>
                    <Copy size={11} color="#707884" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.routePlaceBtn}
                onPress={() => router.push('/modal')}>
                <Navigation size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent Trip History */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <History size={18} color="#0096FF" />
              <Text style={styles.cardTitle}>Recent Trips</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Trip History', 'Viewing all 142 completed trips and mileage exports.')}>
              <Text style={styles.cardHeaderAction}>View All</Text>
            </TouchableOpacity>
          </View>

          {RECENT_TRIPS.map((trip, idx) => (
            <View key={idx} style={styles.tripItem}>
              <View style={styles.tripTopRow}>
                <Text style={styles.tripDest}>{trip.destination}</Text>
                <Text style={styles.tripDate}>{trip.date}</Text>
              </View>
              <View style={styles.tripMetaRow}>
                <View style={styles.tripBadge}>
                  <Clock size={11} color="#707884" />
                  <Text style={styles.tripBadgeText}>{trip.duration}</Text>
                </View>
                <View style={styles.tripBadge}>
                  <Gauge size={11} color="#707884" />
                  <Text style={styles.tripBadgeText}>{trip.distance}</Text>
                </View>
                <View style={styles.tripBadge}>
                  <CreditCard size={11} color="#707884" />
                  <Text style={styles.tripBadgeText}>{trip.toll}</Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: '#E8F8EE' }]}>
                  <Leaf size={11} color="#00C06D" />
                  <Text style={[styles.tripBadgeText, { color: '#00C06D' }]}>{trip.co2}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Sovereign & Privacy Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <ShieldCheck size={18} color="#0096FF" />
              <Text style={styles.cardTitle}>Sovereignty & Security</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <Satellite size={18} color="#0096FF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>ISRO NavIC Constellation Mode</Text>
              <Text style={styles.settingDesc}>Dual-Band L5/S ionospheric delay cancellation</Text>
            </View>
            <Switch
              value={navicMode}
              onValueChange={setNavicMode}
              trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <EyeOff size={18} color="#FF9800" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Differential Privacy Obfuscation</Text>
              <Text style={styles.settingDesc}>200m spatial laplacian noise near defense zones</Text>
            </View>
            <Switch
              value={differentialPrivacy}
              onValueChange={setDifferentialPrivacy}
              trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <DownloadCloud size={18} color="#00C06D" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Offline Regional Vector Maps</Text>
              <Text style={styles.settingDesc}>Delhi NCR & Yamuna Expressway (420 MB)</Text>
            </View>
            <Switch
              value={offlineSync}
              onValueChange={setOfflineSync}
              trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingIconCol}>
              <Volume2 size={18} color="#6A1B9A" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>ADAS Speed & Camera Chimes</Text>
              <Text style={styles.settingDesc}>Audio alerts when exceeding corridor limits</Text>
            </View>
            <Switch
              value={speedAlerts}
              onValueChange={setSpeedAlerts}
              trackColor={{ false: '#D8E3FB', true: '#0096FF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert(
              'Sign Out?',
              'Are you sure you want to end your current sovereign navigation session?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => router.push('/auth'),
                },
              ]
            )
          }
          activeOpacity={0.8}>
          <LogOut size={16} color="#BA1A1A" />
          <Text style={styles.logoutText}>Sign Out of B Map</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>B Map v1.0.0 · ISRO NavIC & Survey of India Compliant</Text>
          <Text style={styles.footerSubText}>High-Precision Sovereign Navigation Engine</Text>
        </View>

        <View style={{ height: 32 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111C2D',
  },
  subtitle: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sosQuickText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F44336',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  profileContact: {
    fontSize: 11,
    color: '#707884',
    marginTop: 1,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  vipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D57E00',
  },

  levelProgressContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F3FF',
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
  },
  levelPoints: {
    fontSize: 10,
    color: '#707884',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8EEFF',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0096FF',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F3FF',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#707884',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8EEFF',
  },
  ecoStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  /* Activity Banner */
  activityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4FF',
    borderRadius: 14,
    padding: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityIconRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0061A7',
  },
  activitySub: {
    fontSize: 10,
    color: '#4B779A',
    marginTop: 1,
  },
  activityLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C06D',
  },
  activityLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C06D',
  },

  /* Card General */
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  cardHeaderAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0096FF',
  },
  cardSub: {
    fontSize: 11,
    color: '#707884',
    marginBottom: 12,
    lineHeight: 16,
  },

  /* Vehicle & FASTag */
  vehicleDetails: {
    gap: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  vehicleReg: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C06D',
  },
  fastagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F4FC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBD8F7',
  },
  fastagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fastagTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A154B',
  },
  fastagNumber: {
    fontSize: 10,
    color: '#7B5282',
    marginTop: 1,
  },
  fastagBalanceBox: {
    alignItems: 'flex-end',
  },
  fastagBalanceLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#7B5282',
    letterSpacing: 0.5,
  },
  fastagBalance: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6A1B9A',
  },

  /* Languages Grid */
  langCountBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  langCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0096FF',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    width: '31%',
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: {
    borderColor: '#0096FF',
    backgroundColor: '#E8F4FF',
  },
  langScript: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F4753',
  },
  langScriptActive: {
    color: '#0096FF',
  },
  langName: {
    fontSize: 9,
    color: '#707884',
    marginTop: 2,
  },
  langNameActive: {
    color: '#0061A7',
    fontWeight: '600',
  },

  /* Saved Places with DigiPIN */
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    gap: 10,
  },
  placeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  placeAddress: {
    fontSize: 11,
    color: '#707884',
    marginTop: 1,
  },
  placePinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  digiBadge: {
    backgroundColor: '#0096FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  digiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  digiCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
    fontFamily: 'monospace',
  },
  copyBtn: {
    padding: 3,
  },
  routePlaceBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Trip Item */
  tripItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    gap: 6,
  },
  tripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDest: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111C2D',
    flex: 1,
    marginRight: 8,
  },
  tripDate: {
    fontSize: 10,
    color: '#707884',
  },
  tripMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tripBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3F4753',
  },

  /* Settings */
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3FF',
    gap: 12,
  },
  settingIconCol: {
    width: 24,
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111C2D',
  },
  settingDesc: {
    fontSize: 10,
    color: '#707884',
    marginTop: 2,
    lineHeight: 14,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BA1A1A',
  },

  /* Footer */
  footerNote: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 3,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#707884',
  },
  footerSubText: {
    fontSize: 10,
    color: '#A0A8B4',
  },
});
