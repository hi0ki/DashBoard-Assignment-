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
    
    // If current time is before 12:40 AM today, the last valid reset was yesterday at 12:40 AM
    const now = new Date();
    if (now < todayReset) {
      todayReset.setDate(todayReset.getDate() - 1);
    }

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
          lastResetDate: todayReset
        }
      });
    } else {
      // Check if user needs daily reset
      const lastReset = new Date(userProfile.lastResetDate);
      
      // Only reset if lastResetDate is before today's reset time
      if (lastReset < todayReset) {
        // User needs daily reset
        userProfile = await prisma.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            remaining: 50,
            lastResetDate: todayReset
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