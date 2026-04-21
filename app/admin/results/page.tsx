import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { GROUPS, KNOCKOUT_ROUNDS, getTeam, TEAMS } from '@/lib/wc2026-data'
import ResultsClient from './ResultsClient'

export default async function ResultsPage() {
  const session = await getSession()
  if (!session || !session.is_admin) redirect('/admin')

  const db = getDb()
  const matches = db.prepare(
    "SELECT * FROM matches WHERE phase = 'group' ORDER BY date, time"
  ).all() as Array<{ id: number; group_name: string; team1: string; team2: string; date: string; time: string; venue: string; score1: number | null; score2: number | null; status: string }>

  const bracketResults = db.prepare(
    'SELECT round, teams FROM bracket_picks WHERE user_id = -1'
  ).all() as Array<{ round: string; teams: string }>

  const bracketData = Object.fromEntries(bracketResults.map(r => [r.round, JSON.parse(r.teams) as string[]]))

  return (
    <ResultsClient
      matches={matches}
      groups={GROUPS}
      teams={TEAMS}
      knockoutRounds={KNOCKOUT_ROUNDS}
      initialBracketResults={bracketData}
    />
  )
}
