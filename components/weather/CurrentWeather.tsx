'use client';

import { CurrentWeather as CurrentWeatherType } from '@/lib/types/weather';
import { getWeatherDescription, getWeatherIcon } from '@/lib/types/weather';

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  locationName: string;
}

export default function CurrentWeather({ weather, locationName }: CurrentWeatherProps) {
  const weatherDescription = getWeatherDescription(weather.weathercode);
  const weatherIcon = getWeatherIcon(weather.weathercode, weather.is_day === 1);

  // Convert wind direction to compass direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl text-white p-8">
      {/* Location */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">{locationName}</h2>
        <p className="text-blue-100 text-sm mt-1">
          {new Date(weather.time).toLocaleString()}
        </p>
      </div>

      {/* Main Temperature with Icon */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">
          {weatherIcon}
        </div>
        <div className="text-7xl font-bold mb-2">
          {Math.round(weather.temperature)}°C
        </div>
        <p className="text-xl text-blue-100">{weatherDescription}</p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Wind Speed */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-blue-100 text-sm mb-1">Wind Speed</p>
          <p className="text-2xl font-semibold">{weather.windspeed} km/h</p>
        </div>

        {/* Wind Direction */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-blue-100 text-sm mb-1">Wind Direction</p>
          <p className="text-2xl font-semibold">
            {getWindDirection(weather.winddirection)} ({weather.winddirection}°)
          </p>
        </div>

        {/* Day/Night */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm col-span-2">
          <p className="text-blue-100 text-sm mb-1">Time of Day</p>
          <p className="text-2xl font-semibold">
            {weather.is_day ? '☀️ Daytime' : '🌙 Nighttime'}
          </p>
        </div>
      </div>
    </div>
  );
}
