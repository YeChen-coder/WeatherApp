// API Route: Individual Saved Query Operations
// GET /api/queries/[id] - Get specific query
// PUT /api/queries/[id] - Update query
// DELETE /api/queries/[id] - Delete query

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch specific query
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    const query = await prisma.savedQuery.findUnique({
      where: { id },
    });

    if (!query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      query,
    });
  } catch (error) {
    console.error('Failed to fetch query:', error);
    return NextResponse.json(
      { error: 'Failed to fetch query' },
      { status: 500 }
    );
  }
}

// PUT - Update query
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { label } = body;

    // Update query
    const query = await prisma.savedQuery.update({
      where: { id },
      data: {
        label: label || null,
      },
    });

    return NextResponse.json({
      success: true,
      query,
    });
  } catch (error) {
    console.error('Failed to update query:', error);
    return NextResponse.json(
      { error: 'Failed to update query' },
      { status: 500 }
    );
  }
}

// DELETE - Delete query
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    await prisma.savedQuery.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Query deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete query:', error);
    return NextResponse.json(
      { error: 'Failed to delete query' },
      { status: 500 }
    );
  }
}
