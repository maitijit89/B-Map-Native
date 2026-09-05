import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { BMapColors, BMapElevation, BMapTypography, BMapAnimation } from '@/constants/bmap-theme';
import { useTelemetry } from '@/services/telemetry';
import { logout, getProfile, saveProfile } from '@/services/auth';
import { FadeInView, staggerDelay } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { useLanguage } from '@/contexts/LanguageContext';
import { IndianLanguageCode } from '@/services/languageService';
import { speakText } from '@/services/voiceGuidance';
import { triggerHaptic } from '@/utils/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const { language, setLanguage, isAutoDetected, resetToAutoDetect, allLanguages, t } = useLanguage();
  const telemetry = useTelemetry();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // --- Animated values ---
  const avatarFloat = useSharedValue(0);
  const saveCheckScale = useSharedValue(0);

  useEffect(() => {
    // Subtle floating animation on avatar
    avatarFloat.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [avatarFloat]);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: avatarFloat.value }],
  }));

  const saveCheckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveCheckScale.value }],
  }));

  useEffect(() => {
    async function loadUserData() {
      setIsProfileLoading(true);
      try {
        const p = await getProfile();
        if (p) {
          setFullName(p.fullName || '');
          setAge(p.age || '');
          setEmail(p.email || '');
        }
      } catch {
        // Keep empty — user can fill manually
      } finally {
        setIsProfileLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    await saveProfile({ fullName, age, email });
    setIsSaved(true);
    saveCheckScale.value = withSpring(1, BMapAnimation.bounceSpring);
    setTimeout(() => {
      setIsSaved(false);
      saveCheckScale.value = withTiming(0, { duration: 200 });
    }, 2000);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to purge your B Map session credentials?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const handleSelectLanguage = (code: IndianLanguageCode) => {
    triggerHaptic.selection();
    setLanguage(code);
    const langMeta = allLanguages.find(l => l.code === code);
    const confirmationMsg =
      code === 'hi'
        ? 'ऐप की भाषा बदलकर हिन्दी कर दी गई है'
        : code === 'en'
        ? 'App language switched to English'
        : code === 'bn'
        ? 'অ্যাপের ভাষা বাংলা করা হয়েছে'
        : code === 'ta'
        ? 'பயன்பாட்டு மொழி தமிழாக மாற்றப்பட்டது'
        : code === 'te'
        ? 'యాప్ భాష తెలుగుగా మార్చబడింది'
        : code === 'kn'
        ? 'ಆ್ಯಪ್ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ'
        : code === 'mr'
        ? 'अॅपची भाषा मराठीमध्ये बदलली आहे'
        : code === 'gu'
        ? 'એપ્લિકેશનની ભાષા ગુજરાતી કરવામાં આવી છે'
        : code === 'ml'
        ? 'ആപ്പ് ഭാഷ മലയാളമാക്കി മാറ്റി'
        : code === 'pa'
        ? 'ਐਪ ਦੀ ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ'
        : code === 'or'
        ? 'ଆପ ଭାଷା ଓଡ଼ିଆ କରାଗଲା'
        : code === 'as'
        ? 'এপৰ ভাষা অসমীয়া কৰা হ’ল'
        : `${langMeta?.nativeName || code} selected`;
    speakText(confirmationMsg, code);
  };

  const handleResetAutoDetect = () => {
    triggerHaptic.medium();
    resetToAutoDetect();
    speakText('भाषा ऑटो-डिटेक्ट पर सेट की गई है', 'hi');
  };

  const STAT_ITEMS = [
    {
      label: 'LATITUDE',
      value: `${telemetry.latitude.toFixed(6)}° N`,
      sub: 'GNSS Locked',
      subColor: BMapColors.secondary,
    },
    {
      label: 'LONGITUDE',
      value: `${telemetry.longitude.toFixed(6)}° E`,
      sub: 'WGS-84 Datum',
      subColor: BMapColors.secondary,
    },
    {
      label: 'DEVICE HARDWARE',
      value: telemetry.deviceModel,
      sub: `${telemetry.osName} ${telemetry.osVersion}`,
      subColor: colors.textSecondary,
    },
    {
      label: 'ACTIVE SESSION',
      value: `${telemetry.activeSessionMinutes} mins`,
      sub: 'Continuous uptime',
      subColor: colors.textSecondary,
      valueColor: BMapColors.primary,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title — animated entrance */}
        <FadeInView delay={50} from="down" slideDistance={12}>
          <View style={styles.topHeader}>
            <Text style={[styles.screenTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
              {t('tabs_profile')} • {t('app_language')}
            </Text>
            <Text style={[styles.screenSubtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
              Indian spatial identity & connected hardware telemetry
            </Text>
          </View>
        </FadeInView>

        {/* Header Card: Avatar + Form */}
        <FadeInView delay={150} from="up" slideDistance={20}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.avatarSection}>
              {/* Floating avatar */}
              <Animated.View style={[styles.avatarWrapper, avatarAnimatedStyle]}>
                <View style={[styles.avatarCircle, { backgroundColor: isProfileLoading ? colors.surfaceVariant : BMapColors.navBlue }]}>
                  {isProfileLoading ? (
                    <ActivityIndicator size="small" color={colors.textMuted} />
                  ) : (
                    <Text style={styles.avatarInitials}>
                      {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </Text>
                  )}
                </View>
                <FadeInView delay={400} from="none">
                  <AnimatedPressableButton pressScale={0.85} style={styles.editBadge}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </AnimatedPressableButton>
                </FadeInView>
              </Animated.View>

              <View style={styles.headerInfo}>
                {isProfileLoading ? (
                  <View style={[styles.skeletonLine, { width: 140, backgroundColor: colors.surfaceVariant }]} />
                ) : (
                  <Text style={[styles.userNameTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                    {fullName || 'My Profile'}
                  </Text>
                )}
                {isProfileLoading ? (
                  <View style={[styles.skeletonLine, { width: 180, height: 13, marginTop: 6, backgroundColor: colors.surfaceVariant }]} />
                ) : (
                  <Text style={[styles.userEmail, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
                    {email || '—'}
                  </Text>
                )}
                <View style={styles.verifiedChip}>
                  <Ionicons name="shield-checkmark" size={12} color={BMapColors.secondary} />
                  <Text style={styles.verifiedChipText}>B-Map User</Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={BMapColors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>AGE</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={18} color={BMapColors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="Enter age"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Animated Save Button */}
            <AnimatedPressableButton
              pressScale={0.96}
              onPress={handleSaveProfile}
              style={[styles.saveBtn, { backgroundColor: isSaved ? BMapColors.secondary : BMapColors.primary }]}
            >
              {isSaved ? (
                <Animated.View style={saveCheckAnimatedStyle}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                </Animated.View>
              ) : (
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveBtnText}>{isSaved ? 'Profile Updated' : 'Save Changes'}</Text>
            </AnimatedPressableButton>
          </View>
        </FadeInView>

        {/* App Language (12 Indian Languages) Card */}
        <FadeInView delay={220} from="up" slideDistance={20}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: isDark ? '#1A233A' : '#EFF4FF' }]}>
                <Ionicons name="globe" size={20} color="#2563EB" />
              </View>
              <View style={styles.cardHeaderTextGroup}>
                <Text style={[styles.cardHeaderTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                  {t('app_language')}
                </Text>
                <Text style={[styles.cardHeaderSub, { color: colors.textSecondary }]}>
                  12 Indian Languages • Live Voice Guide & UI
                </Text>
              </View>

              {/* Auto detect badge / button */}
              <AnimatedPressableButton
                pressScale={0.92}
                onPress={handleResetAutoDetect}
                style={[
                  styles.autoDetectPill,
                  {
                    backgroundColor: isAutoDetected
                      ? isDark ? '#0D2E24' : '#ECFDF5'
                      : isDark ? '#332612' : '#FFFBEB',
                    borderColor: isAutoDetected ? '#10B981' : '#F59E0B',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Toggle automatic language detection"
              >
                <Ionicons
                  name={isAutoDetected ? 'flash' : 'refresh'}
                  size={12}
                  color={isAutoDetected ? '#059669' : '#D97706'}
                />
                <Text
                  style={[
                    styles.autoDetectPillText,
                    { color: isAutoDetected ? '#059669' : '#D97706' },
                  ]}
                >
                  {isAutoDetected ? t('auto_detected') : 'Reset Auto'}
                </Text>
              </AnimatedPressableButton>
            </View>

            {/* 12-Language Grid */}
            <View style={styles.languageGrid}>
              {allLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <AnimatedPressableButton
                    key={lang.code}
                    pressScale={0.94}
                    onPress={() => handleSelectLanguage(lang.code)}
                    style={[
                      styles.langCard,
                      {
                        backgroundColor: isSelected
                          ? isDark ? '#1C2640' : '#EEF4FF'
                          : colors.surfaceVariant,
                        borderColor: isSelected ? '#2563EB' : colors.border,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${lang.nativeName} (${lang.name})`}
                  >
                    <View style={styles.langTopRow}>
                      <Text
                        style={[
                          styles.langNativeName,
                          {
                            color: isSelected ? '#2563EB' : colors.text,
                            fontWeight: isSelected ? '800' : '700',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {lang.nativeName}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={15} color="#2563EB" />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.langEnglishName,
                        { color: isSelected ? '#1D4ED8' : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {lang.name}
                    </Text>

                    <View
                      style={[
                        styles.scriptTag,
                        {
                          backgroundColor: isSelected
                            ? isDark ? '#233256' : '#DBEAFE'
                            : isDark ? '#1F2937' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scriptTagText,
                          { color: isSelected ? '#1E40AF' : colors.textMuted },
                        ]}
                      >
                        {lang.script}
                      </Text>
                    </View>
                  </AnimatedPressableButton>
                );
              })}
            </View>
          </View>
        </FadeInView>

        {/* Telemetry Dashboard Card */}
        <FadeInView delay={300} from="up" slideDistance={20}>
          <View style={[styles.card, styles.telemetryCard, { backgroundColor: isDark ? '#111E2E' : '#F0F7FF', borderColor: isDark ? '#1E3A5F' : '#BAE0FD' }]}>
            <View style={styles.telemetryHeader}>
              <MaterialCommunityIcons name="satellite-variant" size={22} color="#0284C7" />
              <View style={styles.telemetryTitleGroup}>
                <Text style={[styles.telemetryTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                  Live Device & Telemetry Feed
                </Text>
                <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>
                  Real-time sensors via expo-location & expo-device
                </Text>
              </View>
            </View>

            <View style={styles.telemetryGrid}>
              {STAT_ITEMS.map((stat, idx) => (
                <FadeInView
                  key={stat.label}
                  delay={staggerDelay(idx, BMapAnimation.stagger.normal) + 400}
                  from="up"
                  slideDistance={12}
                >
                  <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                    <Text
                      style={[styles.statValue, { color: stat.valueColor || colors.text }]}
                      numberOfLines={1}
                    >
                      {stat.value}
                    </Text>
                    <Text style={[styles.statSub, { color: stat.subColor }]}>{stat.sub}</Text>
                  </View>
                </FadeInView>
              ))}
            </View>

            {/* Current Address readout */}
            {telemetry.addressString && (
              <FadeInView delay={750} from="up" slideDistance={8}>
                <View style={[styles.addressPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="location" size={16} color={BMapColors.primary} />
                  <Text style={[styles.addressPillText, { color: colors.text }]} numberOfLines={2}>
                    {telemetry.addressString}
                  </Text>
                </View>
              </FadeInView>
            )}
          </View>
        </FadeInView>

        {/* Security & Session Logout */}
        <FadeInView delay={500} from="up" slideDistance={15}>
          <AnimatedPressableButton
            pressScale={0.97}
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: '#EF5350' }]}
          >
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            <Text style={styles.logoutText}>Purge Session & Logout</Text>
          </AnimatedPressableButton>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  topHeader: {
    gap: 4,
  },
  screenTitle: {
    fontWeight: '800',
  },
  screenSubtitle: {
    lineHeight: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
    ...BMapElevation.level2,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1E293B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  userNameTitle: {
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedChipText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  telemetryCard: {
    gap: 14,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  telemetryTitleGroup: {
    flex: 1,
  },
  telemetryTitle: {
    fontWeight: '700',
  },
  telemetrySub: {
    fontSize: 12,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  addressPillText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTextGroup: {
    flex: 1,
    gap: 2,
  },
  cardHeaderTitle: {
    fontWeight: '700',
  },
  cardHeaderSub: {
    fontSize: 11,
  },
  autoDetectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  autoDetectPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langCard: {
    flexBasis: '31%',
    flexGrow: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 3,
  },
  langTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langNativeName: {
    fontSize: 14,
  },
  langEnglishName: {
    fontSize: 11,
    fontWeight: '500',
  },
  scriptTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  scriptTagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  logoutButton: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '700',
  },
  skeletonLine: {
    height: 18,
    borderRadius: 8,
    marginBottom: 2,
  },
});
