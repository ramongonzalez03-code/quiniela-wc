import { getDb } from './db'

// Maps football-data.org team names → our internal IDs
const TEAM_NAME_MAP: Record<string, string> = {
  // Group A
  'Mexico': 'mex',
  'South Africa': 'rsa',
  'Republic of South Africa': 'rsa',
  'Korea Republic': 'kor',
  'South Korea': 'kor',
  'Czech Republic': 'cze',
  'Czechia': 'cze',
  // Group B
  'Canada': 'can',
  'Bosnia and Herzegovina': 'bih',
  'Bosnia & Herzegovina': 'bih',
  'Qatar': 'qat',
  'Switzerland': 'sui',
  // Group C
  'Brazil': 'bra',
  'Morocco': 'mar',
  'Haiti': 'hai',
  'Scotland': 'sco',
  // Group D
  'United States': 'usa',
  'USA': 'usa',
  'Paraguay': 'par',
  'Australia': 'aus',
  'Turkey': 'tur',
  'Türkiye': 'tur',
  // Group E
  'Germany': 'ger',
  'Curaçao': 'cur',
  'Curacao': 'cur',
  "Côte d'Ivoire": 'civ',
  'Ivory Coast': 'civ',
  'Ecuador': 'ecu',
  // Group F
  'Netherlands': 'ned',
  'Japan': 'jpn',
  'Sweden': 'swe',
  'Tunisia': 'tun',
  // Group G
  'Belgium': 'bel',
  'Egypt': 'egy',
  'Iran': 'irn',
  'IR Iran': 'irn',
  'New Zealand': 'nzl',
  // Group H
  'Spain': 'esp',
  'Cape Verde': 'cpv',
  'Cabo Verde': 'cpv',
  'Saudi Arabia': 'ksa',
  'Uruguay': 'uru',
  // Group I
  'France': 'fra',
  'Senegal': 'sen',
  'Iraq': 'irq',
  'Norway': 'nor',
  // Group J
  'Argentina': 'arg',
  'Algeria': 'alg',
  'Austria': 'aut',
  'Jordan': 'jor',
  // Group K
  'Portugal': 'por',
  'DR Congo': 'cod',
  'Congo DR': 'cod',
  'Democratic Republic of the Congo': 'cod',
  'Uzbekistan': 'uzb',
  'Colombia': 'col',
  // Group L
  'England': 'eng',
  'Croatia': 'cro',
  'Ghana': 'gha',
  'Panama': 'pan',
}

function resolveTeam(apiName: string): string | null {
  return TEAM_NAME_MAP[apiName] ?? null
}

interface ApiMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
}

export async function syncResults(): Promise<{ updated: number; skipped: number; errors: string[] }> {
  const apiKey = process.env.FOOTBALL_API_KEY
  if (!apiKey) throw new Error('FOOTBALL_API_KEY no configurada')

  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': apiKey },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const apiMatches: ApiMatch[] = data.matches ?? []

  const db = getDb()
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const apiMatch of apiMatches) {
    if (apiMatch.status !== 'FINISHED') { skipped++; continue }

    const score1 = apiMatch.score.fullTime.home
    const score2 = apiMatch.score.fullTime.away
    if (score1 === null || score2 === null) { skipped++; continue }

    const t1 = resolveTeam(apiMatch.homeTeam.name)
    const t2 = resolveTeam(apiMatch.awayTeam.name)

    if (!t1 || !t2) {
      errors.push(`No se encontró: "${apiMatch.homeTeam.name}" vs "${apiMatch.awayTeam.name}"`)
      continue
    }

    // Match in our DB by both team combinations (home/away can be swapped)
    const match = db.prepare(`
      SELECT id FROM matches
      WHERE ((team1 = ? AND team2 = ?) OR (team1 = ? AND team2 = ?))
      AND status != 'finished'
    `).get(t1, t2, t2, t1) as { id: number } | undefined

    if (!match) { skipped++; continue }

    // Keep score in correct order matching our DB (team1 = home in API)
    const dbMatch = db.prepare('SELECT team1 FROM matches WHERE id = ?').get(match.id) as { team1: string }
    const finalScore1 = dbMatch.team1 === t1 ? score1 : score2
    const finalScore2 = dbMatch.team1 === t1 ? score2 : score1

    db.prepare("UPDATE matches SET score1 = ?, score2 = ?, status = 'finished' WHERE id = ?")
      .run(finalScore1, finalScore2, match.id)

    updated++
  }

  // Save last sync time
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('last_sync', ?)").run(new Date().toISOString())

  return { updated, skipped, errors }
}
