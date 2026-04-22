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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #f5c518, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #1c5c30, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #1c5c30, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 blur-3xl opacity-50"
              style={{ background: 'radial-gradient(circle, #f5c518 20%, transparent 70%)' }} />
            <span className="relative text-8xl leading-none select-none">🏆</span>
          </div>

          <h1 className="font-black text-white text-5xl tracking-tight leading-none">
            MUNDIAL
          </h1>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-16 opacity-40" style={{ background: 'linear-gradient(90deg, transparent, #f5c518)' }} />
            <span className="font-black text-5xl" style={{ color: '#f5c518', textShadow: '0 0 30px rgba(245,197,24,0.5)' }}>2026</span>
            <div className="h-px w-16 opacity-40" style={{ background: 'linear-gradient(90deg, #f5c518, transparent)' }} />
          </div>
          <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase mt-2">
            🇺🇸 USA &nbsp;·&nbsp; 🇨🇦 Canadá &nbsp;·&nbsp; 🇲🇽 México
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="text-center mb-5">
            <h2 className="font-bold text-white text-xl">Entra a la Quiniela</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresa tu código de invitación</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="text-input text-center text-2xl font-black tracking-[0.3em] uppercase py-4"
              maxLength={10}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            )}
            <button type="submit" disabled={!code || loading} className="btn-gold w-full py-4 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar a la Quiniela ⚽'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          ¿No tienes código? Pídelo al organizador
        </p>
      </div>
    </div>
  )
}
