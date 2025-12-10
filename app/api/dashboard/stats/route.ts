import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Debug: log incoming request headers to help diagnose missing Clerk session
    try {
      const headersObj: Record<string, string> = {};
      for (const [k, v] of request.headers.entries()) {
        headersObj[k] = v as string;
      }
      console.log('dashboard stats request headers:', headersObj);
    } catch (e) {
      console.log('dashboard stats: failed to read headers', e);
    }

    // Get userId from Clerk server auth (middleware)
    const { userId } = await auth();
    console.log('dashboard stats auth userId:', userId);
    if (!userId) {
      console.log('dashboard stats: returning 401 — no userId from auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's start for usage stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalContacts,
      totalAgencies,
      userProfile,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.agency.count(),
      prisma.userProfile.findUnique({
        where: { clerkUserId: userId }
      }),
    ]);

    // If no user profile, they have default 50 remaining
    const remaining = userProfile?.remaining || 50;
    const used = 50 - remaining;

    return NextResponse.json({
      contacts: totalContacts,
      agencies: totalAgencies,
      usage: {
        count: used,
        total: 50,
        remaining: remaining,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}