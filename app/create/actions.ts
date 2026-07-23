'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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
