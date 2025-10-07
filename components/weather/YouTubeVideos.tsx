'use client';

import { useState, useEffect } from 'react';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeVideosProps {
  locationName: string;
}

// Decode HTML entities in text
function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

export default function YouTubeVideos({ locationName }: YouTubeVideosProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [locationName]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/youtube/search?location=${encodeURIComponent(locationName)}&maxResults=3`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load videos');
        return;
      }

      setVideos(data.data);
    } catch (err) {
      console.error('YouTube fetch error:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl bg-white/90 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📺 Related Weather Videos
        </h3>
        <p className="text-gray-600">Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl bg-white/90 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📺 Related Weather Videos
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl bg-white/90 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        📺 Related Weather Videos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-200">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {decodeHtmlEntities(video.title)}
              </h4>
              <p className="text-xs text-gray-600">{decodeHtmlEntities(video.channelTitle)}</p>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Videos from YouTube related to "{locationName} weather"
      </p>
    </div>
  );
}
