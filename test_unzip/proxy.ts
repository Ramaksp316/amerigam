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

  const { device } = userAgent(request)
  const isDesktopComingSoonPage = pathname === '/desktop'
  
  // device.type is undefined for desktop browsers
  const isDesktop = device.type !== 'mobile' && device.type !== 'tablet'

  // Allow auth/onboarding pages on all device types (no device restriction)
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/'

  if (isDesktop && !isDesktopComingSoonPage) {
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      return NextResponse.redirect(new URL('/desktop', request.url))
    }
  }

  if (!isDesktop && isDesktopComingSoonPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

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
