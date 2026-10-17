export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  driverName: string;
  driverPhone: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  batteryOrFuelPercent: number;
  currentSpeedKmh: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface TspDeliveryStop {
  id: string;
  sequenceOrder: number;
  customerName: string;
  address: string;
  timeWindow: string;
  packagesCount: number;
  isCompleted: boolean;
  latitude: number;
  longitude: number;
}
