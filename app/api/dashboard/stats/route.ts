import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
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