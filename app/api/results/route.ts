import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const db = getDb()
  const matches = db.prepare(
    'SELECT * FROM matches ORDER BY date, time'
  ).all()
  return NextResponse.json({ matches })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = getDb()
  const { match_id, score1, score2 } = await req.json()

  db.prepare(
    "UPDATE matches SET score1 = ?, score2 = ?, status = 'finished' WHERE id = ?"
  ).run(score1, score2, match_id)

  return NextResponse.json({ ok: true })
}
