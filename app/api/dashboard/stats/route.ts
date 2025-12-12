import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; 
import { prisma } from '@/lib/prisma'; // Make sure this path is correct for your project

export async function GET(request: NextRequest) {
  try {
    
    // 1. 🛑 AUTHENTICATION CHECK
    // Call auth() to retrieve the validated userId from Clerk's middleware.
    const { userId } = await auth();
    
    // Log the result. If this prints 'null', the 401 is triggered.
    console.log('API dashboard stats auth userId:', userId); 
    
    if (!userId) {
      // 🛑 Returns the 401 Unauthorized error if the token is invalid/missing.
      console.log('API dashboard stats: returning 401 — no userId.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
    }

    // 2. 🚀 DATA FETCHING (Only runs if authenticated)
    
    // Set a consistent limit for usage calculation
    const totalLimit = 50; 

    const [
      totalContacts,
      totalAgencies,
      userProfile,
    ] = await Promise.all([
      // Fetch total counts from the database tables
      prisma.contact.count(),
      prisma.agency.count(),
      
      // Fetch the authenticated user's profile for specific usage tracking
      prisma.userProfile.findUnique({
        where: { clerkUserId: userId }
      }),
    ]);

    // Calculate usage stats: uses profile's remaining count or defaults to total limit.
    const remaining = userProfile?.remaining ?? totalLimit; 
    const used = totalLimit - remaining; 

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