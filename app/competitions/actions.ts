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
