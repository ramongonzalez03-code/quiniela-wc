import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { GROUPS, TEAMS, getTeam } from '@/lib/wc2026-data'
import NavBar from '@/components/NavBar'

export default async function BracketPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const db = getDb()

  // Get actual bracket results (user_id = -1 means admin-set actual results)
  const bracketResults = db.prepare(
    'SELECT round, teams FROM bracket_picks WHERE user_id = -1'
  ).all() as Array<{ round: string; teams: string }>

  const results = Object.fromEntries(bracketResults.map(r => [r.round, JSON.parse(r.teams) as string[]]))

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

  const rounds = [
    { id: 'r32', name: 'Octavos de Final' },
    { id: 'r16', name: 'Cuartos de Final' },
    { id: 'qf', name: 'Semifinales' },
    { id: 'sf_winner', name: 'Finalistas' },
    { id: 'champion', name: 'Campeón' },
  ]

  return (
    <div className="min-h-screen">
      <NavBar userName={session.name} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-white mb-6">Bracket</h1>

        {/* Group Standings */}
        <h2 className="text-lg font-bold text-gold mb-3">Posiciones de Grupo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {groupStandings.map(({ group, standings }) => (
            <div key={group.id} className="card">
              <h3 className="font-bold text-gold text-sm mb-2">{group.name}</h3>
              <ol className="space-y-1">
                {standings.map((t, i) => {
                  const team = getTeam(t.id)
                  return (
                    <li key={t.id} className={`flex items-center gap-2 text-sm ${i < 2 ? 'text-white' : i === 2 ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="w-4 text-xs text-gray-500">{i + 1}.</span>
                      <span>{team.flag}</span>
                      <span className="truncate">{team.name}</span>
                      <span className="ml-auto font-bold text-xs">{t.pts}p</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>

        {/* Knockout results */}
        <h2 className="text-lg font-bold text-gold mb-3">Eliminatoria</h2>
        {rounds.some(r => (results[r.id] ?? []).length > 0) ? (
          <div className="space-y-4">
            {rounds.map(round => {
              const teams = results[round.id] ?? []
              if (teams.length === 0) return null
              return (
                <div key={round.id} className="card">
                  <h3 className="font-bold text-gold mb-3">{round.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(tid => {
                      const team = getTeam(tid)
                      return (
                        <div key={tid} className="flex items-center gap-2 bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm font-semibold">
                          <span>{team.flag}</span>
                          <span>{team.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card text-center py-8 text-gray-400">
            <p>Los resultados de la eliminatoria aparecerán aquí</p>
            <p className="text-sm mt-1">cuando el Admin los ingrese</p>
          </div>
        )}
      </div>
    </div>
  )
}
