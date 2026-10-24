import { useEffect, useState } from 'react';
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
  updateIntervalMs: number = 100,
  smoothingFactor: number = 0.25,
  enabled: boolean = true
): CompassData {
  const [data, setData] = useState<CompassData>(() => compassService.getCurrentData());

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = compassService.subscribe((newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, [enabled]);

  return data;
}
