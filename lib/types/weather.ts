// Weather-related TypeScript type definitions

// Open-Meteo API response types
export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current_weather?: CurrentWeather;
  daily?: DailyWeather;
  timezone?: string;
}

// Application domain types
export interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current?: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    isDay: boolean;
    time: Date;
  };
  forecast?: {
    date: Date;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitation: number;
    maxWindSpeed: number;
  }[];
  timezone?: string;
}

// Weather code descriptions (Open-Meteo WMO codes)
export const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || 'Unknown';
}
