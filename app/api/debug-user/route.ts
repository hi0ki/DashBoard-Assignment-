import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    const now = new Date();
    const todayReset = new Date();
    todayReset.setHours(17, 52, 0, 0);

    return NextResponse.json({
      userProfile: {
        remaining: userProfile?.remaining || 'No profile',
        lastResetDate: userProfile?.lastResetDate || 'Never reset',
        lastResetTime: userProfile?.lastResetDate ? new Date(userProfile.lastResetDate).toLocaleString() : 'Never'
      },
      currentTime: now.toLocaleString(),
      todayResetTime: todayReset.toLocaleString(),
      shouldReset: !userProfile?.lastResetDate || new Date(userProfile.lastResetDate) < todayReset,
      timeComparison: {
        nowAfterReset: now >= todayReset,
        lastBeforeReset: userProfile?.lastResetDate ? new Date(userProfile.lastResetDate) < todayReset : true
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}