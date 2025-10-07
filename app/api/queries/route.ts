// API Route: Saved Queries CRUD
// GET /api/queries - List all saved queries
// POST /api/queries - Create new saved query

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - List all saved queries
export async function GET() {
  try {
    const queries = await prisma.savedQuery.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        locationName: true,
        latitude: true,
        longitude: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      queries,
    });
  } catch (error) {
    console.error('Failed to fetch queries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved queries' },
      { status: 500 }
    );
  }
}

// POST - Create new saved query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      label,
      locationName,
      latitude,
      longitude,
      startDate,
      endDate,
      weatherData,
      geocodingConfidence,
      locationType,
    } = body;

    // Validation
    if (!locationName || !latitude || !longitude || !weatherData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create query in database
    const query = await prisma.savedQuery.create({
      data: {
        label: label || null,
        locationName,
        latitude,
        longitude,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        weatherData,
        geocodingConfidence: geocodingConfidence || null,
        locationType: locationType || null,
      },
    });

    return NextResponse.json({
      success: true,
      query,
    });
  } catch (error) {
    console.error('Failed to create query:', error);
    return NextResponse.json(
      { error: 'Failed to save query' },
      { status: 500 }
    );
  }
}
