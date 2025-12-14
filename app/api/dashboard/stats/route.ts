import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct for your project

export async function GET(request: NextRequest) {
  try {

    // TEMPORARILY DISABLED AUTHENTICATION
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const totalLimit = 50;

    const [
      totalContacts,
      totalAgencies,
    ] = await Promise.all([
      // Fetch total counts from the database tables
      prisma.contact.count(),
      prisma.agency.count(),

      // Fetch the authenticated user's profile for specific usage tracking
      // prisma.userProfile.findUnique({
      //   where: { clerkUserId: userId }
      // }),
    ]);

    // Calculate usage stats: uses profile's remaining count or defaults to total limit.
    // Default values since auth is disabled
    const remaining = totalLimit;
    const used = 0;

    // 3. ✅ SUCCESS RESPONSE
    return NextResponse.json({
      contacts: totalContacts,
      agencies: totalAgencies,
      usage: {
        count: used,
        total: totalLimit,
        remaining: remaining,
      },
    });

  } catch (error) {
    // 4. ❌ SERVER ERROR HANDLING
    console.error('Fatal Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats due to server error.' }, { status: 500 });
  }
}