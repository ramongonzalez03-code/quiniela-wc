import { getDb } from './db'
import { GROUPS } from './wc2026-data'

export interface StandingTeam {
  id: string
  pts: number
  gf: number
  ga: number
  gd: number
  played: number
}

export function calcGroupStandings(groupId: string): StandingTeam[] {
  const db = getDb()
  const group = GROUPS.find(g => g.id === groupId)
  if (!group) return []

  const matches = db.prepare(
    "SELECT * FROM matches WHERE group_name = ? AND status = 'finished'"
  ).all(groupId) as Array<{ team1: string; team2: string; score1: number; score2: number }>

  const pts: Record<string, StandingTeam> = {}
  for (const t of group.teams) pts[t] = { id: t, pts: 0, gf: 0, ga: 0, gd: 0, played: 0 }

  for (const m of matches) {
    pts[m.team1].played++; pts[m.team2].played++
    pts[m.team1].gf += m.score1; pts[m.team1].ga += m.score2
    pts[m.team2].gf += m.score2; pts[m.team2].ga += m.score1
    if (m.score1 > m.score2) pts[m.team1].pts += 3
    else if (m.score1 === m.score2) { pts[m.team1].pts++; pts[m.team2].pts++ }
    else pts[m.team2].pts += 3
  }

  for (const t of Object.values(pts)) t.gd = t.gf - t.ga

  return group.teams.slice().map(id => pts[id]).sort((a, b) =>
    b.pts !== a.pts ? b.pts - a.pts :
    b.gd !== a.gd ? b.gd - a.gd :
    b.gf - a.gf
  )
}

export interface GroupAdvancement {
  groupId: string
  first: string | null
  second: string | null
  third: string | null   // might advance as best 3rd
  complete: boolean      // all 3 matchdays played
}

export function getGroupAdvancements(): GroupAdvancement[] {
  const db = getDb()
  return GROUPS.map(g => {
    const matchCount = (db.prepare(
      "SELECT COUNT(*) as c FROM matches WHERE group_name = ? AND status = 'finished'"
    ).get(g.id) as { c: number }).c

    const standings = calcGroupStandings(g.id)
    const complete = matchCount >= 6

    return {
      groupId: g.id,
      first: standings[0]?.id ?? null,
      second: standings[1]?.id ?? null,
      third: standings[2]?.id ?? null,
      complete,
    }
  })
}

// Returns all teams that have clinched qualification (top 2 from completed groups)
// plus best 3rd-place teams once all groups are done
export function getQualifiedTeams(): { teamId: string; from: string; position: number }[] {
  const advancements = getGroupAdvancements()
  const qualified: { teamId: string; from: string; position: number }[] = []

  for (const a of advancements) {
    if (!a.complete) continue
    if (a.first) qualified.push({ teamId: a.first, from: `Grupo ${a.groupId}`, position: 1 })
    if (a.second) qualified.push({ teamId: a.second, from: `Grupo ${a.groupId}`, position: 2 })
  }

  // Add best 8 third-place teams if all groups complete
  const allComplete = advancements.every(a => a.complete)
  if (allComplete) {
    const thirds = advancements
      .filter(a => a.third)
      .map(a => {
        const s = calcGroupStandings(a.groupId)
        return { teamId: a.third!, from: `Grupo ${a.groupId} (3°)`, position: 3, ...s[2] }
      })
      .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf)
      .slice(0, 8)

    for (const t of thirds) {
      qualified.push({ teamId: t.teamId, from: t.from, position: 3 })
    }
  }

  return qualified
}

// Pairs knockout matches into bracket structure: [match1, match2] → next round match
export interface BracketMatch {
  id: number
  phase: string
  team1: string
  team2: string
  score1: number | null
  score2: number | null
  status: string
  winner: string | null
  // bracket tree position
  bracketIndex: number
  children: [number, number] | null  // indices of feeding matches
}

export function buildBracketTree(matches: Array<{ id: number; phase: string; team1: string; team2: string; score1: number | null; score2: number | null; status: string }>): BracketMatch[] {
  const PHASE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final', '3rd']

  return matches.map((m, i) => ({
    ...m,
    winner: m.score1 !== null && m.score2 !== null
      ? m.score1 > m.score2 ? m.team1 : m.score2 > m.score1 ? m.team2 : null
      : null,
    bracketIndex: i,
    children: null,
  }))
}
