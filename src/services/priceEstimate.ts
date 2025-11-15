import { apiUrl } from "./config";

export type TransportType = "open" | "enclosed";

export type GenericVehicleReq = {
  type: string; // e.g. "car", "suv", "pickup"
  inop?: boolean;
  count?: number; // default 1
};

export type SpecificVehicleReq = {
  year: number;
  make: string;
  model: string;
  // Optional: include a coarse type classification to help pricing if available
  type?: string; // e.g. "car", "suv", "pickup"
  inop?: boolean;
  count?: number; // default 1
};

// Backwards-compat legacy fields are optional and should not be sent when using vehicles[]
export type PriceEstimateRequest = {
  origin_zip: string; // 5-digit US ZIP
  destination_zip: string; // 5-digit US ZIP
  transport_type: TransportType; // "open" | "enclosed"
  vehicles?: Array<GenericVehicleReq | SpecificVehicleReq>;
  // legacy (single vehicle type):
  vehicle_type?: string;
  inop?: boolean;
  vehicles_count?: number; // default 1
};

export type PriceEstimateItem = {
  // Echo back request info for traceability
  type?: string;
  year?: number;
  make?: string;
  model?: string;
  inop?: boolean;
  count?: number;
  // Estimates
  low_estimate_total?: number;
  discounted_estimate_total?: number;
  normal_estimate_total?: number;
  per_mile?: number;
  // Confidence and sampling
  confidence?: "low" | "medium" | "high";
  confidence_pct?: number; // 0-100
  sample_size?: number;
};

export type PriceEstimateResponse = {
  estimate_available: boolean;
  items?: PriceEstimateItem[]; // when multiple vehicles requested
  // Aggregated totals for all items (optional, but recommended)
  discounted_estimate_total?: number;
  normal_estimate_total?: number;
  // Distances used for pricing and reference
  distance_used_for_pricing_miles?: number;
  reference_distance_miles?: number;
  estimated_transit_days?: number;
  // Overall confidence (optional)
  confidence?: "low" | "medium" | "high";
  confidence_pct?: number;
  sample_size?: number;
};

export async function postPriceEstimate(payload: PriceEstimateRequest, signal?: AbortSignal): Promise<PriceEstimateResponse | null> {
  const canonical = apiUrl("/api/public/price-estimate/");
  const alias = apiUrl("/leads/public/price-estimate/");
  const body = JSON.stringify(payload);
  try {
    let res = await fetch(canonical, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal });
    if (!res.ok) {
      res = await fetch(alias, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal });
    }
    if (!res.ok) return null;
    return (await res.json()) as PriceEstimateResponse;
  } catch {
    return null;
  }
}
