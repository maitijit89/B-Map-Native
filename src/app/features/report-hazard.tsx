import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { useTelemetry } from '@/services/telemetry';
import { HazardCategory } from '@/types';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { FadeInView } from '@/components/ui/fade-in-view';

const HAZARD_CATEGORIES: {
  id: HazardCategory;
  label: string;
  icon: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  color: string;
  bg: string;
}[] = [
  {
    id: 'Speed Breaker',
    label: 'Unmarked Speed Breaker',
    icon: 'car-brake-alert',
    iconSet: 'MaterialCommunityIcons',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    id: 'Waterlogging',
    label: 'Road Waterlogging',
    icon: 'water-alert',
    iconSet: 'MaterialCommunityIcons',
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    id: 'Pothole',
    label: 'Deep Pothole / Crater',
    icon: 'alert-decagram',
    iconSet: 'MaterialCommunityIcons',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  {
    id: 'Stray Animals',
    label: 'Stray Cattle / Animals',
    icon: 'cow',
    iconSet: 'MaterialCommunityIcons',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
];

export default function ReportHazardScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const telemetry = useTelemetry();

  const [selectedCategory, setSelectedCategory] = useState<HazardCategory>('Speed Breaker');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        router.back();
      }, 1600);
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="Report Road Hazard"
        subtitle="Crowdsourced Indian road safety alerts"
        accentColor={BMapColors.warningAmber}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isSubmitted ? (
          <FadeInView delay={50} direction="up">
            <View style={[styles.successCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={64} color="#00875A" />
              </View>
              <Text style={[styles.successTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
                Hazard Reported!
              </Text>
              <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                Thank you for contributing. Other B Map drivers within 5km have received this alert.
              </Text>
              <View style={styles.karmaBadge}>
                <Ionicons name="star" size={16} color="#FFB300" />
                <Text style={styles.karmaText}>+25 Community Karma Points Awarded</Text>
              </View>
            </View>
          </FadeInView>
        ) : (
          <>
            {/* Header Advice */}
            <FadeInView delay={50} direction="down">
              <View style={styles.headerNotice}>
                <Text style={[styles.headerNoticeTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                  Select Hazard Type
                </Text>
                <Text style={[styles.headerNoticeSub, { color: colors.textSecondary }]}>
                  Tap the tile that best describes the road obstacle you encountered.
                </Text>
              </View>
            </FadeInView>

            {/* 4 Large Square Touchable Tiles Category Grid */}
            <View style={styles.categoryGrid}>
              {HAZARD_CATEGORIES.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <FadeInView key={cat.id} delay={100 + index * 60} direction="up">
                    <AnimatedPressable
                      onPress={() => setSelectedCategory(cat.id)}
                      scaleTo={0.95}
                      style={[
                        styles.categoryTile,
                        {
                          backgroundColor: isSelected ? (isDark ? '#2D2319' : cat.bg) : colors.surface,
                          borderColor: isSelected ? cat.color : colors.border,
                          borderWidth: isSelected ? 2.5 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.tileIconBox, { backgroundColor: isSelected ? '#FFFFFF' : cat.bg }]}>
                        <MaterialCommunityIcons name={cat.icon as any} size={28} color={cat.color} />
                      </View>

                      <Text
                        style={[
                          styles.tileLabel,
                          {
                            color: isSelected ? (isDark ? '#FFFFFF' : cat.color) : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>

                      {isSelected && (
                        <View style={[styles.selectedCheck, { backgroundColor: cat.color }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </AnimatedPressable>
                  </FadeInView>
                );
              })}
            </View>

            {/* Auto-Attached GPS Location Card */}
            <FadeInView delay={320} direction="up">
              <View style={[styles.gpsCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <View style={styles.gpsHeader}>
                  <Ionicons name="location" size={18} color={BMapColors.primary} />
                  <Text style={[styles.gpsHeaderTitle, { color: colors.text }]}>AUTO-ATTACHED GPS TELEMETRY</Text>
                </View>
                <Text style={[styles.gpsCoords, { color: colors.text }]}>
                  {telemetry.latitude.toFixed(6)}° N, {telemetry.longitude.toFixed(6)}° E
                </Text>
                <Text style={[styles.gpsAddress, { color: colors.textSecondary }]}>
                  {telemetry.addressString || 'Connaught Place, New Delhi'}
                </Text>
              </View>
            </FadeInView>

            {/* Details Form: Expanding multiline TextInput */}
            <FadeInView delay={380} direction="up">
              <View style={[styles.formBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Optional Hazard Description & Lane Details
                </Text>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="e.g. Left lane blocked due to deep water puddle after metro pillar 80..."
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={3}
                  value={comment}
                  onChangeText={setComment}
                />
              </View>
            </FadeInView>

            {/* Submit Button */}
            <FadeInView delay={440} direction="up">
              <AnimatedPressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                scaleTo={0.96}
                style={[styles.submitButton, { backgroundColor: BMapColors.primary }]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.submitInner}>
                    <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Submit Community Hazard Report</Text>
                  </View>
                )}
              </AnimatedPressable>
            </FadeInView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 18,
  },
  headerNotice: {
    gap: 4,
  },
  headerNoticeTitle: {
    fontWeight: '700',
  },
  headerNoticeSub: {
    fontSize: 13,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTile: {
    flexBasis: '48%',
    flexGrow: 1,
    height: 125,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    position: 'relative',
    ...BMapElevation.level1,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 13,
    lineHeight: 16,
  },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gpsCoords: {
    fontSize: 14,
    fontWeight: '700',
  },
  gpsAddress: {
    fontSize: 12,
  },
  formBlock: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    ...BMapElevation.level1,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  commentInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level2,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  successCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    gap: 14,
    marginVertical: 40,
    ...BMapElevation.level3,
  },
  successIconCircle: {
    marginBottom: 4,
  },
  successTitle: {
    fontWeight: '800',
  },
  successSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  karmaText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
  },
});
