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
  TriangleAlert,
  Camera,
  MapPin,
  ShieldCheck,
  Send,
  Droplets,
  Cone,
  CarFront,
  Zap,
} from 'lucide-react-native';

const HAZARD_TYPES = [
  { id: 'pothole', label: 'Pothole / Road Damage', icon: TriangleAlert, color: '#F44336' },
  { id: 'waterlogging', label: 'Waterlogging / Flood', icon: Droplets, color: '#2196F3' },
  { id: 'speed_trap', label: 'Speed Radar / Interceptor', icon: Camera, color: '#FF9800' },
  { id: 'accident', label: 'Traffic Accident', icon: CarFront, color: '#D32F2F' },
  { id: 'roadwork', label: 'Road Construction', icon: Cone, color: '#FFB300' },
  { id: 'breakdown', label: 'Vehicle Breakdown', icon: Zap, color: '#7E57C2' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', desc: 'Passable with caution', color: '#00C06D' },
  { id: 'medium', label: 'Medium', desc: 'Lane partially blocked', color: '#FF9800' },
  { id: 'high', label: 'Severe', desc: 'Hazardous, avoid lane', color: '#F44336' },
];

export default function HazardReportModal() {
  const [selectedHazard, setSelectedHazard] = useState('pothole');
  const [selectedSeverity, setSelectedSeverity] = useState('high');
  const [lanePosition, setLanePosition] = useState('Right Lane');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSubmit = () => {
    Alert.alert(
      'Hazard Report Broadcasted! 📡',
      `Thank you! Your report for ${HAZARD_TYPES.find((h) => h.id === selectedHazard)?.label} has been tagged with DigiPIN 28J4-K8M2-9P and dispatched to drivers within 5km via Socket.IO community telemetry. Trust Score: +5 XP gained.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <TriangleAlert size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Report Road Hazard</Text>
            <Text style={styles.headerSub}>Crowdsourced Sovereign Telematics</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color="#111C2D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location & Sovereign DigiPIN Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={16} color="#0096FF" />
            <Text style={styles.locationTitle}>Current GPS Coordinates (Locked)</Text>
          </View>
          <Text style={styles.locationAddress}>NH-48 Jaipur Highway Corridor, km 42.4 (Near Manesar)</Text>

          <View style={styles.digiRow}>
            <View style={styles.digiBadge}>
              <Text style={styles.digiBadgeText}>DigiPIN</Text>
            </View>
            <Text style={styles.digiCode}>28J4-K8M2-9P</Text>
            <Text style={styles.digiAccuracy}>4m × 4m Grid Precision</Text>
          </View>
        </View>

        {/* Hazard Type Selector */}
        <Text style={styles.sectionTitle}>Select Hazard Category</Text>
        <View style={styles.hazardGrid}>
          {HAZARD_TYPES.map((ht) => {
            const IconComp = ht.icon;
            const isSelected = selectedHazard === ht.id;
            return (
              <TouchableOpacity
                key={ht.id}
                style={[styles.hazardChip, isSelected && { borderColor: ht.color, backgroundColor: ht.color + '15' }]}
                onPress={() => setSelectedHazard(ht.id)}
                activeOpacity={0.8}>
                <View style={[styles.hazardIconBox, { backgroundColor: isSelected ? ht.color : '#F0F4FF' }]}>
                  <IconComp size={18} color={isSelected ? '#fff' : ht.color} />
                </View>
                <Text style={[styles.hazardChipLabel, isSelected && { color: '#111C2D', fontWeight: '800' }]}>
                  {ht.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Severity Level Selector */}
        <Text style={styles.sectionTitle}>Severity Level</Text>
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map((sl) => {
            const isSelected = selectedSeverity === sl.id;
            return (
              <TouchableOpacity
                key={sl.id}
                style={[
                  styles.severityChip,
                  isSelected && { borderColor: sl.color, backgroundColor: sl.color + '15' },
                ]}
                onPress={() => setSelectedSeverity(sl.id)}
                activeOpacity={0.8}>
                <Text style={[styles.severityLabel, { color: sl.color }]}>{sl.label}</Text>
                <Text style={styles.severityDesc}>{sl.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Highway Lane Location */}
        <Text style={styles.sectionTitle}>Corridor Lane Position</Text>
        <View style={styles.laneRow}>
          {['Left Lane', 'Center Lane', 'Right Lane', 'Shoulder / Flyover'].map((lane) => (
            <TouchableOpacity
              key={lane}
              style={[styles.laneChip, lanePosition === lane && styles.laneChipSelected]}
              onPress={() => setLanePosition(lane)}
              activeOpacity={0.8}>
              <Text style={[styles.laneChipText, lanePosition === lane && styles.laneChipTextSelected]}>
                {lane}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes & Optional Description */}
        <Text style={styles.sectionTitle}>Additional Driver Warning Notes</Text>
        <TextInput
          style={styles.textInput}
          placeholder="E.g., Deep pothole after flyover descent, reduce speed to 40 km/h..."
          placeholderTextColor="#707884"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* Photo Upload Attachment Simulation */}
        <TouchableOpacity
          style={[styles.photoCard, hasPhoto && styles.photoCardActive]}
          onPress={() => setHasPhoto(!hasPhoto)}
          activeOpacity={0.8}>
          <Camera size={20} color={hasPhoto ? '#00C06D' : '#0096FF'} />
          <View style={{ flex: 1 }}>
            <Text style={styles.photoTitle}>
              {hasPhoto ? 'Photo Attached (dashcam_img_81.jpg)' : 'Attach Dashcam / Camera Photo'}
            </Text>
            <Text style={styles.photoSub}>Increases community report verification trust score by +25%</Text>
          </View>
        </TouchableOpacity>

        {/* Trust Score Banner */}
        <View style={styles.trustBanner}>
          <ShieldCheck size={18} color="#00C06D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Reporter Trust Score: 98.4% (VIP Navigator)</Text>
            <Text style={styles.trustSub}>Instant high-priority broadcast to connected V2X nodes</Text>
          </View>
        </View>

        {/* Submit Report Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Send size={18} color="#ffffff" />
          <Text style={styles.submitBtnText}>Broadcast Road Hazard Report</Text>
        </TouchableOpacity>

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
    backgroundColor: '#F44336',
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

  scroll: { padding: 16, gap: 12 },

  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationTitle: { fontSize: 11, fontWeight: '700', color: '#707884', textTransform: 'uppercase' },
  locationAddress: { fontSize: 13, fontWeight: '700', color: '#111C2D', marginTop: 4 },
  digiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F3FF' },
  digiBadge: { backgroundColor: '#0096FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  digiBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  digiCode: { fontSize: 12, fontWeight: '700', color: '#111C2D', fontFamily: 'monospace' },
  digiAccuracy: { fontSize: 10, color: '#707884' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111C2D', marginTop: 4 },

  hazardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hazardChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    gap: 8,
  },
  hazardIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  hazardChipLabel: { fontSize: 11, fontWeight: '600', color: '#3F4753', flex: 1 },

  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    alignItems: 'center',
  },
  severityLabel: { fontSize: 12, fontWeight: '800' },
  severityDesc: { fontSize: 9, color: '#707884', marginTop: 2, textAlign: 'center' },

  laneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  laneChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EEFF',
  },
  laneChipSelected: { backgroundColor: '#0096FF', borderColor: '#0096FF' },
  laneChipText: { fontSize: 11, fontWeight: '600', color: '#3F4753' },
  laneChipTextSelected: { color: '#ffffff' },

  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEFF',
    fontSize: 12,
    color: '#111C2D',
    textAlignVertical: 'top',
  },

  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  photoCardActive: { backgroundColor: '#E8F8EE', borderColor: '#C8E6C9' },
  photoTitle: { fontSize: 12, fontWeight: '700', color: '#111C2D' },
  photoSub: { fontSize: 10, color: '#707884', marginTop: 1 },

  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9F4FC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBD8F7',
  },
  trustTitle: { fontSize: 11, fontWeight: '700', color: '#4A154B' },
  trustSub: { fontSize: 10, color: '#7B5282', marginTop: 1 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F44336',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
});
