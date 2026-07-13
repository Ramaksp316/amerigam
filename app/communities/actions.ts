'use server';

import { prisma } from '../../lib/prisma';
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

  if (name) {
    const community = await prisma.community.create({
      data: {
        name,
        description,
        category,
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
  }

  revalidatePath('/communities');
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
