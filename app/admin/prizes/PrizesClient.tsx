'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Prize { id: number; position: number; description: string; amount: string }

const MEDALS = ['🥇', '🥈', '🥉']

export default function PrizesClient({ initialPrizes }: { initialPrizes: Prize[] }) {
  const [prizes, setPrizes] = useState(
    initialPrizes.length > 0
      ? initialPrizes
      : [
          { id: 0, position: 1, description: '1er Lugar', amount: '' },
          { id: 0, position: 2, description: '2do Lugar', amount: '' },
          { id: 0, position: 3, description: '3er Lugar', amount: '' },
        ]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(pos: number, field: 'description' | 'amount', value: string) {
    setPrizes(ps => ps.map(p => p.position === pos ? { ...p, [field]: value } : p))
  }

  function addPrize() {
    const nextPos = Math.max(...prizes.map(p => p.position)) + 1
    setPrizes(ps => [...ps, { id: 0, position: nextPos, description: `${nextPos}° Lugar`, amount: '' }])
  }

  function removePrize(pos: number) {
    setPrizes(ps => ps.filter(p => p.position !== pos))
  }

  async function save() {
    setSaving(true)
    await fetch('/api/prizes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-field-dark border-b border-field-light sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-gold hover:text-gold-light">← Admin</Link>
          <span className="font-black text-white">Configurar Premios</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card space-y-4">
          <p className="text-gray-400 text-sm">
            Configura los premios que aparecerán en el ranking.
          </p>

          {prizes.map(prize => (
            <div key={prize.position} className="bg-field-dark rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{MEDALS[prize.position - 1] ?? `${prize.position}°`}</span>
                <span className="font-bold text-gold">Lugar #{prize.position}</span>
                {prize.position > 3 && (
                  <button onClick={() => removePrize(prize.position)}
                    className="ml-auto text-red-400 hover:text-red-300 text-sm">
                    Eliminar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                  <input type="text"
                    value={prize.description}
                    onChange={e => update(prize.position, 'description', e.target.value)}
                    placeholder="Ej: 1er Lugar"
                    className="w-full bg-field border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Premio</label>
                  <input type="text"
                    value={prize.amount}
                    onChange={e => update(prize.position, 'amount', e.target.value)}
                    placeholder="Ej: $500 MXN"
                    className="w-full bg-field border border-field-light rounded-lg px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addPrize}
            className="w-full border border-dashed border-field-light rounded-lg py-3 text-gray-500 hover:border-gold hover:text-gold transition-colors text-sm">
            + Agregar lugar
          </button>

          <button onClick={save} disabled={saving}
            className="btn-gold w-full">
            {saving ? 'Guardando...' : saved ? '✅ Guardado' : 'Guardar Premios'}
          </button>
        </div>
      </div>
    </div>
  )
}
