'use client'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

interface RankEntry { id: number; name: string; points: number; rank: number }
interface Prize { position: number; description: string; amount: string }

const MEDALS = ['🥇', '🥈', '🥉']
const POINTS_LEGEND = [
  { label: 'Resultado correcto (G/E/P)', pts: 2 },
  { label: 'Marcador exacto', pts: 3 },
  { label: '1er lugar del grupo', pts: 4 },
  { label: '2do lugar del grupo', pts: 3 },
  { label: '3er lugar (pasa)', pts: 2 },
  { label: 'Equipo en Octavos', pts: 2 },
  { label: 'Equipo en Cuartos', pts: 3 },
  { label: 'Equipo en Semis', pts: 4 },
  { label: 'Finalista correcto', pts: 5 },
  { label: 'Campeón correcto', pts: 8 },
]

export default function RankingClient({ userName, myId, isAdmin }: { userName: string; myId: number; isAdmin: boolean }) {
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/ranking')
    const data = await res.json()
    setRanking(data.ranking)
    setPrizes(data.prizes)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      <NavBar userName={userName} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Ranking</h1>
          <span className="text-xs text-gray-500">Actualiza cada 30s</span>
        </div>

        {/* Prizes */}
        {prizes.some(p => p.amount && p.amount !== 'Por definir') && (
          <div className="card mb-6">
            <h3 className="font-bold text-gold mb-3">Premios</h3>
            <div className="space-y-2">
              {prizes.map(p => (
                <div key={p.position} className="flex items-center justify-between">
                  <span className="font-semibold">{MEDALS[p.position - 1] ?? `${p.position}°`} {p.description}</span>
                  <span className="text-gold font-bold">{p.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking table */}
        <div className="card">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Cargando ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Aún no hay jugadores</div>
          ) : (
            <div className="space-y-2">
              {ranking.map(entry => {
                const isMe = entry.id === myId
                const medal = MEDALS[entry.rank - 1]
                return (
                  <div key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${isMe ? 'bg-gold/10 border border-gold/40' : 'bg-field-dark'}`}>
                    <div className="w-8 text-center font-black text-lg">
                      {medal ?? <span className="text-gray-500">{entry.rank}</span>}
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold ${isMe ? 'text-gold' : 'text-white'}`}>
                        {entry.name} {isMe && <span className="text-xs text-gray-400">(tú)</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-gold">{entry.points}</span>
                      <span className="text-gray-500 text-xs ml-1">pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Points legend */}
        <details className="card mt-6">
          <summary className="font-bold text-gold cursor-pointer select-none">Sistema de puntos</summary>
          <div className="mt-3 space-y-1">
            {POINTS_LEGEND.map(p => (
              <div key={p.label} className="flex justify-between text-sm">
                <span className="text-gray-300">{p.label}</span>
                <span className="text-gold font-bold">{p.pts} pts</span>
              </div>
            ))}
          </div>
        </details>

        {isAdmin && (
          <Link href="/admin" className="btn-outline block text-center mt-4">
            Panel de Admin →
          </Link>
        )}
      </div>
    </div>
  )
}
