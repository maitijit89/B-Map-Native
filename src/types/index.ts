/**
 * B Map - Type Definitions
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export type PlaceCategory = 'ev' | 'toll' | 'hazard' | 'sos' | 'poi' | 'fuel' | 'hospital' | 'taxi' | 'user';

export interface PlacePOI {
  id: string;
  title: string;
  category: PlaceCategory;
  rating: number;
  reviewCount: number;
  address: string;
  digipin: string; // 10-char India Post Code e.g. "DL-982-KP34"
  coordinates: LatLng;
  distanceKm?: number;
  details?: {
    phone?: string;
    timings?: string;
    pricing?: string;
    fastagLane?: boolean;
    connectors?: string[];
  };
}

export interface RouteOption {
  id: string;
  name: string;
  durationMinutes: number;
  distanceKm: number;
  eta: string;
  hasFastagToll: boolean;
  tollFee?: number;
  tollPlazaCount?: number;
  glosaAdvisedSpeedKmh?: number;
  trafficLevel: 'low' | 'moderate' | 'heavy';
  viaRoad: string;
  coordinates: LatLng[];
}

export interface TollPlaza {
  id: string;
  name: string;
  highway: string;
  chainageKm: string;
  carRate: number;
  lcvRate: number;
  busTruckRate: number;
  multiAxleRate: number;
  hasDedicatedFastagLanes: boolean;
  coordinates: LatLng;
}

export type VehicleClass = 'car' | 'lcv' | 'bus_truck' | 'multi_axle';

export interface EVStation {
  id: string;
  name: string;
  network: 'Tata Power EZ Charge' | 'Ather Grid' | 'Jio-bp pulse' | 'Magenta Power' | 'Statiq';
  address: string;
  coordinates: LatLng;
  distanceKm: number;
  availablePorts: number;
  totalPorts: number;
  maxPowerKw: number;
  connectors: ('CCS2' | 'Type2_AC' | 'CHAdeMO' | 'GB/T' | '2W_3W_Swap')[];
  costPerKwh: number;
}

export interface DigiPinResult {
  digipin: string;
  latitude: number;
  longitude: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  region: string;
  gridResolutionMeters: number;
}

export interface ParsedIndianAddress {
  rawAddress: string;
  landmark: string;
  street: string;
  district: string;
  pinCode: string;
  digipin: string;
}

export interface MetroFareRate {
  city: string;
  auto: {
    baseFare: number;
    baseKm: number;
    perKmRate: number;
    nightSurchargePercent: number;
    waitingChargePerMin: number;
    luggageCharge: number;
  };
  cab: {
    baseFare: number;
    baseKm: number;
    perKmRate: number;
    nightSurchargePercent: number;
    waitingChargePerMin: number;
    luggageCharge: number;
  };
}

export type HazardCategory = 'Speed Breaker' | 'Waterlogging' | 'Pothole' | 'Stray Animals';

export interface HazardReport {
  id: string;
  category: HazardCategory;
  comment?: string;
  coordinates: LatLng;
  timestamp: number;
  upvotes: number;
  verified: boolean;
}

export interface FleetVehicle {
  id: string;
  tier: 'Auto' | 'Economy Sedan' | 'Premium SUV';
  driverName: string;
  vehicleNumber: string;
  rating: number;
  estimatedPrice: number;
  etaMinutes: number;
  coordinates: LatLng;
}

export interface UserReview {
  rating: number;
  categories: string[];
  comment: string;
  submittedAt: number;
}
