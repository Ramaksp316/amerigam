'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const content = formData.get('content') as string;
  const media = formData.get('media') as File | null;
  const relatedMasterPath = formData.get('relatedMasterPath') as string;
  const relatedCorePath = formData.get('relatedCorePath') as string;
  const type = formData.get('type') as string || 'post';
  
  let mediaUrl = null;
  let mediaType = null;

  if (media && media.size > 0) {
    const arrayBuffer = await media.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${media.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    
    mediaUrl = `/uploads/${fileName}`;
    mediaType = media.type.startsWith('video/') ? 'video' : 'image';
  }

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
