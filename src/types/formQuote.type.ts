export interface originAndDestination {
  origin_city: string;
  destination_city: string;
  transport_type: string;
}

export interface vehicleTypes {
  vehicle_model_year: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicleOperable: string;
}

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
  Vehicles: vehicleTypes[];
  first_name: string
  phone: string
  email: string
  ship_date: string
}