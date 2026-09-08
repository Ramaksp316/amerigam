
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

export async function searchPersonalUsers(query: string) {
  if (!query || query.length < 2) return [];
  const searchStr = query.replace('@', '');
  
  return await prisma.user.findMany({
    where: {
      accountType: 'PERSONAL',
      OR: [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { username: { contains: searchStr, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarData: true
    },
    take: 10
  });
}

export async function addMemberToCommunity(communityId: string, targetUserId: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { success: false, error: 'Not logged in' };

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { creatorId: true, type: true }
    });

    if (!community) return { success: false, error: 'Community not found' };
    if (community.creatorId !== userId) return { success: false, error: 'Only the creator can add members' };

    const existing = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId: targetUserId, communityId }
      }
    });

    if (existing) return { success: false, error: 'User is already a member' };

    await prisma.communityMember.create({
      data: {
        userId: targetUserId,
        communityId
      }
    });

    revalidatePath(`/communities/` + communityId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Server error' };
  }
}

export async function removeMemberFromCommunity(communityId: string, targetUserId: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) return { success: false, error: 'Not logged in' };

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { creatorId: true }
    });

    if (!community) return { success: false, error: 'Community not found' };
    if (community.creatorId !== userId) return { success: false, error: 'Only the creator can remove members' };

    // Cannot remove the creator
    if (targetUserId === community.creatorId) return { success: false, error: 'Cannot remove the community creator' };

    await prisma.communityMember.delete({
      where: {
        userId_communityId: { userId: targetUserId, communityId }
      }
    });

    revalidatePath(/communities/ + communityId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Server error' };
  }
}
