import { useEffect, useState, useCallback } from 'react';
import { useIsFocused } from 'expo-router';
import {
  locationService,
  LocationCoordinates,
  DEFAULT_FALLBACK_LOCATION,
  type GpsLockTelemetry,
} from '../services/LocationService';

export function useLocation(watch: boolean = true) {
  const isFocused = useIsFocused();
  const [location, setLocation] = useState<LocationCoordinates>(DEFAULT_FALLBACK_LOCATION);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gpsLockTelemetry, setGpsLockTelemetry] = useState<GpsLockTelemetry | null>(
    locationService.getGpsLockTelemetry()
  );
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const shouldWatch = watch && isFocused;

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await locationService.getCurrentLocation();
      setLocation(coords);
      setPermissionGranted(true);
    } catch (e: any) {
      setError(e?.message || 'Unable to fetch location');
      setLocation(DEFAULT_FALLBACK_LOCATION);
    } finally {
      setLoading(false);
    }
  }, []);

  const establishGpsLock = useCallback(async () => {
    setIsLocking(true);
    setError(null);
    try {
      const result = await locationService.establishGpsLock();
      setLocation(result.coords);
      setGpsLockTelemetry(result.telemetry);
      setPermissionGranted(true);
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to establish GPS lock');
      const fallbackTelemetry = locationService.getGpsLockTelemetry();
      if (fallbackTelemetry) {
        setGpsLockTelemetry(fallbackTelemetry);
      }
      throw e;
    } finally {
      setIsLocking(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleCoords = (coords: LocationCoordinates) => {
      if (isMounted) {
        setLocation(coords);
        setLoading(false);
      }
    };

    async function init() {
      const granted = await locationService.requestPermissions();
      if (!isMounted) return;

      setPermissionGranted(granted);

      if (granted && shouldWatch) {
        await locationService.startLocationUpdates(handleCoords);
      } else {
        const coords = await locationService.getCurrentLocation();
        if (isMounted) {
          setLocation(coords);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      if (shouldWatch) {
        locationService.stopLocationUpdates(handleCoords);
      }
    };
  }, [shouldWatch]);

  return {
    location,
    permissionGranted,
    loading,
    error,
    refreshLocation,
    establishGpsLock,
    gpsLockTelemetry,
    isLocking,
  };
}

