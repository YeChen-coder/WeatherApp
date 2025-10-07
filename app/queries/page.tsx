'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWeatherDescription, getWeatherIcon } from '@/lib/types/weather';

interface SavedQuery {
  id: number;
  label: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  geocodingConfidence: number | null;
  locationType: string | null;
}

export default function SavedQueriesPage() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/queries');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch queries');
        return;
      }

      setQueries(data.queries);
    } catch (err) {
      console.error('Fetch queries error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/queries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabel }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update query');
        return;
      }

      await fetchQueries();
      setEditingId(null);
      setEditLabel('');
    } catch (err) {
      console.error('Update query error:', err);
      setError('Failed to update query');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this query?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/queries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete query');
        return;
      }

      await fetchQueries();
    } catch (err) {
      console.error('Delete query error:', err);
      setError('Failed to delete query');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = (id: number, format: 'json' | 'csv') => {
    // Open export URL in new window to trigger download
    window.open(`/api/queries/${id}/export?format=${format}`, '_blank');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Saved Weather Queries
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg backdrop-blur-sm transition-colors"
            >
              ← Back to Search
            </Link>
          </div>
          <p className="text-white/90 mt-2">
            View and manage your saved weather searches
          </p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-lg">
            Loading saved queries...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Queries List */}
        {!loading && queries.length === 0 && (
          <div className="text-center bg-white/90 rounded-lg p-12 shadow-md">
            <p className="text-gray-600 text-lg mb-4">
              No saved queries yet
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Search Weather
            </Link>
          </div>
        )}

        {!loading && queries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queries.map((query) => (
              <div
                key={query.id}
                className="bg-white/90 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Label */}
                {editingId === query.id ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Enter label"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(query.id)}
                        className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditLabel('');
                        }}
                        className="flex-1 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3
                    className="text-xl font-bold text-gray-800 mb-4 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setEditingId(query.id);
                      setEditLabel(query.label || '');
                    }}
                  >
                    {query.label || 'Untitled Query'}
                  </h3>
                )}

                {/* Location */}
                <div className="mb-4">
                  <p className="text-gray-700 font-medium">
                    📍 {query.locationName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {Number(query.latitude).toFixed(4)}, {Number(query.longitude).toFixed(4)}
                  </p>
                </div>

                {/* Metadata */}
                <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                  <p className="text-gray-600 text-sm">
                    <strong>Saved:</strong> {formatDate(query.createdAt)}
                  </p>
                  {query.locationType && (
                    <p className="text-gray-600 text-sm">
                      <strong>Type:</strong> {query.locationType}
                    </p>
                  )}
                  {query.geocodingConfidence && (
                    <p className="text-gray-600 text-sm">
                      <strong>Confidence:</strong> {(query.geocodingConfidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(query.id);
                        setEditLabel(query.label || '');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(query.id)}
                      disabled={deleting === query.id}
                      className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === query.id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport(query.id, 'json')}
                      className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      📥 JSON
                    </button>
                    <button
                      onClick={() => handleExport(query.id, 'csv')}
                      className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      📥 CSV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-white/90">
          <p className="text-sm">
            Total Saved Queries: <strong>{queries.length}</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}
