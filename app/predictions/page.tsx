import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb, isPredictionsLocked } from '@/lib/db'
import { GROUPS, TEAMS, KNOCKOUT_ROUNDS, getTeam } from '@/lib/wc2026-data'
import PredictionsClient from './PredictionsClient'

export default async function PredictionsPage() {
  const session = await getSession()
  if (!session) redirect('/')
  if (session.is_admin) redirect('/admin')

  const db = getDb()
  const locked = isPredictionsLocked()

  const matches = db.prepare(
    "SELECT * FROM matches WHERE phase = 'group' ORDER BY date, time"
  ).all() as Array<{ id: number; group_name: string; team1: string; team2: string; date: string; time: string; venue: string; score1: number | null; score2: number | null; status: string }>

  const koMatches = db.prepare(
    "SELECT * FROM matches WHERE phase != 'group' ORDER BY phase, id"
  ).all() as Array<{ id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }>

  const existingPreds = db.prepare(
    'SELECT match_id, pred_score1, pred_score2 FROM predictions WHERE user_id = ?'
  ).all(session.id) as Array<{ match_id: number; pred_score1: number; pred_score2: number }>

  const existingGroupPicks = db.prepare(
    'SELECT group_name, pos1, pos2, pos3, pos4 FROM group_picks WHERE user_id = ?'
  ).all(session.id) as Array<{ group_name: string; pos1: string; pos2: string; pos3: string; pos4: string }>

  const existingBracket = db.prepare(
    'SELECT round, teams FROM bracket_picks WHERE user_id = ?'
  ).all(session.id) as Array<{ round: string; teams: string }>

  return (
    <PredictionsClient
      userName={session.name}
      locked={locked}
      matches={matches}
      koMatches={koMatches}
      groups={GROUPS}
      teams={TEAMS}
      knockoutRounds={KNOCKOUT_ROUNDS}
      initialPreds={Object.fromEntries(existingPreds.map(p => [p.match_id, { s1: p.pred_score1, s2: p.pred_score2 }]))}
      initialGroupPicks={Object.fromEntries(existingGroupPicks.map(p => [p.group_name, [p.pos1, p.pos2, p.pos3, p.pos4]]))}
      initialBracket={Object.fromEntries(existingBracket.map(p => [p.round, JSON.parse(p.teams)]))}
    />
  )
}
