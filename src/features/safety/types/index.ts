export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isNotified: boolean;
}

export type HazardType =
  | 'accident'
  | 'pothole'
  | 'waterlogging'
  | 'road_closure'
  | 'speed_camera'
  | 'construction';

export interface HazardReport {
  id: string;
  type: HazardType;
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  upvotes: number;
  imageUrl?: string;
}
