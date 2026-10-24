import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';

export interface MetricCardProps {
  value: string | number;
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MetricCard: React.FC<MetricCardProps> = memo(({
  value,
  label,
  unit,
  icon,
  trend,
  highlight = false,
  style,
}) => {
  const colors = useThemeColors();

  const containerStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: highlight
      ? colors.primaryContainer
      : colors.surfaceContainerLowest,
    borderColor: highlight ? colors.primary : colors.surfaceContainerHigh,
  }), [highlight, colors]);

  const labelColor = useMemo(() => ({
    color: highlight ? colors.onPrimaryContainer : colors.onSurfaceVariant,
  }), [highlight, colors]);

  const valueColor = useMemo(() => ({
    color: highlight ? colors.onPrimaryContainer : colors.onSurface,
  }), [highlight, colors]);

  const unitColor = useMemo(() => ({
    color: highlight ? colors.onPrimaryContainer : colors.onSurfaceVariant,
  }), [highlight, colors]);

  const trendColor = useMemo(() => {
    if (!trend) return undefined;
    return { color: trend.positive ? colors.secondary : colors.error };
  }, [trend, colors]);

  return (
    <View style={[styles.container, containerStyle, style]}>
      <View style={styles.headerRow}>
        <Text numberOfLines={1} style={[styles.label, labelColor]}>
          {label}
        </Text>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      </View>

      <View style={styles.valueRow}>
        <Text numberOfLines={1} style={[styles.value, valueColor]}>
          {value}
        </Text>
        {unit ? (
          <Text style={[styles.unit, unitColor]}>
            {' '}{unit}
          </Text>
        ) : null}
      </View>

      {trend ? (
        <View style={styles.trendRow}>
          <Text style={[styles.trendText, trendColor]}>
            {trend.positive ? '↑ ' : '↓ '}
            {trend.value}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

MetricCard.displayName = 'MetricCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    minWidth: 100,
    ...Shadows.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.labelSmall,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    flex: 1,
  },
  iconContainer: {
    marginLeft: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...Typography.titleLarge,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  trendRow: {
    marginTop: 4,
  },
  trendText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
});

export default MetricCard;
