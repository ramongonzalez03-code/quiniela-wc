import { getDb, getGroupStandings } from './db'
import { GROUPS } from './wc2026-data'

export const POINTS = {
  EXACT_SCORE: 3,
  CORRECT_RESULT: 2,
  GROUP_1ST: 4,
  GROUP_2ND: 3,
  GROUP_3RD_ADV: 2,
  R32: 2,
  R16: 3,
  QF: 4,
  SF_WINNER: 5,
  CHAMPION: 8,
}

function getResult(s1: number, s2: number): 'home' | 'draw' | 'away' {
  if (s1 > s2) return 'home'
  if (s1 === s2) return 'draw'
  return 'away'
}

export function calcMatchPoints(
  predScore1: number, predScore2: number,
  realScore1: number, realScore2: number
): number {
  if (predScore1 === realScore1 && predScore2 === realScore2) return POINTS.EXACT_SCORE
  if (getResult(predScore1, predScore2) === getResult(realScore1, realScore2)) return POINTS.CORRECT_RESULT
  return 0
}

export function calcUserPoints(userId: number): number {
  const db = getDb()
  let total = 0

  // Match predictions
  const preds = db.prepare(`
    SELECT p.pred_score1, p.pred_score2, m.score1, m.score2
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ? AND m.status = 'finished' AND m.phase = 'group'
  `).all(userId) as Array<{ pred_score1: number; pred_score2: number; score1: number; score2: number }>

  for (const p of preds) {
    total += calcMatchPoints(p.pred_score1, p.pred_score2, p.score1, p.score2)
  }

  // Group standings predictions
  for (const group of GROUPS) {
    const pick = db.prepare(
      'SELECT pos1, pos2, pos3, pos4 FROM group_picks WHERE user_id = ? AND group_name = ?'
    ).get(userId, group.id) as { pos1: string; pos2: string; pos3: string; pos4: string } | undefined

    if (!pick) continue

    const actual = getGroupStandings(group.id)
    if (actual.length === 0) continue

    if (actual[0] === pick.pos1) total += POINTS.GROUP_1ST
    if (actual[1] === pick.pos2) total += POINTS.GROUP_2ND
    if (actual[2] === pick.pos3) total += POINTS.GROUP_3RD_ADV
  }

  // Bracket picks
  const bracketRounds: Array<{ round: string; points: number }> = [
    { round: 'r32', points: POINTS.R32 },
    { round: 'r16', points: POINTS.R16 },
    { round: 'qf', points: POINTS.QF },
    { round: 'sf_winner', points: POINTS.SF_WINNER },
    { round: 'champion', points: POINTS.CHAMPION },
  ]

  for (const { round, points } of bracketRounds) {
    const pick = db.prepare(
      'SELECT teams FROM bracket_picks WHERE user_id = ? AND round = ?'
    ).get(userId, round) as { teams: string } | undefined
    if (!pick) continue

    const actual = db.prepare(
      'SELECT teams FROM bracket_picks WHERE user_id = -1 AND round = ?'
    ).get(round) as { teams: string } | undefined
    if (!actual) continue

    const pickedTeams: string[] = JSON.parse(pick.teams)
    const actualTeams: string[] = JSON.parse(actual.teams)

    for (const t of pickedTeams) {
      if (actualTeams.includes(t)) total += points
    }
  }

  return total
}

export function getRanking(): Array<{ id: number; name: string; points: number; rank: number }> {
  const db = getDb()
  const users = db.prepare('SELECT id, name FROM users WHERE is_admin = 0').all() as Array<{ id: number; name: string }>

  const ranked = users
    .map(u => ({ ...u, points: calcUserPoints(u.id) }))
    .sort((a, b) => b.points - a.points)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  return ranked
}
