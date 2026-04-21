'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/predictions', label: 'Predicciones', icon: '✏️' },
  { href: '/ranking', label: 'Ranking', icon: '🏆' },
  { href: '/bracket', label: 'Bracket', icon: '🗂️' },
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
    <nav className="bg-field-dark border-b border-field-light sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-black text-gold text-lg">⚽ WC 2026</span>
        <div className="flex gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${path.startsWith(l.href) ? 'tab-active' : 'tab-inactive'}`}>
              <span className="hidden sm:inline">{l.icon} </span>{l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">{userName}</span>
          <button onClick={logout} disabled={loggingOut}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
