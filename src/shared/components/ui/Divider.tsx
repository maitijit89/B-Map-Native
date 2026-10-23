import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeColors } from '../../hooks';
import { Spacing, Typography } from '../../constants/tokens';

export interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  orientation = 'horizontal',
  style,
}) => {
  const colors = useThemeColors();

  if (orientation === 'vertical') {
    return <View style={[styles.verticalLine, { backgroundColor: colors.outlineVariant }, style]} />;
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={[styles.line, { backgroundColor: colors.outlineVariant }]} />
        <Text style={[styles.labelText, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: colors.outlineVariant }]} />
      </View>
    );
  }

  return <View style={[styles.line, { backgroundColor: colors.outlineVariant }, style]} />;
};

const styles = StyleSheet.create({
  line: {
    flex: 1,
    height: 1,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  labelText: {
    ...Typography.labelSmall,
    paddingHorizontal: Spacing.md,
    textTransform: 'uppercase',
  },
});

export default Divider;
