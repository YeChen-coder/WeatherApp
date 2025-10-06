'use client';

import { useState } from 'react';
import { Location } from '@/lib/types/location';

interface LocationInputProps {
  onLocationSelect: (location: Location) => void;
  loading?: boolean;
}

export default function LocationInput({ onLocationSelect, loading = false }: LocationInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a location');
      return;
    }

    setError(null);
    setIsSearching(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to find location');
        setIsSearching(false);
        return;
      }

      const locations = data.locations;

      // Check if query is pure numbers (likely a zip code - ambiguous)
      const isPureNumbers = /^\d+$/.test(query.trim());

      // Auto-select if only one result AND very high confidence AND not a pure number query
      if (locations.length === 1 && !isPureNumbers) {
        onLocationSelect(locations[0]);
        setSuggestions([]);
      } else if (locations.length > 1 && locations[0].confidence && locations[0].confidence > 0.9 && !isPureNumbers) {
        // Very high confidence and not ambiguous - auto-select
        onLocationSelect(locations[0]);
        setSuggestions([]);
      } else {
        // Show suggestions for user to choose (especially for ambiguous queries)
        setSuggestions(locations.slice(0, 5)); // Show top 5 for better selection
      }

    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (location: Location) => {
    setSuggestions([]);
    setQuery('');
    onLocationSelect(location);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUseMyLocation = async () => {
    setError(null);
    setIsGettingLocation(true);
    setSuggestions([]);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get location name
          const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude,
              longitude,
              reverse: true
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            // If reverse geocoding fails, still use coordinates with generic name
            onLocationSelect({
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude,
              longitude,
            });
          } else {
            // Use the geocoded location name
            const location = data.locations[0];
            onLocationSelect({
              ...location,
              latitude,
              longitude,
            });
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setError('Failed to get location name. Please try again.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please try again.';
        }

        setError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter city, zip code, or address..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          disabled={loading || isSearching || isGettingLocation}
        />
        <button
          onClick={handleSearch}
          disabled={loading || isSearching || isGettingLocation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={handleUseMyLocation}
          disabled={loading || isSearching || isGettingLocation}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
          title="Use my current location"
        >
          {isGettingLocation ? '📍 Getting...' : '📍 My Location'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Location Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600 font-medium">
            Multiple locations found. Please select one:
          </div>
          <ul className="divide-y divide-gray-200">
            {suggestions.map((location, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(location)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium">{location.name}</div>
                      {location.country && (
                        <div className="text-xs text-gray-500 mt-1">
                          {location.city && `${location.city}, `}{location.country}
                        </div>
                      )}
                    </div>
                    {location.confidence && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {Math.round(location.confidence * 100)}% match
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
