export interface RouteStep {
  instruction: string;
  distance: string;
  iconName: string;
  roadName: string;
  maneuver?: 'turn-left' | 'turn-right' | 'straight' | 'u-turn' | 'fork';
}

export interface RouteOption {
  id: string;
  name: string;
  duration: string;
  distance: string;
  tollCost?: string;
  isFastest?: boolean;
  hasTraffic?: boolean;
}

export interface NavigationSession {
  currentSpeedKmh: number;
  speedLimitKmh: number;
  eta: string;
  remainingDistanceKm: number;
  remainingTimeMin: number;
  currentStreet: string;
}
