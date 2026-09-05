import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BMapColors, BMapTypography } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice } from '@/utils/responsive';
import { FadeInView } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightActionPress?: () => void;
  rightActionLabel?: string;
  accentColor?: string;
}

export function HeaderBar({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightActionIcon,
  onRightActionPress,
  rightActionLabel,
  accentColor,
}: HeaderBarProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <AnimatedPressableButton
            pressScale={0.85}
            onPress={handleBack}
            style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
          >
            <Ionicons name="arrow-back" size={isSmallDevice ? 18 : 20} color={accentColor || colors.text} />
          </AnimatedPressableButton>
        )}
        <FadeInView delay={80} from="left" slideDistance={12}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                BMapTypography.titleLarge,
                {
                  color: colors.text,
                  fontSize: moderateScale(isSmallDevice ? 16 : 18),
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  BMapTypography.bodySmall,
                  {
                    color: colors.textSecondary,
                    fontSize: moderateScale(isSmallDevice ? 11 : 12),
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </FadeInView>
      </View>

      {(rightActionIcon || rightActionLabel) && (
        <AnimatedPressableButton
          pressScale={0.9}
          onPress={onRightActionPress}
          style={styles.rightButton}
        >
          {rightActionIcon && (
            <Ionicons name={rightActionIcon} size={isSmallDevice ? 18 : 22} color={accentColor || BMapColors.primary} />
          )}
          {rightActionLabel && (
            <Text
              style={[
                styles.rightLabel,
                {
                  color: accentColor || BMapColors.primary,
                  fontSize: moderateScale(isSmallDevice ? 12 : 14),
                },
              ]}
            >
              {rightActionLabel}
            </Text>
          )}
        </AnimatedPressableButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: isSmallDevice ? 52 : 60,
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: isSmallDevice ? 8 : 12,
  },
  iconButton: {
    width: isSmallDevice ? 34 : 40,
    height: isSmallDevice ? 34 : 40,
    borderRadius: isSmallDevice ? 17 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 1,
  },
  rightButton: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightLabel: {
    fontWeight: '700',
  },
});
