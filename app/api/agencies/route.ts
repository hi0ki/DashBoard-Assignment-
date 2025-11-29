import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const type = searchParams.get('type') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { county: { contains: search, mode: 'insensitive' as const } },
          ]
        } : {},
        state ? { state: { equals: state } } : {},
        type ? { type: { equals: type } } : {},
      ].filter(condition => Object.keys(condition).length > 0)
    };

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where: Object.keys(where.AND).length > 0 ? where : undefined,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.agency.count({
        where: Object.keys(where.AND).length > 0 ? where : undefined,
      }),
    ]);

    return NextResponse.json({
      agencies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}