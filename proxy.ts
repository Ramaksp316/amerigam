import { NextResponse, type NextRequest, userAgent } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Routes that are always accessible (no auth or device check)
const PUBLIC_PATHS = ['/login', '/signin', '/signup', '/forgot-password', '/api', '/desktop', '/_next']

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Always allow API calls through first
  if (pathname.startsWith('/api')) {
    return await updateSession(request)
  }

  // Removed Desktop restriction because we now support Desktop layout
  // (Left the variables in case they are used later)
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/'

  // For onboarding route, skip further checks (avoid redirect loop)
  if (pathname.startsWith('/onboarding') || isPublicPath) {
    return await updateSession(request)
  }

  return await updateSession(request)
}

// Next.js 16 also accepts 'middleware' as a named export for backwards compatibility
export { proxy as middleware }

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
