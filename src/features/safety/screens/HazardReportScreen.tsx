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
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
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
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

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
  const colors = useThemeColors();
  const [selectedHazard, setSelectedHazard] = useState('pothole');
  const [selectedSeverity, setSelectedSeverity] = useState('high');
  const [lanePosition, setLanePosition] = useState('Right Lane');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSubmit = () => {
    haptics.success();
    Alert.alert(
      'Hazard Report Broadcasted! 📡',
      `Thank you! Your report for ${HAZARD_TYPES.find((h) => h.id === selectedHazard)?.label} has been tagged with DigiPIN 28J4-K8M2-9P and dispatched to drivers within 5km via Socket.IO community telemetry. Trust Score: +5 XP gained.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="Report Road Hazard"
        onBackPress={() => {
          haptics.light();
          router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location & Sovereign DigiPIN Card */}
        <Animated.View entering={FadeInDown.duration(350).springify().damping(16)}>
          <Card variant="elevated" padding="md" style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[styles.locationTitle, { color: colors.primary }]}>Current GPS Coordinates (Locked)</Text>
            </View>
            <Text style={[styles.locationAddress, { color: colors.onSurface }]}>
              NH-48 Jaipur Highway Corridor, km 42.4 (Near Manesar)
            </Text>

            <View style={[styles.digiRow, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.digiBadge, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.digiBadgeText, { color: colors.onPrimary }]}>DigiPIN</Text>
              </View>
              <Text style={[styles.digiCode, { color: colors.primary }]}>28J4-K8M2-9P</Text>
              <Text style={[styles.digiAccuracy, { color: colors.onSurfaceVariant }]}>4m × 4m Grid Precision</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Hazard Type Selector */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Select Hazard Category</Text>
        <View style={styles.hazardGrid}>
          {HAZARD_TYPES.map((ht, idx) => {
            const IconComp = ht.icon;
            const isSelected = selectedHazard === ht.id;
            return (
              <Animated.View
                key={ht.id}
                entering={FadeInDown.delay(100 + idx * 40).duration(350).springify().damping(16)}
                style={styles.hazardChipWrapper}>
                <TouchableOpacity
                  style={[
                    styles.hazardChip,
                    {
                      backgroundColor: isSelected ? ht.color + '20' : colors.surfaceContainerLowest,
                      borderColor: isSelected ? ht.color : colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedHazard(ht.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select hazard ${ht.label}`}
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.hazardIconBox,
                      { backgroundColor: isSelected ? ht.color : colors.surfaceContainerLow },
                    ]}>
                    <IconComp size={18} color={isSelected ? '#fff' : ht.color} />
                  </View>
                  <Text
                    style={[
                      styles.hazardChipLabel,
                      { color: colors.onSurface },
                      isSelected && { fontWeight: '800' },
                    ]}>
                    {ht.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Severity Level Selector */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Severity Level</Text>
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map((sl) => {
            const isSelected = selectedSeverity === sl.id;
            return (
              <TouchableOpacity
                key={sl.id}
                style={[
                  styles.severityChip,
                  {
                    backgroundColor: isSelected ? sl.color + '20' : colors.surfaceContainerLowest,
                    borderColor: isSelected ? sl.color : colors.surfaceContainerHigh,
                  },
                ]}
                onPress={() => {
                  haptics.selection();
                  setSelectedSeverity(sl.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select severity ${sl.label}, ${sl.desc}`}
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.8}>
                <Text style={[styles.severityLabel, { color: sl.color }]}>{sl.label}</Text>
                <Text style={[styles.severityDesc, { color: colors.onSurfaceVariant }]}>{sl.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Highway Lane Location */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Corridor Lane Position</Text>
        <View style={styles.laneRow}>
          {['Left Lane', 'Center Lane', 'Right Lane', 'Shoulder / Flyover'].map((lane) => (
            <TouchableOpacity
              key={lane}
              style={[
                styles.laneChip,
                { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceContainerHigh },
                lanePosition === lane && {
                  backgroundColor: colors.primaryContainer,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                haptics.selection();
                setLanePosition(lane);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select corridor lane ${lane}`}
              accessibilityState={{ selected: lanePosition === lane }}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.laneChipText,
                  { color: colors.onSurfaceVariant },
                  lanePosition === lane && { color: colors.onPrimary, fontWeight: '700' },
                ]}>
                {lane}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes & Optional Description */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Additional Driver Warning Notes</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
              color: colors.onSurface,
            },
          ]}
          placeholder="E.g., Deep pothole after flyover descent, reduce speed to 40 km/h..."
          placeholderTextColor={colors.outline}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        {/* Photo Upload Attachment Simulation */}
        <TouchableOpacity
          style={[
            styles.photoCard,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh },
            hasPhoto && { borderColor: colors.trafficGreen, backgroundColor: colors.surfaceContainerLow },
          ]}
          onPress={() => {
            haptics.selection();
            setHasPhoto(!hasPhoto);
          }}
          accessibilityRole="button"
          accessibilityLabel={hasPhoto ? 'Photo attached, tap to remove' : 'Attach dashcam or camera photo'}
          accessibilityState={{ checked: hasPhoto }}
          activeOpacity={0.8}>
          <Camera size={20} color={hasPhoto ? colors.trafficGreen : colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.photoTitle, { color: colors.onSurface }]}>
              {hasPhoto ? 'Photo Attached (dashcam_img_81.jpg)' : 'Attach Dashcam / Camera Photo'}
            </Text>
            <Text style={[styles.photoSub, { color: colors.onSurfaceVariant }]}>
              Increases community report verification trust score by +25%
            </Text>
          </View>
        </TouchableOpacity>

        {/* Trust Score Banner */}
        <View style={[styles.trustBanner, { backgroundColor: colors.surfaceContainerLow }]}>
          <ShieldCheck size={18} color={colors.trafficGreen} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.trustTitle, { color: colors.onSurface }]}>Reporter Trust Score: 98.4% (VIP Navigator)</Text>
            <Text style={[styles.trustSub, { color: colors.onSurfaceVariant }]}>
              Instant high-priority broadcast to connected V2X nodes
            </Text>
          </View>
        </View>

        {/* Submit Report Button */}
        <Button
          title="Broadcast Road Hazard Report"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Send size={18} color={colors.onPrimary} />}
          onPress={handleSubmit}
        />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 100 },

  locationCard: { gap: Spacing.xs },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationTitle: { ...Typography.labelSmall, fontWeight: '700' },
  locationAddress: { ...Typography.bodyMedium, fontWeight: '700', marginTop: 2 },
  digiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: Radius.md,
    marginTop: 6,
  },
  digiBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.xs },
  digiBadgeText: { fontSize: 9, fontWeight: '800' },
  digiCode: { ...Typography.labelMedium, fontWeight: '800', letterSpacing: 0.5 },
  digiAccuracy: { ...Typography.bodySmall, fontSize: 10, flex: 1 },

  sectionTitle: { ...Typography.titleSmall, fontWeight: '800', marginTop: Spacing.xs },
  hazardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  hazardChipWrapper: { width: '48%' },
  hazardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  hazardIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardChipLabel: { ...Typography.labelSmall, fontWeight: '700', flex: 1 },

  severityRow: { flexDirection: 'row', gap: 8 },
  severityChip: {
    flex: 1,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  severityLabel: { ...Typography.labelMedium, fontWeight: '800' },
  severityDesc: { ...Typography.bodySmall, fontSize: 9, textAlign: 'center', marginTop: 2 },

  laneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  laneChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  laneChipText: { ...Typography.labelSmall, fontWeight: '600' },

  textInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    ...Typography.bodyMedium,
  },

  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  photoTitle: { ...Typography.labelMedium, fontWeight: '700' },
  photoSub: { ...Typography.bodySmall, fontSize: 10, marginTop: 1 },

  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
  },
  trustTitle: { ...Typography.labelSmall, fontWeight: '700' },
  trustSub: { ...Typography.bodySmall, fontSize: 10, marginTop: 1 },
});
