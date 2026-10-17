export interface EvConnector {
  type: 'CCS2' | 'Type2' | 'CHAdeMO' | 'GB/T';
  powerKw: number;
  totalPorts: number;
  availablePorts: number;
  pricePerKwh: number;
}

export interface EvChargingStation {
  id: string;
  name: string;
  operator: string;
  distanceKm: number;
  address: string;
  connectors: EvConnector[];
  rating: number;
  isAvailable: boolean;
}
