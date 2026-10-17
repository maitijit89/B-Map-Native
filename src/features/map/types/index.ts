export type TransitMode = 'drive' | 'transit' | 'ride' | 'bike' | 'walk';
export type MapLayerType = 'standard' | 'satellite' | 'night' | 'navic';

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapViewport {
  center: MapCoordinates;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  coordinates: MapCoordinates;
  rating?: number;
  address?: string;
}
