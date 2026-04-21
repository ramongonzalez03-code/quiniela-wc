import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import RankingClient from './RankingClient'

export default async function RankingPage() {
  const session = await getSession()
  if (!session) redirect('/')

  return <RankingClient userName={session.name} myId={session.id} isAdmin={session.is_admin} />
}
