import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { invite_code } = await req.json()
  if (!invite_code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const db = getDb()
  const user = db.prepare('SELECT id, name, is_admin FROM users WHERE invite_code = ?').get(
    invite_code.trim().toUpperCase()
  ) as { id: number; name: string; is_admin: number } | undefined

  if (!user) return NextResponse.json({ error: 'Código inválido' }, { status: 401 })

  const cookieStore = await cookies()
  cookieStore.set('session_user_id', String(user.id), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true, name: user.name, is_admin: !!user.is_admin })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('session_user_id')
  return NextResponse.json({ ok: true })
}
