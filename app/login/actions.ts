'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '../../utils/supabase/server'
import { prisma } from '../../lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure user exists in Prisma
  if (data.user) {
    const user = await prisma.user.findUnique({ where: { email: data.user.email } })
    if (!user) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.email!.split('@')[0],
          username: data.user.email!.split('@')[0],
        }
      })
    }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', data.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  revalidatePath('/feed')
  redirect('/feed')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Create Prisma user
  if (data.user) {
    const user = await prisma.user.findUnique({ where: { email: data.user.email } })
    if (!user) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.email!.split('@')[0],
          username: data.user.email!.split('@')[0],
        }
      })
    }
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', data.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  revalidatePath('/feed')
  redirect('/feed')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Also clear dummy cookie just in case
  import('next/headers').then(async (headers) => {
    const cookieStore = await headers.cookies()
    cookieStore.delete('userId')
  })

  redirect('/')
}
