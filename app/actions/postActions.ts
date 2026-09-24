'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sendWebPushNotification } from './sendWebPush';

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
  revalidatePath('/home');
  revalidatePath(`/user/${userId}`);
  return { success: true };
}

export async function toggleLike(postId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false, error: 'Unauthorized' };

  const existingLike = await prisma.like.findFirst({
    where: { userId, postId },
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  let hasLiked = false;

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    hasLiked = false;
  } else {
    await prisma.like.create({ data: { userId, postId } });
    hasLiked = true;
    
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
      }).catch(() => {});
      
      const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
      const actorName = actorUser ? (actorUser.username || actorUser.name || 'Someone') : 'Someone';
      await sendWebPushNotification(post.authorId, 'New Like', `${actorName} liked your post.`, `/post/${postId}`).catch(() => {});
    }
  }

  return { success: true, hasLiked };
}

export async function toggleBookmark(postId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false, error: 'Unauthorized' };

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId, postId }
    }
  });

  let isBookmarked = false;
  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id }
    });
    isBookmarked = false;
  } else {
    await prisma.bookmark.create({
      data: { userId, postId }
    });
    isBookmarked = true;
  }

  revalidatePath('/saved');
  return { success: true, isBookmarked };
}

export async function addComment(postId: string, content: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId || !content || content.trim().length === 0) {
    return { success: false, error: 'Unauthorized or empty comment' };
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: userId,
    },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarData: true }
      }
    }
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
    }).catch(() => {});

    const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
    const actorName = actorUser ? (actorUser.username || actorUser.name || 'Someone') : 'Someone';
    await sendWebPushNotification(post.authorId, 'New Comment', `${actorName} commented on your post.`, `/post/${postId}`).catch(() => {});
  }

  return { success: true, comment };
}
