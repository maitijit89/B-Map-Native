import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { useTelemetry } from '@/services/telemetry';
import { logout, getProfile, saveProfile, UserProfile } from '@/services/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const telemetry = useTelemetry();

  const [fullName, setFullName] = useState('Aarav Sharma');
  const [age, setAge] = useState('28');
  const [email, setEmail] = useState('aarav.sharma@bmap.in');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const p = await getProfile();
      if (p) {
        setFullName(p.fullName);
        setAge(p.age);
        setEmail(p.email);
      }
    }
    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    await saveProfile({ fullName, age, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <View style={styles.topHeader}>
          <Text style={[styles.screenTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
            User Profile & Telemetry
          </Text>
          <Text style={[styles.screenSubtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
            Indian spatial identity & connected hardware telemetry
          </Text>
        </View>

        {/* Header Card: Avatar with edit overlay & Editable Name/Age */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: BMapColors.primary }]}>
                <Text style={styles.avatarInitials}>
                  {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerInfo}>
              <Text style={[styles.userNameTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                {fullName || 'User'}
              </Text>
              <Text style={[styles.userEmail, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
                {email}
              </Text>
              <View style={styles.verifiedChip}>
                <Ionicons name="shield-checkmark" size={12} color={BMapColors.secondary} />
                <Text style={styles.verifiedChipText}>Verified Driver Profile</Text>
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveProfile}
            style={[styles.saveBtn, { backgroundColor: isSaved ? BMapColors.secondary : BMapColors.primary }]}
          >
            <Ionicons name={isSaved ? 'checkmark-circle' : 'save-outline'} size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{isSaved ? 'Profile Updated' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry Dashboard Card */}
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
            {/* Latitude */}
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>LATITUDE</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {telemetry.latitude.toFixed(6)}° N
              </Text>
              <Text style={[styles.statSub, { color: BMapColors.secondary }]}>GNSS Locked</Text>
            </View>

            {/* Longitude */}
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>LONGITUDE</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {telemetry.longitude.toFixed(6)}° E
              </Text>
              <Text style={[styles.statSub, { color: BMapColors.secondary }]}>WGS-84 Datum</Text>
            </View>

            {/* Device Model */}
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEVICE HARDWARE</Text>
              <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                {telemetry.deviceModel}
              </Text>
              <Text style={[styles.statSub, { color: colors.textSecondary }]}>
                {telemetry.osName} {telemetry.osVersion}
              </Text>
            </View>

            {/* Active Session Minutes */}
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>ACTIVE SESSION</Text>
              <Text style={[styles.statValue, { color: BMapColors.primary }]}>
                {telemetry.activeSessionMinutes} mins
              </Text>
              <Text style={[styles.statSub, { color: colors.textSecondary }]}>Continuous uptime</Text>
            </View>
          </View>

          {/* Current Address readout */}
          {telemetry.addressString && (
            <View style={[styles.addressPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="location" size={16} color={BMapColors.primary} />
              <Text style={[styles.addressPillText, { color: colors.text }]} numberOfLines={2}>
                {telemetry.addressString}
              </Text>
            </View>
          )}
        </View>

        {/* Security & Session Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: '#EF5350' }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Purge Session & Logout</Text>
        </TouchableOpacity>
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
    paddingBottom: 60,
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
});
