import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get userId from middleware/cookies first
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      userId = clerkUserId;
    } else {
      // Fallback: try to extract from Authorization header token
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
          const client = await clerkClient();
          const decoded = await client.verifyToken(token);
          userId = decoded.sub;
          console.log('contacts API: extracted userId from token:', userId);
        } catch (e) {
          console.log('contacts API: failed to verify token:', e);
        }
      }
    }

    if (!userId) {
      console.log('contacts API: returning 401 — no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const viewed = searchParams.get('viewed') === 'true';

    const skip = (page - 1) * limit;

    // Base where clause for search
    let whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { agency: { contains: search, mode: 'insensitive' as const } },
        { position: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Filter by view status
    if (viewed) {
      whereClause.views = {
        some: {
          clerkUserId: userId
        }
      };
    } else {
      whereClause.views = {
        none: {
          clerkUserId: userId
        }
      };
    }

    console.log('contacts API - userId:', userId);
    console.log('contacts API - viewed:', viewed);
    console.log('contacts API - whereClause:', JSON.stringify(whereClause, null, 2));

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        include: {
          views: {
            where: { clerkUserId: userId },
            select: { viewedAt: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where: whereClause }),
    ]);

    console.log('contacts API - total count:', total);
    console.log('contacts API - returned contacts:', contacts.length);

    // Add viewed status to each contact
    const contactsWithViewStatus = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      agency: contact.agency,
      position: contact.position,
      department: contact.department,
      isViewed: contact.views.length > 0,
      viewedAt: contact.views[0]?.viewedAt?.toISOString() || null,
    }));

    // Get user profile to check remaining credits
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    // If no user profile exists, create one with default 50 remaining
    let remaining = 50;
    if (userProfile) {
      remaining = userProfile.remaining;
    } else {
      // Create user profile with default remaining credits and user info from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          remaining: 50,
          lastResetDate: new Date()
        }
      });
    }

    return NextResponse.json({
      contacts: contactsWithViewStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      remaining: remaining,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, agency, position, notes } = body;

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        agency,
        position,
        notes,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}