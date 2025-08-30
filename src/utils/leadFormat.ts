
export function parseCityStateZip(line?: string) {
  const m = (line || "").match(/^\s*([^,]+)\s*,\s*([A-Za-z]{2})(?:\s+(\d{5}))?\s*$/);
  if (!m) return { city: "", state: "", postalCode: "" };
  return { city: m[1].trim(), state: m[2].toUpperCase(), postalCode: m[3] || "" };
}

export function toISODate(input?: string) {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[1]}-${m[2]}` : input;
}

export function toInopBoolean(v: string | number | boolean | undefined): boolean {
  if (typeof v === "boolean") return v;
  return String(v ?? "").trim() === "1";
}

export type TransportLabel = "Open" | "Enclosed";
export function toTransportLabel(v: string | number | undefined): TransportLabel {
  const s = String(v ?? "1").trim();
  return s === "2" ? "Enclosed" : "Open";
}

export function normalizeContactPhone(phone?: string) {
  if (!phone) return "";
  const plus = phone.trim().startsWith("+") ? "+" : "";
  const digits = phone.replace(/\D/g, "");
  return plus + digits;
}
