import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { registrations: true } }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const now = new Date();
    const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
    const regEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;
    const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;

    if (!isRegistrationOpen) {
      return NextResponse.json({ error: 'Registration is not currently open' }, { status: 400 });
    }

    if (event.participantLimit && event._count.registrations >= event.participantLimit) {
      return NextResponse.json({ error: 'Maximum participants reached' }, { status: 400 });
    }

    const existingReg = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } }
    });

    if (existingReg) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }

    const isFree = !event.entryFee || event.entryFee === 0;

    // Create Registration
    const registration = await prisma.eventRegistration.create({
      data: {
        registrationId: `AMG-R-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        userId,
        eventId,
        status: isFree ? 'APPROVED' : 'PENDING',
        participantType: 'PARTICIPANT'
      }
    });

    if (isFree) {
      return NextResponse.json({ success: true, redirectUrl: `/competitions/${eventId}/manage` });
    } else {
      // Create Payment Record
      await prisma.eventPayment.create({
        data: {
          registrationId: registration.id,
          amount: event.entryFee!,
          currency: event.currency || 'INR',
          status: 'PENDING',
          provider: 'SIMULATED'
        }
      });

      return NextResponse.json({ success: true, redirectUrl: `/competitions/payment/${registration.id}` });
    }

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
