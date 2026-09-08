import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (event.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      category,
      eventLevel,
      locationType,
      venue,
      startDate,
      endDate,
      requireApproval,
      allowTeams,
      requireSubmissions
    } = body;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: name || event.name,
        description: description || event.description,
        category: category || event.category,
        eventLevel: eventLevel || event.eventLevel,
        locationType: locationType || event.locationType,
        venue: venue !== undefined ? venue : event.venue,
        startDate: startDate ? new Date(startDate) : event.startDate,
        endDate: endDate ? new Date(endDate) : event.endDate,
        requireApproval: requireApproval !== undefined ? requireApproval : event.requireApproval,
        allowTeams: allowTeams !== undefined ? allowTeams : event.allowTeams,
        requireSubmissions: requireSubmissions !== undefined ? requireSubmissions : event.requireSubmissions
      }
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
