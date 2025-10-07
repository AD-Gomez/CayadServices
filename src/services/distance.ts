/**
 * Lightweight distance utilities using open services.
 * - Geocoding: Nominatim (OpenStreetMap)
 * - Routing distance: OSRM demo server
 * Both are public endpoints with rate limits; suitable for light use.
 */

export type LatLng = { lat: number; lon: number };

function toNumber(v: any, def = NaN): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function geocode(q: string, signal?: AbortSignal): Promise<LatLng | null> {
  if (!q) return null;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal,
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(arr) || !arr.length) return null;
    const first = arr[0];
    const lat = toNumber(first.lat);
    const lon = toNumber(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch (_) {
    return null;
  }
}

export async function routeDistanceMeters(a: LatLng, b: LatLng, signal?: AbortSignal): Promise<number | null> {
  try {
    const url = new URL(
      `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}`
    );
    url.searchParams.set("alternatives", "false");
    url.searchParams.set("overview", "false");
    url.searchParams.set("annotations", "false");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return null;
    const data = await res.json();
    const meters = data?.routes?.[0]?.distance;
    return Number.isFinite(meters) ? Number(meters) : null;
  } catch (_) {
    return null;
  }
}

// Haversine fallback (great-circle approximation)
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export async function distanceForLocations(origin: string, destination: string): Promise<{
  meters: number | null;
  miles: number | null;
  kilometers: number | null;
}> {
  const ctrl = new AbortController();
  const [a, b] = await Promise.all([geocode(origin, ctrl.signal), geocode(destination, ctrl.signal)]);
  if (!a || !b) return { meters: null, miles: null, kilometers: null };

  // Try routed distance first
  const routed = await routeDistanceMeters(a, b, ctrl.signal);
  const meters = routed ?? haversineMeters(a, b);
  const kilometers = meters / 1000;
  const miles = kilometers * 0.621371;
  return { meters, kilometers, miles };
}

export function formatMiles(mi: number | null, fractionDigits = 0): string {
  if (mi == null || !Number.isFinite(mi)) return "";
  return `${mi.toFixed(fractionDigits)} mi`;
}

export function formatKm(km: number | null, fractionDigits = 0): string {
  if (km == null || !Number.isFinite(km)) return "";
  return `${km.toFixed(fractionDigits)} km`;
}

export function estimateTransitDays(miles: number | null): string | null {
  if (!miles || !Number.isFinite(miles)) return null;
  // Rough heuristic for auto transport transit windows
  if (miles <= 200) return "1–2 days";
  if (miles <= 600) return "2–4 days";
  if (miles <= 1000) return "3–5 days";
  if (miles <= 1500) return "4–7 days";
  if (miles <= 2000) return "5–8 days";
  return "6–10 days";
}
