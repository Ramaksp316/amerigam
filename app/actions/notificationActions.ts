'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteNotification(notificationId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return;

  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId: userId
    }
  });

  revalidatePath('/notifications');
}
