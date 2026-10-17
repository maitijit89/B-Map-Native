export interface LatLng {
  latitude: number;
  longitude: number;
}

export type ColorScheme = 'light' | 'dark';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
