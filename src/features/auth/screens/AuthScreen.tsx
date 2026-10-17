import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  KeyRound,
  RefreshCw,
  Fingerprint,
} from 'lucide-react-native';

const LOGO_URI =
  'https://lh3.googleusercontent.com/aida/AEtjO1VN3H4tzgmXs2ZRa0LcSjl67XdRLkUoaSPeH_CWrj-KjJJn-jxm5Ry5BCuQEgauBA2ThJbop3aKeUWeQ6SIdguokZoxbQ03I2vdvAUunO_QvAU8m1DCVcEXQYq8TxLTr2sWs2k07ep1c3xBFVp7H3inSTj60j6IHieJAYPLhMEQKWUapTBKMbNFv4M-1wMcH_cGS00_NluNZE-s9nOPbjxB6lGgQyLc1ATdoWESAGL1bzNPnljLN2abiRf-';

type AuthMode = 'login' | 'signup' | 'otp';

export default function AuthScreen() {
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
    setTimer(30);
    setCanResend(false);
    Alert.alert('Code Resent', `A fresh 6-digit code was dispatched to ${email}.`);
  };

  const handleBiometricMock = () => {
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#111C2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sovereign Identity</Text>
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}>
          <Text style={styles.guestText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandCard}>
          <Image source={{ uri: LOGO_URI }} style={styles.brandLogo} resizeMode="contain" />
          <View>
            <View style={styles.sovereignTag}>
              <Sparkles size={11} color="#0096FF" />
              <Text style={styles.sovereignTagText}>ISRO NavIC Verified System</Text>
            </View>
            <Text style={styles.brandTitle}>B-Map Identity Portal</Text>
            <Text style={styles.brandSub}>
              {mode === 'otp'
                ? 'Two-factor cryptographic verification'
                : mode === 'signup'
                ? 'Create your sovereign navigation account'
                : 'Passwordless login with secure email OTP'}
            </Text>
          </View>
        </View>

        {/* Tab Switcher (Login vs Sign Up) */}
        {mode !== 'otp' && (
          <View style={styles.tabTrack}>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
              onPress={() => setMode('login')}
              activeOpacity={0.8}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
              onPress={() => setMode('signup')}
              activeOpacity={0.8}>
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Body */}
        {mode === 'login' && (
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Registered Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#0096FF" />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#707884"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleSendOtp(false)}
              disabled={isLoading}
              activeOpacity={0.85}>
              <KeyRound size={18} color="#ffffff" />
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Dispatching OTP...' : 'Send Secure Login OTP'}
              </Text>
            </TouchableOpacity>

            {/* Biometric Quick Login */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK LOGIN</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricMock}
              activeOpacity={0.8}>
              <Fingerprint size={20} color="#0096FF" />
              <Text style={styles.biometricText}>Authenticate with Biometrics / Face ID</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'signup' && (
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Full Legal Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#0096FF" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter full name"
                placeholderTextColor="#707884"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formSectionTitle}>Age</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="26"
                    placeholderTextColor="#707884"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={{ flex: 2, marginLeft: 10 }}>
                <Text style={styles.formSectionTitle}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#0096FF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#707884"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.formSectionTitle}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#0096FF" />
              <TextInput
                style={styles.textInput}
                placeholder="aarav.sharma@example.com"
                placeholderTextColor="#707884"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handleSendOtp(true)}
              disabled={isLoading}
              activeOpacity={0.85}>
              <Lock size={18} color="#ffffff" />
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Registering...' : 'Register & Receive OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'otp' && (
          <View style={styles.formCard}>
            <View style={styles.otpHeaderBox}>
              <Text style={styles.otpInstruction}>
                Enter the 6-digit code sent to:
              </Text>
              <Text style={styles.otpEmailBadge}>{email}</Text>
            </View>

            {/* 6 Digit Pin Boxes */}
            <View style={styles.otpBoxRow}>
              {otp.map((digit, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.otpBox}
                  onPress={() => {
                    const next = [...otp];
                    next[idx] = String((Number(next[idx]) + 1) % 10);
                    setOtp(next);
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              activeOpacity={0.85}>
              <CheckCircle2 size={18} color="#ffffff" />
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Verifying...' : 'Verify OTP & Log In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.timerText}>
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Did not receive code?'}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!canResend}
                style={styles.resendBtn}>
                <RefreshCw size={13} color={canResend ? '#0096FF' : '#A0A8B4'} />
                <Text style={[styles.resendBtnText, { color: canResend ? '#0096FF' : '#A0A8B4' }]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changeEmailBtn}
              onPress={() => setMode('login')}
              activeOpacity={0.7}>
              <Text style={styles.changeEmailText}>Change Email / Sign in with different ID</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security & Sovereign Compliance Footnote */}
        <View style={styles.securityBox}>
          <ShieldCheck size={20} color="#00C06D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>DPDP Act 2023 Compliant</Text>
            <Text style={styles.securityDesc}>
              All user coordinates and telematics data are encrypted on sovereign Indian cloud
              infrastructure with differential privacy spatial obfuscation.
            </Text>
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3FF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111C2D',
  },
  guestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F3FF',
  },
  guestText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0096FF',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },

  /* Brand Card */
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  brandLogo: {
    width: 52,
    height: 52,
  },
  sovereignTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  sovereignTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0096FF',
    letterSpacing: 0.3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  brandSub: {
    fontSize: 11,
    color: '#707884',
    marginTop: 2,
    lineHeight: 15,
  },

  /* Tab Track */
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#E8EEFF',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#707884',
  },
  tabTextActive: {
    color: '#0096FF',
    fontWeight: '700',
  },

  /* Form Card */
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#D8E3FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111C2D',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Primary Action Button */
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EEFF',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0A8B4',
    letterSpacing: 0.5,
  },

  /* Biometric */
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F3FF',
    borderWidth: 1,
    borderColor: '#D8E3FB',
    borderRadius: 12,
    paddingVertical: 12,
  },
  biometricText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0096FF',
  },

  /* OTP Elements */
  otpHeaderBox: {
    alignItems: 'center',
    gap: 4,
    marginVertical: 6,
  },
  otpInstruction: {
    fontSize: 13,
    color: '#707884',
  },
  otpEmailBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0096FF',
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F0F3FF',
    borderWidth: 1.5,
    borderColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111C2D',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#707884',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  changeEmailBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  changeEmailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#707884',
    textDecorationLine: 'underline',
  },

  /* Security Footnote */
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F8EE',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 14,
    padding: 14,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
  securityDesc: {
    fontSize: 10,
    color: '#2E7D32',
    lineHeight: 14,
    marginTop: 2,
  },
});
