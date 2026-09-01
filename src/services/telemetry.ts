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

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
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
  });

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function initTelemetry() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setTelemetry(prev => ({ ...prev, isLocationAvailable: false }));
          }
          return;
        }

        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted && initialLoc) {
          const lat = initialLoc.coords.latitude;
          const lng = initialLoc.coords.longitude;
          const speed = (initialLoc.coords.speed || 0) * 3.6; // convert m/s to km/h

          setTelemetry(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            altitude: initialLoc.coords.altitude,
            speedKmh: Math.max(0, Math.round(speed)),
            heading: initialLoc.coords.heading,
            accuracyMeters: initialLoc.coords.accuracy,
            isLocationAvailable: true,
          }));

          // Reverse geocode
          try {
            const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geocoded && geocoded.length > 0 && isMounted) {
              const place = geocoded[0];
              const addr = [place.name, place.street, place.district || place.city, place.region, place.postalCode]
                .filter(Boolean)
                .join(', ');
              setTelemetry(prev => ({ ...prev, addressString: addr || prev.addressString }));
            }
          } catch {
            // Keep default
          }
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          loc => {
            if (!isMounted) return;
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            const speed = (loc.coords.speed || 0) * 3.6;

            setTelemetry(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              altitude: loc.coords.altitude,
              speedKmh: Math.max(0, Math.round(speed)),
              heading: loc.coords.heading,
              accuracyMeters: loc.coords.accuracy,
            }));
          }
        );
      } catch (err) {
        console.warn('Location telemetry error:', err);
      }
    }

    initTelemetry();

    // Session timer ticker
    const timer = setInterval(() => {
      const minutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      setTelemetry(prev => ({ ...prev, activeSessionMinutes: minutes }));
    }, 10000);

    return () => {
      isMounted = false;
      subscription?.remove();
      clearInterval(timer);
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
