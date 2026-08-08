'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { generateRegistrationId } from '../../lib/idGenerator';
import crypto from 'crypto';

export async function joinEvent(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const eventId = formData.get('eventId') as string;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return;

    const regStatus = event.requireApproval ? 'PENDING' : 'APPROVED';

    const registration = await prisma.eventRegistration.create({
      data: {
        registrationId: generateRegistrationId(),
        userId,
        eventId,
        status: regStatus,
        qrToken: crypto.randomUUID()
      }
    });

    if (event.competitionId && regStatus === 'APPROVED') {
      await prisma.competitionEntity.create({
        data: {
          entityId: `AMG-E-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          competitionId: event.competitionId,
          type: 'USER',
          userId: userId,
          status: 'ACTIVE'
        }
      });
    }
  } catch (e) {
    console.error('Failed to join event', e);
  }

  revalidatePath('/competitions');
}

export async function cancelRegistration(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const eventId = formData.get('eventId') as string;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        }
      }
    });

    if (event?.competitionId) {
      // Find and delete the competition entity if it exists
      await prisma.competitionEntity.deleteMany({
        where: {
          competitionId: event.competitionId,
          userId: userId
        }
      });
    }
  } catch (e) {
    console.error('Failed to cancel event registration', e);
  }

  revalidatePath('/competitions');
}
