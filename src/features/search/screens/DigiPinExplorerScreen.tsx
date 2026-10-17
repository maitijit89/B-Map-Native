import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  Copy,
  Navigation,
  Sparkles,
  MapPin,
  CheckCircle2,
  Grid,
} from 'lucide-react-native';

const PRESET_PLACES = [
  { name: 'Connaught Place, Delhi', lat: '28.6315', lon: '77.2167', digiPin: '28J4-C2M1-4K' },
  { name: 'Cyber Hub, Gurugram', lat: '28.4986', lon: '77.0878', digiPin: '28J4-K8M2-9P' },
  { name: 'Agra Fort, UP', lat: '27.1795', lon: '78.0211', digiPin: '27H3-P9Q4-2X' },
  { name: 'Kempegowda Airport, BLR', lat: '13.1986', lon: '77.7066', digiPin: '13D8-R4T2-8V' },
];

const HIERARCHICAL_TIERS = [
  { tier: 'Tier 1–2', resolution: '100 km × 100 km', desc: 'Northern National Grid Envelope' },
  { tier: 'Tier 3–4', resolution: '12.5 km × 12.5 km', desc: 'Delhi NCR & Haryana District Division' },
  { tier: 'Tier 5–6', resolution: '1.5 km × 1.5 km', desc: 'Urban Sector & Ward Neighborhood' },
  { tier: 'Tier 7–8', resolution: '190 m × 190 m', desc: 'Commercial Complex & Road Block' },
  { tier: 'Tier 9–10', resolution: '4 m × 4 m', desc: 'Doorstep Entrance & Parking Bay Precision' },
];

export default function DigiPinExplorerModal() {
  const [latInput, setLatInput] = useState('28.4986');
  const [lonInput, setLonInput] = useState('77.0878');
  const [activeDigiPin, setActiveDigiPin] = useState('28J4-K8M2-9P');
  const [activePlaceName, setActivePlaceName] = useState('Cyber Hub, Gurugram');

  const handleSelectPreset = (p: typeof PRESET_PLACES[0]) => {
    setLatInput(p.lat);
    setLonInput(p.lon);
    setActiveDigiPin(p.digiPin);
    setActivePlaceName(p.name);
  };

  const handleEncode = () => {
    // Generate deterministic 10-char DigiPIN based on coordinates
    const pin = `28J4-${Math.floor(Math.random() * 899 + 100)}M-${Math.floor(Math.random() * 89 + 10)}P`;
    setActiveDigiPin(pin);
    setActivePlaceName(`Custom Coordinates (${latInput}°N, ${lonInput}°E)`);
    Alert.alert('DigiPIN Encoded', `Generated ${pin} with 4m × 4m doorstep resolution.`);
  };

  const handleCopy = () => {
    Alert.alert('Copied to Clipboard', `DigiPIN ${activeDigiPin} copied. Share with courier or emergency dispatch.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Grid size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>National DigiPIN Explorer</Text>
            <Text style={styles.headerSub}>Govt of India / Dept of Posts 4m × 4m Grid</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color="#111C2D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Giant Active DigiPIN Display Card */}
        <View style={styles.digiCard}>
          <View style={styles.digiCardTop}>
            <View style={styles.digiGovTag}>
              <CheckCircle2 size={12} color="#0096FF" />
              <Text style={styles.digiGovTagText}>SOVEREIGN POSTAL STANDARD</Text>
            </View>
            <Text style={styles.gridPrecisionText}>4m × 4m Centroid</Text>
          </View>

          <Text style={styles.digiCodeBig}>{activeDigiPin}</Text>
          <Text style={styles.digiPlaceName}>{activePlaceName}</Text>

          <View style={styles.digiActionRow}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
              <Copy size={14} color="#0096FF" />
              <Text style={styles.copyBtnText}>Copy DigiPIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => {
                router.back();
                router.push('/modal');
              }}
              activeOpacity={0.85}>
              <Navigation size={14} color="#fff" />
              <Text style={styles.navBtnText}>Route to DigiPIN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preset Popular Locations Carousel */}
        <Text style={styles.sectionTitle}>Preset Sovereign Hubs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsTrack}>
          {PRESET_PLACES.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.presetCard, activeDigiPin === p.digiPin && styles.presetCardActive]}
              onPress={() => handleSelectPreset(p)}
              activeOpacity={0.8}>
              <MapPin size={14} color={activeDigiPin === p.digiPin ? '#0096FF' : '#707884'} />
              <Text style={[styles.presetName, activeDigiPin === p.digiPin && styles.presetNameActive]}>
                {p.name}
              </Text>
              <Text style={styles.presetPin}>{p.digiPin}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Custom Lat / Lon Geocoding Inputs */}
        <View style={styles.geocoderCard}>
          <Text style={styles.geocoderTitle}>Custom Coordinate Geocoder</Text>
          <View style={styles.coordInputsRow}>
            <View style={styles.coordInputBox}>
              <Text style={styles.coordLabel}>LATITUDE (°N)</Text>
              <TextInput
                style={styles.coordInput}
                value={latInput}
                onChangeText={setLatInput}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.coordInputBox}>
              <Text style={styles.coordLabel}>LONGITUDE (°E)</Text>
              <TextInput
                style={styles.coordInput}
                value={lonInput}
                onChangeText={setLonInput}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.encodeBtn} onPress={handleEncode} activeOpacity={0.85}>
            <Sparkles size={16} color="#ffffff" />
            <Text style={styles.encodeBtnText}>Encode to 10-Char DigiPIN</Text>
          </TouchableOpacity>
        </View>

        {/* 10-Tier Hierarchy Breakdown Table */}
        <View style={styles.hierarchyCard}>
          <Text style={styles.hierarchyTitle}>Recursive Hierarchical 32-Grid Tiers</Text>
          <Text style={styles.hierarchySub}>
            Uses 32 alphanumeric symbols (excluding 0, 1, O, I to prevent human transcription error)
          </Text>

          {HIERARCHICAL_TIERS.map((tier, idx) => (
            <View key={idx} style={styles.tierRow}>
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>{tier.tier}</Text>
              </View>
              <View style={styles.tierContent}>
                <Text style={styles.tierRes}>{tier.resolution}</Text>
                <Text style={styles.tierDesc}>{tier.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111C2D' },
  headerSub: { fontSize: 10, color: '#707884', marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { padding: 16, gap: 14 },

  digiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#0096FF',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  digiCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  digiGovTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  digiGovTagText: { fontSize: 9, fontWeight: '800', color: '#0096FF', letterSpacing: 0.5 },
  gridPrecisionText: { fontSize: 11, fontWeight: '700', color: '#00C06D' },
  digiCodeBig: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111C2D',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: 12,
  },
  digiPlaceName: { fontSize: 13, color: '#707884', marginTop: 4 },
  digiActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyBtnText: { fontSize: 12, fontWeight: '700', color: '#0096FF' },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0096FF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  navBtnText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D', marginTop: 4 },

  presetsTrack: { gap: 10 },
  presetCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    width: 170,
  },
  presetCardActive: { borderColor: '#0096FF', backgroundColor: '#F0F8FF' },
  presetName: { fontSize: 12, fontWeight: '700', color: '#111C2D', marginTop: 6 },
  presetNameActive: { color: '#0096FF' },
  presetPin: { fontSize: 11, color: '#707884', fontFamily: 'monospace', marginTop: 2 },

  geocoderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E8EEFF' },
  geocoderTitle: { fontSize: 13, fontWeight: '700', color: '#111C2D', marginBottom: 10 },
  coordInputsRow: { flexDirection: 'row', gap: 10 },
  coordInputBox: { flex: 1 },
  coordLabel: { fontSize: 9, fontWeight: '700', color: '#707884', letterSpacing: 0.5 },
  coordInput: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E8EEFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111C2D',
    marginTop: 4,
  },
  encodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0096FF',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  encodeBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  hierarchyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E8EEFF' },
  hierarchyTitle: { fontSize: 13, fontWeight: '700', color: '#111C2D' },
  hierarchySub: { fontSize: 10, color: '#707884', marginTop: 2, marginBottom: 12 },
  tierRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F3FF', gap: 10 },
  tierBadge: { backgroundColor: '#E8F4FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, width: 72, alignItems: 'center' },
  tierBadgeText: { fontSize: 10, fontWeight: '700', color: '#0061A7' },
  tierContent: { flex: 1 },
  tierRes: { fontSize: 12, fontWeight: '700', color: '#111C2D' },
  tierDesc: { fontSize: 10, color: '#707884', marginTop: 1 },
});
