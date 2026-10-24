import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { haptics } from '@/shared/utils/haptics';
import {
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Fingerprint,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Button,
  Badge,
  Input,
  Divider,
} from '@/shared/components/ui';

const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AEtjO1VN3H4tzgmXs2ZRa0LcSjl67XdRLkUoaSPeH_CWrj-KjJJn-jxm5Ry5BCuQEgauBA2ThJbop3aKeUWeQ6SIdguokZoxbQ03I2vdvAUunO_QvAU8m1DCVcEXQYq8TxLTr2sWs2k07ep1c3xBFVp7H3inSTj60j6IHieJAYPLhMEQKWUapTBKMbNFv4M-1wMcH_cGS00_NluNZE-s9nOPbjxB6lGgQyLc1ATdoWESAGL1bzNPnljLN2abiRf-';

type AuthMode = 'login' | 'signup' | 'otp';

const triggerHaptic = () => {
  haptics.light();
};

export default function AuthScreen() {
  const colors = useThemeColors();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [name, setName] = useState('Aarav Sharma');
  const [age, setAge] = useState('26');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState(['4', '9', '7', '5', '1', '1']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mode === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const handleSendOtp = (isSignup: boolean) => {
    triggerHaptic();
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address to receive your 6-digit OTP.');
      return;
    }
    if (isSignup && (!name || !phone)) {
      Alert.alert('Incomplete Details', 'Please provide your full name and phone number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMode('otp');
      setTimer(30);
      setCanResend(false);
      Alert.alert(
        'OTP Dispatched! ✉️',
        `A 6-digit verification code has been dispatched to ${email}. Use test code 497511.`
      );
    }, 600);
  };

  const handleVerifyOtp = () => {
    triggerHaptic();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Identity Verified! 🎉',
        'Welcome to B-Map Sovereign Navigation. Session JWT token established.',
        [
          {
            text: 'Launch Explore',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    }, 700);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    triggerHaptic();
    setTimer(30);
    setCanResend(false);
    Alert.alert('Code Resent', `A fresh 6-digit code was dispatched to ${email}.`);
  };

  const handleBiometricMock = () => {
    triggerHaptic();
    Alert.alert(
      'Biometric Verification',
      'Fingerprint / Face ID scanned successfully. Authenticating session as Aarav Sharma.',
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="Sovereign Identity"
        onBackPress={() => {
          triggerHaptic();
          router.back();
        }}
        rightAction={
          <TouchableOpacity
            style={[styles.guestBtn, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => {
              triggerHaptic();
              router.replace('/(tabs)');
            }}
            accessibilityRole="button"
            accessibilityLabel="Skip authentication"
            activeOpacity={0.7}>
            <Text style={[styles.guestText, { color: colors.primary }]}>Skip</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <Animated.View entering={FadeInDown.duration(280).springify().damping(16)}>
          <Card variant="elevated" padding="md" style={styles.brandCard}>
            <Image source={{ uri: LOGO_URI }} style={styles.brandLogo} resizeMode="contain" />
            <View style={{ flex: 1, gap: 4 }}>
              <Badge label="ISRO NavIC Verified System" variant="primary" size="sm" />
              <Text style={[styles.brandTitle, { color: colors.onSurface }]}>
                B-Map Identity Portal
              </Text>
              <Text style={[styles.brandSub, { color: colors.onSurfaceVariant }]}>
                {mode === 'otp'
                  ? 'Two-factor cryptographic verification'
                  : mode === 'signup'
                  ? 'Create your sovereign navigation account'
                  : 'Passwordless login with secure email OTP'}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Tab Switcher */}
        {mode !== 'otp' && (
          <View
            style={[
              styles.tabTrack,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === 'login' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.surfaceContainerLowest },
                ],
              ]}
              onPress={() => {
                triggerHaptic();
                setMode('login');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'login' }}
              accessibilityLabel="Sign In"
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  { color: colors.onSurfaceVariant },
                  mode === 'login' && { color: colors.primary, fontWeight: '700' },
                ]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === 'signup' && [
                  styles.tabBtnActive,
                  { backgroundColor: colors.surfaceContainerLowest },
                ],
              ]}
              onPress={() => {
                triggerHaptic();
                setMode('signup');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'signup' }}
              accessibilityLabel="Create Account"
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  { color: colors.onSurfaceVariant },
                  mode === 'signup' && { color: colors.primary, fontWeight: '700' },
                ]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <Card variant="elevated" padding="lg" style={styles.formCard}>
            <Input
              label="Registered Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.primary} />}
            />

            <Button
              title={isLoading ? 'Dispatching OTP...' : 'Send Secure Login OTP'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={<KeyRound size={18} color="#fff" />}
              onPress={() => handleSendOtp(false)}
            />

            <Divider label="OR QUICK LOGIN" />

            <Button
              title="Authenticate with Biometrics / Face ID"
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<Fingerprint size={20} color={colors.primary} />}
              onPress={handleBiometricMock}
            />
          </Card>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <Card variant="elevated" padding="lg" style={styles.formCard}>
            <Input
              label="Full Legal Name"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color={colors.primary} />}
            />

            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Age"
                  placeholder="26"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ flex: 2, marginLeft: Spacing.sm }}>
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={18} color={colors.primary} />}
                />
              </View>
            </View>

            <Input
              label="Email Address"
              placeholder="aarav.sharma@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.primary} />}
            />

            <Button
              title={isLoading ? 'Registering...' : 'Register & Receive OTP'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={<Lock size={18} color="#fff" />}
              onPress={() => handleSendOtp(true)}
            />
          </Card>
        )}

        {/* OTP Verification */}
        {mode === 'otp' && (
          <Card variant="elevated" padding="lg" style={styles.formCard}>
            <View style={styles.otpHeaderBox}>
              <Text style={[styles.otpInstruction, { color: colors.onSurfaceVariant }]}>
                Enter the 6-digit code sent to:
              </Text>
              <Text style={[styles.otpEmailBadge, { color: colors.primary }]}>{email}</Text>
            </View>

            {/* 6 Digit Pin Boxes */}
            <View style={styles.otpBoxRow}>
              {otp.map((digit, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: colors.surfaceContainerLow,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    const next = [...otp];
                    next[idx] = String((Number(next[idx]) + 1) % 10);
                    setOtp(next);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`OTP digit ${idx + 1}, current value ${digit}`}
                  activeOpacity={0.7}>
                  <Text style={[styles.otpDigit, { color: colors.onSurface }]}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={isLoading ? 'Verifying...' : 'Verify OTP & Log In'}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={<CheckCircle2 size={18} color="#fff" />}
              onPress={handleVerifyOtp}
            />

            <View style={styles.resendRow}>
              <Text style={[styles.timerText, { color: colors.onSurfaceVariant }]}>
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Did not receive code?'}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!canResend}
                accessibilityRole="button"
                accessibilityLabel="Resend OTP code"
                style={styles.resendBtn}>
                <RefreshCw
                  size={13}
                  color={canResend ? colors.primary : colors.outline}
                />
                <Text
                  style={[
                    styles.resendBtnText,
                    { color: canResend ? colors.primary : colors.outline },
                  ]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changeEmailBtn}
              onPress={() => {
                triggerHaptic();
                setMode('login');
              }}
              accessibilityRole="button"
              accessibilityLabel="Change email or sign in with different ID"
              activeOpacity={0.7}>
              <Text style={[styles.changeEmailText, { color: colors.onSurfaceVariant }]}>
                Change Email / Sign in with different ID
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Security & Sovereign Compliance Footnote */}
        <Card variant="outlined" padding="md" style={styles.securityBox}>
          <ShieldCheck size={20} color={colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.securityTitle, { color: colors.onSurface }]}>
              DPDP Act 2023 Compliant
            </Text>
            <Text style={[styles.securityDesc, { color: colors.onSurfaceVariant }]}>
              All user coordinates and telematics data are encrypted on sovereign Indian cloud
              infrastructure with differential privacy spatial obfuscation.
            </Text>
          </View>
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
  },
  guestText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  brandLogo: {
    width: 52,
    height: 52,
  },
  brandTitle: {
    ...Typography.titleLarge,
    fontWeight: '800',
    fontSize: 18,
  },
  brandSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  tabTrack: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: {
    ...Shadows.xs,
  },
  tabText: {
    ...Typography.labelLarge,
    fontSize: 13,
  },
  formCard: {
    gap: 12,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  otpHeaderBox: {
    alignItems: 'center',
    gap: 4,
    marginVertical: Spacing.xs,
  },
  otpInstruction: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  otpEmailBadge: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: Spacing.xs,
  },
  timerText: {
    ...Typography.bodySmall,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendBtnText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  changeEmailBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  changeEmailText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityTitle: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  securityDesc: {
    ...Typography.bodySmall,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
    opacity: 0.85,
  },
});
