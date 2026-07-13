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

export async function toggleLike(postId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const existingLike = await prisma.like.findFirst({
    where: { userId, postId },
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
    
    // Create Notification if liker is not the author
    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: userId,
          type: 'like',
          content: 'liked your post.',
          link: `/post/${postId}`,
        }
      });
    }
  }
  revalidatePath('/feed');
  revalidatePath(`/post/${postId}`);
}

export async function addComment(postId: string, content: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId || !content || content.trim().length === 0) return;

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: userId,
    },
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  // Create Notification if commenter is not the author
  if (post && post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: userId,
        type: 'comment',
        content: 'commented on your post.',
        link: `/post/${postId}`,
      }
    });
  }

  revalidatePath('/feed');
  revalidatePath(`/post/${postId}`);
}
