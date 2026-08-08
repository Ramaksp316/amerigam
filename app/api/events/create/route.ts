import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      category,
      locationType,
      venue,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      requireApproval,
      requireCheckIn,
      participantLimit,
      evaluationMethod,
    } = body;

    // Validate required fields
    if (!name || !description || !category || !locationType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        category,
        locationType,
        venue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        requireApproval: requireApproval || false,
        requireCheckIn: requireCheckIn || false,
        participantLimit: participantLimit ? parseInt(participantLimit) : null,
        evaluationMethod: evaluationMethod || 'NONE',
        creatorId: userId,
      }
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
