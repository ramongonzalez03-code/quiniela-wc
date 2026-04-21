'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (data.is_admin) router.push('/admin')
    else router.push('/predictions')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-3xl font-black text-gold">Quiniela</h1>
          <p className="text-xl font-bold text-white mt-1">Mundial 2026</p>
          <p className="text-gray-400 text-sm mt-2">USA · Canadá · México</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Código de invitación
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              className="w-full bg-field-dark border border-field-light rounded-lg px-4 py-3 text-white text-lg font-mono tracking-widest uppercase focus:border-gold focus:outline-none text-center"
              maxLength={10}
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={!code || loading} className="btn-gold w-full">
            {loading ? 'Entrando...' : 'Entrar a la Quiniela'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          ¿No tienes código? Pídelo al organizador
        </p>
      </div>
    </div>
  )
}
