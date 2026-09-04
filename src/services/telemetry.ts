import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { LatLng } from '@/types';

export interface TelemetryData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speedKmh: number;
  heading: number | null;
  accuracyMeters: number | null;
  deviceModel: string;
  osName: string;
  osVersion: string;
  activeSessionMinutes: number;
  isLocationAvailable: boolean;
  addressString?: string;
}

const sessionStartTime = Date.now();

// Singleton shared state
let currentTelemetry: TelemetryData = {
  latitude: 28.6139, // Default to New Delhi (Connaught Place / India Gate)
  longitude: 77.2090,
  altitude: 216,
  speedKmh: 0,
  heading: 45,
  accuracyMeters: 5,
  deviceModel: Device.modelName || (Platform.OS === 'web' ? 'Web Browser' : 'Mobile Device'),
  osName: Device.osName || Platform.OS,
  osVersion: Device.osVersion || '1.0',
  activeSessionMinutes: 0,
  isLocationAvailable: true,
  addressString: 'Connaught Place, New Delhi, Delhi 110001',
};

const listeners = new Set<(data: TelemetryData) => void>();
let isInitialized = false;
let lastGeocodedLat = 0;
let lastGeocodedLng = 0;

function notifyListeners() {
  listeners.forEach(listener => listener(currentTelemetry));
}

async function reverseGeocodeCached(lat: number, lng: number) {
  try {
    lastGeocodedLat = lat;
    lastGeocodedLng = lng;
    const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (geocoded && geocoded.length > 0) {
      const place = geocoded[0];
      const addr = [place.name, place.street, place.district || place.city, place.region, place.postalCode]
        .filter(Boolean)
        .join(', ');
      if (addr) {
        currentTelemetry = { ...currentTelemetry, addressString: addr };
        notifyListeners();
      }
    }
  } catch {
    // Keep default
  }
}

async function startTelemetryService() {
  if (isInitialized) return;
  isInitialized = true;

  // Defer location polling so initial UI renders immediately without blocking JS thread
  setTimeout(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        currentTelemetry = { ...currentTelemetry, isLocationAvailable: false };
        notifyListeners();
        return;
      }

      // Fast non-blocking location: use cached last-known position first
      let initialLoc = await Location.getLastKnownPositionAsync();
      if (!initialLoc) {
        // Fallback with 2-second timeout to prevent indefinite satellite search lock
        initialLoc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          new Promise<null>(res => setTimeout(() => res(null), 2000)),
        ]);
      }

      if (initialLoc) {
        const lat = initialLoc.coords.latitude;
        const lng = initialLoc.coords.longitude;
        const speed = (initialLoc.coords.speed || 0) * 3.6;

        currentTelemetry = {
          ...currentTelemetry,
          latitude: lat,
          longitude: lng,
          altitude: initialLoc.coords.altitude,
          speedKmh: Math.max(0, Math.round(speed)),
          heading: initialLoc.coords.heading,
          accuracyMeters: initialLoc.coords.accuracy,
          isLocationAvailable: true,
        };
        notifyListeners();

        reverseGeocodeCached(lat, lng);
      }

    // Single throttled watcher for the entire app (10s, 25m interval for battery & low-RAM performance)
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 25,
      },
      loc => {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        const speed = (loc.coords.speed || 0) * 3.6;

        // Skip state update if location change is sub-threshold to prevent re-renders
        if (
          Math.abs(lat - currentTelemetry.latitude) < 0.0001 &&
          Math.abs(lng - currentTelemetry.longitude) < 0.0001 &&
          Math.abs(Math.round(speed) - currentTelemetry.speedKmh) < 3
        ) {
          return;
        }

        currentTelemetry = {
          ...currentTelemetry,
          latitude: lat,
          longitude: lng,
          altitude: loc.coords.altitude,
          speedKmh: Math.max(0, Math.round(speed)),
          heading: loc.coords.heading,
          accuracyMeters: loc.coords.accuracy,
        };
        notifyListeners();

        // Only reverse geocode if user moved significantly (>1.5 km)
        if (
          lastGeocodedLat === 0 ||
          calculateGeodesicDistanceKm(
            { latitude: lastGeocodedLat, longitude: lastGeocodedLng },
            { latitude: lat, longitude: lng }
          ) > 1.5
        ) {
          reverseGeocodeCached(lat, lng);
        }
      }
    );
    } catch {
      // Non-blocking fallback
    }
  }, 500);

  // Session timer ticker - only update once every 2 minutes to prevent CPU cycles
  setInterval(() => {
    const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    if (currentTelemetry.activeSessionMinutes !== minutes) {
      currentTelemetry = { ...currentTelemetry, activeSessionMinutes: minutes };
      notifyListeners();
    }
  }, 120000);
}

// Synchronous getter for components that only need telemetry on user action (e.g. Center Map button)
export function getLatestTelemetry(): TelemetryData {
  if (!isInitialized) {
    startTelemetryService();
  }
  return currentTelemetry;
}

// Reactive hook for screens that display live telemetry
export function useTelemetry(): TelemetryData {
  const [telemetry, setTelemetry] = useState<TelemetryData>(currentTelemetry);

  useEffect(() => {
    startTelemetryService();
    listeners.add(setTelemetry);
    setTelemetry(currentTelemetry);

    return () => {
      listeners.delete(setTelemetry);
    };
  }, []);

  return telemetry;
}

export function calculateGeodesicDistanceKm(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
