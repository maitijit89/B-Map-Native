import { Platform, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { compassService } from './CompassService';

// Safe native module loader: returns null in Expo Go or unlinked builds without throwing
function getNativeIconModule(): {
  setAppIcon?: (icon: string | null, inBackground?: boolean) => Promise<boolean | string>;
  getAppIcon?: () => Promise<string | null>;
} | null {
  if (Platform.OS === 'web') return null;
  try {
    return requireOptionalNativeModule('ExpoDynamicAppIcon');
  } catch {
    return null;
  }
}

export type CompassIconKey = 'compassNorth' | 'compassEast' | 'compassSouth' | 'compassWest';
export type AppIconKey = 'DEFAULT' | CompassIconKey;

export interface DynamicIconOption {
  key: AppIconKey;
  label: string;
  degrees: number | null;
  cardinal: string;
  description: string;
}

export const COMPASS_ICON_OPTIONS: readonly DynamicIconOption[] = [
  {
    key: 'DEFAULT',
    label: 'Standard B-Map',
    degrees: null,
    cardinal: 'Default',
    description: 'Original blue squircle with white B-Map navigation emblem',
  },
  {
    key: 'compassNorth',
    label: 'North Compass',
    degrees: 0,
    cardinal: 'N (0°)',
    description: 'Dynamic arrow pointed directly North',
  },
  {
    key: 'compassEast',
    label: 'East Compass',
    degrees: 90,
    cardinal: 'E (90°)',
    description: 'Dynamic arrow oriented toward Sunrise East',
  },
  {
    key: 'compassSouth',
    label: 'South Compass',
    degrees: 180,
    cardinal: 'S (180°)',
    description: 'Dynamic arrow pointed Southward',
  },
  {
    key: 'compassWest',
    label: 'West Compass',
    degrees: 270,
    cardinal: 'W (270°)',
    description: 'Dynamic arrow pointed toward Sunset West',
  },
] as const;

const STORAGE_KEYS = {
  ACTIVE_ICON: '@bmap/app_icon_key',
  AUTO_SYNC: '@bmap/app_icon_autosync',
};

/**
 * Calculates the cardinal app icon key from a given degree heading (0° - 360°).
 */
export function getCardinalIconForHeading(heading: number): CompassIconKey {
  const normalized = ((heading % 360) + 360) % 360;
  if (normalized >= 45 && normalized < 135) return 'compassEast';
  if (normalized >= 135 && normalized < 225) return 'compassSouth';
  if (normalized >= 225 && normalized < 315) return 'compassWest';
  return 'compassNorth';
}

/**
 * Service managing dynamic launcher app icons for iOS & Android with
 * compass direction synchronization.
 */
class DynamicAppIconService {
  private currentIcon: AppIconKey = 'DEFAULT';
  private autoSyncEnabled: boolean = false;
  private isInitialized: boolean = false;
  private listeners = new Set<(icon: AppIconKey, autoSync: boolean) => void>();

  constructor() {
    this.init();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private async init() {
    if (this.isInitialized) return;
    try {
      const [savedIcon, savedAutoSync] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ICON),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_SYNC),
      ]);

      if (savedAutoSync !== null) {
        this.autoSyncEnabled = JSON.parse(savedAutoSync);
      }

      if (savedIcon) {
        this.currentIcon = savedIcon as AppIconKey;
      } else if (Platform.OS !== 'web') {
        try {
          const mod = getNativeIconModule();
          if (mod?.getAppIcon) {
            const nativeIcon = await mod.getAppIcon();
            this.currentIcon = (nativeIcon as AppIconKey) || 'DEFAULT';
          } else {
            this.currentIcon = 'DEFAULT';
          }
        } catch {
          this.currentIcon = 'DEFAULT';
        }
      }
    } catch {
      // Fallback defaults
    } finally {
      this.isInitialized = true;
      this.notifySubscribers();
    }
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // When app goes to background, if autoSync is enabled, sync launcher icon to current compass heading!
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      if (this.autoSyncEnabled) {
        const currentData = compassService.getCurrentData();
        const cardinalIcon = getCardinalIconForHeading(currentData.heading);
        await this.applyIcon(cardinalIcon, true);
      }
    }
  };

  /**
   * Returns current active icon key.
   */
  getCurrentIcon(): AppIconKey {
    return this.currentIcon;
  }

  /**
   * Whether auto-sync with compass heading is enabled.
   */
  isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  /**
   * Set dynamic app icon manually.
   * Passing 'DEFAULT' or null restores standard app launcher icon.
   */
  async setAppIcon(iconKey: AppIconKey): Promise<boolean> {
    const success = await this.applyIcon(iconKey, false);
    if (success) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ICON, iconKey);
      this.currentIcon = iconKey;
      this.notifySubscribers();
    }
    return success;
  }

  /**
   * Toggle automatic compass heading synchronization.
   * When enabled, leaving the app rotates the home screen icon to the heading direction.
   */
  async setAutoSync(enabled: boolean): Promise<void> {
    this.autoSyncEnabled = enabled;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(enabled));

    if (enabled) {
      const heading = compassService.getCurrentData().heading;
      const cardinalIcon = getCardinalIconForHeading(heading);
      await this.setAppIcon(cardinalIcon);
    }

    this.notifySubscribers();
  }

  /**
   * Low-level native invocation with platform safety checks.
   */
  private async applyIcon(iconKey: AppIconKey, inBackground: boolean): Promise<boolean> {
    if (Platform.OS === 'web') {
      this.currentIcon = iconKey;
      this.notifySubscribers();
      return true;
    }

    try {
      const mod = getNativeIconModule();
      if (!mod?.setAppIcon) {
        this.currentIcon = iconKey;
        this.notifySubscribers();
        return true;
      }
      const nativeParam = iconKey === 'DEFAULT' ? null : iconKey;
      const result = await mod.setAppIcon(nativeParam, inBackground);
      return result !== false;
    } catch {
      // Safe fallback (e.g. in development environments without prebuild)
      this.currentIcon = iconKey;
      this.notifySubscribers();
      return true;
    }
  }

  /**
   * Subscribe to icon and auto-sync preference updates.
   */
  subscribe(listener: (icon: AppIconKey, autoSync: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentIcon, this.autoSyncEnabled);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifySubscribers() {
    this.listeners.forEach((fn) => fn(this.currentIcon, this.autoSyncEnabled));
  }
}

export const dynamicAppIconService = new DynamicAppIconService();
