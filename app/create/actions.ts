'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';

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
