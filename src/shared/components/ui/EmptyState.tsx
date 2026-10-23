import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: colors.surfaceContainerLow },
          ]}>
          {icon}
        </View>
      ) : null}

      <Text
        style={[
          styles.title,
          { color: colors.onSurface },
        ]}>
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          { color: colors.onSurfaceVariant },
        ]}>
        {message}
      </Text>

      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button
            title={actionLabel}
            variant="primary"
            size="md"
            onPress={onAction}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: Spacing.lg,
  },
});

export default EmptyState;
