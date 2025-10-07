// API Route: Export Saved Query Data
// GET /api/queries/[id]/export?format=json|csv

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper to convert query to CSV format
function convertToCSV(query: any): string {
  const weatherData = query.weatherData;

  if (!weatherData || !weatherData.current || !weatherData.forecast) {
    return 'No weather data available';
  }

  const lines: string[] = [];

  // Header
  lines.push('Query Information');
  lines.push(`Label,${query.label || 'Untitled'}`);
  lines.push(`Location,${query.locationName}`);
  lines.push(`Latitude,${query.latitude}`);
  lines.push(`Longitude,${query.longitude}`);
  lines.push(`Date,${new Date(query.createdAt).toLocaleDateString()}`);
  lines.push('');

  // Current Weather
  lines.push('Current Weather');
  lines.push('Temperature (°C),Wind Speed (km/h),Wind Direction (°),Time');
  const current = weatherData.current;
  lines.push(`${current.temperature},${current.windspeed},${current.winddirection},${current.time}`);
  lines.push('');

  // Forecast
  if (weatherData.forecast && weatherData.forecast.time) {
    lines.push('5-Day Forecast');
    lines.push('Date,Max Temp (°C),Min Temp (°C),Precipitation (mm),Wind Speed (km/h)');

    const forecast = weatherData.forecast;
    for (let i = 0; i < Math.min(5, forecast.time.length); i++) {
      lines.push(
        `${forecast.time[i]},${forecast.temperature_2m_max[i]},${forecast.temperature_2m_min[i]},${forecast.precipitation_sum[i]},${forecast.windspeed_10m_max[i]}`
      );
    }
  }

  return lines.join('\n');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    // Fetch query with full weather data
    const query = await prisma.savedQuery.findUnique({
      where: { id },
    });

    if (!query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      );
    }

    // Export as JSON
    if (format === 'json') {
      const jsonData = {
        id: query.id,
        label: query.label,
        location: {
          name: query.locationName,
          latitude: query.latitude,
          longitude: query.longitude,
        },
        dates: {
          start: query.startDate,
          end: query.endDate,
          created: query.createdAt,
        },
        weatherData: query.weatherData,
        metadata: {
          geocodingConfidence: query.geocodingConfidence,
          locationType: query.locationType,
        },
      };

      const filename = `weather-${query.locationName.replace(/[^a-z0-9]/gi, '-')}-${query.id}.json`;

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Export as CSV
    if (format === 'csv') {
      const csvData = convertToCSV(query);
      const filename = `weather-${query.locationName.replace(/[^a-z0-9]/gi, '-')}-${query.id}.csv`;

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use ?format=json or ?format=csv' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to export query:', error);
    return NextResponse.json(
      { error: 'Failed to export query' },
      { status: 500 }
    );
  }
}
