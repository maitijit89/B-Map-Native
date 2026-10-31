import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Mic,
  X,
  Check,
  Globe,
  CornerUpRight,
  Zap,
  Utensils,
  TriangleAlert,
  Navigation,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import { Button } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';
import {
  speechService,
  voiceListenerService,
  voiceLanguageService,
  VoiceLanguageCode,
  VoiceListeningState,
  VoiceRecognitionResult,
} from '@/shared/services';

interface VoiceListeningModalProps {
  visible: boolean;
  onClose: () => void;
  onResult?: (result: VoiceRecognitionResult) => void;
  initialPrompt?: string;
}

export function VoiceListeningModal({
  visible,
  onClose,
  onResult,
  initialPrompt,
}: VoiceListeningModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<VoiceListeningState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [activeLang, setActiveLang] = useState<VoiceLanguageCode>(
    voiceLanguageService.getLanguage()
  );
  const [lastResult, setLastResult] = useState<VoiceRecognitionResult | null>(null);

  // Audio waveform animation heights for 5 distinct frequency bars
  const barHeight1 = useSharedValue(12);
  const barHeight2 = useSharedValue(24);
  const barHeight3 = useSharedValue(38);
  const barHeight4 = useSharedValue(22);
  const barHeight5 = useSharedValue(14);
  const pulseScale = useSharedValue(1);

  // Connect to VoiceListenerService
  useEffect(() => {
    if (!visible) {
      voiceListenerService.cancelListening();
      return;
    }

    // Auto-start listening on modal open
    voiceListenerService.startListening(initialPrompt);

    const unsubscribeState = voiceListenerService.subscribeState((newState, interim) => {
      setState(newState);
      if (interim !== undefined) {
        setTranscript(interim);
      }
    });

    const unsubscribeAudio = voiceListenerService.subscribeAudioLevel((level) => {
      // Modulate waveform heights based on live amplitude
      const amp = Math.max(0.1, level);
      barHeight1.value = withTiming(10 + amp * 32, { duration: 60 });
      barHeight2.value = withTiming(14 + amp * 48, { duration: 60 });
      barHeight3.value = withTiming(18 + amp * 64, { duration: 60 });
      barHeight4.value = withTiming(14 + amp * 44, { duration: 60 });
      barHeight5.value = withTiming(10 + amp * 30, { duration: 60 });
    });

    const unsubscribeResult = voiceListenerService.subscribeResult((res) => {
      setLastResult(res);
      onResult?.(res);
    });

    return () => {
      unsubscribeState();
      unsubscribeAudio();
      unsubscribeResult();
      voiceListenerService.cancelListening();
    };
  }, [visible, initialPrompt, onResult, barHeight1, barHeight2, barHeight3, barHeight4, barHeight5]);

  // Mic ring pulse effect when actively listening
  useEffect(() => {
    if (state === 'listening') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.22, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1.0, { duration: 200 });
    }
  }, [state, pulseScale]);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const bar1Style = useAnimatedStyle(() => ({ height: barHeight1.value }));
  const bar2Style = useAnimatedStyle(() => ({ height: barHeight2.value }));
  const bar3Style = useAnimatedStyle(() => ({ height: barHeight3.value }));
  const bar4Style = useAnimatedStyle(() => ({ height: barHeight4.value }));
  const bar5Style = useAnimatedStyle(() => ({ height: barHeight5.value }));

  const handleLanguageSwitch = useCallback(async (code: VoiceLanguageCode) => {
    haptics.selection();
    setActiveLang(code);
    await voiceLanguageService.setLanguage(code);
    voiceListenerService.cancelListening();
    setTimeout(() => {
      voiceListenerService.startListening();
    }, 200);
  }, []);

  const handleQuickCommand = useCallback((commandText: string) => {
    haptics.medium();
    voiceListenerService.cancelListening();
    voiceListenerService.startListening(commandText);
  }, []);

  const handleExecuteIntent = useCallback(() => {
    if (!lastResult) return;
    haptics.medium();
    onClose();
    if (lastResult.intent.targetRoute) {
      router.push(lastResult.intent.targetRoute as any);
    }
  }, [lastResult, onClose]);

  const handleStopOrClose = useCallback(() => {
    if (state === 'listening') {
      voiceListenerService.stopListening();
    } else {
      onClose();
    }
  }, [state, onClose]);

  const langInfo = voiceLanguageService.getLanguageInfo(activeLang);

  const quickSuggestions = useMemo(() => {
    switch (activeLang) {
      case 'bn':
        return [
          {
            text: 'কাছের নিরামিষ ধাবা এবং রেস্টরুম দেখাও',
            label: 'নিরামিষ ধাবা',
            icon: <Utensils size={12} color={colors.primary} />,
          },
          {
            text: 'নিকটতম ইভি চার্জিং স্টেশন কোথায়',
            label: '১৫০kW ইভি চার্জার',
            icon: <Zap size={12} color="#00C06D" />,
          },
          {
            text: 'ডিএলএফ সাইবার হাবে চলো',
            label: 'সাইবার হাব',
            icon: <Navigation size={12} color="#0096FF" />,
          },
          {
            text: 'রাস্তায় খানাখন্দ রিপোর্ট করো',
            label: 'বিপদ রিপোর্ট',
            icon: <TriangleAlert size={12} color="#F44336" />,
          },
        ];
      case 'hi':
        return [
          {
            text: 'रास्ते में शुद्ध शाकाहारी ढाबा ढूंढो',
            label: 'शाकाहारी ढाबा',
            icon: <Utensils size={12} color={colors.primary} />,
          },
          {
            text: 'निकटतम 150kW ईवी फास्ट चार्जर बताओ',
            label: '150kW ईवी चार्जर',
            icon: <Zap size={12} color="#00C06D" />,
          },
          {
            text: 'डीएलएफ साइबर हब का रास्ता दिखाओ',
            label: 'साइबर हब',
            icon: <Navigation size={12} color="#0096FF" />,
          },
          {
            text: 'सड़क पर गड्ढा रिपोर्ट करो',
            label: 'खतरा रिपोर्ट',
            icon: <TriangleAlert size={12} color="#F44336" />,
          },
        ];
      default:
        return [
          {
            text: 'Find vegetarian dhaba with clean restrooms on NH-48',
            label: 'Vegetarian Dhaba',
            icon: <Utensils size={12} color={colors.primary} />,
          },
          {
            text: 'Find 150kW CCS2 EV fast charger',
            label: '150kW EV Charger',
            icon: <Zap size={12} color="#00C06D" />,
          },
          {
            text: 'Navigate to DLF Cyber Hub Gurugram',
            label: 'Cyber Hub',
            icon: <Navigation size={12} color="#0096FF" />,
          },
          {
            text: 'Report pothole in right lane',
            label: 'Report Hazard',
            icon: <TriangleAlert size={12} color="#F44336" />,
          },
        ];
    }
  }, [activeLang, colors.primary]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.surfaceContainerHigh,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}>
          {/* Top Bar with Live Indicator & Close */}
          <View style={styles.sheetHeader}>
            <View style={styles.statusIndicatorRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      state === 'listening'
                        ? colors.error
                        : state === 'success'
                        ? colors.trafficGreen
                        : colors.primary,
                  },
                ]}
              />
              <Text style={[styles.statusTitle, { color: colors.onSurface }]}>
                {state === 'listening'
                  ? 'Listening...'
                  : state === 'processing'
                  ? 'Recognizing Intent...'
                  : state === 'success'
                  ? 'Command Recognized'
                  : 'Ready'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={[
                  styles.voiceGenderPill,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.surfaceContainerHigh,
                  },
                ]}>
                <Text style={[styles.voiceGenderPillText, { color: colors.primary }]}>
                  {speechService.getVoiceGender() === 'female' ? '♀ Female' : '♂ Male'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close voice listener"
                style={[styles.closeBtn, { backgroundColor: colors.surfaceContainerLow }]}>
                <X size={18} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vernacular Language Switcher Chips */}
          <View style={styles.langChipsRow}>
            {(['en', 'bn', 'hi'] as VoiceLanguageCode[]).map((code) => {
              const isSelected = activeLang === code;
              const info = voiceLanguageService.getLanguageInfo(code);
              return (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryContainer
                        : colors.surfaceContainerLow,
                      borderColor: isSelected ? colors.primary : colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={() => handleLanguageSwitch(code)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${info.nativeName}`}>
                  <Globe size={11} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                  <Text
                    style={[
                      styles.langChipText,
                      { color: isSelected ? colors.primary : colors.onSurfaceVariant },
                      isSelected && { fontWeight: '800' },
                    ]}>
                    {info.nativeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Center Mic & Dynamic Audio Waveform */}
          <View style={styles.centerSection}>
            <View style={styles.micHaloWrapper}>
              <Animated.View
                style={[
                  styles.micPulseRing,
                  pulseRingStyle,
                  {
                    backgroundColor:
                      state === 'listening'
                        ? colors.primary + '25'
                        : colors.trafficGreen + '25',
                  },
                ]}
              />
              <TouchableOpacity
                style={[
                  styles.micMainButton,
                  {
                    backgroundColor:
                      state === 'listening' ? colors.primary : colors.surfaceContainerHigh,
                  },
                ]}
                onPress={handleStopOrClose}
                activeOpacity={0.85}>
                {state === 'success' ? (
                  <Check size={28} color="#fff" />
                ) : (
                  <Mic size={28} color={state === 'listening' ? '#fff' : colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            {/* 5-Bar Dynamic Audio Waveform */}
            <View style={styles.waveformRow}>
              <Animated.View style={[styles.waveBar, { backgroundColor: colors.primary }, bar1Style]} />
              <Animated.View style={[styles.waveBar, { backgroundColor: colors.primary }, bar2Style]} />
              <Animated.View style={[styles.waveBar, { backgroundColor: colors.primary }, bar3Style]} />
              <Animated.View style={[styles.waveBar, { backgroundColor: colors.primary }, bar4Style]} />
              <Animated.View style={[styles.waveBar, { backgroundColor: colors.primary }, bar5Style]} />
            </View>
          </View>

          {/* Real-Time Live Transcript Box */}
          <View
            style={[
              styles.transcriptCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.surfaceContainerHigh,
              },
            ]}>
            <Text
              style={[
                styles.transcriptText,
                { color: colors.onSurface },
                !transcript && { color: colors.onSurfaceVariant, fontStyle: 'italic' },
              ]}
              numberOfLines={3}>
              {transcript ? `“${transcript}”` : `Speak in ${langInfo.nativeName}...`}
            </Text>
          </View>

          {/* Quick Vernacular Preset Suggestion Chips */}
          <Text style={[styles.suggestionTitle, { color: colors.onSurfaceVariant }]}>
            POPULAR VOICE COMMANDS
          </Text>
          <View style={styles.suggestionsRow}>
            {quickSuggestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.suggestChip, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => handleQuickCommand(item.text)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.label}>
                {item.icon}
                <Text style={[styles.suggestText, { color: colors.onSurface }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Success Intent Bottom Action Button */}
          {state === 'success' && lastResult && (
            <View style={styles.actionButtonContainer}>
              <Button
                title={lastResult.intent.actionText}
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<CornerUpRight size={16} color="#fff" />}
                onPress={handleExecuteIntent}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceGenderPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  voiceGenderPillText: {
    ...Typography.labelSmall,
    fontWeight: '800',
    fontSize: 10,
  },
  langChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  langChipText: {
    fontSize: 11,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  micHaloWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  micPulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  micMainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 48,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
  },
  transcriptCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    minHeight: 64,
    justifyContent: 'center',
  },
  transcriptText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  suggestionTitle: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  suggestText: {
    ...Typography.labelSmall,
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonContainer: {
    marginTop: 4,
  },
});
