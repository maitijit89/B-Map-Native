import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import {
  Magnetometer,
  DeviceMotion,
  Gyroscope,
  Accelerometer,
  type MagnetometerMeasurement,
  type DeviceMotionMeasurement,
  type GyroscopeMeasurement,
  type AccelerometerMeasurement,
} from 'expo-sensors';

export type CompassSource =
  | 'location-fused'
  | 'device-motion'
  | 'gyroscope'
  | 'accelerometer'
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
  /** Gyroscope rotational velocity around X axis (pitch rate, rad/s) */
  gyroX: number;
  /** Gyroscope rotational velocity around Y axis (roll rate, rad/s) */
  gyroY: number;
  /** Gyroscope rotational velocity around Z axis (yaw rate, rad/s) */
  gyroZ: number;
  /** Overall angular velocity magnitude in rad/s */
  gyroMagnitude: number;
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
 * Singleton Compass Service that consolidates all native sensor listeners
 * (Location Fused Heading, DeviceMotion, Gyroscope, Accelerometer, Magnetometer)
 * into a high-performance, reference-counted stream with throttled sampling,
 * deadband filtering, and AppState background pause handling.
 */
class CompassService {
  private subscribers = new Set<(data: CompassData) => void>();
  private currentData: CompassData = {
    heading: 0,
    pitch: 0,
    roll: 0,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
    gyroMagnitude: 0,
    isAvailable: false,
    accuracy: 0,
    source: 'none',
    error: null,
  };

  private isRunning = false;
  private isLocationFusedStreaming = false;
  private locationSub: Location.LocationSubscription | null = null;
  private motionSub: { remove: () => void } | null = null;
  private gyroSub: { remove: () => void } | null = null;
  private accelSub: { remove: () => void } | null = null;
  private magSub: { remove: () => void } | null = null;
  private removeWebListener: (() => void) | null = null;
  private subscriberMap = new Map<(data: CompassData) => void, { needsTilt?: boolean }>();

  private smoothedHeading = 0;
  private hasInitializedHeading = false;
  private lastBroadcastTime = 0;
  private lastEmittedHeading = 0;
  private lastEmittedPitch = 0;
  private lastEmittedRoll = 0;

  // 80ms hardware update interval (~12.5 updates/sec: optimal balance of fluid 60fps interpolation and zero CPU/bridge lag)
  private readonly UPDATE_INTERVAL_MS = 80;
  private readonly SMOOTHING_FACTOR = 0.35;
  private readonly DEADBAND_DEG = 0.8;

  constructor() {
    // Listen for AppState changes to automatically pause/resume hardware sensors
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      if (this.subscribers.size > 0 && !this.isRunning) {
        this.startSensors();
      }
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      if (this.isRunning) {
        this.stopSensors();
      }
    }
  };

  /**
   * Returns current synchronous snapshot of compass data.
   */
  getCurrentData(): CompassData {
    return this.currentData;
  }

  /**
   * Subscribe a listener to compass sensor updates with optional tilt requirements.
   * Starts native sensors if this is the first subscriber.
   * Returns an unsubscribe function.
   */
  subscribe(
    listener: (data: CompassData) => void,
    options?: { needsTilt?: boolean }
  ): () => void {
    const opts = { needsTilt: true, ...options };
    this.subscribers.add(listener);
    this.subscriberMap.set(listener, opts);

    // Send immediate cached value
    listener(this.currentData);

    if (this.subscribers.size === 1 && AppState.currentState === 'active') {
      this.startSensors();
    } else if (opts.needsTilt && this.isRunning && (!this.motionSub && !this.gyroSub && !this.accelSub)) {
      // Start motion & gyro sensors if a new subscriber requires 3D tilt
      this.startMotionAndGyroSensors();
    }

    return () => {
      this.subscribers.delete(listener);
      this.subscriberMap.delete(listener);

      if (this.subscribers.size === 0) {
        this.stopSensors();
      } else {
        // Stop motion/gyro sensors only if no remaining subscribers need 3D tilt
        const anyNeedsTilt = Array.from(this.subscriberMap.values()).some((opt) => opt.needsTilt !== false);
        if (!anyNeedsTilt) {
          if (this.motionSub) {
            this.motionSub.remove();
            this.motionSub = null;
          }
          if (this.gyroSub) {
            this.gyroSub.remove();
            this.gyroSub = null;
          }
          if (this.accelSub) {
            this.accelSub.remove();
            this.accelSub = null;
          }
        }
      }
    };
  }

  private updateHeading(rawHeading: number, newAccuracy: number = 3, newSource: CompassSource = 'location-fused') {
    if (isNaN(rawHeading)) return;

    if (!this.hasInitializedHeading) {
      this.hasInitializedHeading = true;
      this.smoothedHeading = rawHeading;
      this.currentData = {
        ...this.currentData,
        heading: Math.round(rawHeading),
        isAvailable: true,
        accuracy: newAccuracy,
        source: newSource,
        error: null,
      };
      this.broadcast();
      return;
    }

    // Shortest-arc smoothing
    let diff = rawHeading - this.smoothedHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    let next = this.smoothedHeading + diff * this.SMOOTHING_FACTOR;
    if (next < 0) next += 360;
    if (next >= 360) next -= 360;

    this.smoothedHeading = next;
    this.currentData = {
      ...this.currentData,
      heading: Math.round(next),
      isAvailable: true,
      accuracy: newAccuracy,
      source: newSource,
      error: null,
    };

    this.broadcast();
  }

  private updateTilt(
    pitch: number,
    roll: number,
    gyro?: { x: number; y: number; z: number; mag: number }
  ) {
    const roundedPitch = Number(pitch.toFixed(1));
    const roundedRoll = Number(roll.toFixed(1));

    this.currentData = {
      ...this.currentData,
      pitch: roundedPitch,
      roll: roundedRoll,
      gyroX: gyro ? Number(gyro.x.toFixed(3)) : this.currentData.gyroX,
      gyroY: gyro ? Number(gyro.y.toFixed(3)) : this.currentData.gyroY,
      gyroZ: gyro ? Number(gyro.z.toFixed(3)) : this.currentData.gyroZ,
      gyroMagnitude: gyro ? Number(gyro.mag.toFixed(3)) : this.currentData.gyroMagnitude,
      isAvailable: true,
      source: this.currentData.source === 'none' ? 'gyroscope' : this.currentData.source,
    };
    this.broadcast();
  }

  private broadcast() {
    const now = Date.now();
    // Balanced ~13 Hz throttling (75ms) for fluid 60fps Reanimated rendering without bridge saturation
    if (now - this.lastBroadcastTime < 75) {
      return;
    }

    // Deadband check: if heading, pitch, and roll changed less than DEADBAND_DEG, skip
    const headingDiff = Math.abs(this.currentData.heading - this.lastEmittedHeading);
    const pitchDiff = Math.abs(this.currentData.pitch - this.lastEmittedPitch);
    const rollDiff = Math.abs(this.currentData.roll - this.lastEmittedRoll);

    if (
      this.hasInitializedHeading &&
      headingDiff < this.DEADBAND_DEG &&
      pitchDiff < this.DEADBAND_DEG &&
      rollDiff < this.DEADBAND_DEG
    ) {
      return;
    }

    this.lastBroadcastTime = now;
    this.lastEmittedHeading = this.currentData.heading;
    this.lastEmittedPitch = this.currentData.pitch;
    this.lastEmittedRoll = this.currentData.roll;

    const snapshot = { ...this.currentData };
    this.subscribers.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        if (__DEV__) { console.debug('CompassService listener error:', err); }
      }
    });
  }

  private async startSensors() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Web handling
    if (Platform.OS === 'web') {
      const handleWebOrientation = (event: any) => {
        if (!this.isRunning) return;
        if (typeof event.beta === 'number' && typeof event.gamma === 'number') {
          this.updateTilt(
            Math.max(-45, Math.min(45, event.beta)),
            Math.max(-45, Math.min(45, event.gamma))
          );
        }
        if (typeof event.webkitCompassHeading === 'number') {
          this.updateHeading(event.webkitCompassHeading, 3, 'web-orientation');
          return;
        }
        if (typeof event.alpha === 'number') {
          const comp = (360 - event.alpha) % 360;
          this.updateHeading(comp, 2, 'web-orientation');
        }
      };

      if (typeof window !== 'undefined' && 'addEventListener' in window) {
        window.addEventListener('deviceorientationabsolute', handleWebOrientation, true);
        window.addEventListener('deviceorientation', handleWebOrientation, true);
        this.removeWebListener = () => {
          window.removeEventListener('deviceorientationabsolute', handleWebOrientation, true);
          window.removeEventListener('deviceorientation', handleWebOrientation, true);
        };
      }
      return;
    }

    // Native iOS / Android Lifecycle
    this.isLocationFusedStreaming = false;

    // Check if any subscriber requires 3D gyro motion (default: true)
    const anyNeedsTilt = Array.from(this.subscriberMap.values()).some((opt) => opt.needsTilt !== false);
    if (anyNeedsTilt) {
      await this.startMotionAndGyroSensors();
    }

    // 1. Location Fused Heading (High-precision tilt-compensated true heading)
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }

      if (perm.granted && this.isRunning) {
        this.locationSub = await Location.watchHeadingAsync((headingData) => {
          if (!this.isRunning) return;
          const chosen =
            headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          if (typeof chosen === 'number' && !isNaN(chosen)) {
            this.isLocationFusedStreaming = true;
            // Stop raw magnetometer if fused location heading is active & working
            if (this.magSub) {
              this.magSub.remove();
              this.magSub = null;
            }
            this.updateHeading(chosen, headingData.accuracy, 'location-fused');
          }
        });
      }
    } catch {
      // Location heading unavailable
    }

    // 2. Fallback Magnetometer (only if Location fused heading is NOT streaming)
    if (!this.isLocationFusedStreaming) {
      await this.startMagnetometerSensor();
    }
  }

  private async startMagnetometerSensor() {
    try {
      const magAvailable = await Magnetometer.isAvailableAsync();
      if (magAvailable && this.isRunning && !this.magSub) {
        Magnetometer.setUpdateInterval(this.UPDATE_INTERVAL_MS);
        this.magSub = Magnetometer.addListener((magData: MagnetometerMeasurement) => {
          if (!this.isRunning) return;
          if (!this.isLocationFusedStreaming) {
            const deg = computeHeadingFromMagnetometer(magData);
            this.updateHeading(deg, 2, 'magnetometer');
          }
        });
      }
    } catch (magErr: any) {
      if (this.isRunning) {
        this.currentData = {
          ...this.currentData,
          error: magErr?.message || 'Magnetometer sensor unavailable',
        };
      }
    }
  }

  /**
   * Performance-optimized 3D Gyroscope & Motion Sensor Pipeline:
   * 1. DeviceMotion is prioritized first: it combines 3D orientation tilt AND gyro rotation rate
   *    in a single native stream, eliminating the overhead of dual sensor listeners.
   * 2. Standalone Gyroscope + Accelerometer are only activated as a fallback if DeviceMotion is unsupported.
   */
  private async startMotionAndGyroSensors() {
    let hasMotionSource = false;

    // 1. Primary: DeviceMotion (unified 3D orientation & gyro rotational velocity)
    try {
      const motionAvailable = await DeviceMotion.isAvailableAsync();
      if (motionAvailable && this.isRunning && !this.motionSub) {
        DeviceMotion.setUpdateInterval(this.UPDATE_INTERVAL_MS);
        this.motionSub = DeviceMotion.addListener((motionData: DeviceMotionMeasurement) => {
          if (!this.isRunning) return;

          let pitchDeg: number | null = null;
          let rollDeg: number | null = null;

          // Case A: Full rotation angles available
          if (motionData.rotation) {
            pitchDeg = Math.max(-45, Math.min(45, (motionData.rotation.beta * 180) / Math.PI));
            rollDeg = Math.max(-45, Math.min(45, (motionData.rotation.gamma * 180) / Math.PI));
          }
          // Case B: Fallback to gravity acceleration vector
          else if (motionData.accelerationIncludingGravity) {
            const { x, y, z } = motionData.accelerationIncludingGravity;
            const normPitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
            const normRoll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
            pitchDeg = Math.max(-45, Math.min(45, normPitch));
            rollDeg = Math.max(-45, Math.min(45, normRoll));
          }

          if (pitchDeg !== null && rollDeg !== null) {
            let gyroPayload: { x: number; y: number; z: number; mag: number } | undefined;
            if (motionData.rotationRate) {
              const rr = motionData.rotationRate;
              const mag = Math.sqrt(rr.alpha * rr.alpha + rr.beta * rr.beta + rr.gamma * rr.gamma);
              gyroPayload = { x: rr.alpha, y: rr.beta, z: rr.gamma, mag };
            }

            this.updateTilt(pitchDeg, rollDeg, gyroPayload);

            // DeviceMotion can also supply heading if magnetometer or location is absent
            if (!this.isLocationFusedStreaming && !this.magSub) {
              const deg = computeHeadingFromMotion(motionData);
              if (deg !== null) {
                this.updateHeading(deg, 1, 'device-motion');
              }
            }
          }
        });
        hasMotionSource = true;
        // DeviceMotion handles both tilt and gyro rate; skip starting redundant standalone gyro listener
        return;
      }
    } catch {
      // DeviceMotion unavailable, fall back to standalone sensors
    }

    // 2. Fallback: Standalone Hardware Gyroscope (only if DeviceMotion is not supported)
    if (!hasMotionSource) {
      try {
        const gyroAvailable = await Gyroscope.isAvailableAsync();
        if (gyroAvailable && this.isRunning && !this.gyroSub) {
          Gyroscope.setUpdateInterval(this.UPDATE_INTERVAL_MS);
          this.gyroSub = Gyroscope.addListener((data: GyroscopeMeasurement) => {
            if (!this.isRunning) return;
            const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
            this.currentData = {
              ...this.currentData,
              gyroX: Number(data.x.toFixed(3)),
              gyroY: Number(data.y.toFixed(3)),
              gyroZ: Number(data.z.toFixed(3)),
              gyroMagnitude: Number(mag.toFixed(3)),
              isAvailable: true,
            };
            this.broadcast();
          });
        }
      } catch {}

      // 3. Fallback: Standalone Accelerometer (for pitch & roll tilt)
      try {
        const accelAvailable = await Accelerometer.isAvailableAsync();
        if (accelAvailable && this.isRunning && !this.accelSub) {
          Accelerometer.setUpdateInterval(this.UPDATE_INTERVAL_MS);
          this.accelSub = Accelerometer.addListener((accelData: AccelerometerMeasurement) => {
            if (!this.isRunning) return;
            const { x, y, z } = accelData;
            const normPitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
            const normRoll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
            this.updateTilt(
              Math.max(-45, Math.min(45, normPitch)),
              Math.max(-45, Math.min(45, normRoll))
            );
          });
        }
      } catch {}
    }
  }

  private stopSensors() {
    this.isRunning = false;
    this.isLocationFusedStreaming = false;

    if (this.removeWebListener) {
      this.removeWebListener();
      this.removeWebListener = null;
    }

    if (this.locationSub) {
      this.locationSub.remove();
      this.locationSub = null;
    }
    if (this.motionSub) {
      this.motionSub.remove();
      this.motionSub = null;
    }
    if (this.gyroSub) {
      this.gyroSub.remove();
      this.gyroSub = null;
    }
    if (this.accelSub) {
      this.accelSub.remove();
      this.accelSub = null;
    }
    if (this.magSub) {
      this.magSub.remove();
      this.magSub = null;
    }
  }
}

export const compassService = new CompassService();
