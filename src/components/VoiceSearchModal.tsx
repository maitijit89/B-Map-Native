import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BMapColors, BMapElevation } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import {
  IndianLanguageCode,
  INDIAN_LANGUAGES,
  ALL_INDIAN_LANGUAGES,
} from '@/services/languageService';
import { speakText, stopSpeaking } from '@/services/voiceGuidance';
import { triggerHaptic } from '@/utils/haptics';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  currentLanguage: IndianLanguageCode;
  onLanguageChange: (lang: IndianLanguageCode) => void;
}

// Single animated audio waveform bar
function WaveformBar({ delay, heightMultiplier }: { delay: number; heightMultiplier: number }) {
  const scaleY = useSharedValue(0.3);

  useEffect(() => {
    scaleY.value = withRepeat(
      withSequence(
        withTiming(1.2 * heightMultiplier, {
          duration: 350 + delay,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.25, {
          duration: 350 + delay,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [delay, heightMultiplier, scaleY]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return <Animated.View style={[styles.waveBar, barAnimatedStyle]} />;
}

export function VoiceSearchModal({
  visible,
  onClose,
  onSelectQuery,
  currentLanguage,
  onLanguageChange,
}: VoiceSearchModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const recognitionRef = useRef<any>(null);

  const langMeta = INDIAN_LANGUAGES[currentLanguage] || INDIAN_LANGUAGES.hi;

  const handleQueryConfirmed = useCallback(
    (query: string) => {
      triggerHaptic.success();
      // Localized spoken acknowledgment
      const ackText =
        currentLanguage === 'hi'
          ? `${query} के लिए रास्ता खोजा जा रहा है`
          : currentLanguage === 'ta'
          ? `${query} வழியைத் தேடுகிறது`
          : currentLanguage === 'kn'
          ? `${query} ಮಾರ್ಗವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ`
          : currentLanguage === 'bn'
          ? `${query} এর পথ খোঁজা হচ্ছে`
          : currentLanguage === 'te'
          ? `${query} మార్గం శోధించబడుతోంది`
          : currentLanguage === 'mr'
          ? `${query} साठी रस्ता शोधत आहे`
          : `Searching route for ${query}`;

      speakText(ackText, currentLanguage, () => {
        onSelectQuery(query);
        onClose();
      });
    },
    [currentLanguage, onSelectQuery, onClose]
  );

  // Initialize browser speech recognition if supported
  useEffect(() => {
    if (!visible) {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Non-blocking
        }
      }
      return;
    }

    setIsListening(true);
    setTranscript('');
    triggerHaptic.medium();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = langMeta.bcp47;
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            setTranscript(text);
            if (event.results[current].isFinal) {
              handleQueryConfirmed(text);
            }
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          // Fallback to suggestions
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Non-blocking
        }
      }
    };
  }, [visible, currentLanguage, langMeta.bcp47, handleQueryConfirmed]);

  const handleSuggestionPress = (suggestion: string) => {
    triggerHaptic.medium();
    setTranscript(suggestion);
    handleQueryConfirmed(suggestion);
  };

  const handleSelectLang = (code: IndianLanguageCode) => {
    triggerHaptic.selection();
    onLanguageChange(code);
    setShowLanguagePicker(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdropOverlay}>
        {/* Solid Voice Assistant Card */}
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Row: Language Pill & Close */}
          <View style={styles.headerRow}>
            {/* 12-Language Dropdown Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLanguagePicker(prev => !prev)}
              style={[
                styles.languagePill,
                {
                  backgroundColor: isDark ? '#1F2937' : '#EFF6FF',
                  borderColor: isDark ? '#374151' : '#DBEAFE',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Current language: ${langMeta.nativeName}`}
            >
              <Ionicons name="language" size={14} color="#2563EB" />
              <Text style={[styles.languagePillText, { color: '#2563EB' }]}>
                {langMeta.nativeName} ({langMeta.name})
              </Text>
              <Ionicons name="chevron-down" size={12} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}
              accessibilityRole="button"
              accessibilityLabel="Close voice modal"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Language Selection List Dropdown */}
          {showLanguagePicker ? (
            <View
              style={[
                styles.langPickerList,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.langListTitle, { color: colors.textSecondary }]}>
                Select Voice Language (12 Indian Languages)
              </Text>
              <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                {ALL_INDIAN_LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleSelectLang(lang.code)}
                    style={[
                      styles.langOptionItem,
                      currentLanguage === lang.code && {
                        backgroundColor: isDark ? '#1E2B58' : '#EFF6FF',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.langOptionNative,
                        {
                          color: currentLanguage === lang.code ? '#2563EB' : colors.text,
                          fontWeight: currentLanguage === lang.code ? '700' : '500',
                        },
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                    <Text style={[styles.langOptionEnglish, { color: colors.textSecondary }]}>
                      {lang.name}
                    </Text>
                    {currentLanguage === lang.code && (
                      <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <>
              {/* Mic & Waveform Animation Visual */}
              <View style={styles.visualCluster}>
                <View
                  style={[
                    styles.micCircle,
                    {
                      backgroundColor: isListening
                        ? isDark ? '#1E2B58' : '#EFF6FF'
                        : isDark ? '#1F2937' : '#F1F5F9',
                      borderColor: isListening ? '#2563EB' : colors.border,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isListening ? 'microphone' : 'microphone-off'}
                    size={36}
                    color={isListening ? '#2563EB' : colors.textMuted}
                  />
                </View>

                {/* 5-Bar Frequency Sound Wave */}
                <View style={styles.waveformContainer}>
                  <WaveformBar delay={0} heightMultiplier={0.9} />
                  <WaveformBar delay={80} heightMultiplier={1.4} />
                  <WaveformBar delay={160} heightMultiplier={1.9} />
                  <WaveformBar delay={80} heightMultiplier={1.3} />
                  <WaveformBar delay={40} heightMultiplier={0.8} />
                </View>

                {/* Spoken Text Transcript or Prompt */}
                <Text
                  style={[
                    styles.promptText,
                    {
                      color: transcript ? colors.text : colors.textSecondary,
                      fontWeight: transcript ? '700' : '500',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {transcript || langMeta.listeningPrompt}
                </Text>
              </View>

              {/* Quick Spoken Suggestion Chips */}
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>
                  TRY SAYING OR TAP TO NAVIGATE:
                </Text>
                <View style={styles.chipsRow}>
                  {langMeta.sampleQueries.map((query, idx) => (
                    <AnimatedPressableButton
                      key={`query-${idx}`}
                      pressScale={0.92}
                      onPress={() => handleSuggestionPress(query)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: colors.surfaceVariant,
                          borderColor: colors.border,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Query: ${query}`}
                    >
                      <Ionicons name="navigate-circle-outline" size={14} color="#2563EB" />
                      <Text style={[styles.chipText, { color: colors.text }]}>
                        {query}
                      </Text>
                    </AnimatedPressableButton>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    padding: isSmallDevice ? 12 : 16,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: isSmallDevice ? 16 : 20,
    gap: 16,
    ...BMapElevation.level3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  languagePillText: {
    fontSize: moderateScale(11.5),
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualCluster: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...BMapElevation.level2,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 6,
  },
  waveBar: {
    width: 5,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  promptText: {
    fontSize: moderateScale(isSmallDevice ? 13 : 14),
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  suggestionsContainer: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
    fontWeight: '600',
  },
  langPickerList: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  langListTitle: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 8,
  },
  langOptionNative: {
    fontSize: moderateScale(13),
  },
  langOptionEnglish: {
    flex: 1,
    fontSize: moderateScale(11),
  },
});
