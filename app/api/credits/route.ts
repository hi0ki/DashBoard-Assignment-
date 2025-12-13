import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's reset time (11:00 PM server time = 00:00 AM local time)
    const todayReset = new Date();
    todayReset.setHours(23, 0, 0, 0);

    // Get user profile to check remaining credits
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    // Create profile if it doesn't exist
    if (!userProfile) {
      // Get user data from Clerk to save firstName and lastName
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          remaining: 50,
          lastResetDate: new Date()
        }
      });
    } else {
      // Check if user needs daily reset at 11:00 PM server time (on my time is 00:00 AM)
      const lastReset = userProfile.lastResetDate ? new Date(userProfile.lastResetDate) : null;
      const now = new Date();
      
      // Only reset if:
      const shouldReset = !lastReset || (now >= todayReset && lastReset < todayReset);
      
      if (shouldReset) {
        userProfile = await prisma.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            remaining: 50,
            lastResetDate: now
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