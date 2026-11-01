import { useEffect, useState } from 'react';
import { useIsFocused } from 'expo-router';
import {
  compassService,
  type CompassData,
} from '../services/CompassService';

export interface UseCompassOptions {
  updateIntervalMs?: number;
  smoothingFactor?: number;
  enabled?: boolean;
  needsTilt?: boolean;
}

/**
 * Multi-tier hardware compass and 3D gyro hook backed by singleton CompassService.
 * Consolidates Location Fused, Magnetometer, Gyroscope, and DeviceMotion listeners into
 * a single high-performance stream (~20 Hz) to eliminate React re-render churn.
 *
 * Supports both options object or positional arguments.
 * Tilt and gyro data (`pitch`, `roll`, `gyroMagnitude`) are enabled by default (`needsTilt = true`).
 */
export function useCompass(
  optionsOrInterval: UseCompassOptions | number = 50,
  smoothingFactor: number = 0.25,
  enabled: boolean = true,
  needsTilt: boolean = true
): CompassData {
  const isFocused = useIsFocused();
  const [data, setData] = useState<CompassData>(() => compassService.getCurrentData());

  const isOptionsObject = typeof optionsOrInterval === 'object' && optionsOrInterval !== null;
  const activeEnabled = isOptionsObject
    ? optionsOrInterval.enabled ?? true
    : enabled;
  const activeNeedsTilt = isOptionsObject
    ? optionsOrInterval.needsTilt ?? true
    : needsTilt;

  const shouldBeActive = activeEnabled && isFocused;

  useEffect(() => {
    if (!shouldBeActive) return;

    let lastHeading = -999;
    let lastPitch = -999;
    let lastRoll = -999;

    const unsubscribe = compassService.subscribe(
      (newData) => {
        // Prevent state update thrashing if values haven't changed meaningfully
        if (
          Math.abs(newData.heading - lastHeading) < 1 &&
          Math.abs(newData.pitch - lastPitch) < 1 &&
          Math.abs(newData.roll - lastRoll) < 1
        ) {
          return;
        }

        lastHeading = newData.heading;
        lastPitch = newData.pitch;
        lastRoll = newData.roll;
        setData(newData);
      },
      { needsTilt: activeNeedsTilt }
    );

    return unsubscribe;
  }, [shouldBeActive, activeNeedsTilt]);

  return data;
}


