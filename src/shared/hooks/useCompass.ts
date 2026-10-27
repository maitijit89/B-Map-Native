import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';
import {
  compassService,
  type CompassData,
} from '../services/CompassService';

/**
 * Multi-tier hardware compass hook backed by a singleton CompassService.
 * Consolidates Location Fused, Magnetometer, and DeviceMotion listeners into
 * a single throttled stream to prevent React re-render churn and CPU lag.
 */
export function useCompass(
  _updateIntervalMs: number = 200,
  _smoothingFactor: number = 0.25,
  enabled: boolean = true,
  needsTilt: boolean = false
): CompassData {
  const isFocused = useIsFocused();
  const [data, setData] = useState<CompassData>(() => compassService.getCurrentData());

  const shouldBeActive = enabled && isFocused;

  useEffect(() => {
    if (!shouldBeActive) return;

    const unsubscribe = compassService.subscribe(
      (newData) => {
        setData(newData);
      },
      { needsTilt }
    );

    return unsubscribe;
  }, [shouldBeActive, needsTilt]);

  return data;
}

