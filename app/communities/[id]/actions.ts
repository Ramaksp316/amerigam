'use server';

import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../../utils/supabase/server';
import { sendWebPushNotification } from '../../actions/sendWebPush';

export async function createCommunityPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const content = formData.get('content') as string;
  const communityId = formData.get('communityId') as string;
  const media = formData.get('media') as File | null;
  
  let mediaUrl = null;
  let mediaType = null;

  if (media && media.size > 0) {
    const supabase = await createClient();
    const fileName = `${Date.now()}-${media.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, media, {
        contentType: media.type,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      mediaUrl = publicUrlData.publicUrl;
      mediaType = media.type.startsWith('video/') ? 'video' : 'image';
    } else {
      console.error('Storage upload error:', error);
    }
  }

  if (content || mediaUrl) {
    await prisma.communityPost.create({
      data: {
        content: content || '',
        mediaUrl,
        mediaType,
        authorId: userId,
        communityId,
      },
    });

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { members: true }
    });

    if (community) {
      const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
      const actorName = actorUser ? (actorUser.username || actorUser.name || 'Someone') : 'Someone';

      for (const member of community.members) {
        if (member.userId !== userId) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              actorId: userId,
              type: 'community_post',
              content: `posted in ${community.name}.`,
              link: `/communities/${communityId}`,
            }
          });
          await sendWebPushNotification(
            member.userId, 
            `New post in ${community.name}`, 
            `${actorName}: ${content.length > 30 ? content.substring(0, 30) + '...' : content}`, 
            `/communities/${communityId}`
          );
        }
      }
    }

    revalidatePath(`/communities/${communityId}`);
  }
}

export async function createCommunityTask(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const communityId = formData.get('communityId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const assigneeId = formData.get('assigneeId') as string || null;
  const deadlineStr = formData.get('deadline') as string;
  
  if (!title || title.trim().length === 0) return;

  const deadline = deadlineStr ? new Date(deadlineStr) : null;

  await prisma.communityTask.create({
    data: {
      title,
      description,
      communityId,
      creatorId: userId,
      assigneeId,
      deadline,
    }
  });

  revalidatePath(`/communities/${communityId}`);
}

export async function updateTaskStatus(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const taskId = formData.get('taskId') as string;
  const status = formData.get('status') as string;
  const communityId = formData.get('communityId') as string;

  await prisma.communityTask.update({
    where: { id: taskId },
    data: { status }
  });

  revalidatePath(`/communities/${communityId}`);
}
