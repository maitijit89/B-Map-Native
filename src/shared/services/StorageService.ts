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

/**
 * Ultra-fast StorageService with synchronous in-memory read caching and
 * non-blocking asynchronous disk persistence.
 */
class StorageService {
  private cache = new Map<string, any>();

  /**
   * Save user preferences with synchronous memory lookup and async persistence.
   */
  async getPreferences(): Promise<UserPreferences> {
    if (this.cache.has(STORAGE_KEYS.PREFERENCES)) {
      return this.cache.get(STORAGE_KEYS.PREFERENCES);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (json) {
        const loaded = { ...DEFAULT_PREFERENCES, ...JSON.parse(json) };
        this.cache.set(STORAGE_KEYS.PREFERENCES, loaded);
        return loaded;
      }
    } catch (e) {
      console.warn('StorageService: Failed to load preferences', e);
    }
    this.cache.set(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  }

  async savePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    this.cache.set(STORAGE_KEYS.PREFERENCES, updated);
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
    if (this.cache.has(STORAGE_KEYS.SAVED_PLACES)) {
      return this.cache.get(STORAGE_KEYS.SAVED_PLACES);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PLACES);
      const loaded = json ? JSON.parse(json) : [];
      this.cache.set(STORAGE_KEYS.SAVED_PLACES, loaded);
      return loaded;
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
    this.cache.set(STORAGE_KEYS.SAVED_PLACES, updated);
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
    this.cache.set(STORAGE_KEYS.SAVED_PLACES, updated);
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
    if (this.cache.has(STORAGE_KEYS.SEARCH_HISTORY)) {
      return this.cache.get(STORAGE_KEYS.SEARCH_HISTORY);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      const loaded = json ? JSON.parse(json) : [];
      this.cache.set(STORAGE_KEYS.SEARCH_HISTORY, loaded);
      return loaded;
    } catch {
      return [];
    }
  }

  async addSearchQuery(query: string): Promise<string[]> {
    if (!query.trim()) return await this.getSearchHistory();
    const current = await this.getSearchHistory();
    const updated = [
      query.trim(),
      ...current.filter((q) => q.toLowerCase() !== query.trim().toLowerCase()),
    ].slice(0, 15);
    this.cache.set(STORAGE_KEYS.SEARCH_HISTORY, updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService: Failed to add search query', e);
    }
    return updated;
  }

  async clearSearchHistory(): Promise<void> {
    this.cache.set(STORAGE_KEYS.SEARCH_HISTORY, []);
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
    if (this.cache.has(STORAGE_KEYS.EV_PROFILE)) {
      return this.cache.get(STORAGE_KEYS.EV_PROFILE);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.EV_PROFILE);
      const loaded = json ? JSON.parse(json) : null;
      this.cache.set(STORAGE_KEYS.EV_PROFILE, loaded);
      return loaded;
    } catch {
      return null;
    }
  }

  async saveEvProfile(profile: EvVehicleProfile): Promise<void> {
    this.cache.set(STORAGE_KEYS.EV_PROFILE, profile);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EV_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('StorageService: Failed to save EV profile', e);
    }
  }
}

export const storageService = new StorageService();
