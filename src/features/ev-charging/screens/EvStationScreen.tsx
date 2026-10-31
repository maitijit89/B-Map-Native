import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { fluidEntering } from '@/shared/animations';
import {
  Zap,
  Plug,
  Navigation,
  Clock,
  IndianRupee,
  Star,
  CircleDot,
  CheckCircle2,
  Copy,
} from 'lucide-react-native';
import { storageService, notificationService } from '@/shared/services';
import { useThemeColors } from '@/shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import { Header, Card, Button, Badge } from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

interface ConnectorBay {
  id: string;
  type: string;
  powerKw: number;
  availableGuns: number;
  totalGuns: number;
  pricePerKwh: number;
  voltageRange: string;
}

const CONNECTOR_BAYS: ConnectorBay[] = [
  {
    id: '1',
    type: 'CCS2 Dual Gun (DC Fast)',
    powerKw: 150,
    availableGuns: 2,
    totalGuns: 2,
    pricePerKwh: 18,
    voltageRange: '200V - 1000V DC',
  },
  {
    id: '2',
    type: 'CCS2 Single Gun (DC Standard)',
    powerKw: 60,
    availableGuns: 1,
    totalGuns: 2,
    pricePerKwh: 15,
    voltageRange: '150V - 750V DC',
  },
  {
    id: '3',
    type: 'Type 2 Mennekes (AC Fast)',
    powerKw: 22,
    availableGuns: 1,
    totalGuns: 2,
    pricePerKwh: 12,
    voltageRange: '415V Three-Phase AC',
  },
];

export default function EvStationScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [selectedBayId, setSelectedBayId] = useState<string>('1');
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [currentSoc, setCurrentSoc] = useState<number>(22);

  const activeBay = useMemo(() => {
    return CONNECTOR_BAYS.find((b) => b.id === selectedBayId) || CONNECTOR_BAYS[0];
  }, [selectedBayId]);

  const batteryCapacityKwh = 60;
  const energyNeededKwh = useMemo(() => {
    return (Math.max(0, targetSoc - currentSoc) / 100) * batteryCapacityKwh;
  }, [targetSoc, currentSoc]);

  const chargingTimeMinutes = useMemo(() => {
    if (energyNeededKwh <= 0) return 0;
    return Math.round((energyNeededKwh / activeBay.powerKw) * 60 + 4);
  }, [energyNeededKwh, activeBay.powerKw]);

  const totalCost = useMemo(() => {
    return Math.round(energyNeededKwh * activeBay.pricePerKwh);
  }, [energyNeededKwh, activeBay.pricePerKwh]);

  const handleReserveSlot = useCallback(async () => {
    haptics.success();
    const reservationId = `EZ-${Math.floor(1000 + Math.random() * 9000)}`;
    await storageService.savePreferences({
      evConnectorTypes: [activeBay.type],
    });

    // Broadcast EV charging reservation in-app notification
    notificationService.addNotification({
      title: 'EV Charging Gun Reserved ⚡',
      message: `Gun #1 (${activeBay.type}) held for 15 mins. Token: #${reservationId}. Est: ₹${totalCost}`,
      type: 'system',
      actionRoute: '/ev-station',
    });

    Alert.alert(
      'Charging Gun Reserved! ⚡',
      `Gun #1 (${activeBay.type}) held for your vehicle for 15 minutes. Session token: #${reservationId}.\nEst. Cost: ₹${totalCost}`,
      [
        {
          text: 'Route to Station',
          onPress: () => router.push('/modal'),
        },
      ]
    );
  }, [activeBay.type, totalCost]);

  const handleCopyDigiPin = useCallback(() => {
    haptics.selection();
    Alert.alert('DigiPIN Copied', '28J4-K8M2-9P copied to clipboard (4m × 4m charging bay centroid).');
  }, []);

  const handleBackPress = useCallback(() => {
    haptics.light();
    router.back();
  }, []);

  const handleRouteToStation = useCallback(() => {
    haptics.light();
    router.push('/modal');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="EV Supercharger Hub"
        onBackPress={handleBackPress}
        rightAction={
          <TouchableOpacity
            style={[styles.navTopBtn, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={handleRouteToStation}
            accessibilityRole="button"
            accessibilityLabel="Route to station"
            activeOpacity={0.7}>
            <Navigation size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Main Station Banner Card */}
        <Animated.View entering={fluidEntering(0)}>
          <Card variant="elevated" padding="md" style={styles.stationCard}>
            <View style={styles.stationHeader}>
              <View style={{ flex: 1 }}>
                <Badge label="TATA POWER EZ CHARGE" variant="primary" size="sm" />
                <Text style={[styles.stationName, { color: colors.onSurface }]}>
                  Cyber City Multi-Modal EV Hub
                </Text>
                <Text style={[styles.stationAddress, { color: colors.onSurfaceVariant }]}>
                  Building 10, DLF Cyber City, Gurugram
                </Text>
              </View>
              <View style={[styles.ratingBox, { backgroundColor: colors.surfaceContainerLow }]}>
                <Star size={14} color="#FF9800" fill="#FF9800" />
                <Text style={[styles.ratingText, { color: colors.onSurface }]}>4.8</Text>
              </View>
            </View>

            {/* DigiPIN 4m x 4m Card */}
            <TouchableOpacity
              style={[
                styles.digiRow,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.surfaceContainerHigh,
                },
              ]}
              onPress={handleCopyDigiPin}
              activeOpacity={0.8}>
              <View style={[styles.digiTag, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.digiTagText, { color: colors.onPrimary }]}>DigiPIN</Text>
              </View>
              <Text style={[styles.digiCode, { color: colors.primary }]}>28J4-K8M2-9P</Text>
              <Text style={[styles.digiHint, { color: colors.onSurfaceVariant }]}>
                Bay precision (Tap to copy)
              </Text>
              <Copy size={13} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            <View style={styles.statusRow}>
              <View style={[styles.availPill, { backgroundColor: colors.surfaceContainerLow }]}>
                <CircleDot size={10} color={colors.trafficGreen} />
                <Text style={[styles.availText, { color: colors.trafficGreen }]}>
                  4 of 6 Fast Guns Free
                </Text>
              </View>
              <Text style={[styles.timingText, { color: colors.onSurfaceVariant }]}>
                Open 24/7 · Security Guarded
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Connector Selection Grid */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Select Connector Standard</Text>
        <View style={styles.connectorList}>
          {CONNECTOR_BAYS.map((bay, idx) => {
            const isSelected = bay.id === selectedBayId;
            return (
              <Animated.View
                key={bay.id}
                entering={fluidEntering(20 * (idx + 1))}>
                <Card
                  variant={isSelected ? 'elevated' : 'outlined'}
                  padding="md"
                  style={[
                    styles.connectorCard,
                    isSelected && {
                      borderColor: colors.primary,
                      borderWidth: 1.5,
                      backgroundColor: colors.surfaceContainerLowest,
                    },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedBayId(bay.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Connector ${bay.type}, power ${bay.powerKw} kilowatts, price ₹${bay.pricePerKwh} per kilowatt hour`}
                  accessibilityState={{ selected: isSelected }}>
                  <View style={styles.connectorCardTop}>
                    <View style={styles.connectorTitleRow}>
                      <Plug size={16} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                      <Text
                        style={[
                          styles.connectorType,
                          { color: colors.onSurface },
                          isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}>
                        {bay.type}
                      </Text>
                    </View>
                    <View style={[styles.powerBadge, { backgroundColor: colors.primaryContainer }]}>
                      <Text style={[styles.powerText, { color: colors.onPrimary }]}>{bay.powerKw} kW</Text>
                    </View>
                  </View>

                  <View style={styles.connectorMetaRow}>
                    <Text style={[styles.voltageText, { color: colors.onSurfaceVariant }]}>{bay.voltageRange}</Text>
                    <Text style={[styles.priceText, { color: colors.onSurface }]}>₹{bay.pricePerKwh} / kWh</Text>
                  </View>

                  <View style={styles.gunsAvailRow}>
                    <CheckCircle2 size={13} color={colors.trafficGreen} />
                    <Text style={[styles.gunsAvailText, { color: colors.trafficGreen }]}>
                      {bay.availableGuns} of {bay.totalGuns} guns available now
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Live Charging & Energy Estimator */}
        <Animated.View entering={fluidEntering(40)}>
          <Card variant="flat" padding="md" style={styles.estimatorCard}>
            <Text style={[styles.estimatorTitle, { color: colors.onSurface }]}>Charging Calculator</Text>

            <View style={styles.socRow}>
              <View style={styles.socBlock}>
                <Text style={[styles.socLabel, { color: colors.onSurfaceVariant }]}>CURRENT SOC</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.socAdjustBtn, { backgroundColor: colors.surfaceContainerLow }]}
                    onPress={() => {
                      haptics.selection();
                      setCurrentSoc((prev) => Math.max(5, prev - 10));
                    }}>
                    <Text style={[styles.socAdjustText, { color: colors.onSurface }]}>-10</Text>
                  </TouchableOpacity>
                  <Text style={[styles.socVal, { color: colors.onSurface }]}>{currentSoc}%</Text>
                  <TouchableOpacity
                    style={[styles.socAdjustBtn, { backgroundColor: colors.surfaceContainerLow }]}
                    onPress={() => {
                      haptics.selection();
                      setCurrentSoc((prev) => Math.min(targetSoc - 5, prev + 10));
                    }}>
                    <Text style={[styles.socAdjustText, { color: colors.onSurface }]}>+10</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.socArrow, { backgroundColor: colors.surfaceContainerHigh }]} />

              <View style={styles.socBlock}>
                <Text style={[styles.socLabel, { color: colors.onSurfaceVariant }]}>TARGET SOC</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  {[80, 90, 100].map((soc) => (
                    <TouchableOpacity
                      key={soc}
                      style={[
                        styles.targetChip,
                        {
                          backgroundColor: targetSoc === soc ? colors.primaryContainer : colors.surfaceContainerLow,
                          borderColor: targetSoc === soc ? colors.primary : colors.surfaceContainerHigh,
                        },
                      ]}
                      onPress={() => {
                        haptics.selection();
                        setTargetSoc(soc);
                      }}>
                      <Text
                        style={[
                          styles.targetChipText,
                          { color: targetSoc === soc ? colors.primary : colors.onSurfaceVariant },
                        ]}>
                        {soc}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={[styles.estimatorOutput, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.estItem}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.estValue, { color: colors.onSurface }]}>{chargingTimeMinutes} min</Text>
                <Text style={[styles.estLabel, { color: colors.onSurfaceVariant }]}>EST. TIME</Text>
              </View>

              <View style={[styles.estDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

              <View style={styles.estItem}>
                <Zap size={14} color={colors.secondary} />
                <Text style={[styles.estValue, { color: colors.onSurface }]}>{energyNeededKwh.toFixed(1)} kWh</Text>
                <Text style={[styles.estLabel, { color: colors.onSurfaceVariant }]}>ENERGY</Text>
              </View>

              <View style={[styles.estDivider, { backgroundColor: colors.surfaceContainerHigh }]} />

              <View style={styles.estItem}>
                <IndianRupee size={14} color={colors.primary} />
                <Text style={[styles.estValue, { color: colors.primary }]}>₹{totalCost}</Text>
                <Text style={[styles.estLabel, { color: colors.onSurfaceVariant }]}>TOTAL COST</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Docked Sticky Reservation Action Bar */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.surfaceContainerHigh,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}>
        <View style={styles.dockContent}>
          <View style={styles.dockSummary}>
            <View style={styles.dockPriceRow}>
              <IndianRupee size={16} color={colors.primary} />
              <Text style={[styles.dockPriceText, { color: colors.primary }]}>{totalCost}</Text>
              <Text style={[styles.dockPriceSub, { color: colors.onSurfaceVariant }]}>
                ({energyNeededKwh.toFixed(1)} kWh)
              </Text>
            </View>
            <Text style={[styles.dockMetaText, { color: colors.onSurfaceVariant }]}>
              {activeBay.type} · {chargingTimeMinutes} min est.
            </Text>
          </View>

          <View style={styles.dockButtonWrapper}>
            <Button
              title={`Reserve Gun (${activeBay.powerKw}kW)`}
              onPress={handleReserveSlot}
              size="md"
              variant="primary"
              leftIcon={<Zap size={18} color={colors.onPrimary} />}
              style={styles.dockReserveBtn}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  navTopBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationCard: {
    borderRadius: Radius.xl,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stationName: {
    ...Typography.titleSmall,
    fontWeight: '800',
    marginTop: 4,
  },
  stationAddress: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  ratingText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  digiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 12,
    borderWidth: 1,
  },
  digiTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  digiTagText: {
    ...Typography.labelSmall,
    fontSize: 9,
    fontWeight: '800',
  },
  digiCode: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  digiHint: {
    ...Typography.bodySmall,
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  availText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  timingText: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginTop: 4,
  },
  connectorList: {
    gap: 10,
  },
  connectorCard: {
    borderRadius: Radius.lg,
  },
  connectorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  connectorType: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  powerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  powerText: {
    ...Typography.labelSmall,
    fontWeight: '800',
  },
  connectorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  voltageText: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  priceText: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  gunsAvailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  gunsAvailText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  estimatorCard: {
    borderRadius: Radius.xl,
  },
  estimatorTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    marginBottom: 10,
  },
  socRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  socBlock: {
    alignItems: 'center',
  },
  socLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  socVal: {
    ...Typography.titleLarge,
    fontWeight: '800',
  },
  socAdjustBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  socAdjustText: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontSize: 9,
  },
  targetChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  targetChipText: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontSize: 10,
  },
  socArrow: {
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  estimatorOutput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  estItem: {
    alignItems: 'center',
    gap: 2,
  },
  estValue: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  estLabel: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  estDivider: {
    width: 1,
    height: 24,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: Spacing.md,
    ...Shadows.lg,
  },
  dockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  dockSummary: {
    flex: 1,
  },
  dockPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dockPriceText: {
    ...Typography.titleMedium,
    fontWeight: '800',
    fontSize: 20,
  },
  dockPriceSub: {
    ...Typography.bodySmall,
    marginLeft: 4,
  },
  dockMetaText: {
    ...Typography.bodySmall,
    marginTop: 2,
    fontSize: 12,
  },
  dockButtonWrapper: {
    minWidth: 170,
  },
  dockReserveBtn: {
    height: 48,
  },
});
