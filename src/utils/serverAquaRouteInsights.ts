import { getAaaFuelPriceSnapshot, type FuelStatePrice } from "./serverAaaFuelPrices";
import { createTtlCache } from "./serverCache";

const NOAA_BASE_URL = "https://api.weather.gov";

// Cache TTLs — data changes slowly, no need to re-fetch every request
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

// ZIP → coordinates (static data, cache 24h)
const zipCoordCache = createTtlCache<ZipLookupData>(ONE_DAY_MS);
// lat/lon → NOAA point URL (static per location, cache 24h)
const noaaPointCache = createTtlCache<PointData>(ONE_DAY_MS);
// forecast URL → forecast data (changes hourly, cache 1h)
const noaaForecastCache = createTtlCache<ForecastData>(ONE_HOUR_MS);
const ZIP_LOOKUP_BASE_URL = "https://api.zippopotam.us/us";
const MAPBOX_DIRECTIONS_BASE_URL = "https://api.mapbox.com/directions/v5/mapbox/driving";
const SHORT_TERM_FORECAST_DAYS = 7;
const ROUTE_PULSE_SAMPLE_DEFS = [
  { key: "origin", label: "Origin", fraction: 0 },
  { key: "checkpoint_1", label: "Checkpoint 1", fraction: 0.33 },
  { key: "checkpoint_2", label: "Checkpoint 2", fraction: 0.66 },
  { key: "destination", label: "Destination", fraction: 1 },
] as const;
const ROUTE_EFFORT_FACTORS = {
  normal: 1,
  moderate: 1.01,
  severe: 1.025,
} as const;
const ROUTE_PULSE_MODERATE_WIND_THRESHOLD_MPH = 25;
const ROUTE_PULSE_STRONG_WIND_THRESHOLD_MPH = 35;
const ROUTE_PULSE_SINGLE_MODERATE_DELTA = 0.015;
const ROUTE_PULSE_MULTI_MODERATE_DELTA = 0.03;
const ROUTE_PULSE_SINGLE_SEVERE_DELTA = 0.05;
const ROUTE_PULSE_COMPOUND_SEVERE_DELTA = 0.07;

const SEVERE_WINTER_STATES = new Set([
  "CO", "IA", "ID", "ME", "MI", "MN", "MT", "ND", "NE", "NH", "NY", "SD", "UT", "VT", "WI", "WY",
]);
const MODERATE_WINTER_STATES = new Set([
  "CT", "IL", "IN", "KS", "MA", "MD", "MO", "NJ", "NV", "OH", "OR", "PA", "RI", "WA", "WV",
]);

const WEATHER_KIND_RULES = [
  { kind: "thunderstorm", pattern: /thunder|storm|tornado|hurricane|tropical/i },
  { kind: "snow", pattern: /snow|blizzard|sleet|ice|freez/i },
  { kind: "rain", pattern: /rain|shower|drizzle|flood/i },
  { kind: "wind", pattern: /wind|breezy|gust/i },
  { kind: "cloudy", pattern: /cloud|overcast|fog|haze|smoke/i },
  { kind: "sunny", pattern: /sun|clear|fair/i },
] as const;

type Severity = "normal" | "moderate" | "severe";

type RouteInsightsLocationInput = {
  zip?: string;
  city?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type ZipLookupPlace = {
  "place name"?: string;
  "state abbreviation"?: string;
  latitude?: string;
  longitude?: string;
};

type ZipLookupData = {
  "post code"?: string;
  places?: ZipLookupPlace[];
};

type ForecastPeriod = {
  shortForecast?: string;
  detailedForecast?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  startTime?: string;
  endTime?: string;
  isDaytime?: boolean;
};

type ForecastData = {
  properties?: {
    periods?: ForecastPeriod[];
    updated?: string;
  };
};

type PointData = {
  properties?: {
    forecast?: string;
    relativeLocation?: {
      properties?: {
        city?: string;
        state?: string;
      };
    };
  };
};

type MapboxDirectionsData = {
  routes?: Array<{
    geometry?: {
      coordinates?: number[][];
    };
  }>;
};

type WeatherSummary = {
  kind: string;
  shortForecast: string;
  detailedForecast: string;
  windSpeed: string;
  windDirection: string;
  updatedAt: string | null;
  forecastStart: string | null;
  forecastEnd: string | null;
};

type PlaceSummary = {
  zip: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
};

type PulseCheckpoint = {
  key: string;
  label: string;
  city: string;
  state: string;
  shortForecast: string;
  windSpeedMph: number | null;
  triggers: string[];
};

type SeasonalCheckpoint = PulseCheckpoint & {
  seasonalSeverity: Severity;
};

type RouteEffort = {
  factor: number;
  windFactorDelta: number;
  severeFactorDelta: number;
  weatherFactorDelta: number;
  adjustmentPct: number;
  severity: Severity;
  basis: "route_pulse" | "seasonal" | "default";
  daysOut: number | null;
  shipDate: string | null;
  reason: string;
  adjustments: string[];
  moderateCheckpointCount?: number;
  severeCheckpointCount?: number;
  strongWindCheckpointCount?: number;
  checkpoints: Array<PulseCheckpoint | SeasonalCheckpoint>;
  pricingFormula: string;
};

type LocationInsights = PlaceSummary & {
  weather: WeatherSummary | null;
  fuel: FuelStatePrice | null;
};

export type AquaRouteInsightsResult = {
  source: {
    weather: string;
    fuel: string;
  };
  fetchedAt: string;
  shipDate: string | null;
  routeEffort: RouteEffort;
  routePulse: {
    checkpoints: PulseCheckpoint[];
  };
  origin: LocationInsights;
  destination: LocationInsights;
};

const toFahrenheit = (temperature: number | undefined, unit: string | undefined) => {
  const numeric = Number(temperature);
  if (!Number.isFinite(numeric)) return null;
  if (String(unit || "").toUpperCase() === "C") {
    return (numeric * 9) / 5 + 32;
  }
  return numeric;
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent": import.meta.env.NOAA_API_USER_AGENT || "CAYAD Services (support@cayad.co)",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeZipPlace(zipData: ZipLookupData, fallback: RouteInsightsLocationInput): PlaceSummary {
  const place = Array.isArray(zipData?.places) ? zipData.places[0] : null;
  const state = String(place?.["state abbreviation"] || fallback.state || "").trim().toUpperCase();
  const city = String(place?.["place name"] || fallback.city || "").trim();
  const latitude = Number(place?.latitude);
  const longitude = Number(place?.longitude);

  return {
    zip: String(zipData?.["post code"] || fallback.zip || "").trim(),
    city,
    state,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

function getWeatherKind(period: ForecastPeriod): string {
  const text = `${period.shortForecast || ""} ${period.detailedForecast || ""}`.trim();
  const match = WEATHER_KIND_RULES.find((rule) => rule.pattern.test(text));
  return match?.kind || "cloudy";
}

function parseShipDate(value?: string | null): Date | null {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00` : text;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDaysOut(shipDate: Date | null) {
  if (!(shipDate instanceof Date) || Number.isNaN(shipDate.getTime())) return null;
  const today = startOfDay(new Date());
  const target = startOfDay(shipDate);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function parseWindSpeedMph(value: string | undefined) {
  const matches = String(value || "").match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return null;
  const numbers = matches.map(Number).filter(Number.isFinite);
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

function formatAdjustmentPct(value: number) {
  const pct = Math.round(value * 1000) / 10;
  return Number.isInteger(pct) ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
}

function hasFiniteCoordinates(point: RouteInsightsLocationInput) {
  return Number.isFinite(point?.latitude) && Number.isFinite(point?.longitude);
}

function interpolateCoordinate(start: number, end: number, fraction: number) {
  return start + ((end - start) * fraction);
}

function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

function getHaversineMiles(start: RouteInsightsLocationInput, end: RouteInsightsLocationInput) {
  const lat1 = Number(start?.latitude);
  const lon1 = Number(start?.longitude);
  const lat2 = Number(end?.latitude);
  const lon2 = Number(end?.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return 0;

  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function normalizeRelativeLocation(pointData: PointData, fallback: RouteInsightsLocationInput) {
  const relative = pointData?.properties?.relativeLocation?.properties || {};
  return {
    city: String(relative?.city || fallback.city || "").trim(),
    state: String(relative?.state || fallback.state || "").trim().toUpperCase(),
  };
}

function getRoutePulseSampleCoordinatesFromInterpolation(origin: LocationInsights, destination: LocationInsights) {
  return ROUTE_PULSE_SAMPLE_DEFS.map((sample) => ({
    ...sample,
    latitude: interpolateCoordinate(origin.latitude as number, destination.latitude as number, sample.fraction),
    longitude: interpolateCoordinate(origin.longitude as number, destination.longitude as number, sample.fraction),
  }));
}

function sampleCoordinateAlongLine(coordinates: number[][], fraction: number) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;
  if (coordinates.length === 1) {
    const [longitude, latitude] = coordinates[0] || [];
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  }

  const segments: Array<{ start: RouteInsightsLocationInput; end: RouteInsightsLocationInput; distance: number }> = [];
  let totalDistance = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const previous = coordinates[index - 1];
    const current = coordinates[index];
    const start = { longitude: previous?.[0], latitude: previous?.[1] };
    const end = { longitude: current?.[0], latitude: current?.[1] };
    const distance = getHaversineMiles(start, end);
    segments.push({ start, end, distance });
    totalDistance += distance;
  }

  if (totalDistance <= 0) {
    const last = coordinates[Math.floor((coordinates.length - 1) * fraction)] || coordinates[0];
    return last ? { longitude: last[0], latitude: last[1] } : null;
  }

  const targetDistance = totalDistance * fraction;
  let covered = 0;
  for (const segment of segments) {
    if ((covered + segment.distance) >= targetDistance) {
      const innerFraction = segment.distance > 0 ? (targetDistance - covered) / segment.distance : 0;
      return {
        latitude: interpolateCoordinate(segment.start.latitude as number, segment.end.latitude as number, innerFraction),
        longitude: interpolateCoordinate(segment.start.longitude as number, segment.end.longitude as number, innerFraction),
      };
    }
    covered += segment.distance;
  }

  const lastSegment = segments[segments.length - 1];
  return lastSegment ? { ...lastSegment.end } : null;
}

async function getRoutePulseSampleCoordinatesFromMapbox(origin: LocationInsights, destination: LocationInsights) {
  const mapboxToken = import.meta.env.MAPBOX_ACCESS_TOKEN || import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN || "";
  if (!mapboxToken) return null;

  const start = `${origin.longitude},${origin.latitude}`;
  const end = `${destination.longitude},${destination.latitude}`;
  const url = `${MAPBOX_DIRECTIONS_BASE_URL}/${start};${end}?geometries=geojson&overview=full&access_token=${mapboxToken}`;

  try {
    const directionsData = await fetchJson<MapboxDirectionsData>(url, {
      headers: { Accept: "application/json" },
    });
    const coordinates = directionsData?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length === 0) return null;

    return ROUTE_PULSE_SAMPLE_DEFS.map((sample) => {
      const sampled = sampleCoordinateAlongLine(coordinates, sample.fraction);
      return sampled ? { ...sample, ...sampled } : null;
    }).filter((sample): sample is (typeof ROUTE_PULSE_SAMPLE_DEFS[number] & { latitude: number; longitude: number }) => sample != null);
  } catch {
    return null;
  }
}

async function getRoutePulseSampleCoordinates(origin: LocationInsights, destination: LocationInsights) {
  if (!hasFiniteCoordinates(origin) || !hasFiniteCoordinates(destination)) return [];
  const mapboxSamples = await getRoutePulseSampleCoordinatesFromMapbox(origin, destination);
  if (Array.isArray(mapboxSamples) && mapboxSamples.length > 0) return mapboxSamples;
  return getRoutePulseSampleCoordinatesFromInterpolation(origin, destination);
}

function selectForecastPeriod(periods: ForecastPeriod[], shipDate: Date | null) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  if (!(shipDate instanceof Date) || Number.isNaN(shipDate.getTime())) return periods[0];

  const target = shipDate.getTime();
  const containing = periods.find((period) => {
    const start = new Date(period?.startTime || "").getTime();
    const end = new Date(period?.endTime || "").getTime();
    return Number.isFinite(start) && Number.isFinite(end) && start <= target && target <= end;
  });
  if (containing) return containing;

  return periods
    .filter((period) => Number.isFinite(new Date(period?.startTime || "").getTime()))
    .sort((a, b) => {
      const aDiff = Math.abs(new Date(a.startTime || "").getTime() - target);
      const bDiff = Math.abs(new Date(b.startTime || "").getTime() - target);
      return aDiff - bDiff;
    })[0] || periods[0];
}

function summarizeForecast(forecast: ForecastData, shipDate: Date | null): WeatherSummary | null {
  const periods = Array.isArray(forecast?.properties?.periods) ? forecast.properties.periods : [];
  const primary = selectForecastPeriod(periods, shipDate);
  if (!primary) return null;

  return {
    kind: getWeatherKind(primary),
    shortForecast: String(primary.shortForecast || "").trim(),
    detailedForecast: String(primary.detailedForecast || "").trim(),
    windSpeed: String(primary.windSpeed || "").trim(),
    windDirection: String(primary.windDirection || "").trim(),
    updatedAt: forecast?.properties?.updated || null,
    forecastStart: primary?.startTime || null,
    forecastEnd: primary?.endTime || null,
  };
}

function hasSevereCondition(weather: WeatherSummary | null) {
  const kind = String(weather?.kind || "").toLowerCase();
  const text = `${weather?.shortForecast || ""} ${weather?.detailedForecast || ""}`.trim();
  return kind === "snow" || kind === "thunderstorm" || /snow|sleet|ice|freez|blizzard|thunder|storm/i.test(text);
}

function hasModerateCondition(weather: WeatherSummary | null) {
  const kind = String(weather?.kind || "").toLowerCase();
  const windSpeedMph = parseWindSpeedMph(weather?.windSpeed);
  if (kind === "rain") return true;
  if (windSpeedMph != null && windSpeedMph > ROUTE_PULSE_MODERATE_WIND_THRESHOLD_MPH) return true;
  return false;
}

function summarizePulseCheckpoint(checkpoint: { key?: string; label?: string; city?: string; state?: string; weather?: WeatherSummary | null; }) {
  const weather = checkpoint?.weather || null;
  const windSpeedMph = parseWindSpeedMph(weather?.windSpeed);
  const triggers: string[] = [];
  if (hasSevereCondition(weather)) {
    triggers.push("severe");
  } else if (hasModerateCondition(weather)) {
    if (windSpeedMph != null && windSpeedMph > ROUTE_PULSE_MODERATE_WIND_THRESHOLD_MPH) triggers.push("wind");
    if (String(weather?.kind || "").toLowerCase() === "rain") triggers.push("rain");
    if (triggers.length === 0) triggers.push("moderate");
  }

  return {
    key: checkpoint?.key || "checkpoint",
    label: checkpoint?.label || "Checkpoint",
    city: String(checkpoint?.city || "").trim(),
    state: String(checkpoint?.state || "").trim().toUpperCase(),
    shortForecast: String(weather?.shortForecast || "").trim(),
    windSpeedMph,
    triggers,
  } satisfies PulseCheckpoint;
}

function formatCheckpointLocation(checkpoint: PulseCheckpoint | SeasonalCheckpoint) {
  return [checkpoint?.city, checkpoint?.state].filter(Boolean).join(", ") || checkpoint?.label || "Checkpoint";
}

function buildRoutePulseBreakdown({ severeCheckpoints = [], moderateCheckpoints = [], strongWindCheckpoints = [] }: {
  severeCheckpoints: PulseCheckpoint[];
  moderateCheckpoints: PulseCheckpoint[];
  strongWindCheckpoints: PulseCheckpoint[];
}) {
  if (severeCheckpoints.length >= 2) {
    return {
      factor: 1 + ROUTE_PULSE_COMPOUND_SEVERE_DELTA,
      severity: "severe" as Severity,
      weatherFactorDelta: ROUTE_PULSE_COMPOUND_SEVERE_DELTA,
      adjustments: [`+${formatAdjustmentPct(ROUTE_PULSE_COMPOUND_SEVERE_DELTA)} multiple severe checkpoints`],
    };
  }

  if (severeCheckpoints.length === 1 && strongWindCheckpoints.length > 0) {
    return {
      factor: 1 + ROUTE_PULSE_COMPOUND_SEVERE_DELTA,
      severity: "severe" as Severity,
      weatherFactorDelta: ROUTE_PULSE_COMPOUND_SEVERE_DELTA,
      adjustments: [`+${formatAdjustmentPct(ROUTE_PULSE_COMPOUND_SEVERE_DELTA)} severe weather and strong wind`],
    };
  }

  if (severeCheckpoints.length === 1) {
    return {
      factor: 1 + ROUTE_PULSE_SINGLE_SEVERE_DELTA,
      severity: "severe" as Severity,
      weatherFactorDelta: ROUTE_PULSE_SINGLE_SEVERE_DELTA,
      adjustments: [`+${formatAdjustmentPct(ROUTE_PULSE_SINGLE_SEVERE_DELTA)} isolated severe checkpoint`],
    };
  }

  if (moderateCheckpoints.length >= 2) {
    return {
      factor: 1 + ROUTE_PULSE_MULTI_MODERATE_DELTA,
      severity: "moderate" as Severity,
      weatherFactorDelta: ROUTE_PULSE_MULTI_MODERATE_DELTA,
      adjustments: [`+${formatAdjustmentPct(ROUTE_PULSE_MULTI_MODERATE_DELTA)} repeated moderate checkpoints`],
    };
  }

  if (moderateCheckpoints.length === 1) {
    return {
      factor: 1 + ROUTE_PULSE_SINGLE_MODERATE_DELTA,
      severity: "moderate" as Severity,
      weatherFactorDelta: ROUTE_PULSE_SINGLE_MODERATE_DELTA,
      adjustments: [`+${formatAdjustmentPct(ROUTE_PULSE_SINGLE_MODERATE_DELTA)} isolated moderate checkpoint`],
    };
  }

  return {
    factor: 1,
    severity: "normal" as Severity,
    weatherFactorDelta: 0,
    adjustments: [] as string[],
  };
}

function buildRoutePulseReason({
  severity = "normal",
  moderateCheckpoints = [],
  severeCheckpoints = [],
  strongWindCheckpoints = [],
  flaggedCheckpoints = [],
}: {
  severity?: Severity;
  moderateCheckpoints?: PulseCheckpoint[];
  severeCheckpoints?: PulseCheckpoint[];
  strongWindCheckpoints?: PulseCheckpoint[];
  flaggedCheckpoints?: PulseCheckpoint[];
}) {
  if (severity === "normal") {
    return "Sampled checkpoints look clear for the selected ship date.";
  }

  const watchList = flaggedCheckpoints
    .slice(0, 2)
    .map((checkpoint) => {
      const signals: string[] = [];
      if (checkpoint?.triggers?.includes("wind") && Number.isFinite(checkpoint?.windSpeedMph)) {
        signals.push(`wind ${Math.round(checkpoint.windSpeedMph as number)} mph`);
      }
      if (checkpoint?.triggers?.includes("rain")) {
        signals.push("rain");
      }
      if (checkpoint?.triggers?.includes("severe")) {
        signals.push("snow/thunder/ice");
      }
      return `${formatCheckpointLocation(checkpoint)}${signals.length ? ` (${signals.join(", ")})` : ""}`;
    })
    .filter(Boolean);

  let prefix = "Localized moderate weather detected on sampled checkpoints.";
  if (severity === "severe") {
    prefix = severeCheckpoints.length >= 2
      ? "Multiple severe weather checkpoints detected along the route."
      : strongWindCheckpoints.length > 0
        ? "Severe weather with strong wind detected along the route."
        : "Severe weather detected on a sampled checkpoint.";
  } else if (moderateCheckpoints.length >= 2) {
    prefix = "Moderate weather detected on multiple sampled checkpoints.";
  }

  return watchList.length ? `${prefix} Watch ${watchList.join(" | ")}.` : prefix;
}

function buildSeasonalRouteReason({ severity = "normal", flaggedCheckpoints = [] }: {
  severity?: Severity;
  flaggedCheckpoints?: SeasonalCheckpoint[];
}) {
  if (severity === "normal") {
    return "No seasonal weather premium applied.";
  }

  const watchList = flaggedCheckpoints
    .slice(0, 2)
    .map((checkpoint) => {
      const label = formatCheckpointLocation(checkpoint);
      const severityLabel = checkpoint?.seasonalSeverity === "severe" ? "severe winter corridor" : "winter corridor";
      return `${label} (${severityLabel})`;
    })
    .filter(Boolean);

  const prefix = severity === "severe"
    ? "Seasonal severe weather risk detected along the route."
    : "Seasonal moderate weather risk detected along the route.";

  return watchList.length ? `${prefix} Watch ${watchList.join(" | ")}.` : prefix;
}

function getSeasonalSeverityForState(stateCode: string | undefined, shipDate: Date | null): Severity {
  if (!(shipDate instanceof Date) || Number.isNaN(shipDate.getTime())) return "normal";

  const state = String(stateCode || "").trim().toUpperCase();
  const month = shipDate.getMonth() + 1;
  const isWinterWindow = month === 11 || month === 12 || month <= 3;
  if (!isWinterWindow) return "normal";
  if (SEVERE_WINTER_STATES.has(state)) return "severe";
  if (MODERATE_WINTER_STATES.has(state)) return "moderate";
  return "normal";
}

function getSeverityRank(severity: Severity) {
  if (severity === "severe") return 3;
  if (severity === "moderate") return 2;
  return 1;
}

function resolveWorstSeverity(values: Severity[]): Severity {
  return values.reduce((worst, current) => {
    return getSeverityRank(current) > getSeverityRank(worst) ? current : worst;
  }, "normal" as Severity);
}

function buildRouteEffort({ origin, shipDate }: { origin: LocationInsights & { routePulseCheckpoints?: PulseCheckpoint[] }; shipDate: Date | null }) {
  const daysOut = getDaysOut(shipDate);
  const checkpoints = Array.isArray(origin?.routePulseCheckpoints) ? origin.routePulseCheckpoints : [];
  const useForecast = daysOut != null && daysOut >= 0 && daysOut <= SHORT_TERM_FORECAST_DAYS;

  if (useForecast) {
    const flaggedCheckpoints = checkpoints.filter((checkpoint) => Array.isArray(checkpoint?.triggers) && checkpoint.triggers.length > 0);
    const severeCheckpoints = flaggedCheckpoints.filter((checkpoint) => checkpoint?.triggers?.includes("severe"));
    const moderateCheckpoints = flaggedCheckpoints.filter((checkpoint) => !checkpoint?.triggers?.includes("severe"));
    const strongWindCheckpoints = flaggedCheckpoints.filter((checkpoint) => Number.isFinite(checkpoint?.windSpeedMph) && (checkpoint.windSpeedMph as number) > ROUTE_PULSE_STRONG_WIND_THRESHOLD_MPH);
    const routePulseBreakdown = buildRoutePulseBreakdown({
      severeCheckpoints,
      moderateCheckpoints,
      strongWindCheckpoints,
    });

    return {
      factor: routePulseBreakdown.factor,
      windFactorDelta: routePulseBreakdown.weatherFactorDelta,
      severeFactorDelta: 0,
      weatherFactorDelta: routePulseBreakdown.weatherFactorDelta,
      adjustmentPct: Math.round(routePulseBreakdown.weatherFactorDelta * 1000) / 10,
      severity: routePulseBreakdown.severity,
      basis: "route_pulse",
      daysOut,
      shipDate: shipDate?.toISOString() || null,
      reason: buildRoutePulseReason({
        severity: routePulseBreakdown.severity,
        moderateCheckpoints,
        severeCheckpoints,
        strongWindCheckpoints,
        flaggedCheckpoints,
      }),
      adjustments: routePulseBreakdown.adjustments,
      moderateCheckpointCount: moderateCheckpoints.length,
      severeCheckpointCount: severeCheckpoints.length,
      strongWindCheckpointCount: strongWindCheckpoints.length,
      checkpoints,
      pricingFormula: "Recommended premium x Weather Factor (standard unchanged)",
    } satisfies RouteEffort;
  }

  const seasonalCheckpoints: SeasonalCheckpoint[] = checkpoints.map((checkpoint) => {
    const seasonalSeverity = getSeasonalSeverityForState(checkpoint?.state, shipDate);
    const triggers = seasonalSeverity === "severe"
      ? ["severe"]
      : seasonalSeverity === "moderate"
        ? ["moderate"]
        : [];

    return {
      ...checkpoint,
      seasonalSeverity,
      triggers,
    };
  });
  const severity = resolveWorstSeverity(seasonalCheckpoints.map((checkpoint) => checkpoint.seasonalSeverity));
  const flaggedCheckpoints = seasonalCheckpoints.filter((checkpoint) => checkpoint.seasonalSeverity !== "normal");
  const seasonalFactor = ROUTE_EFFORT_FACTORS[severity] || 1;

  return {
    factor: seasonalFactor,
    windFactorDelta: 0,
    severeFactorDelta: 0,
    weatherFactorDelta: Math.max(0, seasonalFactor - 1),
    adjustmentPct: Math.max(0, Math.round((seasonalFactor - 1) * 1000) / 10),
    severity,
    basis: shipDate ? "seasonal" : "default",
    daysOut,
    shipDate: shipDate?.toISOString() || null,
    reason: buildSeasonalRouteReason({ severity, flaggedCheckpoints }),
    adjustments: severity === "severe"
      ? [`+${formatAdjustmentPct(ROUTE_EFFORT_FACTORS.severe - 1)} severe winter corridor`]
      : severity === "moderate"
        ? [`+${formatAdjustmentPct(ROUTE_EFFORT_FACTORS.moderate - 1)} winter corridor`]
        : [],
    checkpoints: seasonalCheckpoints,
    pricingFormula: "Recommended premium x Weather Factor (standard unchanged)",
  } satisfies RouteEffort;
}

async function getPointInsights({
  latitude,
  longitude,
  fallback = {},
  shipDate = null,
}: {
  latitude?: number | null;
  longitude?: number | null;
  fallback?: RouteInsightsLocationInput;
  shipDate?: Date | null;
}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      city: String(fallback?.city || "").trim(),
      state: String(fallback?.state || "").trim().toUpperCase(),
      latitude: null,
      longitude: null,
      weather: null,
    };
  }

  try {
    const pointCacheKey = `noaa_point:${latitude?.toFixed(4)},${longitude?.toFixed(4)}`;
    let pointData = noaaPointCache.get(pointCacheKey);
    if (!pointData) {
      pointData = await fetchJson<PointData>(`${NOAA_BASE_URL}/points/${latitude},${longitude}`, {
        headers: { Accept: "application/geo+json" },
      });
      noaaPointCache.set(pointCacheKey, pointData);
    }
    const relative = normalizeRelativeLocation(pointData, fallback);
    const forecastUrl = pointData?.properties?.forecast;
    let weather: WeatherSummary | null = null;
    if (forecastUrl) {
      let forecastData = noaaForecastCache.get(forecastUrl);
      if (!forecastData) {
        forecastData = await fetchJson<ForecastData>(forecastUrl, {
          headers: { Accept: "application/geo+json" },
        });
        noaaForecastCache.set(forecastUrl, forecastData);
      }
      weather = summarizeForecast(forecastData, shipDate);
    }

    return {
      city: relative.city || String(fallback?.city || "").trim(),
      state: relative.state || String(fallback?.state || "").trim().toUpperCase(),
      latitude,
      longitude,
      weather,
    };
  } catch {
    return {
      city: String(fallback?.city || "").trim(),
      state: String(fallback?.state || "").trim().toUpperCase(),
      latitude,
      longitude,
      weather: null,
    };
  }
}

async function getLocationInsights(side: RouteInsightsLocationInput = {}, options: { shipDate?: Date | null } = {}) {
  const zip = String(side?.zip || "").trim();
  const fallback = {
    zip,
    city: String(side?.city || "").trim(),
    state: String(side?.state || "").trim().toUpperCase(),
  };

  let place: PlaceSummary = {
    zip,
    city: fallback.city,
    state: fallback.state,
    latitude: null,
    longitude: null,
  };

  if (zip) {
    try {
      const cacheKey = `zip:${zip}`;
      let zipData = zipCoordCache.get(cacheKey);
      if (!zipData) {
        zipData = await fetchJson<ZipLookupData>(`${ZIP_LOOKUP_BASE_URL}/${zip}`);
        zipCoordCache.set(cacheKey, zipData);
      }
      place = normalizeZipPlace(zipData, fallback);
    } catch {
      place = { ...place, latitude: null, longitude: null };
    }
  }

  const pointInsights = await getPointInsights({
    latitude: place.latitude,
    longitude: place.longitude,
    fallback: place,
    shipDate: options?.shipDate || null,
  });

  return {
    zip: place.zip || fallback.zip,
    city: pointInsights.city || place.city || fallback.city,
    state: pointInsights.state || place.state || fallback.state,
    latitude: pointInsights.latitude ?? place.latitude ?? null,
    longitude: pointInsights.longitude ?? place.longitude ?? null,
    weather: pointInsights.weather,
  };
}

async function getRoutePulseCheckpoints({
  origin,
  destination,
  shipDate,
}: {
  origin: LocationInsights;
  destination: LocationInsights;
  shipDate: Date | null;
}) {
  if (!hasFiniteCoordinates(origin) || !hasFiniteCoordinates(destination)) return [];
  const sampleCoordinates = await getRoutePulseSampleCoordinates(origin, destination);

  const checkpoints = await Promise.all(
    sampleCoordinates.map(async (sample) => {
      if (sample.fraction === 0) {
        return summarizePulseCheckpoint({
          ...origin,
          key: sample.key,
          label: sample.label,
        });
      }
      if (sample.fraction === 1) {
        return summarizePulseCheckpoint({
          ...destination,
          key: sample.key,
          label: sample.label,
        });
      }

      const point = await getPointInsights({
        latitude: sample.latitude,
        longitude: sample.longitude,
        fallback: { city: sample.label, state: "" },
        shipDate,
      });

      return summarizePulseCheckpoint({
        ...point,
        key: sample.key,
        label: sample.label,
      });
    }),
  );

  return checkpoints.filter(Boolean);
}

export async function getAquaRouteInsights({
  origin = {},
  destination = {},
  shipDate = null,
}: {
  origin?: RouteInsightsLocationInput;
  destination?: RouteInsightsLocationInput;
  shipDate?: string | null;
} = {}): Promise<AquaRouteInsightsResult> {
  const parsedShipDate = parseShipDate(shipDate);
  const [originInfo, destinationInfo, fuelSnapshot] = await Promise.all([
    getLocationInsights(origin, { shipDate: parsedShipDate }),
    getLocationInsights(destination, { shipDate: parsedShipDate }),
    getAaaFuelPriceSnapshot(),
  ]);

  const states = Array.isArray(fuelSnapshot?.states) ? fuelSnapshot.states : [];
  const findFuel = (stateCode: string) => states.find((item) => item.state === String(stateCode || "").trim().toUpperCase()) || null;
  const enrichedOrigin: LocationInsights = {
    ...originInfo,
    fuel: findFuel(originInfo.state),
  };
  const enrichedDestination: LocationInsights = {
    ...destinationInfo,
    fuel: findFuel(destinationInfo.state),
  };
  const routePulseCheckpoints = await getRoutePulseCheckpoints({
    origin: enrichedOrigin,
    destination: enrichedDestination,
    shipDate: parsedShipDate,
  });

  return {
    source: {
      weather: "api.weather.gov",
      fuel: "gasprices.aaa.com",
    },
    fetchedAt: new Date().toISOString(),
    shipDate: parsedShipDate?.toISOString() || null,
    routeEffort: buildRouteEffort({
      origin: {
        ...enrichedOrigin,
        routePulseCheckpoints,
      },
      shipDate: parsedShipDate,
    }),
    routePulse: {
      checkpoints: routePulseCheckpoints,
    },
    origin: enrichedOrigin,
    destination: enrichedDestination,
  };
}
