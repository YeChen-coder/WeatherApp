'use client';

import { DailyWeather } from '@/lib/types/weather';
import { getWeatherDescription, getWeatherIcon } from '@/lib/types/weather';

interface HistoricalWeatherProps {
  data: {
    daily: DailyWeather;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export default function HistoricalWeather({ data, dateRange }: HistoricalWeatherProps) {
  const { daily } = data;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const temps = daily.temperature_2m_mean || daily.temperature_2m_max;
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...daily.temperature_2m_max);
    const minTemp = Math.min(...daily.temperature_2m_min);
    const totalPrecipitation = daily.precipitation_sum.reduce((a, b) => a + b, 0);
    const avgWind = daily.windspeed_10m_max.reduce((a, b) => a + b, 0) / daily.windspeed_10m_max.length;

    return {
      avgTemp: avgTemp.toFixed(1),
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
      totalPrecipitation: totalPrecipitation.toFixed(1),
      avgWind: avgWind.toFixed(1),
    };
  };

  const stats = calculateStats();

  return (
    <div className="w-full max-w-6xl">
      {/* Header with Statistics */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl text-white p-8 mb-6">
        <h2 className="text-3xl font-bold mb-4">Historical Weather Data</h2>
        <p className="text-blue-100 mb-6">
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </p>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-1">Avg Temp</p>
            <p className="text-2xl font-bold">{stats.avgTemp}°C</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-1">Max Temp</p>
            <p className="text-2xl font-bold">{stats.maxTemp}°C</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-1">Min Temp</p>
            <p className="text-2xl font-bold">{stats.minTemp}°C</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-1">Total Rain</p>
            <p className="text-2xl font-bold">{stats.totalPrecipitation} mm</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-1">Avg Wind</p>
            <p className="text-2xl font-bold">{stats.avgWind} km/h</p>
          </div>
        </div>
      </div>

      {/* Daily Data Table */}
      <div className="bg-white/90 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Weather</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">High/Low</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Avg</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rain</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Wind</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daily.time.map((date, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Date */}
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {formatDate(date)}
                  </td>

                  {/* Weather Icon & Description */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-1">
                        {getWeatherIcon(daily.weathercode[index], true)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getWeatherDescription(daily.weathercode[index])}
                      </div>
                    </div>
                  </td>

                  {/* High/Low Temperature */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-red-600">
                        {Math.round(daily.temperature_2m_max[index])}°
                      </span>
                      <span className="text-sm text-blue-600">
                        {Math.round(daily.temperature_2m_min[index])}°
                      </span>
                    </div>
                  </td>

                  {/* Average Temperature */}
                  <td className="px-4 py-3 text-center text-gray-700">
                    {daily.temperature_2m_mean
                      ? Math.round(daily.temperature_2m_mean[index])
                      : Math.round((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2)
                    }°C
                  </td>

                  {/* Precipitation */}
                  <td className="px-4 py-3 text-center text-gray-700">
                    {daily.precipitation_sum[index]} mm
                  </td>

                  {/* Wind Speed */}
                  <td className="px-4 py-3 text-center text-gray-700">
                    {Math.round(daily.windspeed_10m_max[index])} km/h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Points Count */}
      <div className="mt-4 text-center text-white/90">
        <p className="text-sm">
          Showing <strong>{daily.time.length}</strong> days of historical weather data
        </p>
      </div>
    </div>
  );
}
