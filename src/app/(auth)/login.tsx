import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { requestEmailOtp } from '@/services/auth';
import { ToastBanner } from '@/components/ToastBanner';

export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | undefined>(undefined);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRequestOtp = async () => {
    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRateLimitSeconds(undefined);

    try {
      const res = await requestEmailOtp(email);
      if (res.success) {
        router.push({
          pathname: '/(auth)/verify' as any,
          params: { email: email.trim() },
        });
      } else {
        setErrorMessage(res.error || 'Failed to request OTP');
        if (res.retryAfterSeconds) {
          setRateLimitSeconds(res.retryAfterSeconds);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Map-Themed Vector Background Graphic */}
      <View style={styles.mapVectorBackground}>
        <View style={styles.bgGridH1} />
        <View style={styles.bgGridH2} />
        <View style={styles.bgGridV1} />
        <View style={styles.bgGridV2} />
        <View style={styles.bgHighway} />
        <View style={styles.bgContourCircle1} />
        <View style={styles.bgContourCircle2} />
        
        {/* Decorative Indian Map Geo Icons */}
        <View style={[styles.bgGeoPin, { top: '15%', left: '18%' }]}>
          <MaterialCommunityIcons name="map-marker-radius" size={28} color={BMapColors.primary} />
        </View>
        <View style={[styles.bgGeoPin, { top: '22%', right: '20%' }]}>
          <Ionicons name="navigate-circle" size={32} color={BMapColors.secondary} />
        </View>
        <View style={[styles.bgGeoPin, { top: '10%', right: '35%' }]}>
          <MaterialCommunityIcons name="card-account-details-star" size={24} color={BMapColors.fastagPurple} />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Toast / HTTP 429 Countdown Banner */}
        <ToastBanner
          visible={!!errorMessage}
          message={errorMessage || ''}
          type={rateLimitSeconds ? 'warning' : 'error'}
          countdownSeconds={rateLimitSeconds}
          onDismiss={() => {
            setErrorMessage(null);
            setRateLimitSeconds(undefined);
          }}
        />

        <View style={styles.contentWrapper}>
          {/* Brand Logo & Title */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
            <Text style={[styles.brandTitle, BMapTypography.headlineLarge, { color: colors.text }]}>
              B Map
            </Text>
            <Text style={[styles.brandTagline, BMapTypography.bodyMedium, { color: colors.textSecondary }]}>
              India's Regional Spatial Mobility & Navigation Network
            </Text>
          </View>

          {/* Elevated Translucent Overlay Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? 'rgba(18, 27, 36, 0.92)' : 'rgba(255, 255, 255, 0.94)',
                borderColor: isFocused ? colors.borderFocus : colors.border,
              },
            ]}
          >
            <Text style={[styles.cardHeader, BMapTypography.titleMedium, { color: colors.text }]}>
              Passwordless Login
            </Text>
            <Text style={[styles.cardSubtext, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
              Enter your email to receive a secure 6-digit OTP code.
            </Text>

            {/* Email Input Field */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.textInputContainer,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isFocused ? BMapColors.primary : email.length > 0 && !isValidEmail ? '#E53935' : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isFocused ? BMapColors.primary : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="name@domain.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
                {isValidEmail && (
                  <Ionicons name="checkmark-circle" size={20} color={BMapColors.secondary} />
                )}
              </View>
            </View>

            {/* Prominent 'Request OTP' Pressable Button */}
            <Pressable
              onPress={handleRequestOtp}
              disabled={isLoading || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)}
              style={({ pressed }) => [
                styles.requestButton,
                {
                  backgroundColor: !isValidEmail || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)
                    ? colors.surfaceVariant
                    : pressed
                    ? BMapColors.primaryDark
                    : BMapColors.primary,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text
                    style={[
                      styles.requestButtonText,
                      {
                        color: !isValidEmail || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)
                          ? colors.textMuted
                          : '#FFFFFF',
                      },
                    ]}
                  >
                    Request OTP
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={
                      !isValidEmail || (rateLimitSeconds !== undefined && rateLimitSeconds > 0)
                        ? colors.textMuted
                        : '#FFFFFF'
                    }
                  />
                </View>
              )}
            </Pressable>

            {/* Indian DIGIPIN & FASTag Security Badge */}
            <View style={styles.securityRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={BMapColors.secondary} />
              <Text style={[styles.securityText, { color: colors.textMuted }]}>
                Encrypted with DIGIPIN Spatial Key & Safe Auth
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapVectorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    opacity: 0.45,
  },
  bgGridH1: {
    position: 'absolute',
    top: '20%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(230, 81, 0, 0.18)',
  },
  bgGridH2: {
    position: 'absolute',
    top: '65%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(0, 135, 90, 0.18)',
  },
  bgGridV1: {
    position: 'absolute',
    left: '25%',
    height: '100%',
    width: 2,
    backgroundColor: 'rgba(230, 81, 0, 0.18)',
  },
  bgGridV2: {
    position: 'absolute',
    left: '75%',
    height: '100%',
    width: 2,
    backgroundColor: 'rgba(0, 135, 90, 0.18)',
  },
  bgHighway: {
    position: 'absolute',
    top: '15%',
    left: '-20%',
    width: '140%',
    height: 16,
    backgroundColor: 'rgba(255, 179, 0, 0.25)',
    transform: [{ rotate: '-25deg' }],
  },
  bgContourCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: 'rgba(230, 81, 0, 0.2)',
  },
  bgContourCircle2: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1.5,
    borderColor: 'rgba(230, 81, 0, 0.12)',
  },
  bgGeoPin: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentWrapper: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },
  brandContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BMapColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level2,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-black',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    gap: 16,
    ...BMapElevation.level3,
  },
  cardHeader: {
    fontWeight: '700',
  },
  cardSubtext: {
    lineHeight: 18,
    marginTop: -8,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  requestButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level2,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
