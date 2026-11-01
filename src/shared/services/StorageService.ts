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

export type VoiceLanguageCode =
  | 'en'
  | 'bn'
  | 'hi'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as';

export type UserGender = 'male' | 'female' | 'other';
export type VoiceGender = 'female' | 'male';

export function getPairedVoiceGender(gender: UserGender): VoiceGender {
  return gender === 'male' ? 'female' : 'male';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voiceGuidance: boolean;
  voiceVolume: number;
  voiceLanguage: VoiceLanguageCode;
  speedLimitAlerts: boolean;
  unitSystem: 'metric' | 'imperial';
  hapticFeedback: boolean;
  trafficOverlay: boolean;
  evConnectorTypes: string[];
  userGender?: UserGender;
  voiceGender?: VoiceGender;
}

export interface EvVehicleProfile {
  brand: string;
  model: string;
  batteryCapacityKwh: number;
  connectorType: string;
  maxChargeRateKw: number;
}

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  digipin?: string;
  bloodGroup?: string;
  gender: UserGender;
  voiceGender?: VoiceGender;
}

export type HazardType =
  | 'pothole'
  | 'waterlogging'
  | 'speed_trap'
  | 'accident'
  | 'roadwork'
  | 'breakdown';

export type HazardSeverity = 'low' | 'medium' | 'high';

export interface HazardReportItem {
  id: string;
  hazardType: HazardType;
  label: string;
  severity: HazardSeverity;
  lanePosition: string;
  latitude: number;
  longitude: number;
  address: string;
  digipin: string;
  description?: string;
  photoUri?: string | null;
  verifiedCount: number;
  unverifiedCount: number;
  trustScore: number;
  reportedAt: string;
  isUserReport?: boolean;
  cleared?: boolean;
}

export const SEED_HAZARDS: HazardReportItem[] = [
  {
    id: 'hazard_seed_1',
    hazardType: 'pothole',
    label: 'Pothole / Road Damage',
    severity: 'high',
    lanePosition: 'Right Lane',
    latitude: 28.3587,
    longitude: 76.9428,
    address: 'NH-48 Jaipur Highway Corridor, km 42.4 (Near Manesar)',
    digipin: '28J4-K8M2-9P',
    description: 'Deep road depression after flyover descent. Speed reduction advised.',
    verifiedCount: 18,
    unverifiedCount: 1,
    trustScore: 94,
    reportedAt: '12 min ago',
    isUserReport: false,
    cleared: false,
  },
  {
    id: 'hazard_seed_2',
    hazardType: 'waterlogging',
    label: 'Waterlogging / Flood',
    severity: 'high',
    lanePosition: 'Left Lane',
    latitude: 28.5833,
    longitude: 77.2514,
    address: 'Barapullah Elevated Corridor, Sarai Kale Khan Ramp',
    digipin: '28J3-M9P2-4Q',
    description: 'Heavy rain puddle accumulation; 15cm standing water in curb lane.',
    verifiedCount: 32,
    unverifiedCount: 2,
    trustScore: 98,
    reportedAt: '25 min ago',
    isUserReport: false,
    cleared: false,
  },
  {
    id: 'hazard_seed_3',
    hazardType: 'speed_trap',
    label: 'Speed Radar / Interceptor',
    severity: 'medium',
    lanePosition: 'Center Lane',
    latitude: 28.4952,
    longitude: 77.0891,
    address: 'Cyber City Boulevard, DLF Phase 2 Corridor',
    digipin: '28J4-L6N8-1V',
    description: 'Highway police laser interceptor deployed. Strict 60 km/h radar.',
    verifiedCount: 45,
    unverifiedCount: 3,
    trustScore: 96,
    reportedAt: '42 min ago',
    isUserReport: false,
    cleared: false,
  },
  {
    id: 'hazard_seed_4',
    hazardType: 'roadwork',
    label: 'Road Construction',
    severity: 'medium',
    lanePosition: 'Shoulder / Flyover',
    latitude: 28.6271,
    longitude: 77.3725,
    address: 'Delhi-Meerut Expressway km 18.2 (Indirapuram Flyover)',
    digipin: '28K2-P4R8-7T',
    description: 'Expansion joint resurfacing. Diversion barricades in place.',
    verifiedCount: 21,
    unverifiedCount: 0,
    trustScore: 99,
    reportedAt: '1 hour ago',
    isUserReport: false,
    cleared: false,
  },
  {
    id: 'hazard_seed_5',
    hazardType: 'accident',
    label: 'Traffic Accident',
    severity: 'high',
    lanePosition: 'Center Lane',
    latitude: 28.5702,
    longitude: 77.2589,
    address: 'Ring Road Ashram Underpass (Eastbound)',
    digipin: '28J3-X7Y1-5W',
    description: 'Minor fender bender blocking 1 lane. Traffic slowing down.',
    verifiedCount: 56,
    unverifiedCount: 4,
    trustScore: 92,
    reportedAt: '1 hour ago',
    isUserReport: false,
    cleared: false,
  },
];

export const DEFAULT_USER_PROFILE: UserProfileData = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  digipin: '28J4-K8M2-9P',
  bloodGroup: 'O+',
  gender: 'male',
  voiceGender: 'female',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  voiceGuidance: true,
  voiceVolume: 1.0,
  voiceLanguage: 'en',
  speedLimitAlerts: true,
  unitSystem: 'metric',
  hapticFeedback: false,
  trafficOverlay: true,
  evConnectorTypes: ['CCS2', 'Type 2'],
  userGender: 'male',
  voiceGender: 'female',
};

const STORAGE_KEYS = {
  PREFERENCES: '@bmap/user_preferences',
  SAVED_PLACES: '@bmap/saved_places',
  SEARCH_HISTORY: '@bmap/search_history',
  EV_PROFILE: '@bmap/ev_profile',
  OFFLINE_REGIONS: '@bmap/offline_regions',
  RESERVATIONS: '@bmap/reservations',
  USER_PROFILE: '@bmap/user_profile',
  HAZARD_REPORTS: '@bmap/hazard_reports',
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
      if (__DEV__) {
        console.debug('StorageService: Failed to load preferences', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to save preferences', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to load saved places', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to add saved place', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to remove saved place', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to add search query', e);
      }
    }
    return updated;
  }

  async clearSearchHistory(): Promise<void> {
    this.cache.set(STORAGE_KEYS.SEARCH_HISTORY, []);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (e) {
      if (__DEV__) {
        console.debug('StorageService: Failed to clear search history', e);
      }
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
      if (__DEV__) {
        console.debug('StorageService: Failed to save EV profile', e);
      }
    }
  }

  /**
   * User Identity Profile
   */
  async getUserProfile(): Promise<UserProfileData> {
    if (this.cache.has(STORAGE_KEYS.USER_PROFILE)) {
      return this.cache.get(STORAGE_KEYS.USER_PROFILE);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (json) {
        const loaded = { ...DEFAULT_USER_PROFILE, ...JSON.parse(json) };
        this.cache.set(STORAGE_KEYS.USER_PROFILE, loaded);
        return loaded;
      }
    } catch {
      // fallback
    }
    this.cache.set(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  }

  async saveUserProfile(profile: Partial<UserProfileData>): Promise<UserProfileData> {
    const current = await this.getUserProfile();
    const updated = { ...current, ...profile };
    this.cache.set(STORAGE_KEYS.USER_PROFILE, updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    } catch (e) {
      if (__DEV__) {
        console.debug('StorageService: Failed to save user profile', e);
      }
    }
    return updated;
  }

  /**
   * Community Hazard Reports Management
   */
  async getHazardReports(): Promise<HazardReportItem[]> {
    if (this.cache.has(STORAGE_KEYS.HAZARD_REPORTS)) {
      return this.cache.get(STORAGE_KEYS.HAZARD_REPORTS);
    }
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.HAZARD_REPORTS);
      if (json) {
        const loaded: HazardReportItem[] = JSON.parse(json);
        this.cache.set(STORAGE_KEYS.HAZARD_REPORTS, loaded);
        return loaded;
      }
    } catch (e) {
      if (__DEV__) {
        console.debug('StorageService: Failed to load hazard reports', e);
      }
    }
    this.cache.set(STORAGE_KEYS.HAZARD_REPORTS, SEED_HAZARDS);
    return SEED_HAZARDS;
  }

  async addHazardReport(
    report: Omit<HazardReportItem, 'id' | 'reportedAt' | 'verifiedCount' | 'unverifiedCount' | 'trustScore'>
  ): Promise<HazardReportItem> {
    const current = await this.getHazardReports();
    const newItem: HazardReportItem = {
      ...report,
      id: `hazard_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reportedAt: 'Just now',
      verifiedCount: 1,
      unverifiedCount: 0,
      trustScore: 95,
      isUserReport: true,
      cleared: false,
    };
    const updated = [newItem, ...current];
    this.cache.set(STORAGE_KEYS.HAZARD_REPORTS, updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAZARD_REPORTS, JSON.stringify(updated));
    } catch (e) {
      if (__DEV__) {
        console.debug('StorageService: Failed to add hazard report', e);
      }
    }
    return newItem;
  }

  async voteHazardReport(id: string, isStillThere: boolean): Promise<HazardReportItem | null> {
    const current = await this.getHazardReports();
    let updatedItem: HazardReportItem | null = null;
    const updated = current.map((item) => {
      if (item.id === id) {
        const verifiedCount = isStillThere ? item.verifiedCount + 1 : item.verifiedCount;
        const unverifiedCount = !isStillThere ? item.unverifiedCount + 1 : item.unverifiedCount;
        const total = verifiedCount + unverifiedCount;
        const trustScore = Math.max(10, Math.min(100, Math.round((verifiedCount / total) * 100)));
        const cleared = unverifiedCount >= 5 && unverifiedCount > verifiedCount * 2;
        updatedItem = {
          ...item,
          verifiedCount,
          unverifiedCount,
          trustScore,
          cleared,
        };
        return updatedItem;
      }
      return item;
    });

    this.cache.set(STORAGE_KEYS.HAZARD_REPORTS, updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAZARD_REPORTS, JSON.stringify(updated));
    } catch (e) {
      if (__DEV__) {
        console.debug('StorageService: Failed to update hazard report vote', e);
      }
    }
    return updatedItem;
  }
}

export const storageService = new StorageService();
