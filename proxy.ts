import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Routes that are always accessible (no auth or device check)
const PUBLIC_PATHS = ['/login', '/signin', '/signup', '/forgot-password', '/api', '/desktop', '/_next']

const DEV_SESSION_COOKIE = 'amg_dev_session';
const DEV_SECRET = process.env.DEV_BOARD_SECRET || 'amg_dev_2026_s3cr3t_k3y';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── Dev Board Protection ──
  // Protect /dev-board/dashboard — requires valid session cookie
  if (pathname.startsWith('/dev-board/dashboard')) {
    const session = request.cookies.get(DEV_SESSION_COOKIE);
    if (session?.value !== DEV_SECRET) {
      const loginUrl = new URL('/dev-board', request.url);
      loginUrl.searchParams.set('redirect', 'true');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Allow /dev-board PIN page freely
  if (pathname.startsWith('/dev-board')) {
    return NextResponse.next();
  }

  // Always allow API calls through first
  if (pathname.startsWith('/api')) {
    return await updateSession(request)
  }

  // Removed Desktop restriction because we now support Desktop layout
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
