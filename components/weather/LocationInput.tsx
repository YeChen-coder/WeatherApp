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

      // Auto-select if only one result or very high confidence
      if (locations.length === 1 || (locations[0].confidence && locations[0].confidence > 0.8)) {
        onLocationSelect(locations[0]);
        setSuggestions([]);
      } else {
        // Show suggestions for user to choose
        setSuggestions(locations.slice(0, 3)); // Top 3 results
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
          disabled={loading || isSearching}
        />
        <button
          onClick={handleSearch}
          disabled={loading || isSearching}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
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
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex justify-between items-center"
                >
                  <span className="text-gray-900">{location.name}</span>
                  {location.confidence && (
                    <span className="text-xs text-gray-500">
                      {Math.round(location.confidence * 100)}% match
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
