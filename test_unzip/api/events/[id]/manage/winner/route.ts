import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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

    // 1. Update status to WINNER
    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'WINNER' },
      include: { user: true }
    });

    // 2. Generate a Digital Certificate
    const certificateId = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const certificate = await prisma.eventCertificate.create({
      data: {
        certificateId,
        registrationId: registration.id,
        type: 'WINNER'
      }
    });

    // 3. Add to Achievements
    await prisma.achievement.create({
      data: {
        userId: registration.userId,
        title: `Winner of ${event.name}`,
        description: `Awarded for winning the competition.`,
        badgeIcon: '🏆'
      }
    });

    return NextResponse.json({ registration, certificate });
  } catch (error) {
    console.error('Error marking winner:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
