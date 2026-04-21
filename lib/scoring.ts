import { getDb, getGroupStandings } from './db'
import { GROUPS } from './wc2026-data'

export const POINTS = {
  // Group stage
  EXACT_SCORE: 3,
  CORRECT_RESULT: 2,
  GROUP_1ST: 4,
  GROUP_2ND: 3,
  GROUP_3RD_ADV: 2,
  // Knockout - correct winner
  KO_R32: 4,
  KO_R16: 5,
  KO_QF: 6,
  KO_SF: 7,
  KO_3RD: 7,
  KO_FINAL: 10,
  // Knockout bonus for exact score
  KO_EXACT_BONUS: 2,
}

export const KO_ROUND_POINTS: Record<string, number> = {
  r32: POINTS.KO_R32,
  r16: POINTS.KO_R16,
  qf: POINTS.KO_QF,
  sf: POINTS.KO_SF,
  '3rd': POINTS.KO_3RD,
  final: POINTS.KO_FINAL,
}

function getWinner(s1: number, s2: number): 'team1' | 'team2' | null {
  if (s1 > s2) return 'team1'
  if (s2 > s1) return 'team2'
  return null
}

export function calcMatchPoints(
  predScore1: number, predScore2: number,
  realScore1: number, realScore2: number
): number {
  if (predScore1 === realScore1 && predScore2 === realScore2) return POINTS.EXACT_SCORE
  const predResult = predScore1 > predScore2 ? 'home' : predScore1 === predScore2 ? 'draw' : 'away'
  const realResult = realScore1 > realScore2 ? 'home' : realScore1 === realScore2 ? 'draw' : 'away'
  if (predResult === realResult) return POINTS.CORRECT_RESULT
  return 0
}

export function calcKnockoutMatchPoints(
  predScore1: number, predScore2: number,
  realScore1: number, realScore2: number,
  phase: string
): number {
  const roundPts = KO_ROUND_POINTS[phase] ?? 4
  const predWinner = getWinner(predScore1, predScore2)
  const realWinner = getWinner(realScore1, realScore2)
  if (!realWinner || !predWinner) return 0
  if (predWinner !== realWinner) return 0
  const exactBonus = predScore1 === realScore1 && predScore2 === realScore2 ? POINTS.KO_EXACT_BONUS : 0
  return roundPts + exactBonus
}

export function calcUserPoints(userId: number): number {
  const db = getDb()
  let total = 0

  // Group stage match predictions
  const groupPreds = db.prepare(`
    SELECT p.pred_score1, p.pred_score2, m.score1, m.score2
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ? AND m.status = 'finished' AND m.phase = 'group'
  `).all(userId) as Array<{ pred_score1: number; pred_score2: number; score1: number; score2: number }>

  for (const p of groupPreds) {
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

  // Knockout match predictions
  const koPreds = db.prepare(`
    SELECT p.pred_score1, p.pred_score2, m.score1, m.score2, m.phase
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ? AND m.status = 'finished' AND m.phase != 'group'
  `).all(userId) as Array<{ pred_score1: number; pred_score2: number; score1: number; score2: number; phase: string }>

  for (const p of koPreds) {
    total += calcKnockoutMatchPoints(p.pred_score1, p.pred_score2, p.score1, p.score2, p.phase)
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
