export interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category?: string;
  isRecent?: boolean;
}

export interface DigiPinResult {
  code: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  gridLevel: string;
}
