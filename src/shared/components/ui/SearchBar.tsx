import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Search, X, Mic } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';
import { haptics } from '../../utils/haptics';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onClear?: () => void;
  onMicPress?: () => void;
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  variant?: 'floating' | 'flat' | 'outlined';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 0.5,
};

export const SearchBar: React.FC<SearchBarProps> = memo(({
  value,
  onChangeText,
  placeholder = 'Search destinations, DigiPIN, places...',
  onPress,
  editable = true,
  autoFocus = false,
  onClear,
  onMicPress,
  onFocus,
  onBlur,
  leadingIcon,
  trailingAction,
  variant = 'floating',
  style,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.98, SPRING_CONFIG);
      haptics.light();
    }
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(1, SPRING_CONFIG);
    }
  }, [onPress, scale]);

  const handleFocus: TextInputProps['onFocus'] = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur: TextInputProps['onBlur'] = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useMemo<ViewStyle>(() => {
    const focusBorder = isFocused
      ? { borderColor: colors.primary, borderWidth: 1.5 }
      : {};

    switch (variant) {
      case 'flat':
        return {
          backgroundColor: colors.surfaceContainerLow,
          ...focusBorder,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : colors.outlineVariant,
        };
      case 'floating':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isFocused ? colors.primary : colors.surfaceContainerHigh,
          ...Shadows.md,
          ...focusBorder,
        };
    }
  }, [variant, colors, isFocused]);

  const handleClearPress = useCallback(() => {
    haptics.light();
    onClear?.();
  }, [onClear]);

  const handleMicPressInternal = useCallback(() => {
    haptics.medium();
    onMicPress?.();
  }, [onMicPress]);

  const isClickableOnly = !editable || !!onPress;

  const content = (
    <Animated.View style={[styles.container, containerStyle, animatedStyle, style]}>
      <View style={styles.leading}>
        {leadingIcon || <Search size={20} color={isFocused ? colors.primary : colors.onSurfaceVariant} />}
      </View>

      {isClickableOnly ? (
        <View style={styles.textInputFake}>
          <Text
            numberOfLines={1}
            style={[
              styles.placeholderText,
              { color: value ? colors.onSurface : colors.outline },
            ]}>
            {value || placeholder}
          </Text>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, { color: colors.onSurface }]}
          accessibilityLabel={accessibilityLabel || placeholder}
          returnKeyType="search"
        />
      )}

      <View style={styles.trailing}>
        {value && onClear ? (
          <TouchableOpacity
            onPress={handleClearPress}
            activeOpacity={0.7}
            style={styles.actionBtn}
            accessibilityLabel="Clear search">
            <X size={18} color={colors.outline} />
          </TouchableOpacity>
        ) : null}

        {onMicPress ? (
          <TouchableOpacity
            onPress={handleMicPressInternal}
            activeOpacity={0.7}
            style={styles.actionBtn}
            accessibilityLabel="Voice search">
            <Mic size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        {trailingAction}
      </View>
    </Animated.View>
  );

  if (isClickableOnly && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel || placeholder}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  leading: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.bodyMedium,
    paddingVertical: 0,
  },
  textInputFake: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    ...Typography.bodyMedium,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  actionBtn: {
    padding: 6,
    marginLeft: 2,
    borderRadius: Radius.full,
  },
});

export default SearchBar;
