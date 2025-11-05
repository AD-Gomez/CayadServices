export type VehicleClass = "sedan" | "coupe" | "suv" | "pickup" | "van" | "motorcycle";
export type TransportTypeLabel = "Open" | "Enclosed";

export type EstimateInput = {
  miles: number | null;
  vehicleClass: VehicleClass;
  transportType: TransportTypeLabel; // Assumed for estimate
  inop?: boolean; // default false; only used for adjustments when specified
};

export type EstimateResult = {
  estimate: number | null;
  perMile: number | null;
  breakdown: {
    basePerMile: number | null;
    distanceBand: string | null;
    vehicleMultiplier: number;
    enclosedMultiplier: number;
    inopMultiplier: number;
    minimum: number;
  };
};

// Heuristic estimator based on distance bands and common market averages.
// Notes:
// - Open transport baseline per-mile decreases with distance.
// - Enclosed adds ~35% (varies by market 30–40%).
// - Vehicle class adds size/weight multiplier.
// - Inoperable adds ~15% to account for winch/forklift handling.
// - Hard minimum for short/local trips.
export function estimatePrice(input: EstimateInput): EstimateResult {
  const miles = input.miles;
  if (!miles || !Number.isFinite(miles) || miles <= 0) {
    return {
      estimate: null,
      perMile: null,
      breakdown: {
        basePerMile: null,
        distanceBand: null,
        vehicleMultiplier: 1,
        enclosedMultiplier: 1,
        inopMultiplier: 1,
        minimum: 250,
      },
    };
  }

  // Base per-mile for open transport
  let basePerMile: number;
  let band: string;
  if (miles <= 200) {
    basePerMile = 1.9; band = "0–200 mi";
  } else if (miles <= 600) {
    basePerMile = 1.4; band = "201–600 mi";
  } else if (miles <= 1000) {
    basePerMile = 1.2; band = "601–1000 mi";
  } else if (miles <= 1500) {
    basePerMile = 1.05; band = "1001–1500 mi";
  } else if (miles <= 2000) {
    basePerMile = 0.98; band = "1501–2000 mi";
  } else {
    basePerMile = 0.9; band = "> 2000 mi";
  }

  const vehicleMultiplierMap: Record<VehicleClass, number> = {
    sedan: 1.0,
    coupe: 1.0,
    suv: 1.12,
    pickup: 1.18,
    van: 1.22,
    motorcycle: 0.6,
  };

  const vehicleMultiplier = vehicleMultiplierMap[input.vehicleClass] ?? 1.0;
  const enclosedMultiplier = input.transportType === "Enclosed" ? 1.35 : 1.0;
  const inopMultiplier = input.inop ? 1.15 : 1.0;

  const perMile = basePerMile * vehicleMultiplier * enclosedMultiplier * inopMultiplier;
  const raw = perMile * miles;

  // Apply a floor minimum typical for short routes
  const minimum = 250;
  const estimate = Math.max(raw, minimum);

  return {
    estimate: Math.round(estimate),
    perMile: Math.round(perMile * 100) / 100,
    breakdown: {
      basePerMile,
      distanceBand: band,
      vehicleMultiplier,
      enclosedMultiplier,
      inopMultiplier,
      minimum,
    },
  };
}
