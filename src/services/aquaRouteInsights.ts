import { apiUrl } from "./config";

export type AquaRouteInsightsLocation = {
  zip?: string;
  city?: string;
  state?: string;
};

export type AquaRouteInsightsRequest = {
  origin: AquaRouteInsightsLocation;
  destination: AquaRouteInsightsLocation;
  ship_date?: string | null;
};

export type AquaRouteInsightsResponse = {
  routeEffort?: {
    factor?: number;
    adjustmentPct?: number;
    adjustments?: string[];
  } | null;
  origin?: {
    fuel?: {
      regularPrice?: number | null;
    } | null;
  } | null;
  destination?: {
    fuel?: {
      regularPrice?: number | null;
    } | null;
  } | null;
} | null;

export async function postAquaRouteInsights(
  payload: AquaRouteInsightsRequest,
  signal?: AbortSignal,
): Promise<AquaRouteInsightsResponse> {
  try {
    const endpoints = [
      apiUrl("/api/public/aqua-route-insights/"),
      "/api/aqua-route-insights",
    ];

    for (const endpoint of endpoints) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      if (res.ok) {
        return (await res.json()) as AquaRouteInsightsResponse;
      }
    }

    return null;
  } catch (error) {
    console.warn("[aquaRouteInsights] Request failed", error);
    return null;
  }
}
