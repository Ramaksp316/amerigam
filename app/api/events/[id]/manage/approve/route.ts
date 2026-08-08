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

    if (!event || event.creatorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { registrationId } = await req.json();

    // Clean up any certificates if they were previously marked as winner
    await prisma.eventCertificate.deleteMany({
      where: { registrationId }
    });


    // Let's just delete by title
    const reg = await prisma.eventRegistration.findUnique({ where: { id: registrationId }});
    if (reg) {
      await prisma.achievement.deleteMany({
        where: { userId: reg.userId, title: `Winner of ${event.name}` }
      });
    }

    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'APPROVED' }
    });

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Error approving registration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
