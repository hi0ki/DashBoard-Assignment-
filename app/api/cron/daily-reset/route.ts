import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header (for cron job security)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'daily-reset-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's reset time (12:40 AM)
    const today = new Date();
    today.setHours(0, 40, 0, 0);

    // Find all users who haven't been reset today
    const usersToReset = await prisma.userProfile.findMany({
      where: {
        OR: [
          { lastResetDate: null },
          { lastResetDate: { lt: today } }
        ]
      }
    });

    // Reset credits to 50 for all eligible users
    const resetPromises = usersToReset.map(user => 
      prisma.userProfile.update({
        where: { id: user.id },
        data: {
          remaining: 50,
          lastResetDate: today
        }
      })
    );

    await Promise.all(resetPromises);

    console.log(`Daily credit reset completed: ${usersToReset.length} users reset to 50 credits`);

    return NextResponse.json({
      message: 'Daily credit reset completed',
      usersReset: usersToReset.length,
      resetDate: today.toISOString()
    });

  } catch (error) {
    console.error('Error in daily credit reset:', error);
    return NextResponse.json({ error: 'Failed to reset credits' }, { status: 500 });
  }
}