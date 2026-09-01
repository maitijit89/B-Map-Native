import { MetroFareRate } from '@/types';

export const METRO_FARE_RATES: Record<string, MetroFareRate> = {
  Delhi: {
    city: 'Delhi (NCT)',
    auto: {
      baseFare: 30, // for first 1.5 km
      baseKm: 1.5,
      perKmRate: 11,
      nightSurchargePercent: 25, // 11 PM to 5 AM
      waitingChargePerMin: 1.25, // ₹0.75 per minute after initial 15 mins
      luggageCharge: 10,
    },
    cab: {
      baseFare: 50,
      baseKm: 1.0,
      perKmRate: 16,
      nightSurchargePercent: 25,
      waitingChargePerMin: 2.0,
      luggageCharge: 15,
    },
  },
  Mumbai: {
    city: 'Mumbai (MMR)',
    auto: {
      baseFare: 23, // for first 1.5 km
      baseKm: 1.5,
      perKmRate: 15.33,
      nightSurchargePercent: 25,
      waitingChargePerMin: 1.5,
      luggageCharge: 10,
    },
    cab: {
      baseFare: 28,
      baseKm: 1.5,
      perKmRate: 18.66,
      nightSurchargePercent: 25,
      waitingChargePerMin: 2.5,
      luggageCharge: 15,
    },
  },
  Bengaluru: {
    city: 'Bengaluru (Karnataka)',
    auto: {
      baseFare: 30, // for first 2 km
      baseKm: 2.0,
      perKmRate: 15,
      nightSurchargePercent: 50, // 50% between 10 PM and 5 AM
      waitingChargePerMin: 1.0,
      luggageCharge: 20,
    },
    cab: {
      baseFare: 75,
      baseKm: 4.0,
      perKmRate: 18,
      nightSurchargePercent: 25,
      waitingChargePerMin: 2.0,
      luggageCharge: 25,
    },
  },
  Kolkata: {
    city: 'Kolkata (West Bengal)',
    auto: {
      baseFare: 25,
      baseKm: 2.0,
      perKmRate: 12,
      nightSurchargePercent: 20,
      waitingChargePerMin: 1.0,
      luggageCharge: 10,
    },
    cab: {
      baseFare: 40,
      baseKm: 2.0,
      perKmRate: 15,
      nightSurchargePercent: 25,
      waitingChargePerMin: 1.8,
      luggageCharge: 15,
    },
  },
  Chennai: {
    city: 'Chennai (Tamil Nadu)',
    auto: {
      baseFare: 25,
      baseKm: 1.8,
      perKmRate: 12,
      nightSurchargePercent: 50,
      waitingChargePerMin: 1.0,
      luggageCharge: 20,
    },
    cab: {
      baseFare: 60,
      baseKm: 3.0,
      perKmRate: 17,
      nightSurchargePercent: 25,
      waitingChargePerMin: 2.0,
      luggageCharge: 20,
    },
  },
  Hyderabad: {
    city: 'Hyderabad (Telangana)',
    auto: {
      baseFare: 30,
      baseKm: 1.6,
      perKmRate: 13,
      nightSurchargePercent: 50,
      waitingChargePerMin: 1.0,
      luggageCharge: 15,
    },
    cab: {
      baseFare: 55,
      baseKm: 2.0,
      perKmRate: 16,
      nightSurchargePercent: 25,
      waitingChargePerMin: 2.0,
      luggageCharge: 20,
    },
  },
};

export interface FareCalculationBreakdown {
  city: string;
  vehicleType: 'auto' | 'cab';
  distanceKm: number;
  baseFare: number;
  baseKm: number;
  distanceCharge: number;
  waitingFee: number;
  luggageCharge: number;
  nightSurchargeAmount: number;
  totalFare: number;
  nightSurchargeApplied: boolean;
}

export function calculateMeteredFare(
  cityName: string,
  vehicleType: 'auto' | 'cab',
  distanceKm: number,
  isNightSurcharge: boolean,
  waitingMinutes: number,
  luggageCount: number = 0
): FareCalculationBreakdown {
  const rateConfig = METRO_FARE_RATES[cityName] || METRO_FARE_RATES.Delhi;
  const rates = vehicleType === 'auto' ? rateConfig.auto : rateConfig.cab;

  const validDist = Math.max(0.1, distanceKm);
  const extraKm = Math.max(0, validDist - rates.baseKm);
  const distanceCharge = Math.round(extraKm * rates.perKmRate);
  const waitingFee = Math.round(waitingMinutes * rates.waitingChargePerMin);
  const luggageCharge = luggageCount * rates.luggageCharge;

  const subtotal = rates.baseFare + distanceCharge + waitingFee + luggageCharge;
  const nightSurchargeAmount = isNightSurcharge ? Math.round(subtotal * (rates.nightSurchargePercent / 100)) : 0;
  const totalFare = Math.round(subtotal + nightSurchargeAmount);

  return {
    city: rateConfig.city,
    vehicleType,
    distanceKm: Math.round(validDist * 10) / 10,
    baseFare: rates.baseFare,
    baseKm: rates.baseKm,
    distanceCharge,
    waitingFee,
    luggageCharge,
    nightSurchargeAmount,
    totalFare,
    nightSurchargeApplied: isNightSurcharge,
  };
}
