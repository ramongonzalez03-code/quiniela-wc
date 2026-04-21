'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User { id: number; name: string; invite_code: string; created_at: string }

export default function AdminClient({ initialUsers, initialLocked, adminName }: {
  initialUsers: User[]
  initialLocked: boolean
  adminName: string
}) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [locked, setLocked] = useState(initialLocked)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  async function createCode() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_code', name: newName.trim() }),
    })
    const data = await res.json()
    setCreating(false)
    if (data.ok) {
      setNewCode(data.code)
      setNewName('')
      router.refresh()
    }
  }

  async function toggleLock() {
    setToggling(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_lock' }),
    })
    const data = await res.json()
    setLocked(data.locked)
    setToggling(false)
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      {/* Admin nav */}
      <nav className="bg-field-dark border-b border-field-light sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-black text-gold text-lg">⚙️ Admin</span>
          <div className="flex gap-2">
            <Link href="/admin/results" className="btn-outline text-sm py-1">Resultados</Link>
            <Link href="/admin/prizes" className="btn-outline text-sm py-1">Premios</Link>
            <Link href="/ranking" className="btn-outline text-sm py-1">Ranking</Link>
          </div>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400">Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Panel de Control</h1>
          <span className="text-gray-400 text-sm">Bienvenido, {adminName}</span>
        </div>

        {/* Lock control */}
        <div className="card flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Predicciones</h3>
            <p className="text-sm text-gray-400">
              Estado: {locked ? '🔒 Cerradas' : '🔓 Abiertas'}
            </p>
          </div>
          <button onClick={toggleLock} disabled={toggling}
            className={`font-bold px-4 py-2 rounded-lg transition-colors ${locked ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-red-800 hover:bg-red-700 text-white'}`}>
            {locked ? 'Abrir predicciones' : 'Cerrar predicciones'}
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/results" className="card hover:border-gold transition-colors text-center py-6">
            <div className="text-3xl mb-2">⚽</div>
            <div className="font-bold text-white">Ingresar Resultados</div>
            <div className="text-xs text-gray-400 mt-1">Partidos de grupo y eliminatoria</div>
          </Link>
          <Link href="/admin/prizes" className="card hover:border-gold transition-colors text-center py-6">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold text-white">Configurar Premios</div>
            <div className="text-xs text-gray-400 mt-1">1er, 2do, 3er lugar</div>
          </Link>
        </div>

        {/* Create invite code */}
        <div className="card">
          <h3 className="font-bold text-gold mb-4">Crear Código de Invitación</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createCode()}
              placeholder="Nombre del jugador"
              className="flex-1 bg-field-dark border border-field-light rounded-lg px-4 py-2 text-white focus:border-gold focus:outline-none"
            />
            <button onClick={createCode} disabled={!newName.trim() || creating} className="btn-gold">
              {creating ? '...' : 'Crear'}
            </button>
          </div>
          {newCode && (
            <div className="mt-3 bg-gold/10 border border-gold/40 rounded-lg p-3">
              <p className="text-sm text-gray-300">Código generado para <strong>{initialUsers.find(u => u.invite_code === newCode)?.name ?? 'nuevo jugador'}</strong>:</p>
              <p className="text-2xl font-mono font-black text-gold tracking-widest mt-1">{newCode}</p>
              <p className="text-xs text-gray-500 mt-1">Comparte este código con el jugador</p>
            </div>
          )}
        </div>

        {/* Users list */}
        <div className="card">
          <h3 className="font-bold text-gold mb-4">Jugadores ({users.length})</h3>
          {users.length === 0 ? (
            <p className="text-gray-400 text-sm">Aún no hay jugadores. Crea códigos arriba.</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-field-dark rounded-lg px-4 py-3">
                  <span className="font-semibold text-white">{u.name}</span>
                  <span className="font-mono text-gold text-sm tracking-widest">{u.invite_code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
