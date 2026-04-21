import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { GROUPS, getTeam } from '@/lib/wc2026-data'
import BracketClient from './BracketClient'

export const dynamic = 'force-dynamic'

const KO_ROUNDS = [
  { id: 'r32', name: 'Octavos de Final', pts: 4 },
  { id: 'r16', name: 'Cuartos de Final', pts: 5 },
  { id: 'qf', name: 'Semifinales', pts: 6 },
  { id: 'sf', name: 'Semifinales', pts: 7 },
  { id: '3rd', name: 'Tercer Lugar', pts: 7 },
  { id: 'final', name: 'Gran Final', pts: 10 },
]

export default async function BracketPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const db = getDb()

  // Knockout matches
  const koMatches = db.prepare(
    "SELECT * FROM matches WHERE phase != 'group' ORDER BY phase, id"
  ).all() as Array<{ id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }>

  // User's knockout predictions
  const userPreds = db.prepare(`
    SELECT p.match_id, p.pred_score1, p.pred_score2
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ? AND m.phase != 'group'
  `).all(session.id) as Array<{ match_id: number; pred_score1: number; pred_score2: number }>

  const predsMap = Object.fromEntries(userPreds.map(p => [p.match_id, { s1: p.pred_score1, s2: p.pred_score2 }]))

  // Group standings
  const groupStandings = GROUPS.map(g => {
    const matches = db.prepare(
      "SELECT * FROM matches WHERE group_name = ? AND status = 'finished'"
    ).all(g.id) as Array<{ team1: string; team2: string; score1: number; score2: number }>
    const pts: Record<string, { pts: number; gf: number; ga: number }> = {}
    for (const t of g.teams) pts[t] = { pts: 0, gf: 0, ga: 0 }
    for (const m of matches) {
      if (m.score1 > m.score2) pts[m.team1].pts += 3
      else if (m.score1 === m.score2) { pts[m.team1].pts += 1; pts[m.team2].pts += 1 }
      else pts[m.team2].pts += 3
      pts[m.team1].gf += m.score1; pts[m.team1].ga += m.score2
      pts[m.team2].gf += m.score2; pts[m.team2].ga += m.score1
    }
    const sorted = g.teams.slice().sort((a, b) => {
      const pa = pts[a], pb = pts[b]
      if (pb.pts !== pa.pts) return pb.pts - pa.pts
      return (pb.gf - pb.ga) - (pa.gf - pa.ga)
    })
    return { group: g, standings: sorted.map(id => ({ id, ...pts[id] })) }
  })

  return (
    <BracketClient
      userName={session.name}
      koMatches={koMatches}
      initialPreds={predsMap}
      rounds={KO_ROUNDS}
      groupStandings={groupStandings}
      locked={false}
    />
  )
}
