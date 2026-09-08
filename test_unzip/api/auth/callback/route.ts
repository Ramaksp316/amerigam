import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../../../utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    // OAuth was cancelled or failed
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=oauth_cancelled`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
  if (error || !data.user) {
    console.error('OAuth callback error:', error?.message)
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=oauth_failed`)
  }

  // Find or create user in Prisma
  let dbUser = await prisma.user.findFirst({ where: { email: data.user.email! } })
  let isNewUser = false

  if (!dbUser) {
    isNewUser = true
    // Generate unique username from email prefix
    const emailPrefix = data.user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user'
    let username = emailPrefix
    let attempt = 0
    while (await prisma.user.findUnique({ where: { username } })) {
      attempt++
      username = `${emailPrefix}${attempt}`
    }

    dbUser = await prisma.user.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || emailPrefix,
        username,
        password: '',
        onboarded: false,
      }
    })
  }

  const cookieStore = await cookies()
  cookieStore.set('userId', dbUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  // New users go to onboarding, returning users go to feed
  const redirectPath = (isNewUser || !dbUser.onboarded) ? '/onboarding' : '/home'
  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}
