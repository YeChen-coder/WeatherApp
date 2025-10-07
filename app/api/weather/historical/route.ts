// API Route: Historical Weather Data
// GET /api/weather/historical?lat={lat}&lon={lon}&startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}

import { NextRequest, NextResponse } from 'next/server';
import { openMeteoClient } from '@/lib/clients/openMeteoClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validation
    if (!lat || !lon || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon, startDate, endDate' },
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

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      );
    }

    if (end > today) {
      return NextResponse.json(
        { error: 'End date cannot be in the future' },
        { status: 400 }
      );
    }

    // Fetch historical weather data
    const weatherData = await openMeteoClient.getHistoricalWeather({
      latitude,
      longitude,
      start_date: startDate,
      end_date: endDate,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'precipitation_sum',
        'rain_sum',
        'snowfall_sum',
        'windspeed_10m_max',
        'windgusts_10m_max',
        'weathercode',
      ],
      timezone: 'auto',
    });

    return NextResponse.json({
      success: true,
      data: weatherData,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error('Historical weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical weather data' },
      { status: 500 }
    );
  }
}
