import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Spacing, Typography } from '../../constants/tokens';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  allowClear = false,
  onClear,
  value,
  onChangeText,
  secureTextEntry,
  containerStyle,
  inputStyle,
  placeholderTextColor,
  ...rest
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasValue = Boolean(value && value.length > 0);
  const isSecure = secureTextEntry && !isPasswordVisible;

  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.onSurface }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isFocused
              ? colors.surfaceContainerLowest
              : colors.surfaceContainerLow,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.outlineVariant,
          },
        ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, { color: colors.onBackground }, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor || colors.outline}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {allowClear && hasValue && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClear}
            style={styles.actionIcon}
            accessibilityLabel="Clear input"
            accessibilityRole="button">
            <X size={16} color={colors.outline} />
          </TouchableOpacity>
        )}

        {secureTextEntry && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.actionIcon}
            accessibilityLabel="Toggle password visibility"
            accessibilityRole="button">
            {isPasswordVisible ? (
              <EyeOff size={18} color={colors.outline} />
            ) : (
              <Eye size={18} color={colors.outline} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.bodyLarge,
    paddingVertical: 0,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  helperText: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
});

export default Input;
