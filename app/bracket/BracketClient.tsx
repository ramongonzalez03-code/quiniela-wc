'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import { getTeam } from '@/lib/wc2026-data'

interface KoMatch { id: number; phase: string; team1: string; team2: string; date: string; score1: number | null; score2: number | null; status: string }
interface GroupStanding { id: string; pts: number; gf: number; ga: number; played: number }
interface GroupData { group: { id: string; name: string }; standings: GroupStanding[]; matchesPlayed: number }

const PHASES = [
  { id: 'r32', name: 'Octavos', short: 'R32', pts: 4 },
  { id: 'r16', name: 'Cuartos', short: 'R16', pts: 5 },
  { id: 'qf', name: 'Semis', short: 'SF', pts: 6 },
  { id: 'sf', name: 'Final + 3°', short: 'F', pts: 7 },
  { id: 'final', name: 'Gran Final', short: '🏆', pts: 10 },
]

function MatchCard({ match, pred, onPick, locked }: {
  match: KoMatch
  pred?: { s1: number; s2: number }
  onPick?: (winner: 'team1' | 'team2') => void
  locked?: boolean
}) {
  const t1 = getTeam(match.team1)
  const t2 = getTeam(match.team2)
  const finished = match.status === 'finished'
  const realWinner = finished && match.score1 !== null && match.score2 !== null
    ? match.score1 > match.score2 ? 'team1' : 'team2' : null
  const predWinner = pred ? (pred.s1 > pred.s2 ? 'team1' : pred.s1 < pred.s2 ? 'team2' : null) : null
  const correct = finished && realWinner && predWinner === realWinner
  const wrong = finished && realWinner && predWinner && predWinner !== realWinner

  return (
    <div className={`rounded-lg border-2 overflow-hidden text-xs font-semibold ${
      correct ? 'border-green-500' : wrong ? 'border-red-700' : predWinner ? 'border-gold/60' : 'border-field-light'
    }`}>
      {/* Team 1 */}
      <button
        onClick={() => !locked && !finished && onPick?.('team1')}
        disabled={locked || finished}
        className={`w-full flex items-center gap-1.5 px-2 py-2 transition-colors ${
          realWinner === 'team1' ? 'bg-green-800/40 text-white' :
          predWinner === 'team1' && !finished ? 'bg-gold/15 text-white' :
          'bg-field-dark text-gray-300 hover:bg-field-mid'
        } ${locked || finished ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className="text-base leading-none">{t1.flag}</span>
        <span className="flex-1 text-left truncate">{t1.name}</span>
        {finished && <span className="font-black text-white">{match.score1}</span>}
        {predWinner === 'team1' && !finished && <span className="text-gold">⭐</span>}
        {realWinner === 'team1' && <span className="text-green-400 text-xs">✓</span>}
      </button>

      <div className="h-px bg-field-light" />

      {/* Team 2 */}
      <button
        onClick={() => !locked && !finished && onPick?.('team2')}
        disabled={locked || finished}
        className={`w-full flex items-center gap-1.5 px-2 py-2 transition-colors ${
          realWinner === 'team2' ? 'bg-green-800/40 text-white' :
          predWinner === 'team2' && !finished ? 'bg-gold/15 text-white' :
          'bg-field-dark text-gray-300 hover:bg-field-mid'
        } ${locked || finished ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className="text-base leading-none">{t2.flag}</span>
        <span className="flex-1 text-left truncate">{t2.name}</span>
        {finished && <span className="font-black text-white">{match.score2}</span>}
        {predWinner === 'team2' && !finished && <span className="text-gold">⭐</span>}
        {realWinner === 'team2' && <span className="text-green-400 text-xs">✓</span>}
      </button>
    </div>
  )
}

function EmptySlot() {
  return (
    <div className="rounded-lg border-2 border-dashed border-field-light overflow-hidden text-xs opacity-40">
      <div className="flex items-center gap-1.5 px-2 py-2 bg-field-dark text-gray-500">
        <span>🏳️</span><span>Por definir</span>
      </div>
      <div className="h-px bg-field-light" />
      <div className="flex items-center gap-1.5 px-2 py-2 bg-field-dark text-gray-500">
        <span>🏳️</span><span>Por definir</span>
      </div>
    </div>
  )
}

export default function BracketClient({ userName, koMatches, initialPreds, groupStandings }: {
  userName: string
  koMatches: KoMatch[]
  initialPreds: Record<number, { s1: number; s2: number }>
  groupStandings: GroupData[]
}) {
  const [tab, setTab] = useState<'bracket' | 'groups'>('bracket')
  const [preds, setPreds] = useState(initialPreds)
  const [saving, setSaving] = useState<number | null>(null)

  async function pickWinner(match: KoMatch, winner: 'team1' | 'team2') {
    const cur = preds[match.id]
    const s1 = winner === 'team1' ? Math.max((cur?.s2 ?? 0) + 1, 1) : 0
    const s2 = winner === 'team2' ? Math.max((cur?.s1 ?? 0) + 1, 1) : 0
    const newPred = winner === 'team1' ? { s1, s2: 0 } : { s1: 0, s2 }
    setPreds(p => ({ ...p, [match.id]: newPred }))
    setSaving(match.id)
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'match', data: { match_id: match.id, s1: newPred.s1, s2: newPred.s2 } }),
    })
    setSaving(null)
  }

  const byPhase = (phase: string) => koMatches.filter(m => m.phase === phase)

  // Build bracket columns: r32(16), r16(8), qf(4), sf(2), final(1)
  // Left half: first 8 r32 → first 4 r16 → first 2 qf → first sf
  // Right half: next 8 r32 → next 4 r16 → next 2 qf → second sf
  // Center: final
  const r32 = byPhase('r32')
  const r16 = byPhase('r16')
  const qf = byPhase('qf')
  const sf = byPhase('sf')
  const final = byPhase('final')
  const third = byPhase('3rd')

  const hasAnyKoMatch = koMatches.length > 0

  return (
    <div className="min-h-screen">
      <NavBar userName={userName} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-white mb-4">Bracket</h1>

        <div className="flex gap-2 mb-6 bg-field-dark rounded-xl p-1 max-w-sm">
          <button onClick={() => setTab('bracket')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'bracket' ? 'tab-active' : 'tab-inactive'}`}>
            🏆 Eliminatoria
          </button>
          <button onClick={() => setTab('groups')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'groups' ? 'tab-active' : 'tab-inactive'}`}>
            📊 Grupos
          </button>
        </div>

        {/* BRACKET VIEW */}
        {tab === 'bracket' && (
          <>
            {!hasAnyKoMatch ? (
              <div className="card text-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-white font-bold text-xl">La eliminatoria aún no comienza</p>
                <p className="text-gray-400 mt-2">Los cruces aparecerán aquí cuando el Admin los agregue</p>
                <p className="text-gray-500 text-sm mt-1">Inicia el 4 de julio de 2026</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[700px]">
                  {/* Round headers */}
                  <div className="grid grid-cols-5 gap-2 mb-3 text-center">
                    {['Octavos', 'Cuartos', 'Semis', '', 'Final'].map((label, i) => (
                      <div key={i} className={`text-xs font-bold py-1 rounded ${label ? 'bg-field border border-field-light text-gold' : ''}`}>
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Bracket grid — left half: cols 1-3, center: col 4, right half mirrored on col 5 */}
                  {/* We show up to 8 R32 matches per side for a full 16-match bracket */}
                  <BracketHalf
                    r32={r32.slice(0, 8)}
                    r16={r16.slice(0, 4)}
                    qf={qf.slice(0, 2)}
                    sf={sf.slice(0, 1)}
                    final={final}
                    third={third}
                    preds={preds}
                    onPick={pickWinner}
                    saving={saving}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* GROUPS VIEW */}
        {tab === 'groups' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {groupStandings.map(({ group, standings, matchesPlayed }) => (
              <div key={group.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gold text-sm">{group.name}</h3>
                  <span className="text-xs text-gray-500">{matchesPlayed}/6 partidos</span>
                </div>
                <div className="space-y-1.5">
                  {standings.map((t, i) => {
                    const team = getTeam(t.id)
                    const advances = i < 2
                    const mightAdvance = i === 2
                    return (
                      <div key={t.id} className={`flex items-center gap-2 text-xs rounded px-1.5 py-1 ${
                        advances ? 'bg-green-900/30 text-white' :
                        mightAdvance ? 'bg-yellow-900/20 text-gray-300' :
                        'text-gray-500'
                      }`}>
                        <span className="w-3 text-gray-500 font-bold">{i + 1}</span>
                        <span>{team.flag}</span>
                        <span className="flex-1 truncate font-semibold">{team.name}</span>
                        <span className="font-black text-gold">{t.pts}</span>
                        <span className="text-gray-500 w-8 text-right">{t.gf}-{t.ga}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block"></span>Clasifica</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-600 inline-block"></span>Posible 3°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BracketHalf({ r32, r16, qf, sf, final, third, preds, onPick, saving }: {
  r32: KoMatch[]
  r16: KoMatch[]
  qf: KoMatch[]
  sf: KoMatch[]
  final: KoMatch[]
  third: KoMatch[]
  preds: Record<number, { s1: number; s2: number }>
  onPick: (m: KoMatch, w: 'team1' | 'team2') => void
  saving: number | null
}) {
  // Render matches per round — pairs are visually grouped with a bracket line
  const maxR32 = Math.max(r32.length, 1)

  return (
    <div className="space-y-4">
      {/* R32 + R16 + QF + SF + Final in a flex row */}
      <div className="flex gap-2 items-start">
        {/* R32 column */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="text-center text-xs text-gray-500 mb-1">Octavos · 4pts</div>
          {Array.from({ length: Math.max(r32.length, 8) }, (_, i) => (
            <div key={i}>
              {r32[i]
                ? <MatchCard match={r32[i]} pred={preds[r32[i].id]} onPick={w => onPick(r32[i], w)} />
                : r32.length > 0 ? <EmptySlot /> : null}
              {/* Visual connector every 2 matches */}
              {i % 2 === 1 && i < r32.length - 1 && <div className="h-2" />}
            </div>
          ))}
        </div>

        {/* R16 column */}
        {r16.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-w-0" style={{ marginTop: '28px' }}>
            <div className="text-center text-xs text-gray-500 mb-1">Cuartos · 5pts</div>
            {r16.map((m, i) => (
              <div key={m.id} style={{ marginBottom: i % 2 === 0 ? '8px' : '16px' }}>
                <MatchCard match={m} pred={preds[m.id]} onPick={w => onPick(m, w)} />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - r16.length) }, (_, i) => (
              r32.length > 0 ? <div key={i} style={{ marginBottom: '24px' }}><EmptySlot /></div> : null
            ))}
          </div>
        )}

        {/* QF column */}
        {qf.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-w-0" style={{ marginTop: '60px' }}>
            <div className="text-center text-xs text-gray-500 mb-1">Semis · 6pts</div>
            {qf.map((m, i) => (
              <div key={m.id} style={{ marginBottom: i % 2 === 0 ? '8px' : '32px' }}>
                <MatchCard match={m} pred={preds[m.id]} onPick={w => onPick(m, w)} />
              </div>
            ))}
          </div>
        )}

        {/* SF column */}
        {sf.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-w-0" style={{ marginTop: '120px' }}>
            <div className="text-center text-xs text-gray-500 mb-1">Semifinal · 7pts</div>
            {sf.map(m => (
              <MatchCard key={m.id} match={m} pred={preds[m.id]} onPick={w => onPick(m, w)} />
            ))}
          </div>
        )}

        {/* Final column */}
        {final.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-w-0" style={{ marginTop: '180px' }}>
            <div className="text-center text-xs text-gold font-bold mb-1">🏆 Final · 10pts</div>
            {final.map(m => (
              <MatchCard key={m.id} match={m} pred={preds[m.id]} onPick={w => onPick(m, w)} />
            ))}
          </div>
        )}
      </div>

      {/* 3rd place match */}
      {third.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-bold mb-2">Tercer Lugar · 7pts</p>
          <div className="max-w-48">
            {third.map(m => (
              <MatchCard key={m.id} match={m} pred={preds[m.id]} onPick={w => onPick(m, w)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
