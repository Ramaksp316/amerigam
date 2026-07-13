'use server';

import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../../utils/supabase/server';

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
    revalidatePath(`/communities/${communityId}`);
  }
}
