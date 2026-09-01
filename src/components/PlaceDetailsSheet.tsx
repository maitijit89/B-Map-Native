import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, useColorScheme, Platform } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PlacePOI } from '@/types';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';

interface PlaceDetailsSheetProps {
  place: PlacePOI | null;
  userDistanceKm?: number;
  onClose?: () => void;
  onNavigatePress?: (place: PlacePOI) => void;
}

export function PlaceDetailsSheet({
  place,
  userDistanceKm = 3.8,
  onClose,
  onNavigatePress,
}: PlaceDetailsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  if (!place) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `B Map Location: ${place.title}\nDIGIPIN: ${place.digipin}\nCoordinates: ${place.coordinates.latitude}, ${place.coordinates.longitude}\nAddress: ${place.address}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleNavigate = () => {
    if (onNavigatePress) {
      onNavigatePress(place);
    } else {
      router.push({
        pathname: '/navigate/route-planner' as any,
        params: {
          destTitle: place.title,
          destLat: place.coordinates.latitude.toString(),
          destLng: place.coordinates.longitude.toString(),
          destDigipin: place.digipin,
        },
      });
    }
  };

  // Render 5 Star rating icons
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={`star-${i}`}
          name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={16}
          color="#FFB300"
        />
      );
    }
    return stars;
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1}
      enablePanDownToClose={true}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#4B5563' : '#CBD5E1' }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        {/* Header Place Info */}
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text style={[styles.placeTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
              {place.title}
            </Text>
            <View style={styles.ratingRow}>
              <View style={styles.starCluster}>{renderStars(place.rating)}</View>
              <Text style={[styles.ratingScore, { color: colors.text }]}>{place.rating.toFixed(1)}</Text>
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({place.reviewCount} verified reviews)
              </Text>
            </View>
          </View>

          {onClose && (
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Address String */}
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={18} color={BMapColors.primary} style={styles.addrIcon} />
          <Text style={[styles.addressText, BMapTypography.bodyMedium, { color: colors.textSecondary }]}>
            {place.address}
          </Text>
        </View>

        {/* Action Row: [Navigate, Share, Save] */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNavigate}
            style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: BMapColors.primary }]}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
          >
            <Ionicons name="bookmark-outline" size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Spatial Metadata Box */}
        <View style={[styles.spatialBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
          <View style={styles.spatialHeader}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={BMapColors.primary} />
            <Text style={[styles.spatialHeaderTitle, { color: colors.text }]}>
              Spatial Telemetry & DIGIPIN Grid
            </Text>
          </View>

          <View style={styles.spatialGrid}>
            <View style={styles.spatialItem}>
              <Text style={[styles.spatialLabel, { color: colors.textMuted }]}>GPS COORDINATES</Text>
              <Text style={[styles.spatialValue, { color: colors.text }]}>
                {place.coordinates.latitude.toFixed(5)}° N, {place.coordinates.longitude.toFixed(5)}° E
              </Text>
            </View>

            <View style={styles.spatialItem}>
              <Text style={[styles.spatialLabel, { color: colors.textMuted }]}>INDIA POST DIGIPIN (4m×4m)</Text>
              <View style={styles.digipinPill}>
                <Text style={styles.digipinText}>{place.digipin}</Text>
              </View>
            </View>

            <View style={styles.spatialItem}>
              <Text style={[styles.spatialLabel, { color: colors.textMuted }]}>GEODESIC DISTANCE</Text>
              <Text style={[styles.spatialValue, { color: BMapColors.secondary }]}>
                {place.distanceKm ?? userDistanceKm} km from current location
              </Text>
            </View>
          </View>
        </View>

        {/* Extra Venue Details (if available) */}
        {place.details && (
          <View style={[styles.detailsSection, { borderColor: colors.border }]}>
            {place.details.fastagLane && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="card-bulleted" size={18} color={BMapColors.fastagPurple} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  FASTag 100% ETC Dedicated Lane Active
                </Text>
              </View>
            )}

            {place.details.connectors && (
              <View style={styles.detailRow}>
                <Ionicons name="flash-outline" size={18} color={BMapColors.evCyan} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Connectors: {place.details.connectors.join(', ')}
                </Text>
              </View>
            )}

            {place.details.timings && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Hours: {place.details.timings}
                </Text>
              </View>
            )}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
  },
  placeTitle: {
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starCluster: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 13,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addrIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionButton: {
    borderWidth: 0,
    ...BMapElevation.level1,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spatialBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 6,
  },
  spatialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spatialHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spatialGrid: {
    gap: 10,
  },
  spatialItem: {
    gap: 2,
  },
  spatialLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spatialValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  digipinPill: {
    backgroundColor: '#FF6F00',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  digipinText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  detailsSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
