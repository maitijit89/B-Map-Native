import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationState {
  coords: LocationCoordinates | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
}

// Default Fallback Coordinate (Connaught Place, New Delhi - GIS Center)
export const DEFAULT_FALLBACK_LOCATION: LocationCoordinates = {
  latitude: 28.6315,
  longitude: 77.2167,
  altitude: 216,
  accuracy: 10,
  heading: 0,
  speed: 0,
};

class LocationService {
  private subscription: Location.LocationSubscription | null = null;

  /**
   * Request Foreground Location Permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.warn('LocationService: Failed to request foreground location permission', error);
      return false;
    }
  }

  /**
   * Get Current Single Position
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return DEFAULT_FALLBACK_LOCATION;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };
    } catch (error) {
      console.warn('LocationService: Failed to get current position, using default', error);
      return DEFAULT_FALLBACK_LOCATION;
    }
  }

  /**
   * Start Live Position Watching
   */
  async startLocationUpdates(
    callback: (location: LocationCoordinates) => void,
    distanceIntervalMeters: number = 5
  ): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      callback(DEFAULT_FALLBACK_LOCATION);
      return false;
    }

    try {
      if (this.subscription) {
        this.subscription.remove();
      }

      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: distanceIntervalMeters,
          timeInterval: 2000,
        },
        (loc) => {
          callback({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitude: loc.coords.altitude,
            accuracy: loc.coords.accuracy,
            heading: loc.coords.heading,
            speed: loc.coords.speed,
          });
        }
      );
      return true;
    } catch (error) {
      console.warn('LocationService: Failed to watch location', error);
      callback(DEFAULT_FALLBACK_LOCATION);
      return false;
    }
  }

  /**
   * Stop Live Location Updates
   */
  stopLocationUpdates(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}

export const locationService = new LocationService();
