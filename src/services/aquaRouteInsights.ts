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
    const res = await fetch("/api/aqua-route-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as AquaRouteInsightsResponse;
  } catch (error) {
    console.warn("[aquaRouteInsights] Request failed", error);
    return null;
  }
}
