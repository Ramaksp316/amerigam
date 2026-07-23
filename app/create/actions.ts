'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string | null;
  const mediaType = formData.get('mediaType') as string | null;
  const aspectRatio = formData.get('aspectRatio') as string || 'original';
  const relatedMasterPath = formData.get('relatedMasterPath') as string;
  const relatedCorePath = formData.get('relatedCorePath') as string;
  const type = formData.get('type') as string || 'post';

  if (content || mediaUrl) {
    let finalContent = content;
    // Prefix the content based on the type if it's a project or status
    if (type === 'project') {
      finalContent = `🚀 Launched a new project:\n\n${content}`;
    } else if (type === 'status') {
      finalContent = `💭 Status Update:\n\n${content}`;
    }

    await prisma.post.create({
      data: {
        content: finalContent || '',
        mediaUrl,
        mediaType,
        aspectRatio,
        relatedMasterPath,
        relatedCorePath,
        authorId: userId,
      },
    });
    
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
