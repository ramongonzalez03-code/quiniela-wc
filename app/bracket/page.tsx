import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { calcGroupStandings } from '@/lib/bracket-utils'
import { GROUPS } from '@/lib/wc2026-data'
import BracketClient from './BracketClient'

export const dynamic = 'force-dynamic'

export default async function BracketPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const db = getDb()

  const koMatches = db.prepare(
    "SELECT * FROM matches WHERE phase != 'group' ORDER BY phase, id"
  ).all() as Array<{ id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }>

  const userPreds = db.prepare(`
    SELECT p.match_id, p.pred_score1, p.pred_score2
    FROM predictions p JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ? AND m.phase != 'group'
  `).all(session.id) as Array<{ match_id: number; pred_score1: number; pred_score2: number }>

  const groupStandings = GROUPS.map(g => ({
    group: g,
    standings: calcGroupStandings(g.id),
    matchesPlayed: (db.prepare(
      "SELECT COUNT(*) as c FROM matches WHERE group_name = ? AND status = 'finished'"
    ).get(g.id) as { c: number }).c,
  }))

  return (
    <BracketClient
      userName={session.name}
      koMatches={koMatches}
      initialPreds={Object.fromEntries(userPreds.map(p => [p.match_id, { s1: p.pred_score1, s2: p.pred_score2 }]))}
      groupStandings={groupStandings}
    />
  )
}
