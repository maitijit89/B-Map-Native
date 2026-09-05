/**
 * B-Map Mobile Client TypeScript Type Definitions
 * Typed to match B-Map Go Backend Models
 */

// ==========================================
// 1. Common & Spatial Types
// ==========================================

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RouteBounds {
  northeast: Coordinate;
  southwest: Coordinate;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

// ==========================================
// 2. Authentication & User Profile
// ==========================================

export interface RequestOTPRequest {
  email: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  meta: {
    expires_in_minutes: number;
    cooldown_seconds: number;
  };
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  name?: string;
  age?: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  age?: number;
  avatar_url?: string;
  total_active_minutes: number;
  last_active_at: string;
  created_at: string;
}

export interface AuthSuccessData {
  tokens: TokenPair;
  user: UserProfile;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  avatar_url?: string;
}

export interface TelemetryRequest {
  latitude: number;
  longitude: number;
  device?: string;
  active_minutes_delta?: number;
}

// ==========================================
// 3. Places & Spatial Search
// ==========================================

export interface Place {
  id: string;
  name: string;
  description?: string;
  address: string;
  category: string;
  location: GeoPoint;
  photo_url?: string;
  pincode?: string;
  digipin?: string;
  distance_meters?: number;
}

export interface SearchPlacesParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface AutocompleteSuggestion {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  address?: string;
  category: string;
  distance_meters?: number;
  location?: Coordinate;
  latitude?: number;
  longitude?: number;
}

export interface SearchPlacesResponse {
  success: boolean;
  places: Place[];
  total: number;
}

export interface AutocompleteResponse {
  success: boolean;
  suggestions: AutocompleteSuggestion[];
}

// ==========================================
// 4. Routing & Turn-by-Turn Navigation
// ==========================================

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export type ManeuverType =
  | 'depart'
  | 'continue'
  | 'turn_slight_left'
  | 'turn_left'
  | 'turn_sharp_left'
  | 'turn_slight_right'
  | 'turn_right'
  | 'turn_sharp_right'
  | 'u_turn'
  | 'arrive';

export interface RouteStep {
  instruction: string;
  maneuver: ManeuverType;
  distance_meters: number;
  duration_seconds: number;
  start_location: Coordinate;
  end_location: Coordinate;
  road_name?: string;
}

export interface RouteResponse {
  summary: string;
  distance_meters: number;
  duration_seconds: number;
  overview_polyline: string;
  bounds: RouteBounds;
  steps: RouteStep[];
  waypoints?: Coordinate[];
}

export interface GetDirectionsParams {
  origin: string; // "lat,lng"
  destination: string; // "lat,lng"
  mode?: TravelMode;
  waypoints?: string; // "lat,lng|lat,lng"
}

export interface NavigationProgressRequest {
  user_location: Coordinate;
  route: RouteResponse;
  mode?: TravelMode;
  off_route_threshold_meters?: number;
}

export interface NavigationProgress {
  current_step_index: number;
  distance_to_next_step_meters: number;
  remaining_distance_meters: number;
  remaining_duration_seconds: number;
  is_off_route: boolean;
}

export interface NavigationProgressResponse {
  success: boolean;
  progress: NavigationProgress;
  rerouted: boolean;
  new_route?: RouteResponse;
}

export interface SnappedPoint {
  original_index: number;
  original_location: Coordinate;
  snapped_location: Coordinate;
  distance_meters: number;
  road_name: string;
}

// ==========================================
// 5. Indian Regional Ecosystem
// ==========================================

export interface PINCodeInfo {
  pincode: string;
  district: string;
  state: string;
  circle: string;
  location?: Coordinate;
  center?: { lat: number; lng: number };
  landmarks?: string[];
  post_office?: string;
  bounding_box?: [number, number, number, number];
}

export interface ParsedIndianAddress {
  raw_address: string;
  detected_pincode: string;
  landmark: string;
  locality: string;
  city: string;
  state: string;
  confidence_score: number;
}

export interface DIGIPINData {
  digipin: string;
  latitude?: number;
  longitude?: number;
  center_coordinate?: { lat: number; lng: number };
  bounding_box?: [number, number, number, number];
  plus_code?: string;
  resolution?: string;
  postal_circle?: string;
  state?: string;
}

export type VehicleClass =
  | 'CAR_JEEP_VAN'
  | 'LCV'
  | 'BUS_TRUCK_2AXLE'
  | '3AXLE_COMMERCIAL'
  | '4_6_AXLE'
  | '7_PLUS_AXLE'
  | 'TWO_WHEELER';

export interface TollPlaza {
  id: string;
  name: string;
  highway: string;
  location: Coordinate;
  single_trip_inr: number;
  return_trip_inr: number;
  monthly_pass_inr: number;
  is_fastag_active: boolean;
  operator: string;
}

export interface TollCalculationRequest {
  route_coordinates: Coordinate[];
  vehicle_type: VehicleClass;
  is_return_trip?: boolean;
}

export interface TollCalculationResponse {
  total_toll_inr: number;
  total_plazas_count: number;
  vehicle_type: VehicleClass;
  fastag_savings_inr: number;
  plazas: TollPlaza[];
  expressways_crossed: string[];
  note?: string;
}

export type IndianCity =
  | 'DELHI'
  | 'MUMBAI'
  | 'BENGALURU'
  | 'KOLKATA'
  | 'CHENNAI'
  | 'HYDERABAD';

export interface FareEstimateRequest {
  city: IndianCity;
  distance_km: number;
  duration_minutes?: number;
  is_night_time?: boolean;
}

export interface FareOption {
  vehicle_category: string;
  base_fare_inr: number;
  per_km_rate_inr: number;
  night_surcharge_inr: number;
  total_estimated_inr: number;
  notes?: string;
}

export interface FareEstimateResponse {
  city: IndianCity;
  distance_km: number;
  duration_minutes: number;
  is_night_surcharge_active: boolean;
  fare_options: FareOption[];
}

export type HazardType =
  | 'SPEED_BREAKER_UNMARKED'
  | 'MONSOON_WATERLOGGING'
  | 'POTHOLE_CLUSTER'
  | 'CATTLE_ON_HIGHWAY'
  | 'NARROW_GULLY_BOTTLENECK'
  | 'OPEN_DRAINAGE_CONSTRUCTION';

export interface RoadHazard {
  id: string;
  type: HazardType;
  severity: 'LOW' | 'MODERATE' | 'CRITICAL';
  location: Coordinate | { lat: number; lng: number };
  description: string;
  voice_prompt: string;
  reported_at: string;
  confirmations_count: number;
}

export interface SOSAlertRequest {
  type:
    | 'ACCIDENT_CRITICAL'
    | 'MEDICAL_EMERGENCY'
    | 'VEHICLE_BREAKDOWN'
    | 'WOMEN_SAFETY_SOS'
    | 'NHAI_1033_PATROL';
  current_location: Coordinate;
  vehicle_number?: string;
  user_phone?: string;
  message?: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: string;
  phone: string;
  location: Coordinate;
  distance_km: number;
  is_24x7: boolean;
  has_ambulance: boolean;
}

export interface SOSAlertResponse {
  incident_id: string;
  status: string;
  national_helpline: string;
  highway_helpline: string;
  timestamp: string;
  nearby_facilities: EmergencyFacility[];
}

export type SupportedIndianLanguage =
  | 'hi-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'ml-IN'
  | 'pa-IN'
  | 'en-IN';

export interface ManeuverPromptRequest {
  action: string;
  distance_meters: number;
  street_name: string;
  landmark?: string;
  language: SupportedIndianLanguage;
}

export interface LocalizedVoicePrompt {
  language: SupportedIndianLanguage;
  action: string;
  localized_text: string;
  phonetic_script: string;
  audio_tts_voice: string;
}

export interface HighwayWeatherReport {
  location: Coordinate | { lat: number; lng: number };
  highway_name: string;
  temperature_celsius: number;
  visibility_meters: number;
  is_dense_fog_active: boolean;
  rainfall_mm_per_hour: number;
  imd_alert_level: 'GREEN_NO_WARNING' | 'YELLOW_BE_AWARE' | 'ORANGE_BE_PREPARED' | 'RED_TAKE_ACTION';
  hazard_type?: string;
  safety_advisory: string;
}

export interface EVStation {
  id: string;
  name: string;
  operator: string;
  location: Coordinate | { lat: number; lng: number };
  address: string;
  connectors: string[] | any[];
  total_ports?: number;
  available_ports?: number;
  power_kw?: number;
  cost_per_kwh_inr: number;
  is_battery_swap_available?: boolean;
}

// ==========================================
// 6. Fleet & Real-time Telemetry
// ==========================================

export interface NearbyDriver {
  driver_id: string;
  location?: Coordinate;
  latitude?: number;
  longitude?: number;
  heading?: number;
  status?: 'available' | 'busy' | 'offline';
  distance_meters?: number;
}

export interface TripRequest {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address?: string;
  dropoff_address?: string;
}

export interface Trip {
  id: string;
  rider_id: string;
  driver_id?: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';
  pickup: Coordinate;
  dropoff: Coordinate;
  pickup_address?: string;
  dropoff_address?: string;
  fare_inr?: number;
  created_at: string;
}

// ==========================================
// 7. App Updates & Ratings
// ==========================================

export interface CheckUpdateResponse {
  current_version: string;
  latest_version: string;
  latest_version_code: number;
  min_version: string;
  update_available: boolean;
  is_mandatory: boolean;
  title: string;
  release_notes: string;
  download_url: string;
  apk_url: string;
  platform: string;
}

export interface RatingRequest {
  score: number; // 1 - 5
  category?: 'navigation' | 'ui' | 'performance' | 'general';
  feedback?: string;
}

export interface Rating {
  id: string;
  score: number;
  category: string;
  feedback?: string;
  created_at: string;
}
