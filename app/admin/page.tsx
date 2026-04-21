import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb, getSetting } from '@/lib/db'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/')

  // If not admin, show login form
  if (!session.is_admin) {
    return <AdminLogin />
  }

  const db = getDb()
  const users = db.prepare('SELECT id, name, invite_code, created_at FROM users WHERE is_admin = 0').all() as Array<{ id: number; name: string; invite_code: string; created_at: string }>
  const locked = getSetting('predictions_locked') === 'true'

  return <AdminClient initialUsers={users} initialLocked={locked} adminName={session.name} />
}

function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="text-2xl font-black text-gold">Panel Admin</h1>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}

function AdminLoginForm() {
  return (
    <div className="card">
      <p className="text-gray-400 text-sm text-center mb-4">
        Ingresa con tu código de Admin para acceder
      </p>
      <a href="/" className="btn-outline block text-center">
        Volver al inicio
      </a>
    </div>
  )
}
