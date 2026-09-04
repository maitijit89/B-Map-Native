import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  useColorScheme,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PlacePOI } from '@/types';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { moderateScale, isSmallDevice, SCREEN_HEIGHT } from '@/utils/responsive';

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
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  if (!place) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `B Map Location: ${place.title}\nDIGIPIN: ${place.digipin}\nCoordinates: ${place.coordinates.latitude}, ${place.coordinates.longitude}\nAddress: ${place.address}`,
      });
    } catch {
      // Non-blocking fallback
    }
  };

  const handleNavigate = () => {
    if (onClose) onClose();
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={`star-${i}`}
          name={i <= Math.floor(rating) ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={isSmallDevice ? 13 : 15}
          color="#FFB300"
        />
      );
    }
    return stars;
  };

  return (
    <Modal
      visible={Boolean(place)}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop: tap outside to close */}
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        {/* Bottom Sheet Card */}
        <View style={[styles.sheetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Top Drag Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: isDark ? '#374151' : '#D1D5DB' }]} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Header Place Info */}
            <View style={styles.headerRow}>
              <View style={styles.titleArea}>
                <Text
                  style={[
                    styles.placeTitle,
                    BMapTypography.headlineMedium,
                    { color: colors.text, fontSize: moderateScale(isSmallDevice ? 17 : 20) },
                  ]}
                  numberOfLines={2}
                >
                  {place.title}
                </Text>

                <View style={styles.ratingRow}>
                  <View style={styles.starCluster}>{renderStars(place.rating)}</View>
                  <Text style={[styles.ratingScore, { color: colors.text }]}>
                    {place.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                    ({place.reviewCount} reviews)
                  </Text>
                </View>
              </View>

              {onClose && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Ionicons name="close" size={isSmallDevice ? 18 : 20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Address Row */}
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={isSmallDevice ? 15 : 17}
                color={BMapColors.primary}
                style={styles.addrIcon}
              />
              <Text
                style={[
                  styles.addressText,
                  { color: colors.textSecondary, fontSize: moderateScale(isSmallDevice ? 12 : 13) },
                ]}
              >
                {place.address}
              </Text>
            </View>

            {/* Primary Action Buttons: [Navigate, Share, Save] */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNavigate}
                style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: BMapColors.primary }]}
              >
                <Ionicons name="navigate" size={isSmallDevice ? 15 : 17} color="#FFFFFF" />
                <Text style={styles.primaryActionText} numberOfLines={1}>
                  Navigate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              >
                <Ionicons name="share-social-outline" size={isSmallDevice ? 15 : 17} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]} numberOfLines={1}>
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              >
                <Ionicons name="bookmark-outline" size={isSmallDevice ? 15 : 17} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]} numberOfLines={1}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Spatial Metadata Box */}
            <View
              style={[
                styles.spatialBox,
                { backgroundColor: isDark ? '#16222F' : '#F1F5F9', borderColor: colors.border },
              ]}
            >
              <View style={styles.spatialHeader}>
                <MaterialCommunityIcons name="crosshairs-gps" size={17} color={BMapColors.primary} />
                <Text style={[styles.spatialHeaderTitle, { color: colors.text }]}>
                  Spatial Telemetry & DIGIPIN
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
                  <Text style={[styles.spatialLabel, { color: colors.textMuted }]}>INDIA POST DIGIPIN</Text>
                  <View style={styles.digipinPill}>
                    <Text style={styles.digipinText}>{place.digipin}</Text>
                  </View>
                </View>

                <View style={styles.spatialItem}>
                  <Text style={[styles.spatialLabel, { color: colors.textMuted }]}>DISTANCE</Text>
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
                    <MaterialCommunityIcons name="card-bulleted" size={17} color={BMapColors.fastagPurple} />
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      FASTag 100% ETC Dedicated Lane Active
                    </Text>
                  </View>
                )}

                {place.details.connectors && (
                  <View style={styles.detailRow}>
                    <Ionicons name="flash-outline" size={17} color={BMapColors.evCyan} />
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      Connectors: {place.details.connectors.join(', ')}
                    </Text>
                  </View>
                )}

                {place.details.pricing && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="currency-inr" size={17} color={BMapColors.primary} />
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      Pricing: {place.details.pricing}
                    </Text>
                  </View>
                )}

                {place.details.timings && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={17} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.text }]}>
                      Hours: {place.details.timings}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetCard: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 8,
    ...BMapElevation.level3,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingBottom: 32,
    gap: isSmallDevice ? 12 : 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
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
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addrIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginTop: 2,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: isSmallDevice ? 9 : 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryActionButton: {
    flex: 1.4,
    borderColor: BMapColors.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(isSmallDevice ? 12 : 13),
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: moderateScale(isSmallDevice ? 11 : 12),
  },
  spatialBox: {
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  spatialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spatialHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  spatialGrid: {
    gap: 8,
  },
  spatialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spatialLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  spatialValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  digipinPill: {
    backgroundColor: `${BMapColors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  digipinText: {
    color: BMapColors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
