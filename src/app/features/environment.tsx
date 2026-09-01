import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { HeaderBar } from '@/components/HeaderBar';

export default function EnvironmentScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const [aqiScore, setAqiScore] = useState<number>(245); // Unhealthy/Severe typical winter reading

  const getAqiCategory = (score: number) => {
    if (score <= 50) return { label: 'Good', color: '#16A34A', bg: '#DCFCE7', desc: 'Air quality is satisfactory. Safe for outdoor driving and active mobility.' };
    if (score <= 100) return { label: 'Moderate', color: '#CA8A04', bg: '#FEF9C3', desc: 'Acceptable air quality; moderate health concern for sensitive individuals.' };
    if (score <= 200) return { label: 'Poor / Unhealthy', color: '#EA580C', bg: '#FFEDD5', desc: 'Breathing discomfort to most people on prolonged exposure. Cabin air filter recommended.' };
    return { label: 'Severe / Hazardous', color: '#DC2626', bg: '#FEE2E2', desc: 'Severe health impact. Use N95 masks, keep vehicle windows rolled up & HEPA recirculation on.' };
  };

  const aqiInfo = getAqiCategory(aqiScore);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HeaderBar
        title="IMD Weather & AQI"
        subtitle="Environmental highway intelligence & safety alerts"
        accentColor="#0284C7"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AQI Hero Card with dynamic color coding */}
        <View
          style={[
            styles.aqiHeroCard,
            {
              backgroundColor: isDark ? '#1E1B18' : aqiInfo.bg,
              borderColor: aqiInfo.color,
            },
          ]}
        >
          <View style={styles.aqiTopRow}>
            <View>
              <Text style={[styles.aqiLabel, { color: aqiInfo.color }]}>LIVE AIR QUALITY INDEX (IMD / CPCB)</Text>
              <View style={styles.aqiScoreRow}>
                <Text style={[styles.aqiNumber, { color: aqiInfo.color }]}>{aqiScore}</Text>
                <View style={[styles.aqiStatusBadge, { backgroundColor: aqiInfo.color }]}>
                  <Text style={styles.aqiStatusText}>{aqiInfo.label}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.aqiIconBox, { backgroundColor: `${aqiInfo.color}20` }]}>
              <MaterialCommunityIcons name="weather-hazy" size={36} color={aqiInfo.color} />
            </View>
          </View>

          {/* Contextual Health Advisory */}
          <View style={[styles.advisoryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.advisoryHeader}>
              <Ionicons name="information-circle" size={16} color={aqiInfo.color} />
              <Text style={[styles.advisoryTitle, { color: colors.text }]}>Mobility & Health Advisory</Text>
            </View>
            <Text style={[styles.advisoryDesc, { color: colors.textSecondary }]}>
              {aqiInfo.desc}
            </Text>
          </View>
        </View>

        {/* 2x2 Environmental Intelligence Grid */}
        <View style={styles.gridSection}>
          <Text style={[styles.sectionHeading, BMapTypography.titleMedium, { color: colors.text }]}>
            Highway Weather & Environmental Parameters
          </Text>

          <View style={styles.envGrid}>
            {/* 1. Winter Dense Fog Highway Visibility */}
            <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.gridIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <MaterialCommunityIcons name="weather-fog" size={24} color="#64748B" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textMuted }]}>
                FOG VISIBILITY
              </Text>
              <Text style={[styles.gridMainValue, { color: colors.text }]}>120 Meters</Text>
              <View style={[styles.gridStatusPill, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.gridStatusText, { color: '#92400E' }]}>
                  Dense Fog • Max 40 km/h
                </Text>
              </View>
            </View>

            {/* 2. IMD Monsoon Alert Level */}
            <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.gridIconCircle, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="thunderstorm" size={24} color="#EA580C" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textMuted }]}>
                MONSOON ALERT
              </Text>
              <Text style={[styles.gridMainValue, { color: '#EA580C' }]}>Orange Alert</Text>
              <View style={[styles.gridStatusPill, { backgroundColor: '#FFEDD5' }]}>
                <Text style={[styles.gridStatusText, { color: '#9A3412' }]}>
                  Heavy Showers (IMD)
                </Text>
              </View>
            </View>

            {/* 3. Solar Radiation Index */}
            <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.gridIconCircle, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="sunny" size={24} color="#CA8A04" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textMuted }]}>
                SOLAR UV INDEX
              </Text>
              <Text style={[styles.gridMainValue, { color: colors.text }]}>7.2 High</Text>
              <View style={[styles.gridStatusPill, { backgroundColor: '#FEF9C3' }]}>
                <Text style={[styles.gridStatusText, { color: '#854D0E' }]}>
                  Sun Visor Required
                </Text>
              </View>
            </View>

            {/* 4. Pollen Allergy Risk Level */}
            <View style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.gridIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="flower-pollen" size={24} color="#16A34A" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textMuted }]}>
                POLLEN RISK
              </Text>
              <Text style={[styles.gridMainValue, { color: colors.text }]}>Moderate</Text>
              <View style={[styles.gridStatusPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.gridStatusText, { color: '#166534' }]}>
                  Grass & Oak Pollen
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Weather Forecast Bar */}
        <View style={[styles.forecastCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.forecastTitle, BMapTypography.titleSmall, { color: colors.text }]}>
            Upcoming Highway Forecast (Next 6 Hours)
          </Text>
          <View style={styles.forecastRow}>
            {[
              { time: '04 PM', temp: '26°C', rain: '20%', icon: 'sunny-outline' },
              { time: '06 PM', temp: '24°C', rain: '65%', icon: 'rainy-outline' },
              { time: '08 PM', temp: '21°C', rain: '80%', icon: 'thunderstorm-outline' },
              { time: '10 PM', temp: '19°C', rain: '40%', icon: 'cloudy-outline' },
            ].map(f => (
              <View key={f.time} style={styles.forecastItem}>
                <Text style={[styles.fTime, { color: colors.textSecondary }]}>{f.time}</Text>
                <Ionicons name={f.icon as any} size={22} color={BMapColors.primary} />
                <Text style={[styles.fTemp, { color: colors.text }]}>{f.temp}</Text>
                <Text style={styles.fRain}>{f.rain}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  aqiHeroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    gap: 16,
    ...BMapElevation.level2,
  },
  aqiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aqiLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aqiScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  aqiNumber: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  aqiStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  aqiStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  aqiIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advisoryBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  advisoryDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  gridSection: {
    gap: 12,
  },
  sectionHeading: {
    fontWeight: '700',
  },
  envGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 8,
    ...BMapElevation.level1,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridMainValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  gridStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  forecastCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    ...BMapElevation.level1,
  },
  forecastTitle: {
    fontWeight: '700',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
    gap: 6,
  },
  fTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  fTemp: {
    fontSize: 13,
    fontWeight: '700',
  },
  fRain: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
});
