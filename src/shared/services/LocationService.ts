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
  private subscribers = new Set<(location: LocationCoordinates) => void>();
  private lastLocation: LocationCoordinates = DEFAULT_FALLBACK_LOCATION;
  private permissionGranted: boolean | null = null;
  private pendingPermissionPromise: Promise<boolean> | null = null;
  private pendingLocationPromise: Promise<LocationCoordinates> | null = null;

  /**
   * Request Foreground Location Permissions (cached result & promise deduplication)
   */
  async requestPermissions(): Promise<boolean> {
    if (this.permissionGranted !== null) {
      return this.permissionGranted;
    }

    if (this.pendingPermissionPromise) {
      return this.pendingPermissionPromise;
    }

    this.pendingPermissionPromise = (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        this.permissionGranted = status === Location.PermissionStatus.GRANTED;
        return this.permissionGranted;
      } catch (error) {
        console.warn('LocationService: Failed to request foreground location permission', error);
        return false;
      } finally {
        this.pendingPermissionPromise = null;
      }
    })();

    return this.pendingPermissionPromise;
  }

  /**
   * Get Current Single Position with fast fallback to last known and deduplication
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return this.lastLocation;
    }

    if (this.pendingLocationPromise) {
      return this.pendingLocationPromise;
    }

    this.pendingLocationPromise = (async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords: LocationCoordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        };

        this.lastLocation = coords;
        return coords;
      } catch (error) {
        console.warn('LocationService: Failed to get current position, using last known', error);
        return this.lastLocation;
      } finally {
        this.pendingLocationPromise = null;
      }
    })();

    return this.pendingLocationPromise;
  }

  /**
   * Start Live Position Watching with reference-counted subscribers
   */
  async startLocationUpdates(
    callback: (location: LocationCoordinates) => void,
    distanceIntervalMeters: number = 5
  ): Promise<boolean> {
    this.subscribers.add(callback);
    // Send immediate cached location so UI doesn't stutter or show empty
    callback(this.lastLocation);

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    if (this.subscribers.size === 1 && !this.subscription) {
      try {
        this.subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: distanceIntervalMeters,
            timeInterval: 2500,
          },
          (loc) => {
            const coords: LocationCoordinates = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              altitude: loc.coords.altitude,
              accuracy: loc.coords.accuracy,
              heading: loc.coords.heading,
              speed: loc.coords.speed,
            };
            this.lastLocation = coords;
            this.subscribers.forEach((sub) => {
              try {
                sub(coords);
              } catch (e) {
                console.warn('Location subscriber error:', e);
              }
            });
          }
        );
      } catch (error) {
        console.warn('LocationService: Failed to start watchPositionAsync', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Stop Live Location Updates for a specific callback, or all if none provided
   */
  stopLocationUpdates(callback?: (location: LocationCoordinates) => void): void {
    if (callback) {
      this.subscribers.delete(callback);
    } else {
      this.subscribers.clear();
    }

    if (this.subscribers.size === 0 && this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}

export const locationService = new LocationService();
