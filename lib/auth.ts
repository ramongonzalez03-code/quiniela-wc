import { cookies } from 'next/headers'
import { getDb } from './db'

export interface SessionUser {
  id: number
  name: string
  is_admin: boolean
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session_user_id')?.value
  if (!userId) return null

  const db = getDb()
  const user = db.prepare('SELECT id, name, is_admin FROM users WHERE id = ?').get(Number(userId)) as SessionUser | undefined
  return user ?? null
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('No session')
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession()
  if (!session || !session.is_admin) throw new Error('Not admin')
  return session
}
