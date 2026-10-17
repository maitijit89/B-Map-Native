export interface PlaceItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  address: string;
  isOpenNow: boolean;
  priceLevel?: string;
  imageUrl?: string;
  tags?: string[];
}

export type PlaceCategory =
  | 'all'
  | 'food'
  | 'fuel'
  | 'ev'
  | 'parking'
  | 'hospital'
  | 'hotel'
  | 'atm';
