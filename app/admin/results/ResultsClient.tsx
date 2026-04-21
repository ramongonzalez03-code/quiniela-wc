'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Team, Group, TEAMS } from '@/lib/wc2026-data'

interface Match { id: number; phase: string; group_name: string | null; team1: string; team2: string; date: string; time: string; venue: string; score1: number | null; score2: number | null; status: string }

const KO_ROUNDS = [
  { id: 'r32', name: 'Octavos de Final', pts: 4 },
  { id: 'r16', name: 'Cuartos de Final', pts: 5 },
  { id: 'qf', name: 'Semifinales', pts: 6 },
  { id: 'sf', name: 'Semifinales (otra llave)', pts: 7 },
  { id: '3rd', name: 'Tercer Lugar', pts: 7 },
  { id: 'final', name: 'Gran Final', pts: 10 },
]

function getTeamInfo(id: string) {
  return TEAMS.find(t => t.id === id) ?? { id, name: id.toUpperCase(), flag: '🏳️' }
}

export default function ResultsClient({ matches: initialMatches, groups }: {
  matches: Match[]
  groups: Group[]
}) {
  const [tab, setTab] = useState<'group' | 'knockout'>('group')
  const [allMatches, setAllMatches] = useState<Match[]>(initialMatches)
  const groupMatches = allMatches.filter(m => m.phase === 'group')
  const koMatches = allMatches.filter(m => m.phase !== 'group')

  const [scores, setScores] = useState<Record<number, { s1: string; s2: string }>>(
    Object.fromEntries(allMatches.map(m => [m.id, { s1: m.score1 !== null ? String(m.score1) : '', s2: m.score2 !== null ? String(m.score2) : '' }]))
  )
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  // New knockout match form
  const [newMatch, setNewMatch] = useState({ phase: 'r32', team1: '', team2: '', date: '', venue: '' })
  const [creating, setCreating] = useState(false)

  async function saveResult(matchId: number) {
    const sc = scores[matchId]
    if (sc.s1 === '' || sc.s2 === '') return
    setSaving(matchId)
    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, score1: Number(sc.s1), score2: Number(sc.s2) }),
    })
    setAllMatches(ms => ms.map(m => m.id === matchId ? { ...m, score1: Number(sc.s1), score2: Number(sc.s2), status: 'finished' } : m))
    setSaving(null)
    setSaved(matchId)
    setTimeout(() => setSaved(null), 2000)
  }

  async function createKoMatch() {
    if (!newMatch.team1 || !newMatch.team2 || newMatch.team1 === newMatch.team2) return
    setCreating(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_knockout_match', ...newMatch }),
    })
    const data = await res.json()
    if (data.ok) {
      const created: Match = {
        id: Number(data.id),
        phase: newMatch.phase,
        group_name: null,
        team1: newMatch.team1,
        team2: newMatch.team2,
        date: newMatch.date || '2026-07-01',
        time: '18:00',
        venue: newMatch.venue,
        score1: null,
        score2: null,
        status: 'pending',
      }
      setAllMatches(ms => [...ms, created])
      setScores(s => ({ ...s, [created.id]: { s1: '', s2: '' } }))
      setNewMatch(n => ({ ...n, team1: '', team2: '', date: '', venue: '' }))
    }
    setCreating(false)
  }

  async function deleteKoMatch(matchId: number) {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_knockout_match', match_id: matchId }),
    })
    setAllMatches(ms => ms.filter(m => m.id !== matchId))
  }

  const groupedMatches = groups.map(g => ({
    group: g,
    matches: groupMatches.filter(m => m.group_name === g.id),
  }))

  return (
    <div className="min-h-screen">
      <nav className="bg-field-dark border-b border-field-light sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-gold hover:text-gold-light font-semibold">← Admin</Link>
          <span className="font-black text-white">Resultados</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-field-dark rounded-xl p-1">
          <button onClick={() => setTab('group')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'group' ? 'tab-active' : 'tab-inactive'}`}>
            ⚽ Fase de Grupos
          </button>
          <button onClick={() => setTab('knockout')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'knockout' ? 'tab-active' : 'tab-inactive'}`}>
            🏆 Eliminatoria
          </button>
        </div>

        {/* GROUP STAGE */}
        {tab === 'group' && (
          <div className="space-y-6">
            {groupedMatches.map(({ group, matches: gm }) => (
              <div key={group.id} className="card">
                <h3 className="font-bold text-gold mb-3">{group.name}</h3>
                <div className="space-y-2">
                  {gm.map(match => {
                    const t1 = getTeamInfo(match.team1)
                    const t2 = getTeamInfo(match.team2)
                    const sc = scores[match.id] ?? { s1: '', s2: '' }
                    return (
                      <div key={match.id} className={`flex items-center gap-2 rounded-lg p-3 ${match.status === 'finished' ? 'bg-green-900/20 border border-green-800/30' : 'bg-field-dark'}`}>
                        <div className="flex-1 text-right text-sm font-semibold truncate">{t1.flag} {t1.name}</div>
                        <input type="number" min="0" max="20" value={sc.s1}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s1: e.target.value } }))}
                          className="score-input" placeholder="0" />
                        <span className="text-gray-500">-</span>
                        <input type="number" min="0" max="20" value={sc.s2}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s2: e.target.value } }))}
                          className="score-input" placeholder="0" />
                        <div className="flex-1 text-sm font-semibold truncate">{t2.flag} {t2.name}</div>
                        <button onClick={() => saveResult(match.id)}
                          disabled={saving === match.id || sc.s1 === '' || sc.s2 === ''}
                          className="bg-field-mid border border-gold text-gold text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold hover:text-field-dark transition-colors disabled:opacity-40 whitespace-nowrap">
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

        {/* KNOCKOUT */}
        {tab === 'knockout' && (
          <div className="space-y-6">
            {/* Create new match */}
            <div className="card border-gold/30">
              <h3 className="font-bold text-gold mb-4">Agregar partido de eliminatoria</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Ronda</label>
                  <select value={newMatch.phase}
                    onChange={e => setNewMatch(n => ({ ...n, phase: e.target.value }))}
                    className="w-full bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none">
                    {KO_ROUNDS.map(r => <option key={r.id} value={r.id}>{r.name} ({r.pts}pts)</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Fecha</label>
                  <input type="date" value={newMatch.date}
                    onChange={e => setNewMatch(n => ({ ...n, date: e.target.value }))}
                    className="w-full bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Equipo 1</label>
                  <select value={newMatch.team1}
                    onChange={e => setNewMatch(n => ({ ...n, team1: e.target.value }))}
                    className="w-full bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none">
                    <option value="">-- Selecciona --</option>
                    {TEAMS.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Equipo 2</label>
                  <select value={newMatch.team2}
                    onChange={e => setNewMatch(n => ({ ...n, team2: e.target.value }))}
                    className="w-full bg-field-dark border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none">
                    <option value="">-- Selecciona --</option>
                    {TEAMS.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={createKoMatch}
                disabled={creating || !newMatch.team1 || !newMatch.team2 || newMatch.team1 === newMatch.team2}
                className="btn-gold w-full">
                {creating ? 'Creando...' : '+ Agregar partido'}
              </button>
            </div>

            {/* Existing knockout matches grouped by round */}
            {KO_ROUNDS.filter(r => koMatches.some(m => m.phase === r.id)).map(round => (
              <div key={round.id} className="card">
                <h3 className="font-bold text-gold mb-3">{round.name} <span className="text-xs text-gray-400">({round.pts} pts)</span></h3>
                <div className="space-y-3">
                  {koMatches.filter(m => m.phase === round.id).map(match => {
                    const t1 = getTeamInfo(match.team1)
                    const t2 = getTeamInfo(match.team2)
                    const sc = scores[match.id] ?? { s1: '', s2: '' }
                    return (
                      <div key={match.id} className={`flex items-center gap-2 rounded-lg p-3 ${match.status === 'finished' ? 'bg-green-900/20 border border-green-800/30' : 'bg-field-dark'}`}>
                        <div className="flex-1 text-right text-sm font-semibold truncate">{t1.flag} {t1.name}</div>
                        <input type="number" min="0" max="20" value={sc.s1}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s1: e.target.value } }))}
                          className="score-input" placeholder="0" />
                        <span className="text-gray-500">-</span>
                        <input type="number" min="0" max="20" value={sc.s2}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], s2: e.target.value } }))}
                          className="score-input" placeholder="0" />
                        <div className="flex-1 text-sm font-semibold truncate">{t2.flag} {t2.name}</div>
                        <button onClick={() => saveResult(match.id)}
                          disabled={saving === match.id || sc.s1 === '' || sc.s2 === ''}
                          className="bg-field-mid border border-gold text-gold text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold hover:text-field-dark transition-colors disabled:opacity-40 whitespace-nowrap">
                          {saving === match.id ? '...' : saved === match.id ? '✅' : 'Guardar'}
                        </button>
                        {match.status !== 'finished' && (
                          <button onClick={() => deleteKoMatch(match.id)}
                            className="text-red-500 hover:text-red-400 text-xs px-2">✕</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {koMatches.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aún no has agregado partidos de eliminatoria
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
