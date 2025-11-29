import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's reset time (12:40 AM)
    const todayReset = new Date();
    todayReset.setHours(0, 40, 0, 0);

    // Get user profile to check remaining credits
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    // Create profile if it doesn't exist
    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          remaining: 50,
          lastResetDate: new Date()
        }
      });
    } else {
      // Check if user needs daily reset
      const lastReset = userProfile.lastResetDate ? new Date(userProfile.lastResetDate) : null;
      
      // If user has no lastResetDate OR lastResetDate is before today's 12:40 AM, reset credits
      // Since it's currently after 12:40 AM today, anyone who hasn't been reset since today's 12:40 AM should get reset
      const needsReset = !lastReset || lastReset < todayReset;
      
      if (needsReset) {
        userProfile = await prisma.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            remaining: 50,
            lastResetDate: new Date()
          }
        });
      }
    }

    return NextResponse.json({
      remaining: userProfile.remaining
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}