'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '../../utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function signupNewUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string
  const accountType = (formData.get('accountType') as string) || 'PERSONAL'

  if (!email || !password || !name) {
    return { error: 'All fields are required' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Generate unique username from email prefix
    const baseUsername = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase() || 'user'

    let username = baseUsername
    let attempt = 0
    while (await prisma.user.findUnique({ where: { username } })) {
      attempt++
      username = `${baseUsername}${attempt}`
    }

    const existingUser = await prisma.user.findFirst({ where: { email: data.user.email! } })
    if (!existingUser) {
      let joinKey = null
      if (accountType === 'BUSINESS' || accountType === 'ORGANIZATION') {
        joinKey = Math.random().toString(36).substring(2, 8).toUpperCase()
      }

      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name,
            username,
            password: '',
            accountType: accountType as any,
            onboarded: false,
            joinKey,
          },
        })
      } catch (err) {
        console.error(err)
      }
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', data.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  }

  revalidatePath('/onboarding')
  redirect('/onboarding')
}


export async function checkEmailExists(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  return !!user;
}
