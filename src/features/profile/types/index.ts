export interface SavedPlace {
  id: string;
  title: string;
  type: 'home' | 'work' | 'favorite' | 'custom';
  address: string;
  latitude: number;
  longitude: number;
}

export interface TravelBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface OfflineMapRegion {
  id: string;
  name: string;
  sizeMb: number;
  downloaded: boolean;
  expiresInDays?: number;
}
