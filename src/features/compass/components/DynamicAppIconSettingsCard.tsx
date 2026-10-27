import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import {
  Compass,
  Smartphone,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Spacing, Typography } from '@/shared/constants/tokens';
import { Card, Badge, DynamicCompassIcon } from '@/shared/components/ui';
import { useDynamicAppIcon } from '@/shared/hooks/useDynamicAppIcon';

export const DynamicAppIconSettingsCard: React.FC = () => {
  const colors = useThemeColors();
  const {
    activeIcon,
    isAutoSync,
    isChanging,
    changeIcon,
    toggleAutoSync,
    currentHeading,
    suggestedIcon,
    iconOptions,
  } = useDynamicAppIcon();

  const getHeadingDirectionLabel = (deg: number): string => {
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
    return `${Math.round(deg)}° ${cardinals[index]}`;
  };

  return (
    <Card variant="elevated" padding="lg" style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <DynamicCompassIcon size={44} dynamic={true} tilt3D={true} borderRadius={11} />
        </View>
        <View style={styles.headerTextContainer}>
          <View style={styles.titleBadgeRow}>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              Dynamic App Icon
            </Text>
            <Badge
              label="OS Native"
              variant="primary"
              size="sm"
            />
          </View>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Rotate your device home screen launcher icon with compass heading
          </Text>
        </View>
      </View>

      {/* Live Heading & Direction Radar Banner */}
      <View
        style={[
          styles.headingBanner,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.headingLeft}>
          <Compass size={18} color={colors.primary} />
          <Text style={[styles.headingLabel, { color: colors.onSurface }]}>
            Live Device Heading:
          </Text>
          <Text style={[styles.headingValue, { color: colors.primary }]}>
            {getHeadingDirectionLabel(currentHeading)}
          </Text>
        </View>
        <Badge
          label={`Suggested: ${suggestedIcon.replace('compass', '')}`}
          variant="success"
          size="sm"
        />
      </View>

      {/* Auto-Sync Switch */}
      <View
        style={[
          styles.autoSyncRow,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: isAutoSync ? colors.primary : colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.autoSyncLeft}>
          <View
            style={[
              styles.sparkleIconBox,
              { backgroundColor: isAutoSync ? colors.primaryContainer : colors.surfaceContainerHigh },
            ]}
          >
            <Sparkles
              size={18}
              color={isAutoSync ? colors.onPrimaryContainer : colors.onSurfaceVariant}
            />
          </View>
          <View style={styles.autoSyncText}>
            <Text style={[styles.autoSyncTitle, { color: colors.onSurface }]}>
              Auto-Sync with Heading
            </Text>
            <Text style={[styles.autoSyncSub, { color: colors.onSurfaceVariant }]}>
              Automatically sets launcher icon to current heading upon leaving app
            </Text>
          </View>
        </View>
        <Switch
          value={isAutoSync}
          disabled={isChanging}
          onValueChange={toggleAutoSync}
          trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Icon Variant Selectors */}
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        Launcher Icon Variants
      </Text>

      <View style={styles.iconGrid}>
        {iconOptions.map((opt) => {
          const isSelected = activeIcon === opt.key;
          const isSuggested = suggestedIcon === opt.key && !isSelected;

          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => changeIcon(opt.key)}
              style={[
                styles.iconOptionCard,
                {
                  backgroundColor: isSelected
                    ? colors.primaryContainer
                    : colors.surfaceContainerHigh,
                  borderColor: isSelected
                    ? colors.primary
                    : isSuggested
                    ? colors.secondary
                    : colors.outlineVariant,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View style={styles.iconOptionPreview}>
                {opt.degrees === null ? (
                  <DynamicCompassIcon
                    size={38}
                    dynamic={false}
                    heading={0}
                    borderRadius={9}
                  />
                ) : (
                  <DynamicCompassIcon
                    size={38}
                    dynamic={false}
                    heading={opt.degrees}
                    borderRadius={9}
                  />
                )}
                {isSelected && (
                  <View
                    style={[
                      styles.selectedBadgeCheck,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>

              <View style={styles.iconOptionDetails}>
                <Text
                  style={[
                    styles.iconOptionLabel,
                    {
                      color: isSelected
                        ? colors.onPrimaryContainer
                        : colors.onSurface,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
                <Text
                  style={[
                    styles.iconOptionCardinal,
                    {
                      color: isSelected
                        ? colors.primary
                        : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {opt.cardinal}
                </Text>
              </View>

              {isSuggested && (
                <View style={styles.suggestedPill}>
                  <Text style={[styles.suggestedPillText, { color: colors.secondary }]}>
                    Active Facing
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Platform Optimization Footer */}
      <View
        style={[
          styles.footerBanner,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <Smartphone size={16} color={colors.onSurfaceVariant} />
        <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
          {Platform.OS === 'ios'
            ? 'iOS: Alternate App Icons with silent background change support'
            : Platform.OS === 'android'
            ? 'Android: Activity-Alias Adaptive Icons with instant refresh'
            : 'Web & Simulator: Interactive Compass Icon demonstration preview'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    shadowColor: '#3865F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    ...Typography.titleMedium,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
  },
  headingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headingLabel: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  headingValue: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  autoSyncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  sparkleIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoSyncText: {
    flex: 1,
  },
  autoSyncTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    fontSize: 13,
  },
  autoSyncSub: {
    ...Typography.bodySmall,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOptionCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 10,
    borderRadius: Radius.lg,
    alignItems: 'center',
    position: 'relative',
  },
  iconOptionPreview: {
    position: 'relative',
    marginBottom: 8,
  },
  selectedBadgeCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconOptionDetails: {
    alignItems: 'center',
  },
  iconOptionLabel: {
    ...Typography.labelMedium,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconOptionCardinal: {
    ...Typography.labelSmall,
    fontSize: 11,
    marginTop: 2,
  },
  suggestedPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestedPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  footerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  footerText: {
    ...Typography.bodySmall,
    fontSize: 11,
    flex: 1,
    lineHeight: 14,
  },
});
