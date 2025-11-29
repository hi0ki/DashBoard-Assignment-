import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, imageUrl, bio, phone } = body;

    console.log('Updating profile for user:', userId);
    console.log('Profile data:', { firstName, lastName, bio, phone, imageUrl: imageUrl ? 'present' : 'none' });

    const profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      update: {
        firstName,
        lastName,
        imageUrl,
        bio,
        phone,
      },
      create: {
        clerkUserId: userId,
        firstName,
        lastName,
        imageUrl,
        bio,
        phone,
      },
    });

    console.log('Profile updated successfully:', profile.id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}