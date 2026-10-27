/* eslint-disable @typescript-eslint/no-require-imports */
import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceSignalsService } from '../services/deviceSignalsService';
import { DeviceSignalsTelemetryReport } from '../types/telemetry';
import { haptics } from '../../../shared/utils/haptics';

function getSensors() {
  try {
    return require('expo-sensors') as typeof import('expo-sensors');
  } catch {
    return null;
  }
}

export function useDeviceSignals(liveSensorsEnabled = true) {
  const [report, setReport] = useState<DeviceSignalsTelemetryReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveSensorsActive, setIsLiveSensorsActive] = useState<boolean>(liveSensorsEnabled);
  const [error, setError] = useState<string | null>(null);

  // Sensor subscription holders
  const accelSub = useRef<any>(null);
  const gyroSub = useRef<any>(null);
  const magSub = useRef<any>(null);
  const baroSub = useRef<any>(null);

  const refresh = useCallback(async () => {
    haptics.medium();
    try {
      setLoading(true);
      setError(null);
      const data = await deviceSignalsService.collectAllSignals();
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to collect device signals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    deviceSignalsService
      .collectAllSignals()
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Failed to collect device signals');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isReportLoaded = report !== null;
  const barometerAvailable = report?.sensors.barometerAvailable ?? false;

  // Live Kinetic Sensor Subscriptions
  useEffect(() => {
    const Sensors = getSensors();

    if (!isLiveSensorsActive || !isReportLoaded || !Sensors) {
      accelSub.current?.remove?.();
      gyroSub.current?.remove?.();
      magSub.current?.remove?.();
      baroSub.current?.remove?.();
      return;
    }

    try {
      Sensors.Accelerometer?.setUpdateInterval?.(250);
      accelSub.current = Sensors.Accelerometer?.addListener?.((data) => {
        const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setReport((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sensors: {
              ...prev.sensors,
              accelX: Number(data.x.toFixed(4)),
              accelY: Number(data.y.toFixed(4)),
              accelZ: Number(data.z.toFixed(4)),
              accelTotalMagnitude: Number(mag.toFixed(4)),
            },
          };
        });
      });
    } catch {
      // Sensor not supported on hardware
    }

    try {
      Sensors.Gyroscope?.setUpdateInterval?.(250);
      gyroSub.current = Sensors.Gyroscope?.addListener?.((data) => {
        const rot = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        setReport((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sensors: {
              ...prev.sensors,
              gyroX: Number(data.x.toFixed(4)),
              gyroY: Number(data.y.toFixed(4)),
              gyroZ: Number(data.z.toFixed(4)),
              gyroRotationMagnitude: Number(rot.toFixed(4)),
            },
          };
        });
      });
    } catch {
      // Sensor not supported on hardware
    }

    try {
      Sensors.Magnetometer?.setUpdateInterval?.(250);
      magSub.current = Sensors.Magnetometer?.addListener?.((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        setReport((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sensors: {
              ...prev.sensors,
              magX: Number(data.x.toFixed(1)),
              magY: Number(data.y.toFixed(1)),
              magZ: Number(data.z.toFixed(1)),
              magHeadingDegrees: Math.round(angle),
            },
          };
        });
      });
    } catch {
      // Sensor not supported on hardware
    }

    if (barometerAvailable) {
      try {
        Sensors.Barometer?.setUpdateInterval?.(250);
        baroSub.current = Sensors.Barometer?.addListener?.((data) => {
          setReport((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              sensors: {
                ...prev.sensors,
                barometerPressureHpa: Number(data.pressure.toFixed(2)),
                barometerRelativeAltitudeM: data.relativeAltitude != null ? Number(data.relativeAltitude.toFixed(1)) : null,
              },
            };
          });
        });
      } catch {
        // Barometer unavailable
      }
    }

    return () => {
      accelSub.current?.remove?.();
      gyroSub.current?.remove?.();
      magSub.current?.remove?.();
      baroSub.current?.remove?.();
    };
  }, [isLiveSensorsActive, isReportLoaded, barometerAvailable]);

  const toggleLiveSensors = useCallback(() => {
    haptics.selection();
    setIsLiveSensorsActive((prev) => !prev);
  }, []);

  const exportTelemetryJson = useCallback((): string => {
    haptics.selection();
    if (!report) return '{}';
    return JSON.stringify(report, null, 2);
  }, [report]);

  return {
    report,
    loading,
    error,
    refresh,
    isLiveSensorsActive,
    toggleLiveSensors,
    exportTelemetryJson,
  };
}
