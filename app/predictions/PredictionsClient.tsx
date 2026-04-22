'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import { Team, Group } from '@/lib/wc2026-data'

interface Match { id: number; group_name: string; team1: string; team2: string; date: string; time: string; venue: string }
interface KoMatch { id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }

interface Props {
  userName: string
  locked: boolean
  matches: Match[]
  koMatches: KoMatch[]
  groups: Group[]
  teams: Team[]
  knockoutRounds: { id: string; name: string; slots: number }[]
  initialPreds: Record<number, { s1: number; s2: number }>
  initialGroupPicks: Record<string, string[]>
  initialBracket: Record<string, string[]>
}

function gt(teams: Team[], id: string) {
  return teams.find(t => t.id === id) ?? { id, name: id.toUpperCase(), flag: '🏳️' }
}

function computeGroupStandings(groupTeams: string[], groupMatches: Match[], preds: Record<number, { s1: number; s2: number }>) {
  const s: Record<string, { pts: number; gf: number; ga: number; played: number }> = {}
  for (const t of groupTeams) s[t] = { pts: 0, gf: 0, ga: 0, played: 0 }
  for (const m of groupMatches) {
    const p = preds[m.id]
    if (!p) continue
    s[m.team1].played++; s[m.team2].played++
    s[m.team1].gf += p.s1; s[m.team1].ga += p.s2
    s[m.team2].gf += p.s2; s[m.team2].ga += p.s1
    if (p.s1 > p.s2) s[m.team1].pts += 3
    else if (p.s1 === p.s2) { s[m.team1].pts++; s[m.team2].pts++ }
    else s[m.team2].pts += 3
  }
  return groupTeams
    .map(id => ({ id, ...s[id], gd: s[id].gf - s[id].ga }))
    .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf)
}

// Official WC 2026 R32 bracket (Matches 73–88)
// Slot codes: '1A'=1st Group A, '2B'=2nd Group B, '3_1A'=3rd assigned to 1A slot
const R32_SLOTS: [string, string][] = [
  ['2A', '2B'],   // Match 73 — fixed
  ['1E', '3_1E'], // Match 74 — 1E vs assigned 3rd
  ['1F', '2C'],   // Match 75 — fixed
  ['1C', '2F'],   // Match 76 — fixed
  ['1I', '3_1I'], // Match 77 — 1I vs assigned 3rd
  ['2E', '2I'],   // Match 78 — fixed
  ['1A', '3_1A'], // Match 79 — 1A vs assigned 3rd
  ['1L', '3_1L'], // Match 80 — 1L vs assigned 3rd
  ['1D', '3_1D'], // Match 81 — 1D vs assigned 3rd
  ['1G', '3_1G'], // Match 82 — 1G vs assigned 3rd
  ['2K', '2L'],   // Match 83 — fixed
  ['1H', '2J'],   // Match 84 — fixed
  ['1B', '3_1B'], // Match 85 — 1B vs assigned 3rd
  ['1J', '2H'],   // Match 86 — fixed
  ['1K', '3_1K'], // Match 87 — 1K vs assigned 3rd
  ['2D', '2G'],   // Match 88 — fixed
]

// Official allowed groups for each "1st vs 3rd" slot
// A 3rd-place team can only face the 1st if it came from one of these groups
const THIRD_SLOTS: { host: string; allowed: string[] }[] = [
  { host: '1A', allowed: ['C','E','F','H','I'] },
  { host: '1B', allowed: ['E','F','G','I','J'] },
  { host: '1D', allowed: ['B','E','F','I','J'] },
  { host: '1E', allowed: ['A','B','C','D','F'] },
  { host: '1G', allowed: ['A','E','H','I','J'] },
  { host: '1I', allowed: ['C','D','F','G','H'] },
  { host: '1K', allowed: ['D','E','I','J','L'] },
  { host: '1L', allowed: ['E','H','I','J','K'] },
]

// Bipartite matching: assign each of the 8 best thirds to exactly one host slot
function assignThirds(thirds: { id: string; group: string }[]): Record<string, string | null> {
  const result: Record<string, string | null> = {}
  for (const s of THIRD_SLOTS) result[s.host] = null

  function backtrack(thirdsLeft: { id: string; group: string }[], slotsLeft: typeof THIRD_SLOTS): boolean {
    if (slotsLeft.length === 0) return true
    const [slot, ...rest] = slotsLeft
    for (let i = 0; i < thirdsLeft.length; i++) {
      if (slot.allowed.includes(thirdsLeft[i].group)) {
        result[slot.host] = thirdsLeft[i].id
        if (backtrack(thirdsLeft.filter((_, j) => j !== i), rest)) return true
        result[slot.host] = null
      }
    }
    return false
  }

  backtrack(thirds, THIRD_SLOTS)
  return result
}

const R32_LABELS = [
  '2°A vs 2°B', '1°E vs Mej.3°', '1°F vs 2°C', '1°C vs 2°F',
  '1°I vs Mej.3°', '2°E vs 2°I', '1°A vs Mej.3°', '1°L vs Mej.3°',
  '1°D vs Mej.3°', '1°G vs Mej.3°', '2°K vs 2°L', '1°H vs 2°J',
  '1°B vs Mej.3°', '1°J vs 2°H', '1°K vs Mej.3°', '2°D vs 2°G',
]

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const
const ROUND_SIZES: Record<string, number> = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 }
const ROUND_LABELS: Record<string, string> = { r32: 'Octavos de Final', r16: 'Cuartos de Final', qf: 'Semifinales', sf: 'Final + 3°', final: 'Gran Final' }
const ROUND_PTS: Record<string, number> = { r32: 4, r16: 5, qf: 6, sf: 7, final: 10 }

export default function PredictionsClient({ userName, locked, matches, koMatches, groups, teams, initialPreds, initialBracket }: Props) {
  const [tab, setTab] = useState<'matches' | 'groups' | 'bracket'>('matches')
  const [preds, setPreds] = useState(initialPreds)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [bpicks, setBpicks] = useState<Record<string, string>>({})
  const bpicksInited = useRef(false)
  const prevTab = useRef(tab)

  const flash = (key: string) => { setSaved(key); setTimeout(() => setSaved(null), 1500) }

  async function saveMatch(matchId: number, s1: number, s2: number) {
    if (locked) return
    setSaving(`m${matchId}`)
    await fetch('/api/predictions', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'match', data: { match_id: matchId, s1, s2 } }) })
    setSaving(null); flash(`m${matchId}`)
  }

  // Computed standings per group from match predictions
  const allStandings = useMemo(() => {
    const out: Record<string, ReturnType<typeof computeGroupStandings>> = {}
    for (const g of groups) {
      out[g.id] = computeGroupStandings(g.teams, matches.filter(m => m.group_name === g.id), preds)
    }
    return out
  }, [preds, groups, matches])

  // Compute qualifiers: 1st, 2nd per group + best 8 thirds with proper slot assignment
  const qualifiers = useMemo(() => {
    const first: Record<string, string | null> = {}
    const second: Record<string, string | null> = {}
    const thirds: { id: string; pts: number; gd: number; gf: number; group: string }[] = []
    for (const g of groups) {
      const s = allStandings[g.id]
      first[g.id] = s[0]?.id ?? null
      second[g.id] = s[1]?.id ?? null
      if (s[2]) thirds.push({ ...s[2], group: g.id })
    }
    const best8 = [...thirds]
      .sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf)
      .slice(0, 8)
    // Bipartite matching: assign each 3rd to the correct 1st-place slot
    const thirdAssignment = assignThirds(best8.map(t => ({ id: t.id, group: t.group })))
    return { first, second, thirdAssignment }
  }, [allStandings, groups])

  function resolveSlot(slot: string): string | null {
    if (slot[0] === '1') return qualifiers.first[slot[1]] ?? null
    if (slot[0] === '2') return qualifiers.second[slot[1]] ?? null
    if (slot.startsWith('3_')) return qualifiers.thirdAssignment[slot.slice(2)] ?? null
    return null
  }

  const r32Teams = useMemo(
    () => R32_SLOTS.map(([s1, s2]) => [resolveSlot(s1), resolveSlot(s2)] as [string | null, string | null]),
    [qualifiers]
  )

  // Get match teams for any round
  function getMatchTeams(round: string, matchIdx: number): [string | null, string | null] {
    if (round === 'r32') return r32Teams[matchIdx] ?? [null, null]
    const prevRound = ROUND_ORDER[ROUND_ORDER.indexOf(round as typeof ROUND_ORDER[number]) - 1]
    return [bpicks[`${prevRound}_${matchIdx * 2}`] ?? null, bpicks[`${prevRound}_${matchIdx * 2 + 1}`] ?? null]
  }

  // Get the team that LOST a sf match (for 3rd place)
  function getSFLoser(sfIdx: number): string | null {
    const [t1, t2] = getMatchTeams('sf', sfIdx)
    const winner = bpicks[`sf_${sfIdx}`]
    if (!winner || !t1 || !t2) return null
    return winner === t1 ? t2 : t1
  }

  // Initialize bracket picks from saved data
  useEffect(() => {
    if (bpicksInited.current) return
    bpicksInited.current = true
    const init: Record<string, string> = {}

    const r32s = initialBracket['r32'] ?? []
    r32Teams.forEach(([t1, t2], i) => {
      if (t1 && r32s.includes(t1)) init[`r32_${i}`] = t1
      else if (t2 && r32s.includes(t2)) init[`r32_${i}`] = t2
    })

    const r16s = initialBracket['r16'] ?? []
    for (let i = 0; i < 8; i++) {
      const [t1, t2] = [init[`r32_${i * 2}`], init[`r32_${i * 2 + 1}`]]
      if (t1 && r16s.includes(t1)) init[`r16_${i}`] = t1
      else if (t2 && r16s.includes(t2)) init[`r16_${i}`] = t2
    }

    const qfs = initialBracket['qf'] ?? []
    for (let i = 0; i < 4; i++) {
      const [t1, t2] = [init[`r16_${i * 2}`], init[`r16_${i * 2 + 1}`]]
      if (t1 && qfs.includes(t1)) init[`qf_${i}`] = t1
      else if (t2 && qfs.includes(t2)) init[`qf_${i}`] = t2
    }

    const sfs = initialBracket['sf'] ?? []
    for (let i = 0; i < 2; i++) {
      const [t1, t2] = [init[`qf_${i * 2}`], init[`qf_${i * 2 + 1}`]]
      if (t1 && sfs.includes(t1)) init[`sf_${i}`] = t1
      else if (t2 && sfs.includes(t2)) init[`sf_${i}`] = t2
    }

    const finals = initialBracket['final'] ?? []
    const [ft1, ft2] = [init['sf_0'], init['sf_1']]
    if (ft1 && finals.includes(ft1)) init['final_0'] = ft1
    else if (ft2 && finals.includes(ft2)) init['final_0'] = ft2

    if (Object.keys(init).length > 0) setBpicks(init)
  }, [r32Teams])

  // Auto-save group positions when leaving matches tab
  useEffect(() => {
    if (prevTab.current === 'matches' && tab !== 'matches') {
      for (const g of groups) {
        const positions = allStandings[g.id].map(t => t.id)
        fetch('/api/predictions', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'group', data: { group_name: g.id, positions } }) })
      }
    }
    prevTab.current = tab
  }, [tab])

  async function pickBracket(round: string, matchIdx: number, team: string, other: string | null) {
    const newb = { ...bpicks, [`${round}_${matchIdx}`]: team }
    if (other) {
      const ri = ROUND_ORDER.indexOf(round as typeof ROUND_ORDER[number])
      ROUND_ORDER.slice(ri + 1).forEach(r => {
        Object.keys(newb).forEach(k => { if (k.startsWith(`${r}_`) && newb[k] === other) delete newb[k] })
      })
    }
    setBpicks(newb)
    const roundTeams = Object.entries(newb).filter(([k]) => k.startsWith(`${round}_`)).map(([, v]) => v)
    await fetch('/api/predictions', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'bracket', data: { round, teams: roundTeams } }) })
    flash(`b${round}`)
  }

  // Find an actual DB knockout match for this bracket slot (if admin has created it)
  function findKoMatch(t1id: string | null, t2id: string | null): KoMatch | null {
    if (!t1id || !t2id) return null
    return koMatches.find(m =>
      (m.team1 === t1id && m.team2 === t2id) || (m.team1 === t2id && m.team2 === t1id)
    ) ?? null
  }

  // Render bracket match — with live score inputs if a DB match exists, else bracket picks
  const renderBracketMatch = (round: string, matchIdx: number, label?: string) => {
    const [t1id, t2id] = getMatchTeams(round, matchIdx)
    const t1 = t1id ? gt(teams, t1id) : null
    const t2 = t2id ? gt(teams, t2id) : null
    const picked = bpicks[`${round}_${matchIdx}`]
    const bothReady = !!t1id && !!t2id
    const koMatch = findKoMatch(t1id, t2id)

    // If there's a real KO match → show score prediction inputs
    if (koMatch) {
      const pred = preds[koMatch.id]
      const finished = koMatch.status === 'finished'
      const realWinner = finished && koMatch.score1 != null && koMatch.score2 != null
        ? koMatch.score1 > koMatch.score2 ? koMatch.team1 : koMatch.team2 : null
      const predWinner = pred && pred.s1 !== pred.s2 ? (pred.s1 > pred.s2 ? koMatch.team1 : koMatch.team2) : null

      // Derive bracket pick from score prediction
      if (!locked && predWinner && predWinner !== picked) {
        const other = predWinner === t1id ? t2id : t1id
        setTimeout(() => pickBracket(round, matchIdx, predWinner, other), 0)
      }

      return (
        <div key={`${round}_${matchIdx}_ko`} className="space-y-1.5">
          {label && <p className="text-xs text-gray-500 text-center">{label}</p>}
          <div className={`rounded-xl border-2 overflow-hidden text-sm font-semibold ${
            realWinner && predWinner === realWinner ? 'border-green-500' :
            realWinner && predWinner && predWinner !== realWinner ? 'border-red-600' :
            predWinner ? 'border-gold/70' : 'border-field-light'
          }`} style={{ background: 'linear-gradient(145deg,#0d2815,#081508)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-field-light/40">
              <span className="text-xs text-gold font-bold">⚽ Predicción</span>
              <span className="text-xs text-gold font-semibold">+{ROUND_PTS[round]}pts{!finished && ' +2 exacto'}</span>
            </div>
            {/* Teams with score inputs */}
            {([{ teamObj: t1, teamId: t1id, scoreKey: 's1' as const, realScore: koMatch.score1 },
               { teamObj: t2, teamId: t2id, scoreKey: 's2' as const, realScore: koMatch.score2 }] as const).map(({ teamObj, teamId, scoreKey, realScore }, idx) => {
              const isWinner = realWinner === teamId
              const isPredWinner = predWinner === teamId
              return (
                <div key={idx}>
                  {idx === 1 && <div className="h-px bg-field-light/40" />}
                  <div className={`flex items-center gap-2 px-3 py-2.5 ${
                    isWinner ? 'bg-green-900/30' : isPredWinner && !finished ? 'bg-gold/10' : ''
                  }`}>
                    <span className="text-xl leading-none">{teamObj?.flag ?? '🏳️'}</span>
                    <span className="flex-1 font-semibold text-sm">{teamObj?.name ?? 'Pendiente'}</span>
                    {finished ? (
                      <span className="font-black text-xl text-white w-6 text-center">{realScore}</span>
                    ) : (
                      <input type="number" min="0" max="20" disabled={locked || finished}
                        value={pred?.[scoreKey] ?? ''} placeholder="0"
                        onChange={e => {
                          const v = +e.target.value
                          setPreds(p => ({ ...p, [koMatch.id]: scoreKey === 's1'
                            ? { s1: v, s2: p[koMatch.id]?.s2 ?? 0 }
                            : { s1: p[koMatch.id]?.s1 ?? 0, s2: v } }))
                        }}
                        onBlur={() => { if (pred) saveMatch(koMatch.id, pred.s1, pred.s2) }}
                        className="score-input w-12 text-lg" />
                    )}
                    {isWinner && <span className="text-green-400">✓</span>}
                    {isPredWinner && !finished && <span className="text-gold text-xs">⭐</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // No DB match yet → show bracket pick buttons
    return (
      <div key={`${round}_${matchIdx}`} className="space-y-1.5">
        {label && <p className="text-xs text-gray-500 text-center">{label}</p>}
        <div className={`rounded-xl border-2 overflow-hidden text-xs font-semibold transition-all duration-200 ${
          picked ? 'border-gold/60' : 'border-field-light/60'
        }`} style={{ background: 'linear-gradient(145deg,#0d2815,#081508)' }}>
          {[{ teamObj: t1, teamId: t1id }, { teamObj: t2, teamId: t2id }].map(({ teamObj, teamId }, idx) => (
            <div key={idx}>
              {idx === 1 && <div className="h-px bg-field-light/40" />}
              <button
                onClick={() => {
                  if (!locked && bothReady && teamId) {
                    pickBracket(round, matchIdx, teamId, teamId === t1id ? t2id : t1id)
                  }
                }}
                disabled={locked || !bothReady}
                className={`w-full flex items-center gap-2 px-3 py-2.5 transition-all duration-150 ${
                  picked === teamId ? 'bg-gold/15 text-white' :
                  !teamId ? 'text-gray-600' : 'text-gray-300 hover:bg-field-mid/60'
                } ${locked || !bothReady ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {teamObj ? (
                  <>
                    <span className="text-lg leading-none">{teamObj.flag}</span>
                    <span className="flex-1 text-left truncate font-medium">{teamObj.name}</span>
                    {picked === teamId && <span className="text-gold">⭐</span>}
                  </>
                ) : (
                  <>
                    <span className="text-lg">🏳️</span>
                    <span className="text-gray-600 italic text-xs">Pendiente</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavBar userName={userName} />

      {/* Page header */}
      <div className="border-b border-field-light/30" style={{ background: 'linear-gradient(180deg,#0a1f10,#050e08)' }}>
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Mis Predicciones</h1>
            <p className="text-sm text-gray-500 mt-0.5">Mundial 2026 · {groups.length} grupos · 48 partidos</p>
          </div>
          {locked && <span className="badge-red">🔒 CERRADAS</span>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 p-1.5 rounded-2xl" style={{ background: 'rgba(11,36,18,0.8)', border: '1px solid rgba(28,92,48,0.4)' }}>
          {([['matches', '⚽', 'Partidos'], ['groups', '📊', 'Posiciones'], ['bracket', '🏆', 'Eliminatoria']] as const).map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${tab === id ? 'tab-active' : 'tab-inactive'}`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* MATCHES TAB */}
        {tab === 'matches' && (
          <div className="space-y-5">
            {groups.map(g => {
              const gm = matches.filter(m => m.group_name === g.id)
              return (
                <div key={g.id} className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-black text-gold text-base">{g.name}</h3>
                    <div className="h-px flex-1 bg-field-light/30" />
                  </div>
                  <div className="space-y-3">
                    {gm.map(match => {
                      const t1 = gt(teams, match.team1), t2 = gt(teams, match.team2)
                      const pred = preds[match.id]
                      return (
                        <div key={match.id} className="flex items-center gap-3 bg-field-dark rounded-lg p-3">
                          <div className="flex-1 text-right">
                            <span className="font-semibold text-sm">{t1.flag} {t1.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" max="20" disabled={locked}
                              value={pred?.s1 ?? ''} placeholder="0"
                              onChange={e => setPreds(p => ({ ...p, [match.id]: { s1: +e.target.value, s2: p[match.id]?.s2 ?? 0 } }))}
                              onBlur={() => pred !== undefined && saveMatch(match.id, pred.s1, pred.s2)}
                              className="score-input" />
                            <span className="text-gray-500 font-bold">-</span>
                            <input type="number" min="0" max="20" disabled={locked}
                              value={pred?.s2 ?? ''} placeholder="0"
                              onChange={e => setPreds(p => ({ ...p, [match.id]: { s1: p[match.id]?.s1 ?? 0, s2: +e.target.value } }))}
                              onBlur={() => pred !== undefined && saveMatch(match.id, pred.s1, pred.s2)}
                              className="score-input" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm">{t2.flag} {t2.name}</span>
                          </div>
                          <div className="w-6 text-center text-xs">
                            {saving === `m${match.id}` ? '⏳' : saved === `m${match.id}` ? '✅' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">Guarda al salir del campo</p>
                </div>
              )
            })}
          </div>
        )}

        {/* GROUPS TAB — auto-computed from match predictions */}
        {tab === 'groups' && (
          <div className="space-y-4">
            <div className="bg-field-dark rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <span>📊</span>
              <span>Posiciones calculadas de tus predicciones de marcadores</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map(g => {
                const standings = allStandings[g.id]
                return (
                  <div key={g.id} className="card">
                    <h3 className="font-bold text-gold mb-3">{g.name}</h3>
                    <div className="space-y-1.5">
                      {standings.map((t, i) => {
                        const team = gt(teams, t.id)
                        return (
                          <div key={t.id} className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                            i < 2 ? 'bg-green-900/30 border border-green-800/40 text-white' :
                            i === 2 ? 'bg-yellow-900/20 border border-yellow-800/30 text-gray-300' :
                            'text-gray-500'
                          }`}>
                            <span className="w-4 font-bold text-center text-gray-500">{i + 1}</span>
                            <span className="text-base">{team.flag}</span>
                            <span className="flex-1 font-semibold truncate">{team.name}</span>
                            <span className="font-black text-gold w-6 text-center">{t.pts}</span>
                            <span className="text-xs text-gray-500 w-12 text-right">{t.gf}-{t.ga}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Clasifica</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-600 inline-block" /> Posible 3°</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BRACKET TAB */}
        {tab === 'bracket' && (
          <div className="space-y-10">
            <div className="bg-field-dark rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <span>🏆</span>
              <span>Elige el ganador de cada cruce. Los equipos vienen de tus predicciones de grupo.</span>
            </div>

            {/* R32 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">Octavos de Final</h3>
                <span className="text-xs text-gold font-semibold bg-gold/10 px-2 py-1 rounded-full">+{ROUND_PTS.r32} pts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {R32_SLOTS.map((_, i) => renderBracketMatch('r32', i, R32_LABELS[i]))}
              </div>
              {saved === 'br32' && <p className="text-xs text-green-400 mt-2 text-center">✅ Guardado</p>}
            </div>

            {/* R16 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">Cuartos de Final</h3>
                <span className="text-xs text-gold font-semibold bg-gold/10 px-2 py-1 rounded-full">+{ROUND_PTS.r16} pts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => renderBracketMatch('r16', i))}
              </div>
              {saved === 'br16' && <p className="text-xs text-green-400 mt-2 text-center">✅ Guardado</p>}
            </div>

            {/* QF */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">Semifinales</h3>
                <span className="text-xs text-gold font-semibold bg-gold/10 px-2 py-1 rounded-full">+{ROUND_PTS.qf} pts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }, (_, i) => renderBracketMatch('qf', i))}
              </div>
              {saved === 'bqf' && <p className="text-xs text-green-400 mt-2 text-center">✅ Guardado</p>}
            </div>

            {/* SF + 3rd */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">Final + 3° Lugar</h3>
                <span className="text-xs text-gold font-semibold bg-gold/10 px-2 py-1 rounded-full">+{ROUND_PTS.sf} pts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Semifinal 1</p>
                  {renderBracketMatch('sf', 0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Semifinal 2</p>
                  {renderBracketMatch('sf', 1)}
                </div>
              </div>
              {/* 3rd place — derived from SF losers */}
              {(getSFLoser(0) || getSFLoser(1)) && (
                <div className="mt-4 max-w-xs">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Tercer Lugar (perdedores de semis)</p>
                  <div className={`rounded-lg border-2 border-field-light overflow-hidden text-xs font-semibold`}>
                    {[getSFLoser(0), getSFLoser(1)].map((tid, idx) => {
                      const t = tid ? gt(teams, tid) : null
                      return (
                        <div key={idx}>
                          {idx === 1 && <div className="h-px bg-field-light" />}
                          <div className="flex items-center gap-2 px-3 py-2 bg-field-dark text-gray-400">
                            {t ? <><span className="text-base">{t.flag}</span><span>{t.name}</span></> : <span className="italic text-gray-600">Pendiente</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {saved === 'bsf' && <p className="text-xs text-green-400 mt-2 text-center">✅ Guardado</p>}
            </div>

            {/* Final */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gold text-xl">🏆 Gran Final</h3>
                <span className="text-xs text-gold font-semibold bg-gold/10 px-2 py-1 rounded-full">+{ROUND_PTS.final} pts</span>
              </div>
              <div className="max-w-xs">
                {renderBracketMatch('final', 0)}
              </div>
              {saved === 'bfinal' && <p className="text-xs text-green-400 mt-2 text-center">✅ Guardado</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
