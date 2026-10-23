import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Search, X, Mic } from 'lucide-react-native';
import { useThemeColors } from '../../hooks';
import { Radius, Shadows, Spacing, Typography } from '../../constants/tokens';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onClear?: () => void;
  onMicPress?: () => void;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  variant?: 'floating' | 'flat' | 'outlined';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search destinations, DigiPIN, places...',
  onPress,
  editable = true,
  autoFocus = false,
  onClear,
  onMicPress,
  leadingIcon,
  trailingAction,
  variant = 'floating',
  style,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: colors.surfaceContainerLow,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        };
      case 'floating':
      default:
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.surfaceContainerHigh,
          ...Shadows.md,
        };
    }
  };

  const isClickableOnly = !editable || !!onPress;

  const content = (
    <View
      style={[
        styles.container,
        getContainerStyle(),
        style,
      ]}>
      <View style={styles.leading}>
        {leadingIcon || <Search size={20} color={colors.primary} />}
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
          style={[styles.input, { color: colors.onSurface }]}
          accessibilityLabel={accessibilityLabel || placeholder}
          returnKeyType="search"
        />
      )}

      <View style={styles.trailing}>
        {value && onClear ? (
          <TouchableOpacity
            onPress={onClear}
            activeOpacity={0.7}
            style={styles.actionBtn}
            accessibilityLabel="Clear search">
            <X size={18} color={colors.outline} />
          </TouchableOpacity>
        ) : null}

        {onMicPress ? (
          <TouchableOpacity
            onPress={onMicPress}
            activeOpacity={0.7}
            style={styles.actionBtn}
            accessibilityLabel="Voice search">
            <Mic size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        {trailingAction}
      </View>
    </View>
  );

  if (isClickableOnly && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel || placeholder}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 50,
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
