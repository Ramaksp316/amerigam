import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../../../utils/supabase/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Ensure user exists in Prisma
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
      
      const cookieStore = await cookies()
      cookieStore.set('userId', data.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/feed`)
}
