export interface ParkingFloor {
  level: string;
  totalSlots: number;
  availableSlots: number;
  evSlots: number;
  accessibleSlots: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  totalFloors: number;
  currentFloor: string;
  hourlyRate: string;
  distanceMeters: number;
  indoorNavigationAvailable: boolean;
  floors: ParkingFloor[];
}
