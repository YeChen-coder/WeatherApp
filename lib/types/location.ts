// Location and geocoding type definitions

// Geoapify API response types
export interface GeoapifyResult {
  lat: number;
  lon: number;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  result_type?: string;
  rank?: {
    confidence?: number;
    match_type?: string;
  };
}

export interface GeoapifyResponse {
  results: GeoapifyResult[];
}

// Application domain types
export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  confidence?: number;
  type?: string;
  country?: string;
  city?: string;
}

export interface GeocodingResult {
  locations: Location[];
  query: string;
}
