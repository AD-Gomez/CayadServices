import { buildLandingPayloadWithRoute, type LandingFormInput } from "../utils/buildLandingPayload";

const BASE = import.meta.env.PUBLIC_API_URL
const PUBLIC_API_KEY = import.meta.env.PUBLIC_API_KEY

export async function sendLeadToLanding(input: LandingFormInput) {
  const payload = buildLandingPayloadWithRoute(input);

  const res = await fetch(`https://backupdjango-production.up.railway.app/api/leads/public-create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": '7hXU_mmGDROVh55qiawRAZyFLfrObfBfwDl7BYmAlOE',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}