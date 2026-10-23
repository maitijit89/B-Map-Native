import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedPlaceItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voiceGuidance: boolean;
  voiceVolume: number;
  speedLimitAlerts: boolean;
  unitSystem: 'metric' | 'imperial';
  hapticFeedback: boolean;
  trafficOverlay: boolean;
  evConnectorTypes: string[];
}

export interface EvVehicleProfile {
  brand: string;
  model: string;
  batteryCapacityKwh: number;
  connectorType: string;
  maxChargeRateKw: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  voiceGuidance: true,
  voiceVolume: 1.0,
  speedLimitAlerts: true,
  unitSystem: 'metric',
  hapticFeedback: true,
  trafficOverlay: true,
  evConnectorTypes: ['CCS2', 'Type 2'],
};

const STORAGE_KEYS = {
  PREFERENCES: '@bmap/user_preferences',
  SAVED_PLACES: '@bmap/saved_places',
  SEARCH_HISTORY: '@bmap/search_history',
  EV_PROFILE: '@bmap/ev_profile',
  OFFLINE_REGIONS: '@bmap/offline_regions',
  RESERVATIONS: '@bmap/reservations',
};

class StorageService {
  /**
   * Save user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (json) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(json) };
      }
    } catch (e) {
      console.warn('StorageService: Failed to load preferences', e);
    }
    return DEFAULT_PREFERENCES;
  }

  async savePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService: Failed to save preferences', e);
    }
    return updated;
  }

  /**
   * Saved Places Management
   */
  async getSavedPlaces(): Promise<SavedPlaceItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PLACES);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.warn('StorageService: Failed to load saved places', e);
      return [];
    }
  }

  async addSavedPlace(place: Omit<SavedPlaceItem, 'id' | 'createdAt'>): Promise<SavedPlaceItem[]> {
    const current = await this.getSavedPlaces();
    const newItem: SavedPlaceItem = {
      ...place,
      id: `place_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...current.filter((p) => p.name !== place.name)];
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService: Failed to add saved place', e);
    }
    return updated;
  }

  async removeSavedPlace(id: string): Promise<SavedPlaceItem[]> {
    const current = await this.getSavedPlaces();
    const updated = current.filter((p) => p.id !== id);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService: Failed to remove saved place', e);
    }
    return updated;
  }

  /**
   * Search History Management
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  async addSearchQuery(query: string): Promise<string[]> {
    if (!query.trim()) return await this.getSearchHistory();
    const current = await this.getSearchHistory();
    const updated = [query.trim(), ...current.filter((q) => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 15);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService: Failed to add search query', e);
    }
    return updated;
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (e) {
      console.warn('StorageService: Failed to clear search history', e);
    }
  }

  /**
   * EV Vehicle Profile
   */
  async getEvProfile(): Promise<EvVehicleProfile | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.EV_PROFILE);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  async saveEvProfile(profile: EvVehicleProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EV_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('StorageService: Failed to save EV profile', e);
    }
  }
}

export const storageService = new StorageService();
