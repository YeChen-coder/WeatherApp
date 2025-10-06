// Open-Meteo API Client
// Documentation: https://open-meteo.com/en/docs

import { OpenMeteoResponse } from '../types/weather';

export interface WeatherQueryParams {
  latitude: number;
  longitude: number;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  includeCurrent?: boolean;
  includeForecast?: boolean;
}

export class OpenMeteoClient {
  private baseUrl = 'https://api.open-meteo.com/v1';

  /**
   * Fetch current weather for a location
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<OpenMeteoResponse> {
    const url = new URL(`${this.baseUrl}/forecast`);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('current_weather', 'true');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch 7-day forecast for a location
   */
  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<OpenMeteoResponse> {
    const url = new URL(`${this.baseUrl}/forecast`);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch historical weather for a date range
   */
  async getHistoricalWeather(params: {
    latitude: number;
    longitude: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  }): Promise<OpenMeteoResponse> {
    const url = new URL(`${this.baseUrl}/archive`);
    url.searchParams.set('latitude', params.latitude.toString());
    url.searchParams.set('longitude', params.longitude.toString());
    url.searchParams.set('start_date', params.startDate);
    url.searchParams.set('end_date', params.endDate);
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Flexible query that can fetch current weather, forecast, or historical data
   */
  async query(params: WeatherQueryParams): Promise<OpenMeteoResponse> {
    // Historical data (uses archive endpoint)
    if (params.startDate && params.endDate) {
      return this.getHistoricalWeather({
        latitude: params.latitude,
        longitude: params.longitude,
        startDate: params.startDate,
        endDate: params.endDate,
      });
    }

    // Current weather + forecast
    if (params.includeCurrent && params.includeForecast) {
      const url = new URL(`${this.baseUrl}/forecast`);
      url.searchParams.set('latitude', params.latitude.toString());
      url.searchParams.set('longitude', params.longitude.toString());
      url.searchParams.set('current_weather', 'true');
      url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max');
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Open-Meteo API error: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    }

    // Current weather only
    if (params.includeCurrent) {
      return this.getCurrentWeather(params.latitude, params.longitude);
    }

    // Forecast only
    if (params.includeForecast) {
      return this.getForecast(params.latitude, params.longitude);
    }

    // Default: current weather
    return this.getCurrentWeather(params.latitude, params.longitude);
  }
}

// Singleton instance
export const openMeteoClient = new OpenMeteoClient();
