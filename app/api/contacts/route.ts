import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) userId = clerkUserId;

    // Debug logs to help diagnose why contacts aren't showing
    try {
      const dbHost = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split('?')[0] : 'unknown';
      console.log('contacts API - DB host:', dbHost);
      console.log('contacts API - auth userId:', userId);
    } catch (e) {
      console.log('contacts API - debug log error', e);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const viewed = searchParams.get('viewed') === 'true';
    const skip = (page - 1) * limit;

    if (!userId) {
      // Not authenticated: return empty list and 0 credits
      return NextResponse.json({
        contacts: [],
        pagination: { page, limit, total: 0, pages: 1 },
        remaining: 0,
      });
    }

    let whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { agency: { contains: search, mode: 'insensitive' as const } },
        { position: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Filter by view status for authenticated user
    if (viewed) {
      whereClause.views = { some: { clerkUserId: userId } };
    } else {
      whereClause.views = { none: { clerkUserId: userId } };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        include: {
          views: { where: { clerkUserId: userId }, select: { viewedAt: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where: whereClause }),
    ]);

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
    let remaining = 50;
    let userProfile = await prisma.userProfile.findUnique({ where: { clerkUserId: userId } });
    
    // If no user profile exists, create one with default 50 remaining
    if (!userProfile) {
      try {
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
        remaining = 50;
      } catch (e) {
        console.error('Error creating user profile:', e);
        remaining = 50; // Default if creation fails
      }
    } else {
      remaining = userProfile.remaining;
    }

    return NextResponse.json({
      contacts: contactsWithViewStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      remaining,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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