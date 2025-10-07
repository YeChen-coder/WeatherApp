// API Route: Search YouTube Videos
// GET /api/youtube/search?location=Toronto

import { NextRequest, NextResponse } from 'next/server';
import { youtubeClient } from '@/lib/clients/youtubeClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const maxResults = parseInt(searchParams.get('maxResults') || '3');

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    const videos = await youtubeClient.searchWeatherVideos(location, maxResults);

    return NextResponse.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}
