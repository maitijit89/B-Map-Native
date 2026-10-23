import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Copy,
  Navigation,
  Sparkles,
  MapPin,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { encodeDigiPin } from '@/shared/utils';
import { Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Badge,
  Button,
  Input,
  SectionHeader,
} from '@/shared/components/ui';

const PRESET_PLACES = [
  { name: 'Connaught Place, Delhi', lat: '28.6315', lon: '77.2167', digiPin: '28J4-C2M1-4K' },
  { name: 'Cyber Hub, Gurugram', lat: '28.4986', lon: '77.0878', digiPin: '28J4-K8M2-9P' },
  { name: 'Agra Fort, UP', lat: '27.1795', lon: '78.0211', digiPin: '27H3-P9Q4-2X' },
  { name: 'Kempegowda Airport, BLR', lat: '13.1986', lon: '77.7066', digiPin: '13D8-R4T2-8V' },
];

const HIERARCHICAL_TIERS = [
  { tier: 'Tier 1–2', resolution: '100 km × 100 km', desc: 'Northern National Grid Envelope' },
  { tier: 'Tier 3–4', resolution: '12.5 km × 12.5 km', desc: 'Delhi NCR & Haryana District Division' },
  { tier: 'Tier 5–6', resolution: '1.5 km × 1.5 km', desc: 'Urban Sector & Ward Neighborhood' },
  { tier: 'Tier 7–8', resolution: '190 m × 190 m', desc: 'Commercial Complex & Road Block' },
  { tier: 'Tier 9–10', resolution: '4 m × 4 m', desc: 'Doorstep Entrance & Parking Bay Precision' },
];

export default function DigiPinExplorerModal() {
  const colors = useThemeColors();
  const [latInput, setLatInput] = useState('28.4986');
  const [lonInput, setLonInput] = useState('77.0878');
  const [activeDigiPin, setActiveDigiPin] = useState('28J4-K8M2-9P');
  const [activePlaceName, setActivePlaceName] = useState('Cyber Hub, Gurugram');

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  const handleSelectPreset = (p: typeof PRESET_PLACES[0]) => {
    triggerHaptic();
    setLatInput(p.lat);
    setLonInput(p.lon);
    setActiveDigiPin(p.digiPin);
    setActivePlaceName(p.name);
  };

  const handleEncode = () => {
    triggerHaptic();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude numbers.');
      return;
    }
    const pin = encodeDigiPin(lat, lon);
    setActiveDigiPin(pin);
    setActivePlaceName(`Location (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`);
    Alert.alert('DigiPIN Encoded', `Generated DigiPIN: ${pin}\n4m × 4m doorstep resolution.`);
  };

  const handleCopy = () => {
    triggerHaptic();
    Alert.alert('Copied to Clipboard', `DigiPIN ${activeDigiPin} copied. Share with courier or emergency dispatch.`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="National DigiPIN Explorer"
        subtitle="Govt of India / Dept of Posts 4m × 4m Grid"
        onBackPress={() => {
          triggerHaptic();
          router.back();
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Giant Active DigiPIN Display Card */}
        <Card variant="elevated" padding="lg" style={styles.digiCard}>
          <View style={styles.digiCardTop}>
            <Badge label="SOVEREIGN POSTAL STANDARD" variant="primary" size="sm" showDot />
            <Text style={[styles.gridPrecisionText, { color: colors.secondary }]}>
              4m × 4m Centroid
            </Text>
          </View>

          <Text style={[styles.digiCodeBig, { color: colors.primary }]}>{activeDigiPin}</Text>
          <Text style={[styles.digiPlaceName, { color: colors.onSurface }]}>{activePlaceName}</Text>

          <View style={styles.digiActionRow}>
            <Button
              title="Copy DigiPIN"
              variant="outline"
              size="md"
              leftIcon={<Copy size={16} color={colors.primary} />}
              onPress={handleCopy}
              style={styles.actionBtnFlex}
            />

            <Button
              title="Route to DigiPIN"
              variant="primary"
              size="md"
              leftIcon={<Navigation size={16} color="#fff" />}
              onPress={() => {
                triggerHaptic();
                router.back();
                router.push('/modal');
              }}
              style={styles.actionBtnFlex}
            />
          </View>
        </Card>

        {/* Preset Popular Locations Carousel */}
        <SectionHeader
          title="Preset Sovereign Hubs"
          subtitle="Top destinations with certified postal centroid"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsTrack}>
          {PRESET_PLACES.map((p, idx) => {
            const isSelected = activeDigiPin === p.digiPin;
            return (
              <Card
                key={idx}
                variant={isSelected ? 'elevated' : 'outlined'}
                padding="sm"
                onPress={() => handleSelectPreset(p)}
                accessibilityLabel={`Preset location ${p.name}`}
                style={[
                  styles.presetCard,
                  isSelected && {
                    backgroundColor: colors.primaryContainer,
                    borderColor: colors.primary,
                  },
                ]}>
                <View style={styles.presetContent}>
                  <MapPin
                    size={14}
                    color={isSelected ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.presetName,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}>
                    {p.name}
                  </Text>
                  <Text
                    style={[
                      styles.presetPin,
                      {
                        color: isSelected ? colors.primary : colors.onSurfaceVariant,
                      },
                    ]}>
                    {p.digiPin}
                  </Text>
                </View>
              </Card>
            );
          })}
        </ScrollView>

        {/* Custom Lat / Lon Geocoding Inputs */}
        <Card variant="elevated" padding="md" style={styles.geocoderCard}>
          <Text style={[styles.geocoderTitle, { color: colors.onSurface }]}>
            Custom Coordinate Geocoder
          </Text>
          <View style={styles.coordInputsRow}>
            <View style={styles.coordInputBox}>
              <Input
                label="Latitude (°N)"
                value={latInput}
                onChangeText={setLatInput}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.coordInputBox}>
              <Input
                label="Longitude (°E)"
                value={lonInput}
                onChangeText={setLonInput}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Button
            title="Encode to 10-Char DigiPIN"
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<Sparkles size={16} color="#fff" />}
            onPress={handleEncode}
          />
        </Card>

        {/* 10-Tier Hierarchy Breakdown Table */}
        <Card variant="outlined" padding="md" style={styles.hierarchyCard}>
          <Text style={[styles.hierarchyTitle, { color: colors.onSurface }]}>
            Recursive Hierarchical 32-Grid Tiers
          </Text>
          <Text style={[styles.hierarchySub, { color: colors.onSurfaceVariant }]}>
            Uses 32 alphanumeric symbols (excluding 0, 1, O, I to prevent human transcription error)
          </Text>

          {HIERARCHICAL_TIERS.map((tier, idx) => (
            <View
              key={idx}
              style={[
                styles.tierRow,
                { borderBottomColor: colors.surfaceContainerHigh },
              ]}>
              <Badge label={tier.tier} variant="neutral" size="sm" />
              <View style={styles.tierContent}>
                <Text style={[styles.tierRes, { color: colors.onSurface }]}>{tier.resolution}</Text>
                <Text style={[styles.tierDesc, { color: colors.onSurfaceVariant }]}>{tier.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.md,
    gap: 14,
  },
  digiCard: {
    gap: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  digiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridPrecisionText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  digiCodeBig: {
    ...Typography.headline,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    marginVertical: 4,
  },
  digiPlaceName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    textAlign: 'center',
  },
  digiActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  actionBtnFlex: {
    flex: 1,
  },
  presetsTrack: {
    gap: 8,
    paddingVertical: 2,
  },
  presetCard: {
    minWidth: 160,
  },
  presetContent: {
    gap: 4,
  },
  presetName: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  presetPin: {
    fontSize: 10,
    fontWeight: '700',
  },
  geocoderCard: {
    gap: 12,
  },
  geocoderTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  coordInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordInputBox: {
    flex: 1,
  },
  hierarchyCard: {
    gap: 8,
  },
  hierarchyTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  hierarchySub: {
    ...Typography.bodySmall,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tierContent: {
    flex: 1,
    gap: 1,
  },
  tierRes: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  tierDesc: {
    ...Typography.bodySmall,
    fontSize: 10,
  },
});
