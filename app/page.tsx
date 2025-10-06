'use client';

import { useState } from 'react';
import LocationInput from '@/components/weather/LocationInput';
import CurrentWeather from '@/components/weather/CurrentWeather';
import ForecastDisplay from '@/components/weather/ForecastDisplay';
import { Location } from '@/lib/types/location';
import { CurrentWeather as CurrentWeatherType, DailyWeather } from '@/lib/types/weather';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(null);
  const [forecast, setForecast] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setError(null);
    setLoading(true);

    try {
      // Fetch both current weather and forecast in parallel
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`/api/weather/current?lat=${location.latitude}&lon=${location.longitude}`),
        fetch(`/api/weather/forecast?lat=${location.latitude}&lon=${location.longitude}`)
      ]);

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      if (!currentResponse.ok) {
        setError(currentData.error || 'Failed to fetch weather data');
        setCurrentWeather(null);
        setForecast(null);
        return;
      }

      setCurrentWeather(currentData.data.current_weather);
      setForecast(forecastData.data.daily);

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Network error. Please try again.');
      setCurrentWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Weather Information Platform
          </h1>
          <p className="text-white/90 text-lg">
            Get weather information for any location worldwide
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center gap-8">
          {/* Location Search */}
          <LocationInput
            onLocationSelect={handleLocationSelect}
            loading={loading}
          />

          {/* Loading State */}
          {loading && (
            <div className="text-white text-lg">
              Loading weather data...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-2xl p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Current Weather Display */}
          {currentWeather && selectedLocation && !loading && (
            <CurrentWeather
              weather={currentWeather}
              locationName={selectedLocation.name}
            />
          )}

          {/* 5-Day Forecast */}
          {forecast && !loading && (
            <ForecastDisplay forecast={forecast} />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-white/80 text-sm">
          <p>Developed by Your Name | PM Accelerator Program</p>
          <p className="mt-2">Weather data from Open-Meteo | Geocoding by Geoapify</p>
        </footer>
      </div>
    </div>
  );
}
