export interface TransitLeg {
  mode: 'subway' | 'bus' | 'walk' | 'train';
  lineName?: string;
  lineColor?: string;
  fromStation: string;
  toStation: string;
  stopsCount?: number;
  durationMin: number;
}

export interface TransitItinerary {
  id: string;
  departureTime: string;
  arrivalTime: string;
  totalDurationMin: number;
  fare: string;
  legs: TransitLeg[];
  transfersCount: number;
}
