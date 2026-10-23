import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Spacing, Typography } from '../../constants/tokens';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  showArrow = false,
  disabled = false,
  destructive = false,
  divider = false,
  style,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();

  const titleColor = destructive
    ? colors.error
    : disabled
    ? colors.outline
    : colors.onSurface;

  const content = (
    <View style={[styles.innerContainer, style]}>
      {leading ? <View style={styles.leadingContainer}>{leading}</View> : null}

      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={2}
            style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailingContainer}>
        {trailing}
        {showArrow ? (
          <ChevronRight
            size={18}
            color={colors.outline}
            style={styles.chevron}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.wrapper,
        divider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.outlineVariant,
        },
      ]}>
      {onPress ? (
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          style={styles.touchable}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  leadingContainer: {
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodyLarge,
    fontWeight: '500',
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});

export default ListItem;
