'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '../../../utils/supabase/server';
import { prisma } from '../../../lib/prisma';

export async function directTestLogin(userId: string) {
  // 1. Fetch user email from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, id: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 2. We bypass Supabase Auth entirely for seeded test accounts 
  // because these accounts were created directly in the database 
  // and do not exist in Supabase's auth.users table.
  // We simply establish the session by setting the cookie manually.
  const cookieStore = await cookies();
  cookieStore.set('userId', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  // 4. Redirect to feed
  redirect('/feed');
}
