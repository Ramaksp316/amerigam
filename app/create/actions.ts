'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// Removed createClient since we don't upload from server anymore

export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string | null;
  const mediaType = formData.get('mediaType') as string | null;
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
        relatedMasterPath,
        relatedCorePath,
        authorId: userId,
      },
    });
    
    redirect('/feed');
  }
}
