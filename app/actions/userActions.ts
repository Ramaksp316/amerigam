'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(targetUserId: string) {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;
  if (!currentUserId || currentUserId === targetUserId) return;

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      }
    }
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
  } else {
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        actorId: currentUserId,
        type: 'follow',
        content: 'started following you.',
        link: `/user/${currentUserId}`,
      }
    });
  }
  revalidatePath(`/user/${targetUserId}`);
}
