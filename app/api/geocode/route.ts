// API Route: Geocoding (convert location text to coordinates)
// POST /api/geocode
// Body: { "location": "New York City" }

import { NextRequest, NextResponse } from 'next/server';
import { geoapifyClient } from '@/lib/clients/geoapifyClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location } = body;

    // Validate input
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Call Geoapify geocoding API
    const locations = await geoapifyClient.geocode({
      text: location.trim(),
      limit: 5, // Return top 5 matches
    });

    // No results found
    if (locations.length === 0) {
      return NextResponse.json(
        { error: 'Location not found. Please try a different search term.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      locations,
    });

  } catch (error) {
    console.error('Geocoding error:', error);

    return NextResponse.json(
      { error: 'Failed to geocode location. Please try again.' },
      { status: 500 }
    );
  }
}
