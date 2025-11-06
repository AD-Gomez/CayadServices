// Legacy fixed set kept for backward compatibility; backend now can return dynamic types
export type VehicleClass = "sedan" | "coupe" | "suv" | "pickup" | "van" | "motorcycle";
export type TransportTypeLabel = "Open" | "Enclosed";

export type EstimateInput = {
  miles: number | null;
  /** New dynamic vehicle type from API. If absent, falls back to legacy vehicleClass */
  vehicleType?: string;
  /** Legacy field used previously; still accepted for compatibility */
  vehicleClass?: VehicleClass;
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

  // Target retail open transport per-mile for light vehicles should average $0.50–$0.90.
  // We first derive a "light vehicle" base rate (sedan/coupe) using distance bands that
  // reflect typical market compression with longer distances, then apply multipliers.
  let basePerMile: number; // base for sedan/coupe open & running
  let band: string;
  if (miles <= 150) { // short local / expedited
    basePerMile = 0.9; band = "0–150 mi";
  } else if (miles <= 400) { // regional
    basePerMile = 0.78; band = "151–400 mi";
  } else if (miles <= 800) { // inter-state medium
    basePerMile = 0.7; band = "401–800 mi";
  } else if (miles <= 1200) { // long multi-state
    basePerMile = 0.64; band = "801–1200 mi";
  } else if (miles <= 1800) { // cross-country segment
    basePerMile = 0.58; band = "1201–1800 mi";
  } else { // full cross-country / very long
    basePerMile = 0.52; band = "> 1800 mi";
  }

  const multiplierMap: Record<string, number> = {
    sedan: 1.0,
    coupe: 1.0,
    suv: 1.18,
    crossover: 1.15,
    hatchback: 1.02,
    pickup: 1.25,
    truck: 1.3,
    van: 1.3,
    minivan: 1.22,
    convertible: 1.05,
    motorcycle: 0.55,
    atv: 0.7,
    rv: 1.6,
    bus: 1.8,
  };
  const selectedType = (input.vehicleType || input.vehicleClass || 'sedan').toLowerCase().trim();
  const vehicleMultiplier = multiplierMap[selectedType] ?? 1.0;
  const enclosedMultiplier = input.transportType === "Enclosed" ? 1.4 : 1.0; // raise to ~40% premium
  const inopMultiplier = input.inop ? 1.15 : 1.0;

  let perMile = basePerMile * vehicleMultiplier * enclosedMultiplier * inopMultiplier;

  // Clamp light vehicle open-running (sedan/coupe, not enclosed, not inop)
  // between $0.50 and $0.90 to stay within guidance.
  const isLightStandard = ["sedan", "coupe"].includes(selectedType) && input.transportType === "Open" && !input.inop;
  if (isLightStandard) {
    perMile = Math.min(Math.max(perMile, 0.5), 0.9);
  }

  const raw = perMile * miles;
  const minimum = 250; // keep practical minimum
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
