import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generateRegistrationId } from '@/lib/idGenerator';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { participantType = 'PARTICIPANT' } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check dates
    const now = new Date();
    if (event.registrationStart && now < event.registrationStart) {
      return NextResponse.json({ error: 'Registration has not started yet' }, { status: 400 });
    }
    if (event.registrationEnd && now > event.registrationEnd) {
      return NextResponse.json({ error: 'Registration has closed' }, { status: 400 });
    }

    // Check limits
    if (event.participantLimit && event._count.registrations >= event.participantLimit) {
      return NextResponse.json({ error: 'Event has reached participant limit' }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Generate unique unguessable IDs
    const registrationId = generateRegistrationId();
    const qrToken = crypto.randomUUID();

    // Determine initial status based on approval requirements
    const status = event.requireApproval ? 'PENDING' : 'APPROVED';

    const registration = await prisma.eventRegistration.create({
      data: {
        registrationId,
        userId,
        eventId,
        status,
        participantType,
        qrToken
      }
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
