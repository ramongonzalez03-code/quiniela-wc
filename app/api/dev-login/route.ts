import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  const url = new URL(req.url)
  const userId = url.searchParams.get('uid') || '5'
  cookies().set('session_user_id', userId, { maxAge: 60 * 60 * 24 * 30, httpOnly: true, path: '/' })
  return NextResponse.redirect(new URL('/predictions', req.url))
}
