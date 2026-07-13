'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deletePost(postId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return { success: false, error: 'Not authenticated' };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post || post.authorId !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/feed');
  revalidatePath(`/user/${userId}`);
  return { success: true };
}
