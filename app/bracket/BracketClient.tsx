'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import { getTeam } from '@/lib/wc2026-data'

interface KoMatch { id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }
interface Round { id: string; name: string; pts: number }
interface GroupStanding { group: { id: string; name: string }; standings: Array<{ id: string; pts: number }> }

interface Props {
  userName: string
  koMatches: KoMatch[]
  initialPreds: Record<number, { s1: number; s2: number }>
  rounds: Round[]
  groupStandings: GroupStanding[]
  locked: boolean
}

export default function BracketClient({ userName, koMatches, initialPreds, rounds, groupStandings, locked }: Props) {
  const [preds, setPreds] = useState(initialPreds)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [tab, setTab] = useState<'knockout' | 'groups'>('knockout')

  async function savePred(matchId: number, s1: number, s2: number) {
    setSaving(matchId)
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'match', data: { match_id: matchId, s1, s2 } }),
    })
    setSaving(null)
    setSaved(matchId)
    setTimeout(() => setSaved(null), 2000)
  }

  function pickWinner(match: KoMatch, winner: 'team1' | 'team2') {
    if (locked || match.status === 'finished') return
    const cur = preds[match.id]
    let s1 = cur?.s1 ?? 1
    let s2 = cur?.s2 ?? 0
    if (winner === 'team1') { if (s1 <= s2) { s1 = (s2 ?? 0) + 1 } }
    else { if (s2 <= s1) { s2 = (s1 ?? 0) + 1 } }
    const newPred = { s1, s2 }
    setPreds(p => ({ ...p, [match.id]: newPred }))
    savePred(match.id, newPred.s1, newPred.s2)
  }

  const roundsWithMatches = rounds.filter(r => koMatches.some(m => m.phase === r.id))

  return (
    <div className="min-h-screen">
      <NavBar userName={userName} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-white mb-6">Bracket</h1>

        <div className="flex gap-2 mb-6 bg-field-dark rounded-xl p-1">
          <button onClick={() => setTab('knockout')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'knockout' ? 'tab-active' : 'tab-inactive'}`}>
            🏆 Eliminatoria
          </button>
          <button onClick={() => setTab('groups')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'groups' ? 'tab-active' : 'tab-inactive'}`}>
            📊 Posiciones de Grupo
          </button>
        </div>

        {tab === 'knockout' && (
          <>
            {roundsWithMatches.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-3">⏳</div>
                <p className="text-white font-bold text-lg">La eliminatoria aún no ha comenzado</p>
                <p className="text-gray-400 text-sm mt-2">Los cruces aparecerán aquí cuando el Admin los agregue</p>
              </div>
            ) : (
              <div className="space-y-8">
                {roundsWithMatches.map(round => {
                  const matches = koMatches.filter(m => m.phase === round.id)
                  return (
                    <div key={round.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-lg font-black text-gold">{round.name}</h2>
                        <span className="bg-gold/20 text-gold text-xs font-bold px-2 py-0.5 rounded-full">
                          {round.pts} pts por acierto
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {matches.map(match => {
                          const t1 = getTeam(match.team1)
                          const t2 = getTeam(match.team2)
                          const pred = preds[match.id]
                          const predWinner = pred ? (pred.s1 > pred.s2 ? 'team1' : pred.s1 < pred.s2 ? 'team2' : null) : null
                          const finished = match.status === 'finished'
                          const realWinner = finished && match.score1 !== null && match.score2 !== null
                            ? (match.score1 > match.score2 ? 'team1' : 'team2')
                            : null
                          const correct = finished && realWinner && predWinner === realWinner

                          return (
                            <div key={match.id} className={`card border-2 ${correct ? 'border-green-500' : finished && predWinner && predWinner !== realWinner ? 'border-red-800' : 'border-field-light'}`}>
                              {/* Result badge */}
                              {finished && (
                                <div className="flex justify-center mb-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${correct ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {correct ? '✅ Acertaste' : '❌ Fallaste'} · {match.score1}-{match.score2}
                                  </span>
                                </div>
                              )}

                              {/* Teams */}
                              <div className="space-y-2">
                                {/* Team 1 */}
                                <button
                                  disabled={locked || finished}
                                  onClick={() => pickWinner(match, 'team1')}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    predWinner === 'team1'
                                      ? 'border-gold bg-gold/10 text-white'
                                      : 'border-field-light bg-field-dark text-gray-300 hover:border-gold/50'
                                  } ${finished ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  <span className="text-2xl">{t1.flag}</span>
                                  <span className="font-bold flex-1 text-left">{t1.name}</span>
                                  {predWinner === 'team1' && <span className="text-gold text-xs font-bold">Tu pick ⭐</span>}
                                  {finished && realWinner === 'team1' && <span className="text-green-400 text-xs font-bold">Ganó ✓</span>}
                                </button>

                                <div className="text-center text-gray-500 text-xs font-bold">VS</div>

                                {/* Team 2 */}
                                <button
                                  disabled={locked || finished}
                                  onClick={() => pickWinner(match, 'team2')}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    predWinner === 'team2'
                                      ? 'border-gold bg-gold/10 text-white'
                                      : 'border-field-light bg-field-dark text-gray-300 hover:border-gold/50'
                                  } ${finished ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  <span className="text-2xl">{t2.flag}</span>
                                  <span className="font-bold flex-1 text-left">{t2.name}</span>
                                  {predWinner === 'team2' && <span className="text-gold text-xs font-bold">Tu pick ⭐</span>}
                                  {finished && realWinner === 'team2' && <span className="text-green-400 text-xs font-bold">Ganó ✓</span>}
                                </button>
                              </div>

                              {/* Score prediction (bonus) */}
                              {predWinner && !finished && (
                                <div className="mt-3 pt-3 border-t border-field-light">
                                  <p className="text-xs text-gray-500 mb-2 text-center">Marcador exacto (+{2} pts bonus)</p>
                                  <div className="flex items-center justify-center gap-2">
                                    <input type="number" min="0" max="20"
                                      value={pred?.s1 ?? ''}
                                      onChange={e => setPreds(p => ({ ...p, [match.id]: { ...p[match.id], s1: Number(e.target.value) } }))}
                                      onBlur={() => pred && savePred(match.id, pred.s1, pred.s2)}
                                      className="score-input w-12"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input type="number" min="0" max="20"
                                      value={pred?.s2 ?? ''}
                                      onChange={e => setPreds(p => ({ ...p, [match.id]: { ...p[match.id], s2: Number(e.target.value) } }))}
                                      onBlur={() => pred && savePred(match.id, pred.s1, pred.s2)}
                                      className="score-input w-12"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="text-right text-xs text-gray-600 mt-2">
                                {saving === match.id ? '⏳' : saved === match.id ? '✅' : ''}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'groups' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        )}
      </div>
    </div>
  )
}
