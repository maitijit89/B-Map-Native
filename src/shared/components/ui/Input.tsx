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
import { BMapColors } from '../../constants/BMapTheme';
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
  placeholderTextColor = BMapColors.outline,
  ...rest
}) => {
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
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          Boolean(error) && styles.errorWrapper,
        ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor}
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
            style={styles.actionIcon}>
            <X size={16} color={BMapColors.outline} />
          </TouchableOpacity>
        )}

        {secureTextEntry && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.actionIcon}>
            {isPasswordVisible ? (
              <EyeOff size={18} color={BMapColors.outline} />
            ) : (
              <Eye size={18} color={BMapColors.outline} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
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
    color: BMapColors.onSurface,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BMapColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: BMapColors.outlineVariant,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  focusedWrapper: {
    borderColor: BMapColors.primaryContainer,
    backgroundColor: '#FFFFFF',
  },
  errorWrapper: {
    borderColor: BMapColors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.bodyLarge,
    color: BMapColors.onBackground,
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
    color: BMapColors.error,
    marginTop: Spacing.xs,
  },
  helperText: {
    ...Typography.bodySmall,
    color: BMapColors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
});

export default Input;
