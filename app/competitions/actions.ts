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

    await prisma.eventRegistration.create({
      data: {
        registrationId: generateRegistrationId(),
        userId,
        eventId,
        status: event.requireApproval ? 'PENDING' : 'APPROVED',
        qrToken: crypto.randomUUID()
      }
    });
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
    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        }
      }
    });
  } catch (e) {
    console.error('Failed to cancel event registration', e);
  }

  revalidatePath('/competitions');
}
