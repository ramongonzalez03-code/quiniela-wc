import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { GROUPS } from '@/lib/wc2026-data'
import ResultsClient from './ResultsClient'

export const dynamic = 'force-dynamic'

export default async function ResultsPage() {
  const session = await getSession()
  if (!session || !session.is_admin) redirect('/admin')

  const db = getDb()
  const matches = db.prepare(
    'SELECT * FROM matches ORDER BY phase, date, time'
  ).all() as Array<{ id: number; phase: string; group_name: string | null; team1: string; team2: string; date: string; time: string; venue: string; score1: number | null; score2: number | null; status: string }>

  return <ResultsClient matches={matches} groups={GROUPS} />
}
