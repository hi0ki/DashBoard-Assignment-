import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
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

    // REMOVE all userId/viewed filters for debug
    // Return all contacts regardless of user or viewed status

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        include: { views: true },
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

    return NextResponse.json({
      contacts: contactsWithViewStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      remaining: 50,
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