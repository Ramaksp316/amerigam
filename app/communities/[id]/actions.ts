
'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createCommunityPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error('Not logged in');

  const content = formData.get('content') as string;
  const communityId = formData.get('communityId') as string;

  if (!content || !communityId) return;

  const post = await prisma.communityPost.create({
    data: {
      content,
      authorId: userId,
      communityId
    }
  });

  // Notify community members
  const members = await prisma.communityMember.findMany({
    where: { communityId, userId: { not: userId } },
    select: { userId: true }
  });

  if (members.length > 0) {
    const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
    const community = await prisma.community.findUnique({ where: { id: communityId }, select: { name: true } });
    const actorName = actorUser?.name || actorUser?.username || 'Someone';
    const commName = community?.name || 'a community';
    
    const notificationData = members.map(m => ({
      userId: m.userId,
      actorId: userId,
      type: 'community_post',
      content: `posted in ${commName}.`,
      link: `/communities/${communityId}`
    }));
    
    await prisma.notification.createMany({ data: notificationData });
    
    // Import push manually here if not at top level (we might need to check if it's imported)
  }

  revalidatePath(`/communities/${communityId}`);
}

export async function sendCommunityMessage(communityId: string, content: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error('Not logged in');

  await prisma.communityMessage.create({
    data: {
      content,
      senderId: userId,
      communityId
    }
  });
  
  revalidatePath(`/communities/${communityId}`);
}
