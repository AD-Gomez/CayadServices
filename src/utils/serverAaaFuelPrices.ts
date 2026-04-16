import { createTtlCache } from "./serverCache";

const AAA_BASE_URL = "https://gasprices.aaa.com";

const ONE_HOUR_MS = 60 * 60 * 1000;
const fuelCache = createTtlCache<AaaFuelSnapshot>(ONE_HOUR_MS);

const AAA_HEADERS = {
  "User-Agent": import.meta.env.AAA_FUEL_USER_AGENT || "CAYAD Services (support@cayad.co)",
  Accept: "text/html,application/json",
};

export type FuelStatePrice = {
  state: string;
  name: string;
  regularPrice: number;
  url: string;
  color: string;
};

export type AaaFuelSnapshot = {
  source: string;
  fetchedAt: string;
  stateCount: number;
  regularMeanPrice: number | null;
  highestRegularStates: FuelStatePrice[];
  lowestRegularStates: FuelStatePrice[];
  states: FuelStatePrice[];
};

const safeNumber = (value: string | undefined) => {
  const normalized = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : null;
};

const round3 = (value: number) => Math.round(value * 1000) / 1000;

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: AAA_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`AAA request failed with status ${response.status}`);
  }

  return response.text();
}

function extractPlacestxtPayload(html: string) {
  const match = html.match(/placestxt\s*=\s*"([^"]+)"/);
  if (!match?.[1]) {
    throw new Error("Could not locate AAA map data payload");
  }

  return match[1];
}

function parsePlacestxtPayload(payload: string): FuelStatePrice[] {
  return payload
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [state, name, priceText, url, color] = entry.split(",");
      const regularPrice = safeNumber(priceText);

      if (!state || !name || regularPrice == null) return null;

      return {
        state: state.trim(),
        name: name.trim(),
        regularPrice,
        url: String(url || "").trim(),
        color: String(color || "").trim(),
      } satisfies FuelStatePrice;
    })
    .filter((entry): entry is FuelStatePrice => entry != null)
    .sort((a, b) => a.state.localeCompare(b.state));
}

export async function getAaaFuelPriceSnapshot(): Promise<AaaFuelSnapshot> {
  const cached = fuelCache.get("snapshot");
  if (cached) return cached;

  const homepageHtml = await fetchText(AAA_BASE_URL);
  const states = parsePlacestxtPayload(extractPlacestxtPayload(homepageHtml));

  const regularPrices = states.map((item) => item.regularPrice);
  const regularMeanPrice = regularPrices.length > 0
    ? round3(regularPrices.reduce((sum, value) => sum + value, 0) / regularPrices.length)
    : null;

  const byPriceDesc = [...states].sort((a, b) => b.regularPrice - a.regularPrice);
  const byPriceAsc = [...states].sort((a, b) => a.regularPrice - b.regularPrice);

  const snapshot: AaaFuelSnapshot = {
    source: "gasprices.aaa.com",
    fetchedAt: new Date().toISOString(),
    stateCount: states.length,
    regularMeanPrice,
    highestRegularStates: byPriceDesc.slice(0, 5),
    lowestRegularStates: byPriceAsc.slice(0, 5),
    states,
  };
  fuelCache.set("snapshot", snapshot);
  return snapshot;
}
