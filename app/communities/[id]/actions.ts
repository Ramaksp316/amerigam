'use server';

import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

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
    const arrayBuffer = await media.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${media.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    
    mediaUrl = `/uploads/${fileName}`;
    mediaType = media.type.startsWith('video/') ? 'video' : 'image';
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
    revalidatePath(`/communities/${communityId}`);
  }
}
