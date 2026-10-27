export enum DeviceType {
  UNKNOWN = 0,
  PHONE = 1,
  TABLET = 2,
  DESKTOP = 3,
  TV = 4,
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BotRiskVerdict =
  | 'GENUINE_HUMAN_DEVICE'
  | 'SUSPICIOUS_CONTAINER'
  | 'EMULATOR_FARM'
  | 'COMPROMISED_ROOT';

export interface DeviceHardwareSignals {
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  modelId: string | null;
  designName: string | null;
  productName: string | null;
  deviceName: string | null;
  deviceType: DeviceType | string;
  deviceTypeLabel: string;
  deviceYearClass: number | null;
  totalMemoryBytes: number | null;
  totalMemoryFormatted: string;
  maxMemoryBytes: number | null;
  maxMemoryFormatted: string;
  supportedCpuArchitectures: string[];
  primaryCpuArchitecture: string;
  cpuArchitectureCount: number;
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  osInternalBuildId: string | null;
  osBuildFingerprint: string | null;
  platformApiLevel: number | null;
  systemUptimeMs: number;
  systemUptimeFormatted: string;
}

export interface AppBundleSignals {
  appName: string;
  appSlug: string;
  appVersion: string;
  nativeApplicationVersion: string | null;
  nativeBuildVersion: string | null;
  sdkVersion: string;
  expoRuntimeVersion: string | null;
  executionEnvironment: string;
  isDebugMode: boolean;
  isHeadless: boolean;
  sessionId: string;
  appOwnership: string;
  linkingUri: string;
  expoVersion: string | null;
  statusBarHeight: number;
  systemFontsCount: number;
  systemFontsSample: string[];
  hostUri: string | null;
}

export interface SecurityIntegritySignals {
  isPhysicalDevice: boolean;
  isEmulatorOrSimulator: boolean;
  isRootedOrJailbroken: boolean;
  isSideloadingEnabled: boolean;
  androidHardwareId: string | null;
  iosIdForVendor: string | null;
  installationSource: string | null;
  firstInstallTime: string | null;
  firstInstallTimestampMs: number | null;
  lastUpdateTime: string | null;
  lastUpdateTimestampMs: number | null;
  daysSinceInstall: number;
  applicationId: string | null;
  hardwareFeaturesCount: number;
  hardwareFeaturesSample: string[];
  isDebuggerConnected: boolean;
  deviceIntegrityScore: number;
  deviceRiskLevel: RiskLevel;
  botRiskVerdict: BotRiskVerdict;
  riskFactors: string[];
  deviceFingerprintSha256: string;
  nativeModulesLinked: boolean;
}

export interface LocalizationSignals {
  primaryLanguageTag: string;
  primaryLanguageCode: string;
  primaryRegionCode: string;
  currencyCode: string;
  currencySymbol: string;
  timeZone: string;
  timeZoneOffsetMinutes: number;
  calendarIdentifier: string;
  uses24HourClock: boolean;
  firstWeekday: number;
  measurementSystem: string;
  isMetricSystem: boolean;
  textDirection: 'ltr' | 'rtl';
  digitGroupingSeparator: string;
  decimalSeparator: string;
  temperatureUnit: string;
  preferredLocalesCount: number;
  preferredLanguagesList: string[];
  isRtlLayout: boolean;
  localeSignature: string;
}

export interface ScreenUiSignals {
  windowWidth: number;
  windowHeight: number;
  screenWidth: number;
  screenHeight: number;
  windowPixelWidth: number;
  windowPixelHeight: number;
  screenPixelWidth: number;
  screenPixelHeight: number;
  windowAspectRatio: number;
  screenAspectRatio: number;
  deviceOrientation: 'portrait' | 'landscape';
  pixelRatio: number;
  fontScale: number;
  isAccessibilityFontScaleActive: boolean;
  targetScreenDpiBucket: string;
  colorScheme: 'light' | 'dark' | 'unspecified';
  isDarkMode: boolean;
  screenDiagonalEstimateInches: number;
  platformUiIdiom: string;
  isTabletFormFactor: boolean;
}

export interface SensorSignals {
  accelerometerAvailable: boolean;
  accelX: number;
  accelY: number;
  accelZ: number;
  accelTotalMagnitude: number;
  gyroscopeAvailable: boolean;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  gyroRotationMagnitude: number;
  magnetometerAvailable: boolean;
  magX: number;
  magY: number;
  magZ: number;
  magHeadingDegrees: number;
  barometerAvailable: boolean;
  barometerPressureHpa: number | null;
  barometerRelativeAltitudeM: number | null;
  pedometerAvailable: boolean;
  pedometerLiveStepCount: number;
}

export interface BatteryNetworkSignals {
  batteryAvailable: boolean;
  batteryLevelPercent: number | null;
  batteryState: string;
  isBatteryCharging: boolean;
  isLowPowerModeEnabled: boolean;
  networkAvailable: boolean;
  networkType: string;
  isNetworkConnected: boolean;
  isInternetReachable: boolean;
  isAirplaneMode: boolean;
  localIpAddress: string | null;
  networkCarrierProxy: string | null;
  isHighCostNetwork: boolean;
  networkSecurityFlag: 'SECURE' | 'OFFLINE' | 'RESTRICTED';
  telemetryCollectionTimestamp: string;
  telemetryLatencyMs: number;
}

export interface DeviceSignalsTelemetryReport {
  hardware: DeviceHardwareSignals;
  appBundle: AppBundleSignals;
  security: SecurityIntegritySignals;
  localization: LocalizationSignals;
  screen: ScreenUiSignals;
  sensors: SensorSignals;
  batteryNetwork: BatteryNetworkSignals;
  totalMetricsCollected: number;
  summary: {
    fingerprintSha256: string;
    integrityScore: number;
    riskLevel: RiskLevel;
    verdict: BotRiskVerdict;
    collectedAt: string;
    deviceSummary: string;
  };
}

export type SignalCategory =
  | 'all'
  | 'security'
  | 'hardware'
  | 'sensors'
  | 'appBundle'
  | 'localization'
  | 'screen'
  | 'batteryNetwork';
