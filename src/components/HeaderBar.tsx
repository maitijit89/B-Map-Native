import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BMapColors, BMapTypography } from '@/constants/bmap-theme';

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
          <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={accentColor || colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, BMapTypography.titleLarge, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {(rightActionIcon || rightActionLabel) && (
        <TouchableOpacity activeOpacity={0.7} onPress={onRightActionPress} style={styles.rightButton}>
          {rightActionIcon && <Ionicons name={rightActionIcon} size={22} color={accentColor || BMapColors.primary} />}
          {rightActionLabel && (
            <Text style={[styles.rightLabel, { color: accentColor || BMapColors.primary }]}>
              {rightActionLabel}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
