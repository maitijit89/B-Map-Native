import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { verifyOtp, requestEmailOtp } from '@/services/auth';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90); // 01:30
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // 90-second countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    if (isLocked) return;

    const newOtp = [...otp];
    // Handle paste of full 6 digit string
    if (text.length > 1) {
      const pasted = text.replace(/[^0-9]/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(5, pasted.length);
      inputRefs.current[nextIndex]?.focus();
      if (pasted.length === 6) {
        verifyCode(newOtp.join(''));
      }
      return;
    }

    const char = text.replace(/[^0-9]/g, '');
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, verify
    if (char && index === 5 && newOtp.every(d => d !== '')) {
      verifyCode(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code: string) => {
    if (isLocked) return;

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const userEmail = email || 'user@bmap.in';
      const res = await verifyOtp(userEmail, code);

      if (res.success) {
        router.replace('/(tabs)' as any);
      } else {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);

        if (attempts >= 5) {
          setIsLocked(true);
          setErrorMessage('Account locked for 15 minutes due to 5 failed attempts.');
        } else {
          setErrorMessage(`Invalid OTP. ${5 - attempts} attempts remaining.`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (secondsRemaining > 0 || isLocked) return;
    setOtp(['', '', '', '', '', '']);
    setErrorMessage(null);
    setSecondsRemaining(90);
    inputRefs.current[0]?.focus();

    if (email) {
      await requestEmailOtp(email);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="cellphone-key" size={36} color={BMapColors.primary} />
          </View>

          <Text style={[styles.title, BMapTypography.headlineMedium, { color: colors.text }]}>
            Verify OTP Code
          </Text>

          <Text style={[styles.subtitle, BMapTypography.bodyMedium, { color: colors.textSecondary }]}>
            OTP sent to <Text style={[styles.emailHighlight, { color: colors.text }]}>{email || 'your email'}</Text>
          </Text>

          {/* Lockout or Error Warning Banner */}
          {isLocked && (
            <View style={styles.lockoutBanner}>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <Text style={styles.lockoutBannerText}>
                Account locked for 15 minutes due to 5 failed attempts.
              </Text>
            </View>
          )}

          {!isLocked && errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}>
              <Ionicons name="alert-circle" size={18} color="#C62828" />
              <Text style={[styles.errorBannerText, { color: '#C62828' }]}>{errorMessage}</Text>
            </View>
          )}

          {/* 6-Digit OTP Verification Box */}
          <View style={styles.otpGrid}>
            {otp.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: digit
                      ? BMapColors.primary
                      : isLocked
                      ? '#E53935'
                      : colors.border,
                    color: colors.text,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                editable={!isLocked && !isVerifying}
                selectTextOnFocus={true}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Activity Indicator when verifying */}
          {isVerifying && (
            <View style={styles.verifyingIndicator}>
              <ActivityIndicator size="large" color={BMapColors.primary} />
              <Text style={[styles.verifyingText, { color: colors.textSecondary }]}>
                Verifying OTP credentials...
              </Text>
            </View>
          )}

          {/* Resend Logic & Countdown Timer */}
          <View style={styles.resendContainer}>
            {secondsRemaining > 0 ? (
              <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                Resend code in <Text style={[styles.timerBold, { color: BMapColors.primary }]}>{formatTimer(secondsRemaining)}</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isLocked}
                style={styles.resendButton}
              >
                <Ionicons name="refresh" size={16} color={BMapColors.primary} />
                <Text style={[styles.resendButtonText, { color: BMapColors.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emailHighlight: {
    fontWeight: '700',
  },
  lockoutBanner: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    ...BMapElevation.level2,
  },
  lockoutBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  verifyingIndicator: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  verifyingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
  },
  timerBold: {
    fontWeight: '700',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
