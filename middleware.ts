import { NextResponse, type NextRequest, userAgent } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Ignore API calls for the desktop check, so they don't unexpectedly return HTML
  if (request.nextUrl.pathname.startsWith('/api')) {
    return await updateSession(request)
  }

  const { device } = userAgent(request)
  const isDesktopComingSoonPage = request.nextUrl.pathname === '/desktop'
  
  // In Next.js, device.type can be 'mobile', 'tablet', 'smarttv', 'console', 'wearable'.
  // If it's undefined, it generally means it's a desktop browser.
  const isDesktop = device.type !== 'mobile' && device.type !== 'tablet'

  if (isDesktop && !isDesktopComingSoonPage) {
    // Redirect desktop users to the coming soon page
    return NextResponse.redirect(new URL('/desktop', request.url))
  }

  if (!isDesktop && isDesktopComingSoonPage) {
    // If a mobile user somehow lands on the desktop coming soon page, send them to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proceed with normal session update for mobile users
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
