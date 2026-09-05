import { apiClient } from './client';
import * as T from './types';

// ==========================================
// 1. Authentication & Profile API
// ==========================================
export const AuthAPI = {
  requestOTP: (email: string) =>
    apiClient.post<T.RequestOTPResponse>('/auth/login', { email }),

  verifyOTP: (data: T.VerifyOTPRequest) =>
    apiClient.post<T.ApiResponse<T.AuthSuccessData>>('/auth/verify', data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<T.ApiResponse<{ tokens: T.TokenPair }>>('/auth/refresh', { refresh_token: refreshToken }),

  logout: (refreshToken?: string) =>
    apiClient.post<T.ApiResponse<void>>('/auth/logout', { refresh_token: refreshToken }),

  getProfile: () =>
    apiClient.get<T.ApiResponse<{ user: T.UserProfile }>>('/auth/me'),

  updateProfile: (data: T.UpdateProfileRequest) =>
    apiClient.put<T.ApiResponse<{ user: T.UserProfile }>>('/auth/profile', data),

  sendTelemetry: (data: T.TelemetryRequest) =>
    apiClient.post<T.ApiResponse<{ timestamp: string }>>('/auth/telemetry', data),
};

// ==========================================
// 2. Places & Spatial Search API
// ==========================================
export const PlacesAPI = {
  search: (params: T.SearchPlacesParams) =>
    apiClient.get<T.SearchPlacesResponse>('/places/search', { params }),

  autocomplete: (query: string, lat?: number, lng?: number, limit = 8) =>
    apiClient.get<T.AutocompleteResponse>('/places/autocomplete', {
      params: { q: query, lat, lng, limit },
    }),

  reverseGeocode: (lat: number, lng: number) =>
    apiClient.get<T.ApiResponse<{ place: T.Place }>>('/places/reverse', {
      params: { lat, lng },
    }),
};

// ==========================================
// 3. Routing & Directions API
// ==========================================
export const RoutesAPI = {
  getDirections: (params: T.GetDirectionsParams) =>
    apiClient.get<{ success: boolean; route: T.RouteResponse }>('/routes/directions', { params }),

  trackProgress: (data: T.NavigationProgressRequest) =>
    apiClient.post<T.NavigationProgressResponse>('/routes/progress', data),

  getDistanceMatrix: (origins: string, destinations: string, mode: T.TravelMode = 'driving') =>
    apiClient.get<{ success: boolean; matrix: any }>('/routes/distance-matrix', {
      params: { origins, destinations, mode },
    }),

  snapToRoads: (path: T.Coordinate[], interpolate = true) =>
    apiClient.post<{ success: boolean; snapped_points: T.SnappedPoint[] }>('/roads/snap-to-roads', {
      path,
      interpolate,
    }),

  getSpeedLimits: (pointsPipeSeparated: string) =>
    apiClient.get<{ success: boolean; speed_limits: any[] }>('/roads/speed-limits', {
      params: { points: pointsPipeSeparated },
    }),
};

// ==========================================
// 4. Indian Regional Ecosystem API
// ==========================================
export const IndianEcosystemAPI = {
  lookupPINCode: (pincode: string) =>
    apiClient.get<T.ApiResponse<T.PINCodeInfo>>(`/pincode/${pincode}`),

  parseAddress: (address: string) =>
    apiClient.post<T.ApiResponse<T.ParsedIndianAddress>>('/pincode/parse-address', { address }),

  reversePINCode: (lat: number, lng: number) =>
    apiClient.get<T.ApiResponse<T.PINCodeInfo>>('/pincode/reverse', { params: { lat, lng } }),

  encodeDIGIPIN: (lat: number, lng: number) =>
    apiClient.get<T.ApiResponse<T.DIGIPINData>>('/digipin/encode', { params: { lat, lng } }),

  decodeDIGIPIN: (code: string) =>
    apiClient.get<T.ApiResponse<T.DIGIPINData>>(`/digipin/decode/${code}`),

  calculateFASTagToll: (data: T.TollCalculationRequest) =>
    apiClient.post<T.ApiResponse<T.TollCalculationResponse>>('/tolls/calculate', data),

  getNearbyTolls: (lat: number, lng: number, radiusKm = 50) =>
    apiClient.get<T.ApiResponse<{ count: number; plazas: T.TollPlaza[] }>>('/tolls/nearby', {
      params: { lat, lng, radius_km: radiusKm },
    }),

  estimateMeteredFare: (data: T.FareEstimateRequest) =>
    apiClient.post<T.ApiResponse<T.FareEstimateResponse>>('/fares/estimate', data),

  getAheadHazards: (lat: number, lng: number, lookaheadMeters = 500) =>
    apiClient.get<T.ApiResponse<{ count: number; hazards: T.RoadHazard[] }>>('/hazards/ahead', {
      params: { lat, lng, lookahead_meters: lookaheadMeters },
    }),

  reportHazard: (hazard: Partial<T.RoadHazard>) =>
    apiClient.post<T.ApiResponse<T.RoadHazard>>('/hazards/report', hazard),

  triggerEmergencySOS: (data: T.SOSAlertRequest) =>
    apiClient.post<T.ApiResponse<T.SOSAlertResponse>>('/emergency/sos', data),

  getNearbyEmergencyFacilities: (lat: number, lng: number) =>
    apiClient.get<T.ApiResponse<{ count: number; facilities: T.EmergencyFacility[] }>>('/emergency/facilities', {
      params: { lat, lng },
    }),

  getHighwayWeather: (lat: number, lng: number, highwayName = 'National Highway') =>
    apiClient.get<T.ApiResponse<T.HighwayWeatherReport>>('/weather/highway', {
      params: { lat, lng, highway: highwayName },
    }),

  translateVoicePrompt: (data: T.ManeuverPromptRequest) =>
    apiClient.post<T.ApiResponse<T.LocalizedVoicePrompt>>('/vernacular/prompt', data),

  getEVStations: (lat: number, lng: number, radiusKm = 25, connector?: string) =>
    apiClient.get<T.ApiResponse<{ count: number; stations: T.EVStation[] }>>('/ev/stations', {
      params: { lat, lng, radius_km: radiusKm, connector },
    }),
};

// ==========================================
// 5. Fleet & Ride Hailing API
// ==========================================
export const FleetAPI = {
  getNearbyDrivers: (lat: number, lng: number, radius = 5000, limit = 10) =>
    apiClient.get<{ success: boolean; count: number; drivers: T.NearbyDriver[] }>('/fleet/nearby-drivers', {
      params: { lat, lng, radius, limit },
    }),

  requestTrip: (data: T.TripRequest) =>
    apiClient.post<{ success: boolean; trip: T.Trip }>('/fleet/trips', data),

  getTrip: (tripID: string) =>
    apiClient.get<{ success: boolean; trip: T.Trip }>(`/fleet/trips/${tripID}`),
};

// ==========================================
// 6. App Version & Rating API
// ==========================================
export const AppAPI = {
  checkUpdate: (currentVersion: string, versionCode: number, platform = 'android') =>
    apiClient.get<T.ApiResponse<T.CheckUpdateResponse>>('/app/check-update', {
      params: { current_version: currentVersion, version_code: versionCode, platform },
    }),

  submitRating: (data: T.RatingRequest) =>
    apiClient.post<T.ApiResponse<T.Rating>>('/ratings', data),

  getMyRating: () =>
    apiClient.get<T.ApiResponse<T.Rating>>('/ratings/my-rating'),
};
