import {
  parseCityStateZip,
  toISODate,
  toInopBoolean,
  toTransportLabel,
  type TransportLabel,
  normalizeContactPhone,
} from "./leadFormat";

export type LandingVehicleInput = {
  vehicle_model_year?: string | number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_inop?: string | number | boolean;
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
  Vehicles?: LandingVehicleInput[];
};

export type LandingPayloadWithRoute = {
  first_name: string;
  phone: string;
  email: string;
  ship_date: string;
  transport_type: TransportLabel;
  Vehicles: Array<{
    vehicle_model_year?: string | number;
    vehicle_make?: string;
    vehicle_model?: string;
    inop: boolean;
  }>;
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

  const Vehicles: LandingPayloadWithRoute["Vehicles"] = (input.Vehicles || []).map((v) => ({
    model_year: v.vehicle_model_year,
    make: (v.vehicle_make || "").trim().toLowerCase(),
    model: (v.vehicle_model || "").trim().toLowerCase(),
    inop: toInopBoolean(v.vehicle_inop),
  }));

  return {
    first_name: (input.first_name || "").trim(),
    phone: (input.phone || "").trim(),
    email: (input.email || "").trim().toLowerCase(),
    ship_date: toISODate(input.ship_date),
    transport_type: toTransportLabel(input.transport_type),
    Vehicles,
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
