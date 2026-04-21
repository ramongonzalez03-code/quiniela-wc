'use client'
import { useState, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import { Team, Group } from '@/lib/wc2026-data'

interface Match { id: number; group_name: string; team1: string; team2: string; date: string; time: string; venue: string }
interface KnockoutRound { id: string; name: string; slots: number }

interface Props {
  userName: string
  locked: boolean
  matches: Match[]
  groups: Group[]
  teams: Team[]
  knockoutRounds: KnockoutRound[]
  initialPreds: Record<number, { s1: number; s2: number }>
  initialGroupPicks: Record<string, string[]>
  initialBracket: Record<string, string[]>
}

function getTeamInfo(teams: Team[], id: string) {
  return teams.find(t => t.id === id) ?? { id, name: id.toUpperCase(), flag: '🏳️' }
}

export default function PredictionsClient({ userName, locked, matches, groups, teams, knockoutRounds, initialPreds, initialGroupPicks, initialBracket }: Props) {
  const [tab, setTab] = useState<'matches' | 'groups' | 'bracket'>('matches')
  const [preds, setPreds] = useState<Record<number, { s1: number; s2: number }>>(initialPreds)
  const [groupPicks, setGroupPicks] = useState<Record<string, string[]>>(initialGroupPicks)
  const [bracket, setBracket] = useState<Record<string, string[]>>(initialBracket)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const flash = (key: string) => {
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  async function saveMatch(matchId: number, s1: number, s2: number) {
    if (locked) return
    setSaving(`m${matchId}`)
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'match', data: { match_id: matchId, s1, s2 } }),
    })
    setSaving(null)
    flash(`m${matchId}`)
  }

  async function saveGroupPick(groupId: string, positions: string[]) {
    if (locked) return
    setSaving(`g${groupId}`)
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'group', data: { group_name: groupId, positions } }),
    })
    setSaving(null)
    flash(`g${groupId}`)
  }

  async function saveBracket(round: string, teamsList: string[]) {
    if (locked) return
    setSaving(`b${round}`)
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'bracket', data: { round, teams: teamsList } }),
    })
    setSaving(null)
    flash(`b${round}`)
  }

  const groupedMatches = groups.map(g => ({
    group: g,
    matches: matches.filter(m => m.group_name === g.id),
  }))

  return (
    <div className="min-h-screen">
      <NavBar userName={userName} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Mis Predicciones</h1>
          {locked && (
            <span className="bg-red-900 text-red-200 text-xs font-bold px-3 py-1 rounded-full">
              🔒 CERRADAS
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-field-dark rounded-xl p-1">
          {([['matches', '⚽ Partidos'], ['groups', '📊 Posiciones'], ['bracket', '🏆 Eliminatoria']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${tab === id ? 'tab-active' : 'tab-inactive'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* MATCHES TAB */}
        {tab === 'matches' && (
          <div className="space-y-6">
            {groupedMatches.map(({ group, matches: gm }) => (
              <div key={group.id} className="card">
                <h3 className="font-bold text-gold mb-3">{group.name}</h3>
                <div className="space-y-3">
                  {gm.map(match => {
                    const t1 = getTeamInfo(teams, match.team1)
                    const t2 = getTeamInfo(teams, match.team2)
                    const pred = preds[match.id]
                    const isSaving = saving === `m${match.id}`
                    const isSaved = saved === `m${match.id}`

                    return (
                      <div key={match.id} className="flex items-center gap-3 bg-field-dark rounded-lg p-3">
                        <div className="flex-1 text-right">
                          <span className="font-semibold text-sm">{t1.flag} {t1.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max="20" disabled={locked}
                            value={pred?.s1 ?? ''}
                            onChange={e => {
                              const v = Number(e.target.value)
                              const newPred = { s1: v, s2: pred?.s2 ?? 0 }
                              setPreds(p => ({ ...p, [match.id]: newPred }))
                            }}
                            onBlur={e => {
                              if (pred !== undefined) saveMatch(match.id, pred.s1, pred.s2)
                            }}
                            className="score-input"
                            placeholder="0"
                          />
                          <span className="text-gray-500 font-bold">-</span>
                          <input type="number" min="0" max="20" disabled={locked}
                            value={pred?.s2 ?? ''}
                            onChange={e => {
                              const v = Number(e.target.value)
                              const newPred = { s1: pred?.s1 ?? 0, s2: v }
                              setPreds(p => ({ ...p, [match.id]: newPred }))
                            }}
                            onBlur={() => {
                              if (pred !== undefined) saveMatch(match.id, pred.s1, pred.s2)
                            }}
                            className="score-input"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-sm">{t2.flag} {t2.name}</span>
                        </div>
                        <div className="w-6 text-center text-xs">
                          {isSaving ? '⏳' : isSaved ? '✅' : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">Guarda automáticamente al salir del campo</p>
              </div>
            ))}
          </div>
        )}

        {/* GROUPS TAB */}
        {tab === 'groups' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map(group => {
              const picks = groupPicks[group.id] ?? ['', '', '', '']
              const isSaving = saving === `g${group.id}`
              const isSaved = saved === `g${group.id}`

              return (
                <div key={group.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gold">{group.name}</h3>
                    <span className="text-xs">{isSaving ? '⏳ Guardando' : isSaved ? '✅ Guardado' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {(['1°', '2°', '3°', '4°'] as const).map((pos, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gold w-6">{pos}</span>
                        <select
                          disabled={locked}
                          value={picks[i] ?? ''}
                          onChange={e => {
                            const newPicks = [...picks]
                            newPicks[i] = e.target.value
                            setGroupPicks(p => ({ ...p, [group.id]: newPicks }))
                            saveGroupPick(group.id, newPicks)
                          }}
                          className="flex-1 bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                        >
                          <option value="">-- Selecciona --</option>
                          {group.teams.map(tid => {
                            const t = getTeamInfo(teams, tid)
                            const alreadyPicked = picks.some((p, pi) => p === tid && pi !== i)
                            return (
                              <option key={tid} value={tid} disabled={alreadyPicked}>
                                {t.flag} {t.name}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* BRACKET TAB */}
        {tab === 'bracket' && (
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">Selecciona los equipos que crees que avanzarán en cada ronda.</p>
            {knockoutRounds.map(round => {
              const allTeams = teams
              const picked = bracket[round.id] ?? []
              const isSaving = saving === `b${round.id}`
              const isSaved = saved === `b${round.id}`

              return (
                <div key={round.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gold">{round.name}</h3>
                      <p className="text-xs text-gray-400">
                        {round.id === 'champion' ? 'Elige 1 equipo' : `Elige ${round.slots} equipos`}
                      </p>
                    </div>
                    <span className="text-xs">{isSaving ? '⏳' : isSaved ? '✅' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {allTeams.map(team => {
                      const isSelected = picked.includes(team.id)
                      const isDisabled = locked || (!isSelected && picked.length >= round.slots)
                      return (
                        <button
                          key={team.id}
                          disabled={isDisabled}
                          onClick={() => {
                            let newPicked: string[]
                            if (isSelected) {
                              newPicked = picked.filter(t => t !== team.id)
                            } else if (round.slots === 1) {
                              newPicked = [team.id]
                            } else {
                              newPicked = [...picked, team.id]
                            }
                            setBracket(b => ({ ...b, [round.id]: newPicked }))
                            saveBracket(round.id, newPicked)
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-sm font-medium transition-colors ${
                            isSelected
                              ? 'border-gold bg-gold text-field-dark'
                              : 'border-field-light bg-field-dark text-gray-300 hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed'
                          }`}
                        >
                          <span>{team.flag}</span>
                          <span className="truncate text-xs">{team.name}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Seleccionados: {picked.length}/{round.slots}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
