import { Platform, AppState, AppStateStatus } from 'react-native';
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
 * Singleton Compass Service that consolidates all native sensor listeners
 * (Magnetometer, DeviceMotion, and fused Location Heading) into a single,
 * reference-counted stream with throttled sampling, deadband filtering,
 * and AppState background pause handling.
 */
class CompassService {
  private subscribers = new Set<(data: CompassData) => void>();
  private currentData: CompassData = {
    heading: 0,
    pitch: 0,
    roll: 0,
    isAvailable: false,
    accuracy: 0,
    source: 'none',
    error: null,
  };

  private isRunning = false;
  private isLocationFusedStreaming = false;
  private locationSub: Location.LocationSubscription | null = null;
  private motionSub: { remove: () => void } | null = null;
  private magSub: { remove: () => void } | null = null;
  private removeWebListener: (() => void) | null = null;
  private subscriberMap = new Map<(data: CompassData) => void, { needsTilt?: boolean }>();

  private smoothedHeading = 0;
  private hasInitializedHeading = false;
  private lastBroadcastTime = 0;
  private lastEmittedHeading = 0;
  private lastEmittedPitch = 0;
  private lastEmittedRoll = 0;

  // 200ms hardware update interval (~5 updates/sec, optimal battery-performance balance)
  private readonly UPDATE_INTERVAL_MS = 200;
  private readonly SMOOTHING_FACTOR = 0.25;
  private readonly DEADBAND_DEG = 1.2;

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
    this.subscribers.add(listener);
    this.subscriberMap.set(listener, options || {});

    // Send immediate cached value
    listener(this.currentData);

    if (this.subscribers.size === 1 && AppState.currentState === 'active') {
      this.startSensors();
    } else if (options?.needsTilt && this.isRunning && !this.motionSub) {
      // Start motion sensor if a new subscriber requires 3D tilt
      this.startMotionSensor();
    }

    return () => {
      this.subscribers.delete(listener);
      this.subscriberMap.delete(listener);

      if (this.subscribers.size === 0) {
        this.stopSensors();
      } else {
        // Stop motion sensor if no remaining subscribers need 3D tilt
        const anyNeedsTilt = Array.from(this.subscriberMap.values()).some((opt) => opt.needsTilt);
        if (!anyNeedsTilt && this.motionSub) {
          this.motionSub.remove();
          this.motionSub = null;
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

  private updateTilt(pitch: number, roll: number) {
    this.currentData = {
      ...this.currentData,
      pitch: Math.round(pitch),
      roll: Math.round(roll),
    };
    this.broadcast();
  }

  private broadcast() {
    const now = Date.now();
    // Throttle check (~5 Hz max for low battery consumption)
    if (now - this.lastBroadcastTime < 180) {
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
        console.warn('CompassService listener error:', err);
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

    // Check if any subscriber requires 3D gyro motion
    const anyNeedsTilt = Array.from(this.subscriberMap.values()).some((opt) => opt.needsTilt);
    if (anyNeedsTilt) {
      await this.startMotionSensor();
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
        this.magSub = Magnetometer.addListener((magData) => {
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

  private async startMotionSensor() {
    try {
      const motionAvailable = await DeviceMotion.isAvailableAsync();
      if (motionAvailable && this.isRunning && !this.motionSub) {
        DeviceMotion.setUpdateInterval(this.UPDATE_INTERVAL_MS);
        this.motionSub = DeviceMotion.addListener((motionData) => {
          if (!this.isRunning || !motionData.rotation) return;
          const pitchDeg = Math.max(-45, Math.min(45, (motionData.rotation.beta * 180) / Math.PI));
          const rollDeg = Math.max(-45, Math.min(45, (motionData.rotation.gamma * 180) / Math.PI));
          this.updateTilt(pitchDeg, rollDeg);

          if (!this.isLocationFusedStreaming && !this.magSub) {
            const deg = computeHeadingFromMotion(motionData);
            if (deg !== null) {
              this.updateHeading(deg, 1, 'device-motion');
            }
          }
        });
      }
    } catch {
      // DeviceMotion unavailable
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
    if (this.magSub) {
      this.magSub.remove();
      this.magSub = null;
    }
  }
}

export const compassService = new CompassService();
