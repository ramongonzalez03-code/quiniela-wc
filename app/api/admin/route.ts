import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSetting, setSetting } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// Admin login
export async function POST(req: NextRequest) {
  const { action, ...data } = await req.json()

  if (action === 'login') {
    const { password } = data
    const hash = getSetting('admin_password')
    if (!hash) return NextResponse.json({ error: 'Sin contraseña configurada' }, { status: 500 })

    const valid = await bcrypt.compare(password, hash)
    if (!valid) return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })

    const db = getDb()
    const admin = db.prepare('SELECT id FROM users WHERE is_admin = 1 LIMIT 1').get() as { id: number }

    const cookieStore = await cookies()
    cookieStore.set('session_user_id', String(admin.id), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    return NextResponse.json({ ok: true })
  }

  // All other actions require admin session
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = getDb()

  if (action === 'create_code') {
    const { name } = data
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    db.prepare('INSERT INTO users (name, invite_code) VALUES (?, ?)').run(name, code)
    return NextResponse.json({ ok: true, code })
  }

  if (action === 'toggle_lock') {
    const locked = getSetting('predictions_locked') === 'true'
    setSetting('predictions_locked', locked ? 'false' : 'true')
    return NextResponse.json({ ok: true, locked: !locked })
  }

  if (action === 'create_knockout_match') {
    const { phase, team1, team2, date, time, venue } = data
    const result = db.prepare(
      'INSERT INTO matches (phase, group_name, team1, team2, date, time, venue) VALUES (?, NULL, ?, ?, ?, ?, ?)'
    ).run(phase, team1, team2, date || '2026-07-01', time || '18:00', venue || '')
    return NextResponse.json({ ok: true, id: result.lastInsertRowid })
  }

  if (action === 'delete_knockout_match') {
    const { match_id } = data
    db.prepare('DELETE FROM predictions WHERE match_id = ?').run(match_id)
    db.prepare('DELETE FROM matches WHERE id = ? AND phase != ?').run(match_id, 'group')
    return NextResponse.json({ ok: true })
  }

  if (action === 'set_password') {
    const { password } = data
    const hash = await bcrypt.hash(password, 10)
    setSetting('admin_password', hash)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 })
}

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = getDb()
  const users = db.prepare('SELECT id, name, invite_code, created_at FROM users WHERE is_admin = 0').all()
  const locked = getSetting('predictions_locked') === 'true'
  const tournamentName = getSetting('tournament_name') ?? 'Quiniela Mundial 2026'

  return NextResponse.json({ users, locked, tournamentName })
}
