import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Spacing, Typography } from '../../constants/tokens';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  actionIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  actionIcon,
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.onSurface }]}>
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

      {actionText || actionIcon ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionText || title}
          style={styles.actionButton}>
          {actionText ? (
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {actionText}
            </Text>
          ) : null}
          {actionIcon ? (
            <View style={actionText ? styles.actionIconWithText : undefined}>
              {actionIcon}
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleWrapper: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  actionText: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },
  actionIconWithText: {
    marginLeft: 4,
  },
});

export default SectionHeader;
