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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || !event.allowTeams) {
      return NextResponse.json({ error: 'Event does not support teams' }, { status: 400 });
    }

    // Check if team name exists in this event
    const existingTeam = await prisma.eventTeam.findFirst({
      where: { name, eventId }
    });
    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already taken in this event' }, { status: 400 });
    }

    // Create the team
    const team = await prisma.eventTeam.create({
      data: {
        name,
        captainId: userId,
        eventId
      }
    });

    // Ensure the captain is registered for the event and link to the team
    let registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (!registration) {
      registration = await prisma.eventRegistration.create({
        data: {
          registrationId: generateRegistrationId(),
          userId,
          eventId,
          status: event.requireApproval ? 'PENDING' : 'APPROVED',
          qrToken: crypto.randomUUID(),
          teamId: team.id
        }
      });
    } else {
      registration = await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { teamId: team.id }
      });
    }

    return NextResponse.json({ team, registration }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
