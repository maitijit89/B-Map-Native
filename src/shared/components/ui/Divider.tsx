import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BMapColors } from '../../constants/BMapTheme';
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
  if (orientation === 'vertical') {
    return <View style={[styles.verticalLine, style]} />;
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, style]}>
        <View style={styles.line} />
        <Text style={styles.labelText}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.line, style]} />;
};

const styles = StyleSheet.create({
  line: {
    flex: 1,
    height: 1,
    backgroundColor: BMapColors.outlineVariant,
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: BMapColors.outlineVariant,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  labelText: {
    ...Typography.labelSmall,
    color: BMapColors.onSurfaceVariant,
    paddingHorizontal: Spacing.md,
    textTransform: 'uppercase',
  },
});

export default Divider;
