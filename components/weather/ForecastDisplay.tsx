'use client';

import { DailyWeather } from '@/lib/types/weather';
import { getWeatherDescription, getWeatherIcon } from '@/lib/types/weather';

interface ForecastDisplayProps {
  forecast: DailyWeather;
}

export default function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  // Take first 5 days
  const days = forecast.time.slice(0, 5);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">5-Day Forecast</h3>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {days.map((day, index) => (
          <div
            key={index}
            className="bg-white/90 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Date */}
            <p className="font-semibold text-gray-800 text-center mb-2 text-sm">
              {formatDate(day)}
            </p>

            {/* Weather Icon */}
            <div className="text-5xl text-center mb-2">
              {getWeatherIcon(forecast.weathercode[index], true)}
            </div>

            {/* Weather Description */}
            <p className="text-center text-gray-600 text-xs mb-3">
              {getWeatherDescription(forecast.weathercode[index])}
            </p>

            {/* Temperature */}
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(forecast.temperature_2m_max[index])}°
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(forecast.temperature_2m_min[index])}°
              </p>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-2 space-y-1">
              {/* Precipitation */}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Rain:</span>
                <span className="font-medium">{forecast.precipitation_sum[index]} mm</span>
              </div>

              {/* Wind */}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Wind:</span>
                <span className="font-medium">{Math.round(forecast.windspeed_10m_max[index])} km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
