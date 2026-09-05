import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { BMapColors, BMapElevation, BMapTypography, BMapAnimation } from '@/constants/bmap-theme';
import { requestEmailOtp } from '@/services/auth';
import { ToastBanner } from '@/components/ToastBanner';
import { FadeInView } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';

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

  // Animated logo entrance
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const cardSlide = useSharedValue(40);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(100, withSpring(1, BMapAnimation.bounceSpring));
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    cardSlide.value = withDelay(300, withSpring(0, BMapAnimation.sheetSpring));
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 450 }));
  }, [logoScale, logoOpacity, cardSlide, cardOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardSlide.value }],
    opacity: cardOpacity.value,
  }));

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
        setErrorMessage(res.error || 'Failed to send OTP');
        if (res.retryAfterSeconds) setRateLimitSeconds(res.retryAfterSeconds);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !isValidEmail || isLoading || (rateLimitSeconds !== undefined && rateLimitSeconds > 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Solid top accent strip — no translucency */}
      <View style={[styles.topAccentStrip, { backgroundColor: BMapColors.primary }]} />

      <SafeAreaView style={styles.safeArea}>
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
          {/* Brand Logo Block */}
          <Animated.View style={[styles.brandBlock, logoAnimatedStyle]}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>B Map</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              India's Regional Navigation & Spatial Mobility
            </Text>
          </Animated.View>

          {/* Login Card — 100% solid surface */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: isFocused ? BMapColors.navBlue : colors.border,
              },
              cardAnimatedStyle,
            ]}
          >
            <Text style={[styles.cardHeader, BMapTypography.titleMedium, { color: colors.text }]}>
              Sign In
            </Text>
            <Text style={[styles.cardSubtext, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
              Enter your email to receive a 6-digit OTP
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.textInputContainer,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isFocused
                      ? BMapColors.navBlue
                      : email.length > 0 && !isValidEmail
                      ? BMapColors.emergencyRed
                      : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={isFocused ? BMapColors.navBlue : colors.textMuted}
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
                  <FadeInView delay={0} from="none">
                    <Ionicons name="checkmark-circle" size={18} color={BMapColors.secondary} />
                  </FadeInView>
                )}
              </View>
            </View>

            {/* OTP Request Button */}
            <AnimatedPressableButton
              pressScale={0.96}
              onPress={handleRequestOtp}
              disabled={isButtonDisabled}
              style={[
                styles.requestButton,
                { backgroundColor: isButtonDisabled ? colors.surfaceVariant : BMapColors.navBlue },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Request OTP"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text
                    style={[
                      styles.requestButtonText,
                      { color: isButtonDisabled ? colors.textMuted : '#FFFFFF' },
                    ]}
                  >
                    Send OTP
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color={isButtonDisabled ? colors.textMuted : '#FFFFFF'}
                  />
                </View>
              )}
            </AnimatedPressableButton>

            {/* Security Note */}
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={BMapColors.secondary} />
              <Text style={[styles.securityText, { color: colors.textMuted }]}>
                Secure OTP · No password required
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentWrapper: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: 28,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BMapColors.navBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level2,
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    gap: 16,
    ...BMapElevation.level2,
  },
  cardHeader: {
    fontWeight: '700',
  },
  cardSubtext: {
    lineHeight: 18,
    marginTop: -8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
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
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level1,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -4,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
