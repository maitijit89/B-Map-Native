import { TollPlaza, VehicleClass } from '@/types';

export const NATIONAL_TOLL_PLAZAS: TollPlaza[] = [
  {
    id: 'plaza-1',
    name: 'Kherki Daula Toll Plaza',
    highway: 'Delhi-Gurugram Expressway (NH-48)',
    chainageKm: 'KM 27.5',
    carRate: 85,
    lcvRate: 125,
    busTruckRate: 250,
    multiAxleRate: 410,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 28.4061, longitude: 76.9934 },
  },
  {
    id: 'plaza-2',
    name: 'Jewar Toll Plaza',
    highway: 'Yamuna Expressway (YEIDA)',
    chainageKm: 'KM 38.0',
    carRate: 165,
    lcvRate: 260,
    busTruckRate: 535,
    multiAxleRate: 820,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 28.1287, longitude: 77.5582 },
  },
  {
    id: 'plaza-3',
    name: 'Murthal Toll Plaza',
    highway: 'Delhi-Panipat Expressway (NH-44)',
    chainageKm: 'KM 51.2',
    carRate: 90,
    lcvRate: 145,
    busTruckRate: 295,
    multiAxleRate: 465,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 29.0274, longitude: 77.0722 },
  },
  {
    id: 'plaza-4',
    name: 'Dasna Toll Plaza',
    highway: 'Delhi-Meerut Expressway (NE-3)',
    chainageKm: 'KM 28.0',
    carRate: 70,
    lcvRate: 110,
    busTruckRate: 230,
    multiAxleRate: 360,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 28.6852, longitude: 77.5312 },
  },
  {
    id: 'plaza-5',
    name: 'Khalapur Toll Plaza',
    highway: 'Mumbai-Pune Expressway (YCEW)',
    chainageKm: 'KM 32.5',
    carRate: 320,
    lcvRate: 495,
    busTruckRate: 980,
    multiAxleRate: 1540,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 18.8357, longitude: 73.2842 },
  },
  {
    id: 'plaza-6',
    name: 'Attibele Toll Plaza',
    highway: 'Bengaluru-Hosur Highway (NH-44)',
    chainageKm: 'KM 32.0',
    carRate: 40,
    lcvRate: 65,
    busTruckRate: 135,
    multiAxleRate: 215,
    hasDedicatedFastagLanes: true,
    coordinates: { latitude: 12.7797, longitude: 77.7712 },
  },
];

export function getTollRateForVehicle(plaza: TollPlaza, vehicleClass: VehicleClass): number {
  switch (vehicleClass) {
    case 'car':
      return plaza.carRate;
    case 'lcv':
      return plaza.lcvRate;
    case 'bus_truck':
      return plaza.busTruckRate;
    case 'multi_axle':
      return plaza.multiAxleRate;
    default:
      return plaza.carRate;
  }
}

export function calculateTotalRouteTolls(plazas: TollPlaza[], vehicleClass: VehicleClass): number {
  return plazas.reduce((sum, plaza) => sum + getTollRateForVehicle(plaza, vehicleClass), 0);
}
