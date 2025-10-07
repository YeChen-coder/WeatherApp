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
  private archiveUrl = 'https://archive-api.open-meteo.com/v1';

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
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    daily?: string[];
    timezone?: string;
  }): Promise<OpenMeteoResponse> {
    const url = new URL(`${this.archiveUrl}/archive`);
    url.searchParams.set('latitude', params.latitude.toString());
    url.searchParams.set('longitude', params.longitude.toString());
    url.searchParams.set('start_date', params.start_date);
    url.searchParams.set('end_date', params.end_date);

    // Set daily parameters
    const dailyParams = params.daily || [
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'weathercode',
      'precipitation_sum',
      'windspeed_10m_max'
    ];
    url.searchParams.set('daily', dailyParams.join(','));
    url.searchParams.set('timezone', params.timezone || 'auto');

    console.log('Historical Weather API URL:', url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Open-Meteo API Response:', response.status, errorText);
      throw new Error(
        `Open-Meteo API error: ${response.status} ${response.statusText}. Note: Historical data typically has a 5-7 day delay. Try dates at least 1 week in the past.`
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
        start_date: params.startDate,
        end_date: params.endDate,
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
