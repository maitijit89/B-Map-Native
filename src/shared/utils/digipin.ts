/**
 * DigiPin (Digital Postal Index Number) GIS Geocoding Module
 * Standard 10-character geo-partition grid encoder & decoder
 */

const DIGIPIN_ALPHABET = '23456789CFGJKLMPQRTVWXYZ'; // 24 unique grid symbols

// India & South Asia Bounding Box for standard DigiPin grid coordinates
const MIN_LAT = 6.0;
const MAX_LAT = 38.0;
const MIN_LON = 68.0;
const MAX_LON = 98.0;

export interface DigiPinResult {
  pin: string; // Formatted 10-character DigiPin e.g. "3K-4M-7P-2V"
  rawPin: string; // Unformatted 10-character string
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

/**
 * Encodes latitude & longitude into a 10-character DigiPin
 */
export function encodeDigiPin(lat: number, lon: number): string {
  const boundedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
  const boundedLon = Math.max(MIN_LON, Math.min(MAX_LON, lon));

  let currentMinLat = MIN_LAT;
  let currentMaxLat = MAX_LAT;
  let currentMinLon = MIN_LON;
  let currentMaxLon = MAX_LON;

  let rawPin = '';

  for (let step = 0; step < 10; step++) {
    const latSpan = (currentMaxLat - currentMinLat) / 4;
    const lonSpan = (currentMaxLon - currentMinLon) / 6;

    const latIndex = Math.min(3, Math.floor((boundedLat - currentMinLat) / latSpan));
    const lonIndex = Math.min(5, Math.floor((boundedLon - currentMinLon) / lonSpan));

    const symbolIndex = latIndex * 6 + lonIndex;
    rawPin += DIGIPIN_ALPHABET[symbolIndex];

    currentMinLat = currentMinLat + latIndex * latSpan;
    currentMaxLat = currentMinLat + latSpan;
    currentMinLon = currentMinLon + lonIndex * lonSpan;
    currentMaxLon = currentMinLon + lonSpan;
  }

  return formatDigiPinString(rawPin);
}

/**
 * Decodes a DigiPin string back into coordinates and bounding box
 */
export function decodeDigiPin(pinInput: string): DigiPinResult | null {
  const cleanPin = pinInput.toUpperCase().replace(/[^2-9CFGJKLMPQRTVWXYZ]/g, '');

  if (cleanPin.length !== 10) {
    return null;
  }

  let currentMinLat = MIN_LAT;
  let currentMaxLat = MAX_LAT;
  let currentMinLon = MIN_LON;
  let currentMaxLon = MAX_LON;

  for (let i = 0; i < 10; i++) {
    const char = cleanPin[i];
    const symbolIndex = DIGIPIN_ALPHABET.indexOf(char);

    if (symbolIndex === -1) return null;

    const latIndex = Math.floor(symbolIndex / 6);
    const lonIndex = symbolIndex % 6;

    const latSpan = (currentMaxLat - currentMinLat) / 4;
    const lonSpan = (currentMaxLon - currentMinLon) / 6;

    currentMinLat = currentMinLat + latIndex * latSpan;
    currentMaxLat = currentMinLat + latSpan;
    currentMinLon = currentMinLon + lonIndex * lonSpan;
    currentMaxLon = currentMinLon + lonSpan;
  }

  const centerLat = (currentMinLat + currentMaxLat) / 2;
  const centerLon = (currentMinLon + currentMaxLon) / 2;

  // Estimate grid resolution accuracy in meters
  const latDistMeters = Math.abs(currentMaxLat - currentMinLat) * 111000;

  return {
    pin: formatDigiPinString(cleanPin),
    rawPin: cleanPin,
    latitude: Number(centerLat.toFixed(6)),
    longitude: Number(centerLon.toFixed(6)),
    accuracyMeters: Number(latDistMeters.toFixed(1)),
    boundingBox: {
      minLat: currentMinLat,
      maxLat: currentMaxLat,
      minLon: currentMinLon,
      maxLon: currentMaxLon,
    },
  };
}

/**
 * Validates whether a given string is a valid DigiPin format
 */
export function isValidDigiPin(pinInput: string): boolean {
  const cleanPin = pinInput.toUpperCase().replace(/[^2-9CFGJKLMPQRTVWXYZ]/g, '');
  return cleanPin.length === 10;
}

/**
 * Formats a raw 10-char DigiPin string into hyphenated pairs e.g. "3K-4M-7P-2V-9X"
 */
export function formatDigiPinString(rawPin: string): string {
  const clean = rawPin.toUpperCase().replace(/[^2-9CFGJKLMPQRTVWXYZ]/g, '');
  if (clean.length !== 10) return rawPin;
  return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}-${clean.slice(8, 10)}`;
}
