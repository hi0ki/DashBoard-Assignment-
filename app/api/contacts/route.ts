import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        contacts: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        remaining: 0
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const viewed = searchParams.get('viewed') === 'true';
    const skip = (page - 1) * limit;

    let searchFilter: any = {};
    if (search) {
      searchFilter.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { agency: { contains: search, mode: 'insensitive' as const } },
        { position: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    let contactsWithViewStatus = [];
    let total = 0;

    if (viewed) {
      // If fetching VIEWED contacts, query ContactView directly to sort by viewedAt
      const [views, count] = await Promise.all([
        prisma.contactView.findMany({
          where: {
            clerkUserId: userId,
            contact: search ? searchFilter : undefined
          },
          include: {
            contact: true
          },
          skip,
          take: limit,
          orderBy: { viewedAt: 'desc' }, // Sort by most recently viewed
        }),
        prisma.contactView.count({
          where: {
            clerkUserId: userId,
            contact: search ? searchFilter : undefined
          }
        }),
      ]);

      total = count;
      contactsWithViewStatus = views.map(view => ({
        id: view.contact.id,
        name: view.contact.name,
        email: view.contact.email,
        phone: view.contact.phone,
        agency: view.contact.agency,
        position: view.contact.position,
        department: view.contact.department,
        isViewed: true,
        viewedAt: view.viewedAt.toISOString(),
      }));

    } else {
      // If fetching UNVIEWED contacts, query Contact model
      const whereClause = {
        ...searchFilter,
        views: { none: { clerkUserId: userId } } // Filter out viewed contacts
      };

      const [contacts, count] = await Promise.all([
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

      total = count;
      contactsWithViewStatus = contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        agency: contact.agency,
        position: contact.position,
        department: contact.department,
        isViewed: false, // By definition unviewed
        viewedAt: null,
      }));
    }

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