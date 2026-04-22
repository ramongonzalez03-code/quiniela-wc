'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/predictions', label: 'Predicciones', icon: '✏️' },
  { href: '/ranking',     label: 'Ranking',       icon: '🏆' },
  { href: '/bracket',     label: 'Bracket',       icon: '🗂️' },
]

export default function NavBar({ userName }: { userName: string }) {
  const path = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'linear-gradient(180deg, #081a0c 0%, #050e08 100%)', borderBottom: '1px solid rgba(28,92,48,0.5)' }}>
      {/* Gold top stripe */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #f5c518 30%, #ffe55c 50%, #f5c518 70%, transparent 100%)' }} />

      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-black text-gold text-sm tracking-wider">MUNDIAL</div>
            <div className="flex items-center gap-1">
              <span className="font-black text-white text-xs">2026</span>
              <span className="text-xs">🇺🇸🇨🇦🇲🇽</span>
            </div>
          </div>
          <span className="sm:hidden font-black text-gold text-sm">WC26</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(l => {
            const active = path.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'text-field-dark font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-field-mid/60'
                }`}
                style={active ? { background: 'linear-gradient(135deg,#f5c518,#ffe55c)', boxShadow: '0 2px 10px rgba(245,197,24,0.25)' } : {}}>
                <span className="hidden sm:inline mr-1">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-5 h-5 rounded-full bg-field-mid border border-field-light flex items-center justify-center text-gold font-bold text-xs">
              {userName[0]?.toUpperCase()}
            </span>
            <span className="font-medium">{userName}</span>
          </div>
          <button onClick={logout} disabled={loggingOut}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
