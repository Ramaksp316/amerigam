import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generateRegistrationId } from '@/lib/idGenerator';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;
    const body = await req.json();
    const { teamCode } = body;

    if (!teamCode) {
      return NextResponse.json({ error: 'Team code is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || !event.allowTeams) {
      return NextResponse.json({ error: 'Event does not support teams' }, { status: 400 });
    }

    // Find team by code
    const team = await prisma.eventTeam.findUnique({
      where: { teamCode }
    });

    if (!team || team.eventId !== eventId) {
      return NextResponse.json({ error: 'Invalid team code' }, { status: 404 });
    }

    // Ensure the user is registered for the event and link to the team
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

    return NextResponse.json({ team, registration }, { status: 200 });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
