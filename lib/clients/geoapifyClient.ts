// Geoapify Geocoding API Client
// Documentation: https://apidocs.geoapify.com/docs/geocoding/

import { GeoapifyResponse, Location } from '../types/location';

export interface GeocodingParams {
  text: string; // Location query (e.g., "New York City", "Paris, France")
  limit?: number; // Max results (default: 5)
}

export class GeoapifyClient {
  private baseUrl = 'https://api.geoapify.com/v1/geocode';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEOAPIFY_API_KEY || '';

    if (!this.apiKey) {
      throw new Error(
        'GEOAPIFY_API_KEY is not set. Get a free key from https://www.geoapify.com'
      );
    }
  }

  /**
   * Geocode a location query to coordinates
   * Supports fuzzy matching (e.g., "NYC" → "New York City")
   */
  async geocode(params: GeocodingParams): Promise<Location[]> {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('text', params.text);
    url.searchParams.set('limit', (params.limit || 5).toString());
    url.searchParams.set('apiKey', this.apiKey);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Invalid Geoapify API key. Check GEOAPIFY_API_KEY in .env file.'
        );
      }

      throw new Error(
        `Geoapify API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GeoapifyResponse = await response.json();

    // Transform API results to application domain types
    return data.results.map((result) => ({
      name: result.formatted,
      latitude: result.lat,
      longitude: result.lon,
      confidence: result.rank?.confidence,
      type: result.result_type,
    }));
  }

  /**
   * Reverse geocode coordinates to a location name
   */
  async reverseGeocode(params: {
    latitude: number;
    longitude: number;
  }): Promise<Location | null> {
    const url = new URL(`${this.baseUrl}/reverse`);
    url.searchParams.set('lat', params.latitude.toString());
    url.searchParams.set('lon', params.longitude.toString());
    url.searchParams.set('apiKey', this.apiKey);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Geoapify API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GeoapifyResponse = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    return {
      name: result.formatted,
      latitude: result.lat,
      longitude: result.lon,
      confidence: result.rank?.confidence,
      type: result.result_type,
    };
  }
}

// Singleton instance (will use GEOAPIFY_API_KEY from environment)
export const geoapifyClient = new GeoapifyClient();
