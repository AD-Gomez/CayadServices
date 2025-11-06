import {
  parseCityStateZip,
  toISODate,
  toInopBoolean,
  toTransportLabel,
  type TransportLabel,
  normalizeContactPhone,
} from "./leadFormat";

export type ClientEstimate = {
  miles: number | null;
  per_mile: number | null;
  total: number | null;
  transit: string | null;
  vehicle_class?: string;
  transport_type?: string; // "Open" | "Enclosed" label
};

export type LandingFormInput = {
  first_name: string;
  phone: string;
  email: string;

  origin_city: string;
  destination_city: string;

  origin_address?: string;
  origin_contactName?: string;
  origin_contactPhone?: string;
  origin_notes?: string;

  destination_address?: string;
  destination_contactName?: string;
  destination_contactPhone?: string;
  destination_notes?: string;

  ship_date?: string;
  transport_type?: string | number;
  /** Optional client-side estimate info to aid pricing follow-up */
  client_estimate?: ClientEstimate;
};

export type LandingPayloadWithRoute = {
  first_name: string;
  phone: string;
  email: string;
  ship_date: string;
  transport_type: TransportLabel;
  /** Optional client public IP, if captured client-side */
  client_ip?: string;
  /** Optional client-side estimate info to aid pricing follow-up */
  client_estimate?: ClientEstimate;
  route: {
    origin: {
      city: string;
      state: string;
      postalCode: string;
      address: string;
      contactName: string;
      contactPhone: string;
      notes: string;
      type: "private";
    };
    destination: {
      city: string;
      state: string;
      postalCode: string;
      address: string;
      contactName: string;
      contactPhone: string;
      notes: string;
      type: "private";
    };
  };
};

export function buildLandingPayloadWithRoute(input: LandingFormInput): LandingPayloadWithRoute {
  const o = parseCityStateZip(input.origin_city);
  const d = parseCityStateZip(input.destination_city);
  return {
    first_name: (input.first_name || "").trim(),
    phone: (input.phone || "").trim(),
    email: (input.email || "").trim().toLowerCase(),
    ship_date: toISODate(input.ship_date),
    transport_type: toTransportLabel(input.transport_type),
    client_estimate: input.client_estimate,
    route: {
      origin: {
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        address: (input.origin_address || "").trim(),
        contactName: (input.origin_contactName || "").trim(),
        contactPhone: normalizeContactPhone(input.origin_contactPhone),
        notes: (input.origin_notes || "").trim(),
        type: "private",
      },
      destination: {
        city: d.city,
        state: d.state,
        postalCode: d.postalCode,
        address: (input.destination_address || "").trim(),
        contactName: (input.destination_contactName || "").trim(),
        contactPhone: normalizeContactPhone(input.destination_contactPhone),
        notes: (input.destination_notes || "").trim(),
        type: "private",
      },
    },
  };
}
