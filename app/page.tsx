'use client';

import { useState } from 'react';
import Link from 'next/link';
import LocationInput from '@/components/weather/LocationInput';
import CurrentWeather from '@/components/weather/CurrentWeather';
import ForecastDisplay from '@/components/weather/ForecastDisplay';
import DateRangePicker from '@/components/weather/DateRangePicker';
import HistoricalWeather from '@/components/weather/HistoricalWeather';
import YouTubeVideos from '@/components/weather/YouTubeVideos';
import { Location } from '@/lib/types/location';
import { CurrentWeather as CurrentWeatherType, DailyWeather } from '@/lib/types/weather';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(null);
  const [forecast, setForecast] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'historical'>('current');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 1 week ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Yesterday
    return date.toISOString().split('T')[0];
  });
  const [historicalData, setHistoricalData] = useState<any>(null);

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    setError(null);
    setLoading(true);
    setSaveSuccess(false);

    try {
      if (viewMode === 'current') {
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
        setHistoricalData(null);
      } else {
        // Fetch historical weather data
        const response = await fetch(
          `/api/weather/historical?lat=${location.latitude}&lon=${location.longitude}&startDate=${startDate}&endDate=${endDate}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch historical weather data');
          setHistoricalData(null);
          return;
        }

        setHistoricalData(data.data);
        setCurrentWeather(null);
        setForecast(null);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Network error. Please try again.');
      setCurrentWeather(null);
      setForecast(null);
      setHistoricalData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHistorical = async () => {
    if (!selectedLocation) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/weather/historical?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&startDate=${startDate}&endDate=${endDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch historical weather data');
        setHistoricalData(null);
        return;
      }

      setHistoricalData(data.data);
    } catch (err) {
      console.error('Historical weather fetch error:', err);
      setError('Network error. Please try again.');
      setHistoricalData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuery = async () => {
    if (!selectedLocation || !currentWeather || !forecast) return;

    setSaving(true);
    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: saveLabel || null,
          locationName: selectedLocation.name,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          weatherData: {
            current: currentWeather,
            forecast: forecast,
          },
          geocodingConfidence: selectedLocation.confidence,
          locationType: selectedLocation.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save query');
        return;
      }

      setSaveSuccess(true);
      setShowSaveModal(false);
      setSaveLabel('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save query error:', err);
      setError('Failed to save query');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <Link
              href="/queries"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg backdrop-blur-sm transition-colors"
            >
              📂 Saved Queries
            </Link>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Weather Information Platform
          </h1>
          <p className="text-white/90 text-lg">
            Get weather information for any location worldwide
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center gap-8">
          {/* View Mode Toggle */}
          <div className="w-full max-w-2xl bg-white/90 rounded-lg shadow-md p-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('current');
                  setHistoricalData(null);
                }}
                className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                  viewMode === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ☀️ Current & Forecast
              </button>
              <button
                onClick={() => {
                  setViewMode('historical');
                  setCurrentWeather(null);
                  setForecast(null);
                }}
                className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                  viewMode === 'historical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Historical Data
              </button>
            </div>
          </div>

          {/* Date Range Picker (Historical Mode Only) */}
          {viewMode === 'historical' && (
            <>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                disabled={loading}
              />
              {selectedLocation && (
                <button
                  onClick={handleFetchHistorical}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : '🔍 Fetch Historical Weather'}
                </button>
              )}
            </>
          )}

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

          {/* Success Message */}
          {saveSuccess && (
            <div className="w-full max-w-2xl p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
              ✓ Query saved successfully!
            </div>
          )}

          {/* Save Query Button */}
          {currentWeather && selectedLocation && !loading && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              💾 Save This Query
            </button>
          )}

          {/* Current Weather Display */}
          {currentWeather && selectedLocation && !loading && (
            <CurrentWeather
              weather={currentWeather}
              locationName={selectedLocation.name}
            />
          )}

          {/* 5-Day Forecast */}
          {forecast && !loading && viewMode === 'current' && (
            <ForecastDisplay forecast={forecast} />
          )}

          {/* Historical Weather Display */}
          {historicalData && !loading && viewMode === 'historical' && (
            <HistoricalWeather
              data={historicalData}
              dateRange={{ start: startDate, end: endDate }}
            />
          )}

          {/* YouTube Videos */}
          {selectedLocation && !loading && (currentWeather || historicalData) && (
            <YouTubeVideos locationName={selectedLocation.name} />
          )}
        </main>

        {/* Save Query Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Save Weather Query</h3>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="e.g., Weekend trip to Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Location:</strong> {selectedLocation?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveLabel('');
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuery}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-white/90">
          <div className="mb-4">
            <p className="text-sm font-medium">
              Developed by <span className="font-bold">Your Name</span>
            </p>
            <button
              onClick={() => window.open('https://www.pmaccelerator.io/', '_blank')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm backdrop-blur-sm"
            >
              <span>ℹ️</span>
              <span>PM Accelerator Program</span>
            </button>
          </div>
          <div className="text-xs text-white/70 space-y-1">
            <p>Weather data from Open-Meteo | Geocoding by Geoapify</p>
            <p>Tech Assessment - AI/ML Software Engineer Intern</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
