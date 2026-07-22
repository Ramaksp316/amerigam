'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function joinCompetition(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const competitionId = formData.get('competitionId') as string;

  try {
    await prisma.participant.create({
      data: {
        userId,
        competitionId,
      }
    });
  } catch (e) {
    // Already joined
  }

  revalidatePath('/competitions');
}

export async function cancelRegistration(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const competitionId = formData.get('competitionId') as string;

  try {
    await prisma.participant.delete({
      where: {
        userId_competitionId: {
          userId,
          competitionId,
        }
      }
    });
  } catch (e) {
    // Not joined
  }

  revalidatePath('/competitions');
}
