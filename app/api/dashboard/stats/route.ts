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
      todayViews,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.agency.count(),
      prisma.contactView.count({
        where: {
          clerkUserId: userId,
          viewedAt: {
            gte: today,
          },
        },
      }),
    ]);

    // Daily limit is 50 views per user
    const dailyLimit = 50;

    return NextResponse.json({
      contacts: totalContacts,
      agencies: totalAgencies,
      usage: {
        count: todayViews,
        total: dailyLimit,
        remaining: Math.max(0, dailyLimit - todayViews),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}