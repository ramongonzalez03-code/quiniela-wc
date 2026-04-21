import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import PrizesClient from './PrizesClient'

export default async function PrizesPage() {
  const session = await getSession()
  if (!session || !session.is_admin) redirect('/admin')

  const db = getDb()
  const prizes = db.prepare('SELECT * FROM prizes ORDER BY position').all() as Array<{ id: number; position: number; description: string; amount: string }>

  return <PrizesClient initialPrizes={prizes} />
}
