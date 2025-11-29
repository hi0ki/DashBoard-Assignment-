import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = params;

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if user has already viewed this contact
    const existingView = await prisma.contactView.findUnique({
      where: {
        contactId_clerkUserId: {
          contactId: contactId,
          clerkUserId: userId
        }
      }
    });

    if (existingView) {
      return NextResponse.json({ 
        message: 'Contact already viewed',
        viewedAt: existingView.viewedAt 
      });
    }

    // Check daily limit (50 new contacts per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const viewsToday = await prisma.contactView.count({
      where: {
        clerkUserId: userId,
        viewedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (viewsToday >= 50) {
      return NextResponse.json({ 
        error: 'Daily contact limit reached (50 contacts per day)' 
      }, { status: 429 });
    }

    // Create the view record
    const contactView = await prisma.contactView.create({
      data: {
        contactId: contactId,
        clerkUserId: userId
      }
    });

    return NextResponse.json({
      message: 'Contact marked as viewed',
      viewedAt: contactView.viewedAt,
      remainingViews: 49 - viewsToday
    });

  } catch (error) {
    console.error('Error marking contact as viewed:', error);
    return NextResponse.json({ error: 'Failed to mark contact as viewed' }, { status: 500 });
  }
}