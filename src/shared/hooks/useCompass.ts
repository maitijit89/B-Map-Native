import { useEffect, useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import {
  Magnetometer,
  DeviceMotion,
  type MagnetometerMeasurement,
  type DeviceMotionMeasurement,
} from 'expo-sensors';

export type CompassSource =
  | 'location-fused'
  | 'device-motion'
  | 'magnetometer'
  | 'web-orientation'
  | 'none';

export interface CompassData {
  /** Compass heading in degrees (0 = North, 90 = East, 180 = South, 270 = West) */
  heading: number;
  /** Pitch angle in degrees (-45 to +45) for 3D gyro tilt */
  pitch: number;
  /** Roll angle in degrees (-45 to +45) for 3D gyro tilt */
  roll: number;
  /** Whether the compass sensor is actively streaming heading data */
  isAvailable: boolean;
  /** Calibration accuracy level: 3 = high, 2 = medium, 1 = low, 0 = uncalibrated */
  accuracy: number;
  /** Active sensor engine providing the heading data */
  source: CompassSource;
  /** Error message if sensor is unavailable */
  error: string | null;
}

/**
 * Computes azimuth angle from raw magnetometer x/y data (tilt-free assumption).
 */
function computeHeadingFromMagnetometer(data: MagnetometerMeasurement): number {
  const { x, y } = data;
  let heading = Math.atan2(-x, y) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  if (heading >= 360) heading -= 360;
  return heading;
}

/**
 * Computes heading from DeviceMotion rotation around Z-axis (alpha).
 */
function computeHeadingFromMotion(motion: DeviceMotionMeasurement): number | null {
  if (!motion?.rotation) return null;
  const { alpha } = motion.rotation;
  if (typeof alpha !== 'number') return null;
  let deg = (alpha * 180) / Math.PI;
  if (deg < 0) deg += 360;
  if (deg >= 360) deg -= 360;
  return deg;
}

/**
 * Multi-tier hardware compass hook that prioritizes:
 * 1. Location.watchHeadingAsync (Hardware-fused Gyro + Accelerometer + Magnetometer tilt-compensated)
 * 2. DeviceMotion (Gyro-stabilized attitude sensor & 3D tilt tracking)
 * 3. Magnetometer (Hardware geomagnetic field)
 * 4. Web deviceorientation (Mobile Safari / Chrome browser API)
 */
export function useCompass(
  updateIntervalMs: number = 60,
  smoothingFactor: number = 0.25
): CompassData {
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [source, setSource] = useState<CompassSource>('none');
  const [error, setError] = useState<string | null>(null);

  const smoothedHeading = useRef(0);
  const hasInitialized = useRef(false);

  const updateHeading = useCallback(
    (rawHeading: number, newAccuracy: number = 3, newSource: CompassSource = 'location-fused') => {
      if (isNaN(rawHeading)) return;

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        smoothedHeading.current = rawHeading;
        setHeading(Math.round(rawHeading));
        setIsAvailable(true);
        setAccuracy(newAccuracy);
        setSource(newSource);
        setError(null);
        return;
      }

      // Smooth interpolation handling 360/0 degree wraparound
      let diff = rawHeading - smoothedHeading.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      let next = smoothedHeading.current + diff * smoothingFactor;
      if (next < 0) next += 360;
      if (next >= 360) next -= 360;

      smoothedHeading.current = next;
      setHeading(Math.round(next));
      setIsAvailable(true);
      setAccuracy(newAccuracy);
      setSource(newSource);
      setError(null);
    },
    [smoothingFactor]
  );

  useEffect(() => {
    let isMounted = true;
    let locationHeadingSub: Location.LocationSubscription | null = null;
    let motionSub: { remove: () => void } | null = null;
    let magSub: { remove: () => void } | null = null;

    // --- Web Handler ---
    if (Platform.OS === 'web') {
      const handleWebOrientation = (event: any) => {
        if (!isMounted) return;
        // 3D tilt from beta and gamma
        if (typeof event.beta === 'number') {
          setPitch(Math.max(-45, Math.min(45, event.beta)));
        }
        if (typeof event.gamma === 'number') {
          setRoll(Math.max(-45, Math.min(45, event.gamma)));
        }

        // Heading
        if (typeof event.webkitCompassHeading === 'number') {
          updateHeading(event.webkitCompassHeading, 3, 'web-orientation');
          return;
        }
        if (typeof event.alpha === 'number') {
          const comp = (360 - event.alpha) % 360;
          updateHeading(comp, 2, 'web-orientation');
        }
      };

      if (typeof window !== 'undefined' && 'addEventListener' in window) {
        window.addEventListener('deviceorientationabsolute', handleWebOrientation, true);
        window.addEventListener('deviceorientation', handleWebOrientation, true);
      }

      return () => {
        isMounted = false;
        if (typeof window !== 'undefined' && 'removeEventListener' in window) {
          window.removeEventListener('deviceorientationabsolute', handleWebOrientation, true);
          window.removeEventListener('deviceorientation', handleWebOrientation, true);
        }
      };
    }

    // --- Native iOS / Android Lifecycle ---
    async function setupSensors() {
      // Always run DeviceMotion in parallel for 3D gyro tilt (pitch & roll)
      try {
        const motionAvailable = await DeviceMotion.isAvailableAsync();
        if (motionAvailable && isMounted) {
          DeviceMotion.setUpdateInterval(updateIntervalMs);
          motionSub = DeviceMotion.addListener((motionData) => {
            if (!isMounted || !motionData.rotation) return;
            // Pitch & Roll for 3D perspective tilt
            const pitchDeg = Math.max(-45, Math.min(45, (motionData.rotation.beta * 180) / Math.PI));
            const rollDeg = Math.max(-45, Math.min(45, (motionData.rotation.gamma * 180) / Math.PI));
            setPitch(Math.round(pitchDeg));
            setRoll(Math.round(rollDeg));

            // If location heading is not active, use motion alpha for heading
            if (!locationHeadingSub) {
              const deg = computeHeadingFromMotion(motionData);
              if (deg !== null) {
                updateHeading(deg, 2, 'device-motion');
              }
            }
          });
        }
      } catch {
        // DeviceMotion unavailable
      }

      // Try Location Fused Heading (Highest precision, tilt-compensated)
      try {
        let perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted && perm.canAskAgain) {
          perm = await Location.requestForegroundPermissionsAsync();
        }

        if (perm.granted && isMounted) {
          locationHeadingSub = await Location.watchHeadingAsync((headingData) => {
            if (!isMounted) return;
            const chosen =
              headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
            updateHeading(chosen, headingData.accuracy, 'location-fused');
          });
          return;
        }
      } catch {
        // Location heading unavailable
      }

      // Fallback: Magnetometer
      if (!motionSub && isMounted) {
        try {
          const magAvailable = await Magnetometer.isAvailableAsync();
          if (magAvailable && isMounted) {
            Magnetometer.setUpdateInterval(updateIntervalMs);
            magSub = Magnetometer.addListener((magData) => {
              if (!isMounted) return;
              const deg = computeHeadingFromMagnetometer(magData);
              updateHeading(deg, 1, 'magnetometer');
            });
          }
        } catch (magErr: any) {
          if (isMounted) {
            setError(magErr?.message || 'Compass sensors unavailable');
            setIsAvailable(false);
          }
        }
      }
    }

    setupSensors();

    return () => {
      isMounted = false;
      locationHeadingSub?.remove();
      motionSub?.remove();
      magSub?.remove();
    };
  }, [updateIntervalMs, updateHeading]);

  return { heading, pitch, roll, isAvailable, accuracy, source, error };
}
