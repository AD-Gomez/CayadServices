import { buildLandingPayloadWithRoute, type LandingFormInput } from "../utils/buildLandingPayload";
import { getPublicIP } from "./ip";

const BASE = import.meta.env.PUBLIC_API_URL;
const PUBLIC_API_KEY = import.meta.env.PUBLIC_API_KEY;

export async function sendLeadToLanding(input: LandingFormInput) {
  // Try to capture client public IP but don't block lead submission if it fails
  const ip = await getPublicIP().catch(() => null);
  const payload = {
    ...buildLandingPayloadWithRoute(input),
    ...(ip ? { client_ip: ip } : {}),
  };

  // Build the endpoint URL robustly. If BASE is provided use it as base,
  // otherwise fall back to a relative path so the client can call the
  // local `/api/leads/public-create/` route during development.
  let url: string;
  if (BASE) {
    // Using the URL constructor avoids accidental double slashes when BASE
    // ends with a trailing slash.
    url = new URL('/api/leads/public-create/', BASE).toString();
  } else {
    url = '/api/leads/public-create/';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLIC_API_KEY ? { 'X-API-KEY': PUBLIC_API_KEY } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}