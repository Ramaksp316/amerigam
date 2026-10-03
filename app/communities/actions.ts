'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCommunity(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const type = (formData.get('type') as string) || 'PUBLIC';
  const avatarData = (formData.get('avatarData') as string) || null;

  if (name) {
    const community = await prisma.community.create({
      data: {
        name,
        description,
        category,
        type,
        avatarData: avatarData || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        creatorId: userId,
      }
    });

    // Add creator as member
    await prisma.communityMember.create({
      data: {
        userId,
        communityId: community.id,
      }
    });

    revalidatePath('/communities');
    redirect(`/communities/${community.id}`);
  }
}

export async function updateCommunityAvatar(communityId: string, avatarData: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false, error: 'Unauthorized' };

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { creatorId: true },
  });

  if (!community || community.creatorId !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  await prisma.community.update({
    where: { id: communityId },
    data: { avatarData }
  });

  revalidatePath(`/communities/${communityId}`);
  revalidatePath('/communities');
  return { success: true };
}

export async function joinCommunity(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const communityId = formData.get('communityId') as string;

  try {
    await prisma.communityMember.create({
      data: {
        userId,
        communityId,
      }
    });
  } catch (e) {
    // Already joined
  }

  revalidatePath(`/communities/${communityId}`);
  revalidatePath('/communities');
  redirect(`/communities/${communityId}`);
}

export async function toggleJoinCommunity(communityId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false, error: 'Unauthorized' };

  const existing = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: {
        userId,
        communityId
      }
    }
  });

  if (existing) {
    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });
    revalidatePath('/communities');
    revalidatePath(`/communities/${communityId}`);
    return { success: true, joined: false };
  } else {
    await prisma.communityMember.create({
      data: {
        userId,
        communityId
      }
    });
    revalidatePath('/communities');
    revalidatePath(`/communities/${communityId}`);
    return { success: true, joined: true };
  }
}

export async function deleteCommunity(communityId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false, error: 'Unauthorized' };

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { creatorId: true },
  });

  if (!community || community.creatorId !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  await prisma.community.delete({
    where: { id: communityId }
  });

  revalidatePath('/communities');
  redirect('/communities');
}
