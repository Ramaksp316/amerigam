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

  // 2. Perform actual Supabase login using the known seeded password
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: 'password123'
  });

  if (error) {
    throw new Error('Failed to login via Supabase: ' + error.message);
  }

  // 3. Set the application session cookie
  const cookieStore = await cookies();
  cookieStore.set('userId', data.user.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  // 4. Redirect to feed
  redirect('/feed');
}
