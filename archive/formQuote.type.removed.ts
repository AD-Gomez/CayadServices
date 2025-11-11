export interface originAndDestination {
  origin_city: string;
  destination_city: string;
  transport_type: string;
}

// Vehicle details removed: forms no longer collect per-vehicle information.

export interface shipmentDetails {
  first_name: string
  phone: string
  email: string
  ship_date: Date
}

export interface FormQuoteTypes {
  origin_city: string;
  destination_city: string;
  transport_type: string;
  // Vehicles removed
  first_name: string
  phone: string
  email: string
  ship_date: string
}