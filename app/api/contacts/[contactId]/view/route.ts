import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = await params;

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if user has already viewed this contact
    const existingView = await prisma.contactView.findFirst({
      where: {
        contactId: contactId,
        clerkUserId: userId
      }
    });

    if (existingView) {
      return NextResponse.json({ 
        message: 'Contact already viewed',
        viewedAt: existingView.viewedAt 
      });
    }

    // Get user profile to check remaining views
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

  // Create profile if it doesn't exist
  if (!userProfile) {
    userProfile = await prisma.userProfile.create({
      data: {
        clerkUserId: userId,
        remaining: 50,
        lastResetDate: new Date()
      }
    });
  }    if (userProfile.remaining <= 0) {
      return NextResponse.json({ 
        error: 'No remaining views left',
        remaining: 0
      }, { status: 429 });
    }

    // Create the view record and decrement remaining count
    const [contactView, updatedProfile] = await Promise.all([
      prisma.contactView.create({
        data: {
          contactId: contactId,
          clerkUserId: userId
        }
      }),
      prisma.userProfile.update({
        where: { clerkUserId: userId },
        data: { remaining: userProfile.remaining - 1 }
      })
    ]);

    return NextResponse.json({
      message: 'Contact marked as viewed',
      viewedAt: contactView.viewedAt,
      remaining: updatedProfile.remaining
    });

  } catch (error) {
    console.error('Error marking contact as viewed:', error);
    return NextResponse.json({ error: 'Failed to mark contact as viewed' }, { status: 500 });
  }
}