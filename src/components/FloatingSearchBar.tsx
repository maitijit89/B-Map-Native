import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  useColorScheme,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BMapColors,
  BMapElevation,
  BMapAnimation,
} from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';
import { triggerHaptic } from '@/utils/haptics';
import { useLanguage } from '@/contexts/LanguageContext';

interface FloatingSearchBarProps {
  /** Current search text value */
  value: string;
  /** Text change handler */
  onChangeText: (text: string) => void;
  /** Submit / search handler */
  onSubmit?: () => void;
  /** Voice search button press */
  onVoicePress?: () => void;
  /** AI assistant button press */
  onAIPress?: () => void;
  /** Left menu / profile button press */
  onMenuPress?: () => void;
  /** City selector button press */
  onCityPress?: () => void;
  /** Current city name */
  cityName?: string;
  /** Weather string e.g. "28°C" */
  weatherText?: string;
  /** AQI string e.g. "AQI 48" */
  aqiText?: string;
  /** Active language native name e.g. "हिन्दी" */
  languageName?: string;
  /** Language pill press */
  onLanguagePress?: () => void;
  /** Placeholder text override */
  placeholder?: string;
  /** Additional TextInput props */
  textInputProps?: Partial<TextInputProps>;
}

const SEARCH_HINTS = [
  'Search places, DIGIPIN, routes…',
  '⚡ EV fast chargers nearby…',
  '☕ Cafes with parking in CP…',
  '🏥 24x7 Emergency Trauma Centers…',
  '🚇 Metro Yellow Line stations…',
];

/**
 * FloatingSearchBar — Baidu-style acrylic minimalist search capsule.
 *
 * Combines an integrated city indicator, animated cycling search hints,
 * voice search wave, Baidu AI assistant, and frosted acrylic blur backdrop.
 */
export function FloatingSearchBar({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  onAIPress,
  onMenuPress,
  onCityPress,
  cityName = 'Delhi',
  weatherText = '29°C',
  aqiText = 'AQI 48',
  languageName,
  onLanguagePress,
  placeholder,
  textInputProps,
}: FloatingSearchBarProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;
  const { languageMeta, t } = useLanguage();
  const effectiveLangName = languageName || languageMeta.nativeName || 'हिन्दी';

  // Animated focus state
  const focusProgress = useSharedValue(0);

  // Dynamic cycling placeholder hint index
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    if (placeholder) return;
    const interval = setInterval(() => {
      setHintIndex(prev => (prev + 1) % SEARCH_HINTS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [placeholder]);

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: BMapAnimation.timing.fast });
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: BMapAnimation.timing.fast });
  };

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [
        isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        '#4E6EF2', // Baidu Digital Blue on focus
      ]
    ),
  }));

  const hasText = value.length > 0;

  const handleVoice = () => {
    triggerHaptic.light();
    onVoicePress?.();
  };

  const handleAI = () => {
    triggerHaptic.light();
    onAIPress?.();
  };

  const handleClear = () => {
    triggerHaptic.selection();
    onChangeText('');
  };

  const activePlaceholder = placeholder ?? (hintIndex === 0 ? t('search_placeholder') : SEARCH_HINTS[hintIndex]);

  return (
    <View style={styles.outerWrapper}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.surface },
          borderAnimatedStyle,
        ]}
        accessibilityRole="search"
        accessibilityLabel="Baidu style search capsule"
      >
        {/* Solid content row */}
        <View style={[styles.contentRow, { backgroundColor: colors.surface }]}>
          {/* City / Location pill button (Baidu style) */}
          <AnimatedPressableButton
            pressScale={0.92}
            onPress={onCityPress ?? onMenuPress}
            style={styles.cityPill}
            accessibilityRole="button"
            accessibilityLabel={`City: ${cityName}`}
          >
            <Text
              style={[
                styles.cityName,
                { color: colors.text, fontSize: moderateScale(isSmallDevice ? 11.5 : 12.5) },
              ]}
              numberOfLines={1}
            >
              {cityName}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={colors.textSecondary}
            />
          </AnimatedPressableButton>

          {/* Subtle vertical divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
            ]}
          />

          {/* Search text input */}
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: moderateScale(isSmallDevice ? 12.5 : 13.5),
              },
            ]}
            placeholder={activePlaceholder}
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search input"
            {...textInputProps}
          />

          {/* Right actions: Clear or Voice + AI */}
          {hasText ? (
            <AnimatedPressableButton
              pressScale={0.82}
              onPress={handleClear}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={isSmallDevice ? 18 : 20}
                color={colors.textSecondary}
              />
            </AnimatedPressableButton>
          ) : (
            <View style={styles.rightActions}>
              {/* Voice wave search */}
              <AnimatedPressableButton
                pressScale={0.82}
                onPress={handleVoice}
                style={styles.iconBtn}
                accessibilityRole="button"
                accessibilityLabel="Voice search"
              >
                <Ionicons
                  name="mic"
                  size={isSmallDevice ? 18 : 20}
                  color="#4E6EF2" // Baidu Blue
                />
              </AnimatedPressableButton>

              {/* Baidu AI assistant button */}
              <AnimatedPressableButton
                pressScale={0.82}
                onPress={handleAI}
                style={[
                  styles.aiBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(78, 110, 242, 0.20)'
                      : 'rgba(78, 110, 242, 0.12)',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="AI routing assistant"
              >
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={isSmallDevice ? 16 : 18}
                  color="#4E6EF2"
                />
              </AnimatedPressableButton>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Mini Weather & Language Pill */}
      <View style={styles.subStatusRow}>
        <View
          style={[
            styles.weatherChip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="partly-sunny" size={12} color="#F59E0B" />
          <Text
            style={[
              styles.weatherText,
              { color: colors.textSecondary },
            ]}
          >
            {weatherText} • {aqiText}
          </Text>
          <View style={styles.trafficDotSmall} />
          <Text style={[styles.trafficTextSmall, { color: '#059669' }]}>
            Smooth
          </Text>
        </View>

        {/* Language Indicator Pill */}
        <AnimatedPressableButton
          pressScale={0.92}
          onPress={() => {
            triggerHaptic.selection();
            onLanguagePress?.();
          }}
          style={[
            styles.langIndicatorChip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Active language: ${effectiveLangName}`}
        >
          <Ionicons name="language" size={12} color="#2563EB" />
          <Text style={[styles.langChipText, { color: colors.text }]}>
            {effectiveLangName}
          </Text>
          <Ionicons name="chevron-down" size={10} color={colors.textSecondary} />
        </AnimatedPressableButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    gap: 6,
  },
  container: {
    height: isSmallDevice ? 48 : 52,
    borderRadius: 26,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...BMapElevation.level2,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    borderRadius: 26,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cityName: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontWeight: '500',
    paddingHorizontal: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    ...BMapElevation.level1,
  },
  weatherText: {
    fontSize: moderateScale(10.5),
    fontWeight: '600',
  },
  trafficDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginLeft: 2,
  },
  trafficTextSmall: {
    fontSize: moderateScale(10.5),
    fontWeight: '700',
  },
  langIndicatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 'auto',
    ...BMapElevation.level1,
  },
  langChipText: {
    fontSize: moderateScale(10.5),
    fontWeight: '700',
  },
});
