import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BMapColors } from '../../constants/BMapTheme';
import { Radius } from '../../constants/tokens';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'offline';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  status,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const dim = sizeDimensions[size];
  const hasImage = Boolean(source && !imageError);

  return (
    <View style={[styles.container, { width: dim, height: dim }, style]}>
      {hasImage ? (
        <Image
          source={{ uri: source! }}
          onError={() => setImageError(true)}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}>
          <Text style={[styles.initialsText, textSizes[size]]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {status && (
        <View
          style={[
            styles.statusDot,
            statusDotSizes[size],
            { backgroundColor: statusColors[status] },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallbackContainer: {
    backgroundColor: BMapColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  initialsText: {
    fontWeight: '700',
    color: BMapColors.onPrimaryFixedVariant,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

const sizeDimensions: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 84,
};

const textSizes: Record<AvatarSize, { fontSize: number }> = {
  xs: { fontSize: 11 },
  sm: { fontSize: 13 },
  md: { fontSize: 16 },
  lg: { fontSize: 22 },
  xl: { fontSize: 28 },
};

const statusDotSizes: Record<AvatarSize, ViewStyle> = {
  xs: { width: 8, height: 8 },
  sm: { width: 10, height: 10 },
  md: { width: 13, height: 13 },
  lg: { width: 16, height: 16 },
  xl: { width: 20, height: 20 },
};

const statusColors: Record<AvatarStatus, string> = {
  online: BMapColors.trafficGreen,
  busy: BMapColors.trafficOrange,
  offline: BMapColors.outline,
};

export default Avatar;
