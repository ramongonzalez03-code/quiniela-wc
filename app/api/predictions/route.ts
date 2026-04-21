import { NextRequest, NextResponse } from 'next/server'
import { getDb, isPredictionsLocked } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = getDb()
  const matchPreds = db.prepare(
    'SELECT match_id, pred_score1, pred_score2 FROM predictions WHERE user_id = ?'
  ).all(session.id) as Array<{ match_id: number; pred_score1: number; pred_score2: number }>

  const groupPicks = db.prepare(
    'SELECT group_name, pos1, pos2, pos3, pos4 FROM group_picks WHERE user_id = ?'
  ).all(session.id) as Array<{ group_name: string; pos1: string; pos2: string; pos3: string; pos4: string }>

  const bracketPicks = db.prepare(
    'SELECT round, teams FROM bracket_picks WHERE user_id = ?'
  ).all(session.id) as Array<{ round: string; teams: string }>

  return NextResponse.json({
    matches: Object.fromEntries(matchPreds.map(p => [p.match_id, { s1: p.pred_score1, s2: p.pred_score2 }])),
    groups: Object.fromEntries(groupPicks.map(p => [p.group_name, [p.pos1, p.pos2, p.pos3, p.pos4]])),
    bracket: Object.fromEntries(bracketPicks.map(p => [p.round, JSON.parse(p.teams)])),
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (isPredictionsLocked()) return NextResponse.json({ error: 'Predicciones cerradas' }, { status: 403 })

  const db = getDb()
  const body = await req.json()
  const { type, data } = body

  if (type === 'match') {
    const { match_id, s1, s2 } = data
    db.prepare(
      'INSERT OR REPLACE INTO predictions (user_id, match_id, pred_score1, pred_score2) VALUES (?, ?, ?, ?)'
    ).run(session.id, match_id, s1, s2)
  } else if (type === 'group') {
    const { group_name, positions } = data
    db.prepare(
      'INSERT OR REPLACE INTO group_picks (user_id, group_name, pos1, pos2, pos3, pos4) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(session.id, group_name, positions[0], positions[1], positions[2], positions[3])
  } else if (type === 'bracket') {
    const { round, teams } = data
    db.prepare(
      'INSERT OR REPLACE INTO bracket_picks (user_id, round, teams) VALUES (?, ?, ?)'
    ).run(session.id, round, JSON.stringify(teams))
  }

  return NextResponse.json({ ok: true })
}
