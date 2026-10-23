import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Spacing, Typography } from '../../constants/tokens';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  alignCenter?: boolean;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightAction,
  alignCenter = false,
  transparent = false,
  style,
  titleStyle,
}) => {
  const colors = useThemeColors();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        !transparent && {
          backgroundColor: colors.surfaceContainerLowest,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.surfaceContainerHigh,
        },
        style,
      ]}>
      <View style={styles.contentRow}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <ArrowLeft size={22} color={colors.onBackground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View
          style={[
            styles.titleContainer,
            alignCenter && styles.centerAligned,
          ]}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.onBackground }, titleStyle]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightActionContainer}>
          {rightAction || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  centerAligned: {
    alignItems: 'center',
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  rightActionContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default Header;
