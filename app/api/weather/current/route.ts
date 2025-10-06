// API Route: Current Weather
// GET /api/weather/current?lat=40.7128&lon=-74.0060

import { NextRequest, NextResponse } from 'next/server';
import { openMeteoClient } from '@/lib/clients/openMeteoClient';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // Validate parameters
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }

    // Fetch current weather from Open-Meteo
    const weatherData = await openMeteoClient.getCurrentWeather(latitude, longitude);

    return NextResponse.json({
      success: true,
      data: weatherData,
    });

  } catch (error) {
    console.error('Weather API error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch weather data. Please try again.' },
      { status: 500 }
    );
  }
}
