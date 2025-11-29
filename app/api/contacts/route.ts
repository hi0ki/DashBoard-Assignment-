import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
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
      whereClause.ContactView = {
        some: {
          clerkUserId: userId
        }
      };
    } else {
      whereClause.ContactView = {
        none: {
          clerkUserId: userId
        }
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        include: {
          ContactView: {
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

    // Add viewed status to each contact
    const contactsWithViewStatus = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      agency: contact.agency,
      position: contact.position,
      isViewed: contact.ContactView.length > 0,
      viewedAt: contact.ContactView[0]?.viewedAt?.toISOString() || null,
    }));

    // Get remaining views for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayViews = await prisma.contactView.count({
      where: {
        clerkUserId: userId,
        viewedAt: { gte: today }
      }
    });
    
    const remainingViews = Math.max(0, 50 - todayViews);

    return NextResponse.json({
      contacts: contactsWithViewStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      remaining: remainingViews,
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
        clerkUserId: userId,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}