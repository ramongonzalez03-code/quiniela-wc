export interface Team {
  id: string
  name: string
  flag: string
  confederation: string
}

export interface Group {
  id: string
  name: string
  teams: string[]
}

export interface MatchData {
  id: string
  phase: string
  group_name: string | null
  team1: string
  team2: string
  date: string
  time: string
  venue: string
}

export const TEAMS: Team[] = [
  // Group A
  { id: 'mex', name: 'México', flag: '🇲🇽', confederation: 'CONCACAF' },
  { id: 'rsa', name: 'Sudáfrica', flag: '🇿🇦', confederation: 'CAF' },
  { id: 'kor', name: 'Corea del Sur', flag: '🇰🇷', confederation: 'AFC' },
  { id: 'cze', name: 'República Checa', flag: '🇨🇿', confederation: 'UEFA' },
  // Group B
  { id: 'can', name: 'Canadá', flag: '🇨🇦', confederation: 'CONCACAF' },
  { id: 'bih', name: 'Bosnia y Herzegovina', flag: '🇧🇦', confederation: 'UEFA' },
  { id: 'qat', name: 'Catar', flag: '🇶🇦', confederation: 'AFC' },
  { id: 'sui', name: 'Suiza', flag: '🇨🇭', confederation: 'UEFA' },
  // Group C
  { id: 'bra', name: 'Brasil', flag: '🇧🇷', confederation: 'CONMEBOL' },
  { id: 'mar', name: 'Marruecos', flag: '🇲🇦', confederation: 'CAF' },
  { id: 'hai', name: 'Haití', flag: '🇭🇹', confederation: 'CONCACAF' },
  { id: 'sco', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA' },
  // Group D
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', confederation: 'CONCACAF' },
  { id: 'par', name: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL' },
  { id: 'aus', name: 'Australia', flag: '🇦🇺', confederation: 'AFC' },
  { id: 'tur', name: 'Turquía', flag: '🇹🇷', confederation: 'UEFA' },
  // Group E
  { id: 'ger', name: 'Alemania', flag: '🇩🇪', confederation: 'UEFA' },
  { id: 'cur', name: 'Curazao', flag: '🇨🇼', confederation: 'CONCACAF' },
  { id: 'civ', name: 'Costa de Marfil', flag: '🇨🇮', confederation: 'CAF' },
  { id: 'ecu', name: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL' },
  // Group F
  { id: 'ned', name: 'Países Bajos', flag: '🇳🇱', confederation: 'UEFA' },
  { id: 'jpn', name: 'Japón', flag: '🇯🇵', confederation: 'AFC' },
  { id: 'swe', name: 'Suecia', flag: '🇸🇪', confederation: 'UEFA' },
  { id: 'tun', name: 'Túnez', flag: '🇹🇳', confederation: 'CAF' },
  // Group G
  { id: 'bel', name: 'Bélgica', flag: '🇧🇪', confederation: 'UEFA' },
  { id: 'egy', name: 'Egipto', flag: '🇪🇬', confederation: 'CAF' },
  { id: 'irn', name: 'Irán', flag: '🇮🇷', confederation: 'AFC' },
  { id: 'nzl', name: 'Nueva Zelanda', flag: '🇳🇿', confederation: 'OFC' },
  // Group H
  { id: 'esp', name: 'España', flag: '🇪🇸', confederation: 'UEFA' },
  { id: 'cpv', name: 'Cabo Verde', flag: '🇨🇻', confederation: 'CAF' },
  { id: 'ksa', name: 'Arabia Saudita', flag: '🇸🇦', confederation: 'AFC' },
  { id: 'uru', name: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL' },
  // Group I
  { id: 'fra', name: 'Francia', flag: '🇫🇷', confederation: 'UEFA' },
  { id: 'sen', name: 'Senegal', flag: '🇸🇳', confederation: 'CAF' },
  { id: 'irq', name: 'Iraq', flag: '🇮🇶', confederation: 'AFC' },
  { id: 'nor', name: 'Noruega', flag: '🇳🇴', confederation: 'UEFA' },
  // Group J
  { id: 'arg', name: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL' },
  { id: 'alg', name: 'Argelia', flag: '🇩🇿', confederation: 'CAF' },
  { id: 'aut', name: 'Austria', flag: '🇦🇹', confederation: 'UEFA' },
  { id: 'jor', name: 'Jordania', flag: '🇯🇴', confederation: 'AFC' },
  // Group K
  { id: 'por', name: 'Portugal', flag: '🇵🇹', confederation: 'UEFA' },
  { id: 'cod', name: 'RD Congo', flag: '🇨🇩', confederation: 'CAF' },
  { id: 'uzb', name: 'Uzbekistán', flag: '🇺🇿', confederation: 'AFC' },
  { id: 'col', name: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL' },
  // Group L
  { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { id: 'cro', name: 'Croacia', flag: '🇭🇷', confederation: 'UEFA' },
  { id: 'gha', name: 'Ghana', flag: '🇬🇭', confederation: 'CAF' },
  { id: 'pan', name: 'Panamá', flag: '🇵🇦', confederation: 'CONCACAF' },
]

export const GROUPS: Group[] = [
  { id: 'A', name: 'Grupo A', teams: ['mex', 'rsa', 'kor', 'cze'] },
  { id: 'B', name: 'Grupo B', teams: ['can', 'bih', 'qat', 'sui'] },
  { id: 'C', name: 'Grupo C', teams: ['bra', 'mar', 'hai', 'sco'] },
  { id: 'D', name: 'Grupo D', teams: ['usa', 'par', 'aus', 'tur'] },
  { id: 'E', name: 'Grupo E', teams: ['ger', 'cur', 'civ', 'ecu'] },
  { id: 'F', name: 'Grupo F', teams: ['ned', 'jpn', 'swe', 'tun'] },
  { id: 'G', name: 'Grupo G', teams: ['bel', 'egy', 'irn', 'nzl'] },
  { id: 'H', name: 'Grupo H', teams: ['esp', 'cpv', 'ksa', 'uru'] },
  { id: 'I', name: 'Grupo I', teams: ['fra', 'sen', 'irq', 'nor'] },
  { id: 'J', name: 'Grupo J', teams: ['arg', 'alg', 'aut', 'jor'] },
  { id: 'K', name: 'Grupo K', teams: ['por', 'cod', 'uzb', 'col'] },
  { id: 'L', name: 'Grupo L', teams: ['eng', 'cro', 'gha', 'pan'] },
]

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.id, t]))

export function getTeam(id: string): Team {
  return TEAM_MAP[id] ?? { id, name: id.toUpperCase(), flag: '🏳️', confederation: '' }
}

type RawMatch = Omit<MatchData, 'id'>

// Round robin per group: T1vT2, T3vT4 | T1vT3, T2vT4 | T1vT4, T2vT3
function groupMatches(gid: string, t: string[], d1: string, d2: string, d3: string, venues: string[]): RawMatch[] {
  return [
    { phase: 'group', group_name: gid, team1: t[0], team2: t[1], date: d1, time: '15:00', venue: venues[0] },
    { phase: 'group', group_name: gid, team1: t[2], team2: t[3], date: d1, time: '18:00', venue: venues[1] },
    { phase: 'group', group_name: gid, team1: t[0], team2: t[2], date: d2, time: '15:00', venue: venues[2] },
    { phase: 'group', group_name: gid, team1: t[1], team2: t[3], date: d2, time: '18:00', venue: venues[3] },
    { phase: 'group', group_name: gid, team1: t[0], team2: t[3], date: d3, time: '21:00', venue: venues[4] },
    { phase: 'group', group_name: gid, team1: t[1], team2: t[2], date: d3, time: '21:00', venue: venues[5] },
  ]
}

export const GROUP_MATCHES: RawMatch[] = [
  ...groupMatches('A', ['mex', 'rsa', 'kor', 'cze'],
    '2026-06-11', '2026-06-15', '2026-06-19',
    ['Guadalajara', 'Dallas', 'Monterrey', 'Atlanta', 'Ciudad de México', 'Dallas']),

  ...groupMatches('B', ['can', 'bih', 'qat', 'sui'],
    '2026-06-11', '2026-06-15', '2026-06-19',
    ['Toronto', 'Nueva York', 'Vancouver', 'Boston', 'Toronto', 'Nueva York']),

  ...groupMatches('C', ['bra', 'mar', 'hai', 'sco'],
    '2026-06-12', '2026-06-16', '2026-06-20',
    ['Los Ángeles', 'Miami', 'San Francisco', 'Houston', 'Los Ángeles', 'Miami']),

  ...groupMatches('D', ['usa', 'par', 'aus', 'tur'],
    '2026-06-12', '2026-06-16', '2026-06-20',
    ['Los Ángeles', 'Dallas', 'Seattle', 'Kansas City', 'Los Ángeles', 'Dallas']),

  ...groupMatches('E', ['ger', 'cur', 'civ', 'ecu'],
    '2026-06-13', '2026-06-17', '2026-06-21',
    ['Nueva York', 'Philadelphia', 'Nueva York', 'Boston', 'Chicago', 'Philadelphia']),

  ...groupMatches('F', ['ned', 'jpn', 'swe', 'tun'],
    '2026-06-13', '2026-06-17', '2026-06-21',
    ['San Francisco', 'Seattle', 'Los Ángeles', 'San Francisco', 'Dallas', 'Seattle']),

  ...groupMatches('G', ['bel', 'egy', 'irn', 'nzl'],
    '2026-06-14', '2026-06-18', '2026-06-22',
    ['Miami', 'Atlanta', 'Dallas', 'Miami', 'Houston', 'Atlanta']),

  ...groupMatches('H', ['esp', 'cpv', 'ksa', 'uru'],
    '2026-06-14', '2026-06-18', '2026-06-22',
    ['Los Ángeles', 'San Francisco', 'Dallas', 'Kansas City', 'Los Ángeles', 'Dallas']),

  ...groupMatches('I', ['fra', 'sen', 'irq', 'nor'],
    '2026-06-15', '2026-06-19', '2026-06-23',
    ['Nueva York', 'Boston', 'Chicago', 'Nueva York', 'Philadelphia', 'Boston']),

  ...groupMatches('J', ['arg', 'alg', 'aut', 'jor'],
    '2026-06-15', '2026-06-19', '2026-06-23',
    ['Miami', 'Houston', 'Dallas', 'Atlanta', 'Miami', 'Houston']),

  ...groupMatches('K', ['por', 'cod', 'uzb', 'col'],
    '2026-06-16', '2026-06-20', '2026-06-24',
    ['Los Ángeles', 'San Francisco', 'Seattle', 'Los Ángeles', 'Dallas', 'San Francisco']),

  ...groupMatches('L', ['eng', 'cro', 'gha', 'pan'],
    '2026-06-16', '2026-06-20', '2026-06-24',
    ['Nueva York', 'Philadelphia', 'Boston', 'Nueva York', 'Chicago', 'Philadelphia']),
]

export const KNOCKOUT_ROUNDS = [
  { id: 'r32', name: 'Octavos de Final', slots: 16 },
  { id: 'r16', name: 'Cuartos de Final', slots: 8 },
  { id: 'qf', name: 'Semifinales', slots: 4 },
  { id: 'sf', name: 'Semifinales', slots: 2 },
  { id: '3rd', name: 'Tercer Lugar', slots: 2 },
  { id: 'final', name: 'Gran Final', slots: 2 },
]
