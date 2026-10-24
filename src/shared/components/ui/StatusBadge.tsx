import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  status: StatusType;
  label: string;
  pulsing?: boolean;
  size?: StatusBadgeSize;
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({
  status = 'neutral',
  label,
  pulsing = false,
  size = 'md',
  style,
}) => {
  const colors = useThemeColors();
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!pulsing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, pulseAnim]);

  const getStatusColors = (): { bg: string; dot: string; text: string } => {
    switch (status) {
      case 'success':
        return {
          bg: colors.secondaryContainer,
          dot: colors.secondary,
          text: colors.onSecondaryContainer,
        };
      case 'warning':
        return {
          bg: colors.tertiaryContainer,
          dot: colors.tertiary,
          text: colors.onTertiaryContainer,
        };
      case 'error':
        return {
          bg: colors.errorContainer,
          dot: colors.error,
          text: colors.onErrorContainer,
        };
      case 'info':
        return {
          bg: colors.primaryContainer,
          dot: colors.primary,
          text: colors.onPrimaryContainer,
        };
      case 'neutral':
      default:
        return {
          bg: colors.surfaceContainerHigh,
          dot: colors.outline,
          text: colors.onSurfaceVariant,
        };
    }
  };

  const statusColors = getStatusColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: statusColors.bg,
          paddingHorizontal: isSm ? Spacing.xs + 2 : Spacing.sm + 2,
          paddingVertical: isSm ? 2 : 4,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: statusColors.dot,
            width: isSm ? 5 : 7,
            height: isSm ? 5 : 7,
            borderRadius: isSm ? 2.5 : 3.5,
            opacity: pulsing ? pulseAnim : 1,
          },
        ]}
      />
      <Text
        style={[
          isSm ? styles.textSm : styles.textMd,
          { color: statusColors.text },
        ]}>
        {label}
      </Text>
    </View>
  );
});

StatusBadge.displayName = 'StatusBadge';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 5,
  },
  textSm: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textMd: {
    ...Typography.labelMedium,
    fontWeight: '600',
  },
});

export default StatusBadge;
