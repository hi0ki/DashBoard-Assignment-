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

    console.log('DEBUG - Found existing user profile:', !!userProfile);

    // Create profile if it doesn't exist
    if (!userProfile) {
      console.log('DEBUG - Creating new user profile');
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          remaining: 50,
          lastResetDate: new Date()
        }
      });
      console.log('DEBUG - New user created with remaining:', userProfile.remaining);
    } else {
      // Check if user needs daily reset
      const lastReset = userProfile.lastResetDate ? new Date(userProfile.lastResetDate) : null;
      
      // Debug logging
      console.log('DEBUG - Current time:', new Date());
      console.log('DEBUG - Today reset time (12:40 AM):', todayReset);
      console.log('DEBUG - User lastResetDate:', lastReset);
      console.log('DEBUG - Should reset?', !lastReset || lastReset < todayReset);
      console.log('DEBUG - Current remaining:', userProfile.remaining);
      
      // If user has no lastResetDate or lastResetDate is before today's 12:40 AM, reset credits
      if (!lastReset || lastReset < todayReset) {
        console.log('DEBUG - Resetting credits to 50');
        // User needs daily reset
        userProfile = await prisma.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            remaining: 50,
            lastResetDate: new Date()
          }
        });
        console.log('DEBUG - After reset, remaining:', userProfile.remaining);
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