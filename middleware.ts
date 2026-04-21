import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/predictions', '/ranking', '/bracket', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const sessionUserId = req.cookies.get('session_user_id')?.value
  if (!sessionUserId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/predictions/:path*', '/ranking/:path*', '/bracket/:path*', '/admin/:path*'],
}
