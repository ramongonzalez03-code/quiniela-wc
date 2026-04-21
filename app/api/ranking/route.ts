import { NextResponse } from 'next/server'
import { getRanking } from '@/lib/scoring'
import { getDb } from '@/lib/db'

export async function GET() {
  const ranking = getRanking()
  const db = getDb()
  const prizes = db.prepare('SELECT position, description, amount FROM prizes ORDER BY position').all()
  return NextResponse.json({ ranking, prizes })
}
