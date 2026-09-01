import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';
import { decodeDigiPin, parseIndianAddress } from '@/services/digipin';
import { DigiPinResult, ParsedIndianAddress } from '@/types';

export default function DigiPinScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [activeTab, setActiveTab] = useState<'decode' | 'parse'>('decode');

  // Tab 1 (Decode PIN) state
  const [pinInput, setPinInput] = useState('DL-982-KP34');
  const [decodedResult, setDecodedResult] = useState<DigiPinResult | null>(() => decodeDigiPin('DL-982-KP34'));

  // Tab 2 (Parse Address) state
  const [addressInput, setAddressInput] = useState(
    'Opposite Metro Pillar 142, Near Chai Point, 100 Feet Road, Indiranagar, Bengaluru 560038'
  );
  const [parsedResult, setParsedResult] = useState<ParsedIndianAddress | null>(() =>
    parseIndianAddress(
      'Opposite Metro Pillar 142, Near Chai Point, 100 Feet Road, Indiranagar, Bengaluru 560038'
    )
  );

  const handleDecode = () => {
    const res = decodeDigiPin(pinInput);
    setDecodedResult(res);
  };

  const handleParse = () => {
    const res = parseIndianAddress(addressInput);
    setParsedResult(res);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="DIGIPIN Micro-Grid"
        subtitle="India Post 4m × 4m Digital Address Network"
        accentColor={BMapColors.digipinOrange}
      />

      {/* Segmented Dual Tab Control */}
      <View style={styles.tabBarWrapper}>
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('decode')}
            style={[
              styles.tabButton,
              activeTab === 'decode' && [styles.activeTabButton, { backgroundColor: colors.surface }],
            ]}
          >
            <MaterialCommunityIcons
              name="grid"
              size={18}
              color={activeTab === 'decode' ? BMapColors.digipinOrange : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'decode' ? colors.text : colors.textSecondary,
                  fontWeight: activeTab === 'decode' ? '700' : '500',
                },
              ]}
            >
              Decode 4m PIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('parse')}
            style={[
              styles.tabButton,
              activeTab === 'parse' && [styles.activeTabButton, { backgroundColor: colors.surface }],
            ]}
          >
            <MaterialCommunityIcons
              name="map-search"
              size={18}
              color={activeTab === 'parse' ? BMapColors.digipinOrange : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'parse' ? colors.text : colors.textSecondary,
                  fontWeight: activeTab === 'parse' ? '700' : '500',
                },
              ]}
            >
              Parse Address
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'decode' ? (
          /* Tab 1: Decode PIN */
          <View style={styles.tabContent}>
            {/* Input Card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                Enter 10-Character DIGIPIN
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Standard India Post alphanumeric geo-coordinate tag (e.g. DL-982-KP34)
              </Text>

              <View style={[styles.pinInputContainer, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="crosshairs" size={22} color={BMapColors.digipinOrange} />
                <TextInput
                  style={[styles.pinTextInput, { color: colors.text }]}
                  value={pinInput}
                  onChangeText={setPinInput}
                  placeholder="XX-XXX-XXXXX"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDecode}
                style={[styles.actionBtn, { backgroundColor: BMapColors.digipinOrange }]}
              >
                <Ionicons name="search" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Decode Spatial Grid</Text>
              </TouchableOpacity>
            </View>

            {/* Decoded Bounding Box & Coordinates Result */}
            {decodedResult && (
              <View style={[styles.card, styles.resultCard, { backgroundColor: isDark ? '#1C1917' : '#FFF7ED', borderColor: '#FDBA74' }]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.gridPill, { backgroundColor: BMapColors.digipinOrange }]}>
                    <Text style={styles.gridPillText}>4m × 4m Micro-Cell</Text>
                  </View>
                  <Text style={[styles.regionBadge, { color: BMapColors.digipinOrange }]}>
                    {decodedResult.region}
                  </Text>
                </View>

                <View style={styles.pinDisplayBox}>
                  <Text style={styles.pinDisplayLabel}>RESOLVED DIGIPIN</Text>
                  <Text style={styles.pinDisplayText}>{decodedResult.digipin}</Text>
                </View>

                <View style={styles.coordsGrid}>
                  <View style={[styles.coordBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.coordLabel, { color: colors.textMuted }]}>CENTER LATITUDE</Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {decodedResult.latitude.toFixed(5)}° N
                    </Text>
                  </View>

                  <View style={[styles.coordBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.coordLabel, { color: colors.textMuted }]}>CENTER LONGITUDE</Text>
                    <Text style={[styles.coordValue, { color: colors.text }]}>
                      {decodedResult.longitude.toFixed(5)}° E
                    </Text>
                  </View>
                </View>

                {/* Bounding Box Spatial Coordinates */}
                <View style={[styles.boundingBoxContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.boxTitle, { color: colors.text }]}>
                    Micro-Grid Spatial Bounding Box:
                  </Text>
                  <Text style={[styles.boxCoord, { color: colors.textSecondary }]}>
                    North-East: {decodedResult.boundingBox.maxLat}° N, {decodedResult.boundingBox.maxLng}° E
                  </Text>
                  <Text style={[styles.boxCoord, { color: colors.textSecondary }]}>
                    South-West: {decodedResult.boundingBox.minLat}° N, {decodedResult.boundingBox.minLng}° E
                  </Text>
                  <Text style={[styles.boxAccuracy, { color: '#00875A' }]}>
                    Precision Accuracy: ±{decodedResult.gridResolutionMeters} Meters
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* Tab 2: Parse Address */
          <View style={styles.tabContent}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                Unstructured Address Parser
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Paste informal Indian address with landmarks, floor, metro pillars, or street names.
              </Text>

              <TextInput
                style={[
                  styles.multilineInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline={true}
                numberOfLines={4}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="e.g. Opposite Metro Pillar 142, Near Chai Point, 100 Feet Road..."
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleParse}
                style={[styles.actionBtn, { backgroundColor: BMapColors.digipinOrange }]}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Parse Structured Hierarchy</Text>
              </TouchableOpacity>
            </View>

            {/* Parsed Structured Chips */}
            {parsedResult && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, BMapTypography.titleMedium, { color: colors.text }]}>
                  Structured Indian Spatial Entity Chips
                </Text>

                <View style={styles.chipsCluster}>
                  <View style={styles.chipItem}>
                    <Text style={[styles.chipCategory, { color: colors.textMuted }]}>LANDMARK</Text>
                    <View style={[styles.chipBubble, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="flag" size={14} color="#D97706" />
                      <Text style={[styles.chipText, { color: '#92400E' }]}>{parsedResult.landmark}</Text>
                    </View>
                  </View>

                  <View style={styles.chipItem}>
                    <Text style={[styles.chipCategory, { color: colors.textMuted }]}>STREET / ROAD</Text>
                    <View style={[styles.chipBubble, { backgroundColor: '#E0F2FE' }]}>
                      <Ionicons name="navigate" size={14} color="#0284C7" />
                      <Text style={[styles.chipText, { color: '#0369A1' }]}>{parsedResult.street}</Text>
                    </View>
                  </View>

                  <View style={styles.chipItem}>
                    <Text style={[styles.chipCategory, { color: colors.textMuted }]}>DISTRICT / AREA</Text>
                    <View style={[styles.chipBubble, { backgroundColor: '#E0E7FF' }]}>
                      <Ionicons name="business" size={14} color="#4F46E5" />
                      <Text style={[styles.chipText, { color: '#3730A3' }]}>{parsedResult.district}</Text>
                    </View>
                  </View>

                  <View style={styles.chipItem}>
                    <Text style={[styles.chipCategory, { color: colors.textMuted }]}>6-DIGIT PIN CODE</Text>
                    <View style={[styles.chipBubble, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="mail" size={14} color="#16A34A" />
                      <Text style={[styles.chipText, { color: '#166534' }]}>{parsedResult.pinCode}</Text>
                    </View>
                  </View>

                  <View style={styles.chipItem}>
                    <Text style={[styles.chipCategory, { color: colors.textMuted }]}>DERIVED DIGIPIN</Text>
                    <View style={[styles.chipBubble, { backgroundColor: '#FFEDD5' }]}>
                      <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#EA580C" />
                      <Text style={[styles.chipText, { color: '#C2410C', fontWeight: '800' }]}>
                        {parsedResult.digipin}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTabButton: {
    ...BMapElevation.level1,
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    ...BMapElevation.level2,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: -6,
    lineHeight: 18,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  pinTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  actionBtn: {
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    ...BMapElevation.level1,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    gap: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  regionBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinDisplayBox: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  pinDisplayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
    letterSpacing: 1,
  },
  pinDisplayText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 3,
  },
  coordsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  coordBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  coordValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  boundingBoxContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  boxCoord: {
    fontSize: 11,
  },
  boxAccuracy: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  multilineInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipsCluster: {
    gap: 10,
  },
  chipItem: {
    gap: 4,
  },
  chipCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
