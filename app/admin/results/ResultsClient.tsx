'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Team, Group } from '@/lib/wc2026-data'

interface Match { id: number; group_name: string; team1: string; team2: string; date: string; time: string; venue: string; score1: number | null; score2: number | null; status: string }
interface KnockoutRound { id: string; name: string; slots: number }

function getTeamInfo(teams: Team[], id: string) {
  return teams.find(t => t.id === id) ?? { id, name: id.toUpperCase(), flag: '🏳️' }
}

export default function ResultsClient({ matches, groups, teams, knockoutRounds, initialBracketResults }: {
  matches: Match[]
  groups: Group[]
  teams: Team[]
  knockoutRounds: KnockoutRound[]
  initialBracketResults: Record<string, string[]>
}) {
  const [tab, setTab] = useState<'group' | 'bracket'>('group')
  const [scores, setScores] = useState<Record<number, { s1: string; s2: string }>>(
    Object.fromEntries(matches.map(m => [m.id, { s1: m.score1 !== null ? String(m.score1) : '', s2: m.score2 !== null ? String(m.score2) : '' }]))
  )
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [bracketResults, setBracketResults] = useState(initialBracketResults)
  const [savingBracket, setSavingBracket] = useState<string | null>(null)
  const [savedBracket, setSavedBracket] = useState<string | null>(null)

  async function saveResult(matchId: number) {
    const sc = scores[matchId]
    if (sc.s1 === '' || sc.s2 === '') return
    setSaving(matchId)
    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, score1: Number(sc.s1), score2: Number(sc.s2) }),
    })
    setSaving(null)
    setSaved(matchId)
    setTimeout(() => setSaved(null), 2000)
  }

  async function saveBracketRound(round: string, teamsList: string[]) {
    setSavingBracket(round)
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_bracket_result', round, teams: teamsList }),
    })
    setSavingBracket(null)
    setSavedBracket(round)
    setTimeout(() => setSavedBracket(null), 2000)
  }

  const groupedMatches = groups.map(g => ({
    group: g,
    matches: matches.filter(m => m.group_name === g.id),
  }))

  return (
    <div className="min-h-screen">
      <nav className="bg-field-dark border-b border-field-light sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-gold hover:text-gold-light">← Admin</Link>
          <span className="font-black text-white">Ingresar Resultados</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-field-dark rounded-xl p-1">
          <button onClick={() => setTab('group')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'group' ? 'tab-active' : 'tab-inactive'}`}>
            ⚽ Fase de Grupos
          </button>
          <button onClick={() => setTab('bracket')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'bracket' ? 'tab-active' : 'tab-inactive'}`}>
            🏆 Eliminatoria
          </button>
        </div>

        {tab === 'group' && (
          <div className="space-y-6">
            {groupedMatches.map(({ group, matches: gm }) => (
              <div key={group.id} className="card">
                <h3 className="font-bold text-gold mb-3">{group.name}</h3>
                <div className="space-y-2">
                  {gm.map(match => {
                    const t1 = getTeamInfo(teams, match.team1)
                    const t2 = getTeamInfo(teams, match.team2)
                    const sc = scores[match.id]

                    return (
                      <div key={match.id} className={`flex items-center gap-3 rounded-lg p-3 ${match.status === 'finished' ? 'bg-green-900/20 border border-green-800/40' : 'bg-field-dark'}`}>
                        <div className="flex-1 text-right text-sm font-semibold">{t1.flag} {t1.name}</div>
                        <input type="number" min="0" max="20"
                          value={sc?.s1 ?? ''}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s1: e.target.value } }))}
                          className="score-input"
                          placeholder="0"
                        />
                        <span className="text-gray-500">-</span>
                        <input type="number" min="0" max="20"
                          value={sc?.s2 ?? ''}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s2: e.target.value } }))}
                          className="score-input"
                          placeholder="0"
                        />
                        <div className="flex-1 text-sm font-semibold">{t2.flag} {t2.name}</div>
                        <button onClick={() => saveResult(match.id)}
                          disabled={saving === match.id || sc?.s1 === '' || sc?.s2 === ''}
                          className="bg-field-mid border border-gold text-gold text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold hover:text-field-dark transition-colors disabled:opacity-40">
                          {saving === match.id ? '...' : saved === match.id ? '✅' : 'Guardar'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'bracket' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Selecciona los equipos que avanzaron en cada ronda.</p>
            {knockoutRounds.map(round => {
              const picked = bracketResults[round.id] ?? []
              return (
                <div key={round.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gold">{round.name}</h3>
                      <p className="text-xs text-gray-400">
                        {round.id === 'champion' ? 'El campeón' : `${round.slots} equipos`}
                      </p>
                    </div>
                    <span className="text-xs">
                      {savingBracket === round.id ? '⏳' : savedBracket === round.id ? '✅ Guardado' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {teams.map(team => {
                      const isSelected = picked.includes(team.id)
                      const isDisabled = !isSelected && picked.length >= round.slots
                      return (
                        <button key={team.id}
                          disabled={isDisabled}
                          onClick={() => {
                            let next: string[]
                            if (isSelected) next = picked.filter(t => t !== team.id)
                            else if (round.slots === 1) next = [team.id]
                            else next = [...picked, team.id]
                            setBracketResults(b => ({ ...b, [round.id]: next }))
                            saveBracketRound(round.id, next)
                          }}
                          className={`flex items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border-gold bg-gold text-field-dark'
                              : 'border-field-light bg-field-dark text-gray-300 hover:border-gold disabled:opacity-30'
                          }`}>
                          <span>{team.flag}</span>
                          <span className="truncate">{team.name.split(' ')[0]}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{picked.length}/{round.slots} seleccionados</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
