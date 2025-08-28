export function formatPhoneUSToE164(raw?: string): string {
  const s = String(raw || "");
  if (s.trim().startsWith("+")) return s.trim();

  const digits = s.replace(/\D+/g, "");
  if (!digits) return "";

  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  if (digits.length === 10) return `+1${digits}`;

  return `+${digits}`;
}

export function normalizeRoutePhones(route: any) {
  if (!route || typeof route !== "object") return route;
  const out = { ...route };

  if (out.origin) {
    out.origin = { ...out.origin };
    if ("contactPhone" in out.origin) {
      out.origin.contactPhone = formatPhoneUSToE164(out.origin.contactPhone);
    }
  }
  if (out.destination) {
    out.destination = { ...out.destination };
    if ("contactPhone" in out.destination) {
      out.destination.contactPhone = formatPhoneUSToE164(out.destination.contactPhone);
    }
  }
  return out;
}
