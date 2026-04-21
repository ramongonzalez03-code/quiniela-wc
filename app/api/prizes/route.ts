import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const db = getDb()
  const prizes = db.prepare('SELECT * FROM prizes ORDER BY position').all()
  return NextResponse.json({ prizes })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = getDb()
  const { prizes } = await req.json() as { prizes: Array<{ position: number; description: string; amount: string }> }

  const upsert = db.prepare(
    'INSERT OR REPLACE INTO prizes (position, description, amount) VALUES (?, ?, ?)'
  )
  const tx = db.transaction(() => {
    for (const p of prizes) upsert.run(p.position, p.description, p.amount)
  })
  tx()

  return NextResponse.json({ ok: true })
}
