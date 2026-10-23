import { useEffect, useState, useCallback } from 'react';
import { locationService, LocationCoordinates, DEFAULT_FALLBACK_LOCATION } from '../services/LocationService';

export function useLocation(watch: boolean = true) {
  const [location, setLocation] = useState<LocationCoordinates>(DEFAULT_FALLBACK_LOCATION);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const granted = await locationService.requestPermissions();
      if (!isMounted) return;

      setPermissionGranted(granted);

      if (granted && watch) {
        await locationService.startLocationUpdates((coords) => {
          if (isMounted) {
            setLocation(coords);
            setLoading(false);
          }
        });
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
      locationService.stopLocationUpdates();
    };
  }, [watch]);

  return {
    location,
    permissionGranted,
    loading,
    error,
    refreshLocation,
  };
}
