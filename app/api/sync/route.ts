import { NextRequest, NextResponse } from 'next/server'
import { syncResults } from '@/lib/api-sync'
import { getSetting } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Allow admin session OR a secret token for automated calls (cron jobs)
  const { token } = await req.json().catch(() => ({}))
  const cronSecret = process.env.CRON_SECRET

  const isAutomated = cronSecret && token === cronSecret
  if (!isAutomated) {
    try { await requireAdmin() } catch {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  try {
    const result = await syncResults()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET() {
  const lastSync = getSetting('last_sync')
  const hasKey = !!process.env.FOOTBALL_API_KEY
  return NextResponse.json({ lastSync, hasKey })
}
