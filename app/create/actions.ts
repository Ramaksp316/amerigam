'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendWebPushNotification } from '@/app/actions/sendWebPush';


export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string | null;
  const mediaType = formData.get('mediaType') as string | null;
  const aspectRatio = formData.get('aspectRatio') as string || 'original';
  const type = formData.get('type') as string || 'post';
  const category = formData.get('category') as string | null;
  
  // Handle tags
  const tagsString = formData.get('tags') as string | null;
  let tags: string[] = [];
  if (tagsString) {
    try {
      tags = JSON.parse(tagsString);
    } catch(e) {
      // Fallback if comma separated
      tags = tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
  }

  if (content || mediaUrl) {
    let finalContent = content;
    // Prefix the content based on the type if it's a project or status
    if (type === 'project') {
      finalContent = `Launched a new project:\n\n${content}`;
    } else if (type === 'status') {
      finalContent = `Status Update:\n\n${content}`;
    }

    if (type === 'story') {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await prisma.story.create({
        data: {
          content: finalContent || null,
          mediaUrl,
          mediaType,
          authorId: userId,
          expiresAt
        }
      });
    } else {
      const post = await prisma.post.create({
        data: {
          content: finalContent || '',
          mediaUrl,
          mediaType,
          aspectRatio,
          category: category || null,
          tags,
          authorId: userId,
        },
      });

      // Send notifications to followers
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true }
      });

      if (followers.length > 0) {
        const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
        const actorName = actorUser?.name || actorUser?.username || 'Someone';
        const isReel = aspectRatio === '9:16' && mediaType === 'video';
        
        const notificationData = followers.map(f => ({
          userId: f.followerId,
          actorId: userId,
          type: isReel ? 'reel' : 'post',
          content: isReel ? 'posted a new reel.' : 'published a new post.',
          link: `/post/${post.id}`
        }));
        
        await prisma.notification.createMany({ data: notificationData });
        
        // Push notifications asynchronously
        Promise.all(followers.map(f => sendWebPushNotification(f.followerId, isReel ? 'New Reel' : 'New Post', `${actorName} ${isReel ? 'posted a new reel.' : 'published a new post.'}`, `/post/${post.id}`))).catch(() => {});
      }
    }
    
    redirect('/feed');
  }
}

export async function updateCustomStatus(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const customStatus = formData.get('customStatus') as string;
  
  if (!customStatus || customStatus.trim() === '') {
    // Clear status
    await prisma.user.update({
      where: { id: userId },
      data: { customStatus: null, customStatusExpiresAt: null }
    });
  } else {
    // Set for 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.user.update({
      where: { id: userId },
      data: { 
        customStatus: customStatus.trim(), 
        customStatusExpiresAt: expiresAt 
      }
    });
  }

  revalidatePath(`/user/${userId}`);
  redirect(`/user/${userId}`);
}
