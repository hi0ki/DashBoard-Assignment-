import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's reset time (5:52 PM)
    const todayReset = new Date();
    todayReset.setHours(17, 52, 0, 0);

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
      // Check if user needs daily reset at 5:35 PM
      const lastReset = userProfile.lastResetDate ? new Date(userProfile.lastResetDate) : null;
      const now = new Date();
      
      console.log('DEBUG - Current time:', now.toLocaleString());
      console.log('DEBUG - Reset time (5:52 PM):', todayReset.toLocaleString());
      console.log('DEBUG - Last reset:', lastReset?.toLocaleString() || 'never');
      console.log('DEBUG - Current remaining:', userProfile.remaining);
      
      // Only reset if:
      // 1. User has no lastResetDate (new user), OR
      // 2. Current time is after today's 5:52 PM AND lastReset was before today's 5:52 PM
      const shouldReset = !lastReset || (now >= todayReset && lastReset < todayReset);
      
      console.log('DEBUG - Should reset?', shouldReset);
      
      if (shouldReset) {
        console.log('DEBUG - Resetting user to 50 credits');
        userProfile = await prisma.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            remaining: 50,
            lastResetDate: now
          }
        });
        console.log('DEBUG - Reset complete, new remaining:', userProfile.remaining);
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