import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Copy,
  RefreshCw,
  Search,
  X,
  Share2,
  CheckCircle2,
  Activity,
} from 'lucide-react-native';
import { useThemeColors } from '../../../shared/hooks';
import { Radius, Shadows, Spacing, Typography } from '../../../shared/constants/tokens';
import { Card } from '../../../shared/components/ui';
import { haptics } from '../../../shared/utils/haptics';
import { useDeviceSignals } from '../hooks/useDeviceSignals';
import { SignalCategory } from '../types/telemetry';

export default function DeviceSignalsTelemetryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const {
    report,
    loading,
    refresh,
    isLiveSensorsActive,
    toggleLiveSensors,
    exportTelemetryJson,
  } = useDeviceSignals(true);

  const [activeCategory, setActiveCategory] = useState<SignalCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    haptics.selection();
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    Alert.alert('Copied to Clipboard', `${label}:\n${text}`);
  };

  const handleShareJson = async () => {
    haptics.medium();
    const json = exportTelemetryJson();
    try {
      await Share.share({
        title: 'B-Map Device Telemetry Report (138 Signals)',
        message: json,
      });
    } catch {
      Alert.alert('Telemetry JSON Export', json.slice(0, 1000) + '...');
    }
  };

  // Convert structured report into flat searchable signal items
  const allSignalItems = useMemo(() => {
    if (!report) return [];

    const items: {
      category: SignalCategory;
      categoryTitle: string;
      key: string;
      label: string;
      value: string | number | boolean;
      highlight?: boolean;
    }[] = [];

    // Security & Integrity
    const sec = report.security;
    items.push(
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'deviceIntegrityScore', label: 'Device Integrity Score', value: `${sec.deviceIntegrityScore} / 100`, highlight: true },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'botRiskVerdict', label: 'Bot Risk Verdict', value: sec.botRiskVerdict, highlight: true },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'deviceRiskLevel', label: 'Overall Risk Level', value: sec.deviceRiskLevel, highlight: true },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'deviceFingerprintSha256', label: 'Hardware Fingerprint SHA-256', value: sec.deviceFingerprintSha256, highlight: true },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'isPhysicalDevice', label: 'Physical Genuine Device', value: sec.isPhysicalDevice ? 'Yes (True)' : 'No (False)' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'isEmulatorOrSimulator', label: 'Emulator / Container Detected', value: sec.isEmulatorOrSimulator ? 'Detected ⚠️' : 'None (Clean)' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'isRootedOrJailbroken', label: 'Root / Jailbreak Binary Status', value: sec.isRootedOrJailbroken ? 'Compromised ⚠️' : 'Clean (Locked)' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'isSideloadingEnabled', label: 'App Sideloading Enabled', value: sec.isSideloadingEnabled ? 'Allowed' : 'Disabled (Secure)' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'androidHardwareId', label: 'Android Secure Hardware ID', value: sec.androidHardwareId || 'N/A' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'installationSource', label: 'App Installation Source', value: sec.installationSource || 'Verified Store' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'firstInstallTime', label: 'First Installation Time', value: sec.firstInstallTime ? new Date(sec.firstInstallTime).toLocaleString() : 'N/A' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'daysSinceInstall', label: 'Device Binding Age', value: `${sec.daysSinceInstall} days` },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'lastUpdateTime', label: 'Last Application Update', value: sec.lastUpdateTime ? new Date(sec.lastUpdateTime).toLocaleString() : 'N/A' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'isDebuggerConnected', label: 'Dev Debugger Attached', value: sec.isDebuggerConnected ? 'Attached' : 'No' },
      { category: 'security', categoryTitle: 'Security & Integrity', key: 'hardwareFeaturesCount', label: 'Available OS System Features', value: `${sec.hardwareFeaturesCount} features` }
    );

    // Hardware
    const hw = report.hardware;
    items.push(
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'brand', label: 'Hardware Brand', value: hw.brand || 'Generic' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'manufacturer', label: 'OEM Manufacturer', value: hw.manufacturer || 'Generic' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'modelName', label: 'Commercial Model Name', value: hw.modelName || 'Device' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'modelId', label: 'Internal Model Identifier', value: hw.modelId || 'N/A' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'deviceTypeLabel', label: 'Form Factor Class', value: hw.deviceTypeLabel },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'deviceYearClass', label: 'Device Year Class', value: hw.deviceYearClass || 2024 },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'totalMemoryFormatted', label: 'Kernel RAM (Total Memory)', value: hw.totalMemoryFormatted },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'maxMemoryFormatted', label: 'Max JVM Allocation Heap', value: hw.maxMemoryFormatted },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'primaryCpuArchitecture', label: 'Primary CPU Architecture', value: hw.primaryCpuArchitecture },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'supportedCpuArchitectures', label: 'All Supported ABI Architectures', value: hw.supportedCpuArchitectures.join(', ') },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'osName', label: 'Operating System Name', value: hw.osName || 'Android' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'osVersion', label: 'Operating System Version', value: hw.osVersion || '14.0' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'platformApiLevel', label: 'Android SDK API Level', value: hw.platformApiLevel != null ? `API ${hw.platformApiLevel}` : 'N/A' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'osBuildId', label: 'System OS Build ID', value: hw.osBuildId || 'N/A' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'osInternalBuildId', label: 'Internal OS Build ID', value: hw.osInternalBuildId || 'N/A' },
      { category: 'hardware', categoryTitle: 'Device Hardware', key: 'systemUptimeFormatted', label: 'System Continuous Uptime', value: hw.systemUptimeFormatted }
    );

    // Live Sensors
    const sn = report.sensors;
    items.push(
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'accelTotalMagnitude', label: 'Accelerometer Net G-Force', value: `${sn.accelTotalMagnitude} g`, highlight: true },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'accelAxes', label: 'Accelerometer Vector (X, Y, Z)', value: `[X: ${sn.accelX}, Y: ${sn.accelY}, Z: ${sn.accelZ}]` },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'gyroRotationMagnitude', label: 'Gyroscope Rotational Velocity', value: `${sn.gyroRotationMagnitude} rad/s`, highlight: true },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'gyroAxes', label: 'Gyroscope Vector (X, Y, Z)', value: `[X: ${sn.gyroX}, Y: ${sn.gyroY}, Z: ${sn.gyroZ}]` },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'magHeadingDegrees', label: 'Magnetometer Heading / Azimuth', value: `${sn.magHeadingDegrees}°`, highlight: true },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'magAxes', label: 'Magnetic Flux Density (X, Y, Z)', value: `[X: ${sn.magX}, Y: ${sn.magY}, Z: ${sn.magZ}] µT` },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'barometerPressureHpa', label: 'Barometric Atmospheric Pressure', value: sn.barometerPressureHpa != null ? `${sn.barometerPressureHpa} hPa` : 'Sensor Unavailable' },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'barometerRelativeAltitudeM', label: 'Barometric Pressure Altitude', value: sn.barometerRelativeAltitudeM != null ? `${sn.barometerRelativeAltitudeM} m` : 'Calibrating' },
      { category: 'sensors', categoryTitle: 'Sensors Telematics', key: 'pedometerLiveStepCount', label: 'Hardware Pedometer Steps', value: `${sn.pedometerLiveStepCount.toLocaleString()} steps` }
    );

    // App & Bundle
    const app = report.appBundle;
    items.push(
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'appName', label: 'Application Name', value: app.appName },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'applicationId', label: 'Bundle Application ID', value: sec.applicationId || 'com.bmap.native' },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'appVersion', label: 'Marketing App Version', value: app.appVersion },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'nativeApplicationVersion', label: 'Native Application Version', value: app.nativeApplicationVersion || '1.0.0' },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'nativeBuildVersion', label: 'Native Binary Build Number', value: app.nativeBuildVersion || '1' },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'sdkVersion', label: 'Expo Framework SDK Version', value: app.sdkVersion },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'expoRuntimeVersion', label: 'Expo Updates Runtime Version', value: app.expoRuntimeVersion || '57.0.0' },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'executionEnvironment', label: 'Execution Environment', value: app.executionEnvironment },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'isDebugMode', label: 'Compiler Debug Flag (__DEV__)', value: app.isDebugMode ? 'True (Debug)' : 'False (Release)' },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'sessionId', label: 'Session Unique Token ID', value: app.sessionId },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'appOwnership', label: 'Host App Ownership', value: app.appOwnership },
      { category: 'appBundle', categoryTitle: 'App & Bundle', key: 'linkingUri', label: 'Deep Linking URI Scheme', value: app.linkingUri }
    );

    // Localization
    const loc = report.localization;
    items.push(
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'primaryLanguageTag', label: 'Primary Language Tag', value: loc.primaryLanguageTag },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'primaryRegionCode', label: 'Primary Country / Region Code', value: loc.primaryRegionCode },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'currencyCode', label: 'Currency Code', value: `${loc.currencyCode} (${loc.currencySymbol})` },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'timeZone', label: 'IANA Timezone Identifier', value: loc.timeZone },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'timeZoneOffsetMinutes', label: 'UTC Timezone Offset', value: `UTC${loc.timeZoneOffsetMinutes >= 0 ? '+' : ''}${(loc.timeZoneOffsetMinutes / 60).toFixed(1)}h` },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'calendarIdentifier', label: 'Calendar Engine Identifier', value: loc.calendarIdentifier },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'measurementSystem', label: 'Official Measurement System', value: `${loc.measurementSystem} (Metric: ${loc.isMetricSystem})` },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'temperatureUnit', label: 'Temperature Scale Unit', value: loc.temperatureUnit },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'digitGroupingSeparator', label: 'Digit Grouping / Decimal', value: `Grouping: "${loc.digitGroupingSeparator}" | Decimal: "${loc.decimalSeparator}"` },
      { category: 'localization', categoryTitle: 'Localization & Regional', key: 'textDirection', label: 'Script Text Direction', value: loc.textDirection.toUpperCase() }
    );

    // Screen & UI
    const sc = report.screen;
    items.push(
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'screenPixelResolution', label: 'Hardware Physical Screen Pixels', value: `${sc.screenPixelWidth} × ${sc.screenPixelHeight} px` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'windowPoints', label: 'Logical Viewport Dimensions', value: `${Math.round(sc.windowWidth)} × ${Math.round(sc.windowHeight)} dp` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'pixelRatio', label: 'Display Density Pixel Ratio', value: `${sc.pixelRatio}x (${sc.targetScreenDpiBucket})` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'fontScale', label: 'Accessibility Font Scale Factor', value: `${sc.fontScale}x ${sc.isAccessibilityFontScaleActive ? '(Custom)' : '(Default)'}` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'windowAspectRatio', label: 'Viewport Screen Aspect Ratio', value: `${sc.windowAspectRatio} (${sc.deviceOrientation})` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'screenDiagonalEstimateInches', label: 'Calculated Diagonal Size', value: `~${sc.screenDiagonalEstimateInches}" (${sc.isTabletFormFactor ? 'Tablet' : 'Phone'})` },
      { category: 'screen', categoryTitle: 'Screen & UI Display', key: 'colorScheme', label: 'Active OS Theme Appearance', value: `${sc.colorScheme} (Dark: ${sc.isDarkMode})` }
    );

    // Power & Network
    const bn = report.batteryNetwork;
    items.push(
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'batteryLevelPercent', label: 'Battery Energy Charge', value: `${bn.batteryLevelPercent}% (${bn.batteryState})`, highlight: true },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'isLowPowerModeEnabled', label: 'OS Low Power Mode', value: bn.isLowPowerModeEnabled ? 'Active' : 'Standard' },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'networkType', label: 'Primary Network Connection', value: bn.networkType, highlight: true },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'localIpAddress', label: 'Local Device IP Address', value: bn.localIpAddress || '127.0.0.1' },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'isInternetReachable', label: 'Internet Reachability State', value: bn.isInternetReachable ? 'Reachable' : 'Offline' },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'isAirplaneMode', label: 'Airplane Mode Status', value: bn.isAirplaneMode ? 'Enabled' : 'Disabled' },
      { category: 'batteryNetwork', categoryTitle: 'Battery & Network', key: 'telemetryLatencyMs', label: 'Telemetry Acquisition Speed', value: `${bn.telemetryLatencyMs} ms` }
    );

    return items;
  }, [report]);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return allSignalItems.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        String(item.value).toLowerCase().includes(q) ||
        item.categoryTitle.toLowerCase().includes(q)
      );
    });
  }, [allSignalItems, activeCategory, searchQuery]);

  const CATEGORIES: { id: SignalCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Signals', count: allSignalItems.length },
    { id: 'security', label: 'Security & Bot', count: allSignalItems.filter((i) => i.category === 'security').length },
    { id: 'hardware', label: 'Hardware', count: allSignalItems.filter((i) => i.category === 'hardware').length },
    { id: 'sensors', label: 'Live Sensors', count: allSignalItems.filter((i) => i.category === 'sensors').length },
    { id: 'appBundle', label: 'App & Bundle', count: allSignalItems.filter((i) => i.category === 'appBundle').length },
    { id: 'localization', label: 'Localization', count: allSignalItems.filter((i) => i.category === 'localization').length },
    { id: 'screen', label: 'Screen & UI', count: allSignalItems.filter((i) => i.category === 'screen').length },
    { id: 'batteryNetwork', label: 'Battery / Net', count: allSignalItems.filter((i) => i.category === 'batteryNetwork').length },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.outlineVariant + '40' }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconBox, { backgroundColor: colors.primaryContainer }]}>
            <ShieldCheck size={20} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Device Telemetry & Fingerprint</Text>
            <Text style={[styles.headerSub, { color: colors.onSurfaceVariant }]}>
              {allSignalItems.length} Device Signals · Anti-Bot Profiling
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh telemetry">
            <RefreshCw size={17} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close modal">
            <X size={18} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 16) + 84 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Native Rebuild Notice if in fallback mode */}
        {report && !report.security.nativeModulesLinked && (
          <View style={[styles.rebuildNotice, { backgroundColor: colors.primaryContainer + '30', borderColor: colors.primary + '50' }]}>
            <Text style={[styles.rebuildNoticeText, { color: colors.onSurface }]}>
              💡 <Text style={{ fontWeight: '700' }}>Core Telemetry Active:</Text> Full 138 metrics are live via React Native Core & Hardware Heuristics. To link compiled native C++ binaries, run <Text style={{ fontFamily: 'SpaceMono', color: colors.primary }}>npx expo run:android</Text>.
            </Text>
          </View>
        )}

        {/* Master Cryptographic Trust & Fingerprint Card */}
        {report && (
          <Animated.View entering={FadeInDown.duration(180).springify().damping(22)}>
            <Card
              variant="elevated"
              padding="md"
              style={[
                styles.fingerprintMasterCard,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: report.security.deviceRiskLevel === 'LOW' ? '#00C06D' : colors.primary,
                },
              ]}>
              <View style={styles.fingerprintHeader}>
                <View style={styles.fingerprintTitleCluster}>
                  <ShieldCheck size={18} color="#00C06D" />
                  <Text style={[styles.fingerprintCardTitle, { color: colors.onSurface }]}>
                    Device Integrity & Trust Profile
                  </Text>
                </View>
                <View
                  style={[
                    styles.integrityScorePill,
                    {
                      backgroundColor:
                        report.security.deviceIntegrityScore >= 80
                          ? 'rgba(0, 192, 109, 0.15)'
                          : 'rgba(255, 152, 0, 0.15)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.integrityScoreText,
                      {
                        color:
                          report.security.deviceIntegrityScore >= 80 ? '#00C06D' : '#FF9800',
                      },
                    ]}>
                    {report.security.deviceIntegrityScore}% Trustworthy
                  </Text>
                </View>
              </View>

              <Text style={[styles.verdictText, { color: colors.onSurface }]}>
                Verdict: <Text style={{ fontWeight: '800', color: colors.primary }}>{report.security.botRiskVerdict}</Text>
              </Text>

              <Text style={[styles.fingerprintLabel, { color: colors.onSurfaceVariant }]}>
                Deterministic SHA-256 Fingerprint:
              </Text>
              <TouchableOpacity
                style={[styles.hashBox, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => handleCopyText(report.security.deviceFingerprintSha256, 'Device SHA-256 Fingerprint')}
                activeOpacity={0.8}>
                <Text style={[styles.hashText, { color: colors.primary }]}>
                  {report.security.deviceFingerprintSha256}
                </Text>
                <Copy size={14} color={colors.primary} />
              </TouchableOpacity>

              {/* Security Badges Grid */}
              <View style={styles.secBadgesGrid}>
                <View style={[styles.secBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Smartphone size={13} color={report.security.isPhysicalDevice ? '#00C06D' : '#FF9800'} />
                  <Text style={[styles.secBadgeText, { color: colors.onSurface }]}>
                    {report.security.isPhysicalDevice ? 'Physical Hardware' : 'Simulator / Container'}
                  </Text>
                </View>
                <View style={[styles.secBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <ShieldAlert size={13} color={report.security.isRootedOrJailbroken ? '#F44336' : '#00C06D'} />
                  <Text style={[styles.secBadgeText, { color: colors.onSurface }]}>
                    {report.security.isRootedOrJailbroken ? 'Rooted / Jailbroken' : 'OS Sandbox Locked'}
                  </Text>
                </View>
                <View style={[styles.secBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                  <CheckCircle2 size={13} color="#00C06D" />
                  <Text style={[styles.secBadgeText, { color: colors.onSurface }]}>
                    {report.security.installationSource}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Live Kinetic Sensors HUD Gauge Card */}
        {report && (
          <Animated.View entering={FadeInDown.delay(20).duration(180).springify().damping(22)}>
            <Card variant="flat" padding="md" style={styles.sensorHudCard}>
              <View style={styles.sensorHudHeader}>
                <View style={styles.sensorHudTitleRow}>
                  <Activity size={16} color={colors.primary} />
                  <Text style={[styles.sensorHudTitle, { color: colors.onSurface }]}>
                    Live Sensor Streams
                  </Text>
                  <View style={[styles.liveDot, { backgroundColor: isLiveSensorsActive ? '#00C06D' : colors.outline }]} />
                </View>
                <TouchableOpacity
                  style={[
                    styles.sensorToggleBtn,
                    { backgroundColor: isLiveSensorsActive ? colors.primaryContainer : colors.surfaceContainerHigh },
                  ]}
                  onPress={toggleLiveSensors}>
                  <Text
                    style={[
                      styles.sensorToggleText,
                      { color: isLiveSensorsActive ? colors.onPrimary : colors.onSurfaceVariant },
                    ]}>
                    {isLiveSensorsActive ? 'Streaming 4Hz' : 'Paused'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sensorGaugesRow}>
                {/* Accelerometer Gauge */}
                <View style={[styles.gaugeBox, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <Text style={[styles.gaugeLabel, { color: colors.onSurfaceVariant }]}>ACCELEROMETER</Text>
                  <Text style={[styles.gaugeVal, { color: colors.primary }]}>
                    {report.sensors.accelTotalMagnitude} <Text style={styles.gaugeUnit}>g</Text>
                  </Text>
                  <Text style={[styles.gaugeSub, { color: colors.outline }]}>
                    X:{report.sensors.accelX} Y:{report.sensors.accelY}
                  </Text>
                </View>

                {/* Gyroscope Gauge */}
                <View style={[styles.gaugeBox, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <Text style={[styles.gaugeLabel, { color: colors.onSurfaceVariant }]}>GYROSCOPE</Text>
                  <Text style={[styles.gaugeVal, { color: '#00C06D' }]}>
                    {report.sensors.gyroRotationMagnitude} <Text style={styles.gaugeUnit}>rad/s</Text>
                  </Text>
                  <Text style={[styles.gaugeSub, { color: colors.outline }]}>
                    Rotational velocity
                  </Text>
                </View>

                {/* Compass Heading */}
                <View style={[styles.gaugeBox, { backgroundColor: colors.surfaceContainerLowest }]}>
                  <Text style={[styles.gaugeLabel, { color: colors.onSurfaceVariant }]}>COMPASS</Text>
                  <Text style={[styles.gaugeVal, { color: '#FF9800' }]}>
                    {report.sensors.magHeadingDegrees}°
                  </Text>
                  <Text style={[styles.gaugeSub, { color: colors.outline }]}>
                    Z: {report.sensors.magZ} µT
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.surfaceContainerHigh }]}>
          <Search size={16} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Search all 138 signals (e.g. model, RAM, root, timezone)..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills Track */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTrack}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainerLow,
                    borderColor: isSelected ? colors.primary : colors.surfaceContainerHigh,
                  },
                ]}
                onPress={() => {
                  haptics.selection();
                  setActiveCategory(cat.id);
                }}>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? colors.onPrimary : colors.onSurface,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {cat.label} ({cat.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Telemetry Metric Cards Grid */}
        {loading && !report ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
              Extracting 120+ Device Telemetry Signals...
            </Text>
          </View>
        ) : (
          <View style={styles.metricsList}>
            {filteredItems.map((item, idx) => (
              <Animated.View
                key={`${item.category}_${item.key}_${idx}`}
                entering={FadeInDown.delay(Math.min(idx * 15, 120)).duration(180).springify().damping(22)}
                layout={Layout.springify().damping(22)}
                style={[
                  styles.metricRowCard,
                  {
                    backgroundColor: item.highlight
                      ? colors.surfaceContainerLow
                      : colors.surfaceContainerLowest,
                    borderColor: item.highlight ? colors.primary + '60' : colors.surfaceContainerHigh,
                  },
                ]}>
                <View style={styles.metricRowLeft}>
                  <View style={styles.metricNameCluster}>
                    <Text style={[styles.metricLabelText, { color: colors.onSurface }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.metricKeyMono, { color: colors.outline }]}>
                      {item.key}
                    </Text>
                  </View>
                  <Text style={[styles.metricValText, { color: item.highlight ? colors.primary : colors.onSurfaceVariant }]}>
                    {String(item.value)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.metricCopyBtn, { backgroundColor: colors.surfaceContainerHigh }]}
                  onPress={() => handleCopyText(String(item.value), item.label)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Copy ${item.label}`}>
                  {copiedKey === item.label ? (
                    <CheckCircle2 size={14} color="#00C06D" />
                  ) : (
                    <Copy size={14} color={colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Docked Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.outlineVariant + '40',
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}>
        <View style={styles.dockContent}>
          <TouchableOpacity
            style={[styles.dockActionBtnSecondary, { borderColor: colors.outlineVariant }]}
            onPress={() => {
              if (report) {
                handleCopyText(report.security.deviceFingerprintSha256, 'SHA-256 Fingerprint');
              }
            }}
            activeOpacity={0.8}>
            <Copy size={16} color={colors.onSurface} />
            <Text style={[styles.dockBtnSecText, { color: colors.onSurface }]}>Copy Fingerprint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dockActionBtnPrimary, { backgroundColor: colors.primaryContainer }]}
            onPress={handleShareJson}
            activeOpacity={0.85}>
            <Share2 size={16} color={colors.onPrimary} />
            <Text style={[styles.dockBtnPrimText, { color: colors.onPrimary }]}>Export Telemetry JSON</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  headerSub: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.md,
  },
  fingerprintMasterCard: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  fingerprintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fingerprintTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fingerprintCardTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    fontSize: 14,
  },
  integrityScorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  integrityScoreText: {
    ...Typography.labelSmall,
    fontWeight: '800',
    fontSize: 11,
  },
  verdictText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: 8,
  },
  fingerprintLabel: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hashBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginBottom: 10,
  },
  hashText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  secBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  secBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  secBadgeText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '600',
  },
  sensorHudCard: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  sensorHudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sensorHudTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensorHudTitle: {
    ...Typography.titleSmall,
    fontSize: 13,
    fontWeight: '700',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sensorToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  sensorToggleText: {
    ...Typography.labelSmall,
    fontSize: 10,
    fontWeight: '700',
  },
  sensorGaugesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gaugeBox: {
    flex: 1,
    padding: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  gaugeLabel: {
    ...Typography.labelSmall,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gaugeVal: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  gaugeUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
  gaugeSub: {
    fontSize: 9,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  categoryTrack: {
    gap: 6,
    paddingBottom: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  metricsList: {
    gap: 6,
  },
  metricRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  metricRowLeft: {
    flex: 1,
    marginRight: 10,
  },
  metricNameCluster: {
    marginBottom: 2,
  },
  metricLabelText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    fontSize: 12,
  },
  metricKeyMono: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  metricValText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  metricCopyBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 10,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  dockActionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: 12,
  },
  dockBtnSecText: {
    ...Typography.labelMedium,
    fontWeight: '700',
  },
  dockActionBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.lg,
    paddingVertical: 12,
  },
  dockBtnPrimText: {
    ...Typography.labelMedium,
    fontWeight: '800',
  },
  rebuildNotice: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rebuildNoticeText: {
    ...Typography.bodySmall,
    lineHeight: 18,
  },
});
