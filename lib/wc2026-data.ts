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
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸', confederation: 'CONCACAF' },
  { id: 'mar', name: 'Marruecos', flag: '🇲🇦', confederation: 'CAF' },
  { id: 'pol', name: 'Polonia', flag: '🇵🇱', confederation: 'UEFA' },
  { id: 'crc', name: 'Costa Rica', flag: '🇨🇷', confederation: 'CONCACAF' },
  { id: 'mex', name: 'México', flag: '🇲🇽', confederation: 'CONCACAF' },
  { id: 'nga', name: 'Nigeria', flag: '🇳🇬', confederation: 'CAF' },
  { id: 'kor', name: 'Corea del Sur', flag: '🇰🇷', confederation: 'AFC' },
  { id: 'jam', name: 'Jamaica', flag: '🇯🇲', confederation: 'CONCACAF' },
  { id: 'can', name: 'Canadá', flag: '🇨🇦', confederation: 'CONCACAF' },
  { id: 'sen', name: 'Senegal', flag: '🇸🇳', confederation: 'CAF' },
  { id: 'irn', name: 'Irán', flag: '🇮🇷', confederation: 'AFC' },
  { id: 'hun', name: 'Hungría', flag: '🇭🇺', confederation: 'UEFA' },
  { id: 'ger', name: 'Alemania', flag: '🇩🇪', confederation: 'UEFA' },
  { id: 'jpn', name: 'Japón', flag: '🇯🇵', confederation: 'AFC' },
  { id: 'pan', name: 'Panamá', flag: '🇵🇦', confederation: 'CONCACAF' },
  { id: 'ven', name: 'Venezuela', flag: '🇻🇪', confederation: 'CONMEBOL' },
  { id: 'fra', name: 'Francia', flag: '🇫🇷', confederation: 'UEFA' },
  { id: 'aus', name: 'Australia', flag: '🇦🇺', confederation: 'AFC' },
  { id: 'ecu', name: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL' },
  { id: 'cmr', name: 'Camerún', flag: '🇨🇲', confederation: 'CAF' },
  { id: 'esp', name: 'España', flag: '🇪🇸', confederation: 'UEFA' },
  { id: 'irq', name: 'Iraq', flag: '🇮🇶', confederation: 'AFC' },
  { id: 'uru', name: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL' },
  { id: 'rsa', name: 'Sudáfrica', flag: '🇿🇦', confederation: 'CAF' },
  { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { id: 'srb', name: 'Serbia', flag: '🇷🇸', confederation: 'UEFA' },
  { id: 'col', name: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL' },
  { id: 'alg', name: 'Argelia', flag: '🇩🇿', confederation: 'CAF' },
  { id: 'por', name: 'Portugal', flag: '🇵🇹', confederation: 'UEFA' },
  { id: 'gha', name: 'Ghana', flag: '🇬🇭', confederation: 'CAF' },
  { id: 'cro', name: 'Croacia', flag: '🇭🇷', confederation: 'UEFA' },
  { id: 'tur', name: 'Turquía', flag: '🇹🇷', confederation: 'UEFA' },
  { id: 'ned', name: 'Países Bajos', flag: '🇳🇱', confederation: 'UEFA' },
  { id: 'uzb', name: 'Uzbekistán', flag: '🇺🇿', confederation: 'AFC' },
  { id: 'par', name: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL' },
  { id: 'nzl', name: 'Nueva Zelanda', flag: '🇳🇿', confederation: 'OFC' },
  { id: 'ita', name: 'Italia', flag: '🇮🇹', confederation: 'UEFA' },
  { id: 'jor', name: 'Jordania', flag: '🇯🇴', confederation: 'AFC' },
  { id: 'den', name: 'Dinamarca', flag: '🇩🇰', confederation: 'UEFA' },
  { id: 'civ', name: 'Costa de Marfil', flag: '🇨🇮', confederation: 'CAF' },
  { id: 'bel', name: 'Bélgica', flag: '🇧🇪', confederation: 'UEFA' },
  { id: 'ksa', name: 'Arabia Saudita', flag: '🇸🇦', confederation: 'AFC' },
  { id: 'arg', name: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL' },
  { id: 'tun', name: 'Túnez', flag: '🇹🇳', confederation: 'CAF' },
  { id: 'bra', name: 'Brasil', flag: '🇧🇷', confederation: 'CONMEBOL' },
  { id: 'sui', name: 'Suiza', flag: '🇨🇭', confederation: 'UEFA' },
  { id: 'aut', name: 'Austria', flag: '🇦🇹', confederation: 'UEFA' },
  { id: 'egy', name: 'Egipto', flag: '🇪🇬', confederation: 'CAF' },
]

export const GROUPS: Group[] = [
  { id: 'A', name: 'Grupo A', teams: ['usa', 'mar', 'pol', 'crc'] },
  { id: 'B', name: 'Grupo B', teams: ['mex', 'nga', 'kor', 'jam'] },
  { id: 'C', name: 'Grupo C', teams: ['can', 'sen', 'irn', 'hun'] },
  { id: 'D', name: 'Grupo D', teams: ['ger', 'jpn', 'pan', 'ven'] },
  { id: 'E', name: 'Grupo E', teams: ['fra', 'aus', 'ecu', 'cmr'] },
  { id: 'F', name: 'Grupo F', teams: ['esp', 'irq', 'uru', 'rsa'] },
  { id: 'G', name: 'Grupo G', teams: ['eng', 'srb', 'col', 'alg'] },
  { id: 'H', name: 'Grupo H', teams: ['por', 'gha', 'cro', 'tur'] },
  { id: 'I', name: 'Grupo I', teams: ['ned', 'uzb', 'par', 'nzl'] },
  { id: 'J', name: 'Grupo J', teams: ['ita', 'jor', 'den', 'civ'] },
  { id: 'K', name: 'Grupo K', teams: ['bel', 'ksa', 'arg', 'tun'] },
  { id: 'L', name: 'Grupo L', teams: ['bra', 'sui', 'aut', 'egy'] },
]

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.id, t]))

export function getTeam(id: string): Team {
  return TEAM_MAP[id] ?? { id, name: id.toUpperCase(), flag: '🏳️', confederation: '' }
}

type RawMatch = Omit<MatchData, 'id'>

export const GROUP_MATCHES: RawMatch[] = [
  { phase: 'group', group_name: 'A', team1: 'usa', team2: 'mar', date: '2026-06-11', time: '18:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'A', team1: 'pol', team2: 'crc', date: '2026-06-11', time: '21:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'A', team1: 'usa', team2: 'pol', date: '2026-06-15', time: '18:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'A', team1: 'mar', team2: 'crc', date: '2026-06-15', time: '21:00', venue: 'Miami' },
  { phase: 'group', group_name: 'A', team1: 'usa', team2: 'crc', date: '2026-06-19', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'A', team1: 'pol', team2: 'mar', date: '2026-06-19', time: '21:00', venue: 'Nueva York' },

  { phase: 'group', group_name: 'B', team1: 'mex', team2: 'nga', date: '2026-06-12', time: '15:00', venue: 'Guadalajara' },
  { phase: 'group', group_name: 'B', team1: 'kor', team2: 'jam', date: '2026-06-12', time: '18:00', venue: 'Seattle' },
  { phase: 'group', group_name: 'B', team1: 'mex', team2: 'kor', date: '2026-06-16', time: '18:00', venue: 'Monterrey' },
  { phase: 'group', group_name: 'B', team1: 'nga', team2: 'jam', date: '2026-06-16', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'B', team1: 'mex', team2: 'jam', date: '2026-06-20', time: '21:00', venue: 'Ciudad de México' },
  { phase: 'group', group_name: 'B', team1: 'nga', team2: 'kor', date: '2026-06-20', time: '21:00', venue: 'Atlanta' },

  { phase: 'group', group_name: 'C', team1: 'can', team2: 'sen', date: '2026-06-12', time: '21:00', venue: 'Toronto' },
  { phase: 'group', group_name: 'C', team1: 'irn', team2: 'hun', date: '2026-06-13', time: '12:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'C', team1: 'can', team2: 'irn', date: '2026-06-17', time: '15:00', venue: 'Vancouver' },
  { phase: 'group', group_name: 'C', team1: 'sen', team2: 'hun', date: '2026-06-17', time: '18:00', venue: 'Philadelphia' },
  { phase: 'group', group_name: 'C', team1: 'can', team2: 'hun', date: '2026-06-21', time: '21:00', venue: 'Toronto' },
  { phase: 'group', group_name: 'C', team1: 'sen', team2: 'irn', date: '2026-06-21', time: '21:00', venue: 'Boston' },

  { phase: 'group', group_name: 'D', team1: 'ger', team2: 'jpn', date: '2026-06-13', time: '15:00', venue: 'San Francisco' },
  { phase: 'group', group_name: 'D', team1: 'pan', team2: 'ven', date: '2026-06-13', time: '18:00', venue: 'Miami' },
  { phase: 'group', group_name: 'D', team1: 'ger', team2: 'pan', date: '2026-06-17', time: '21:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'D', team1: 'jpn', team2: 'ven', date: '2026-06-18', time: '12:00', venue: 'Seattle' },
  { phase: 'group', group_name: 'D', team1: 'ger', team2: 'ven', date: '2026-06-22', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'D', team1: 'jpn', team2: 'pan', date: '2026-06-22', time: '21:00', venue: 'Miami' },

  { phase: 'group', group_name: 'E', team1: 'fra', team2: 'aus', date: '2026-06-13', time: '21:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'E', team1: 'ecu', team2: 'cmr', date: '2026-06-14', time: '12:00', venue: 'Atlanta' },
  { phase: 'group', group_name: 'E', team1: 'fra', team2: 'ecu', date: '2026-06-18', time: '15:00', venue: 'Boston' },
  { phase: 'group', group_name: 'E', team1: 'aus', team2: 'cmr', date: '2026-06-18', time: '18:00', venue: 'Houston' },
  { phase: 'group', group_name: 'E', team1: 'fra', team2: 'cmr', date: '2026-06-22', time: '21:00', venue: 'Chicago' },
  { phase: 'group', group_name: 'E', team1: 'aus', team2: 'ecu', date: '2026-06-22', time: '21:00', venue: 'San Francisco' },

  { phase: 'group', group_name: 'F', team1: 'esp', team2: 'irq', date: '2026-06-14', time: '15:00', venue: 'Miami' },
  { phase: 'group', group_name: 'F', team1: 'uru', team2: 'rsa', date: '2026-06-14', time: '18:00', venue: 'Kansas City' },
  { phase: 'group', group_name: 'F', team1: 'esp', team2: 'uru', date: '2026-06-18', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'F', team1: 'irq', team2: 'rsa', date: '2026-06-19', time: '12:00', venue: 'Houston' },
  { phase: 'group', group_name: 'F', team1: 'esp', team2: 'rsa', date: '2026-06-23', time: '21:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'F', team1: 'irq', team2: 'uru', date: '2026-06-23', time: '21:00', venue: 'Miami' },

  { phase: 'group', group_name: 'G', team1: 'eng', team2: 'srb', date: '2026-06-14', time: '21:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'G', team1: 'col', team2: 'alg', date: '2026-06-15', time: '12:00', venue: 'San Francisco' },
  { phase: 'group', group_name: 'G', team1: 'eng', team2: 'col', date: '2026-06-19', time: '15:00', venue: 'Chicago' },
  { phase: 'group', group_name: 'G', team1: 'srb', team2: 'alg', date: '2026-06-19', time: '18:00', venue: 'Atlanta' },
  { phase: 'group', group_name: 'G', team1: 'eng', team2: 'alg', date: '2026-06-23', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'G', team1: 'srb', team2: 'col', date: '2026-06-23', time: '21:00', venue: 'Houston' },

  { phase: 'group', group_name: 'H', team1: 'por', team2: 'cro', date: '2026-06-15', time: '15:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'H', team1: 'gha', team2: 'tur', date: '2026-06-15', time: '18:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'H', team1: 'por', team2: 'gha', date: '2026-06-19', time: '21:00', venue: 'Miami' },
  { phase: 'group', group_name: 'H', team1: 'cro', team2: 'tur', date: '2026-06-20', time: '12:00', venue: 'Seattle' },
  { phase: 'group', group_name: 'H', team1: 'por', team2: 'tur', date: '2026-06-24', time: '21:00', venue: 'Chicago' },
  { phase: 'group', group_name: 'H', team1: 'gha', team2: 'cro', date: '2026-06-24', time: '21:00', venue: 'Boston' },

  { phase: 'group', group_name: 'I', team1: 'ned', team2: 'uzb', date: '2026-06-15', time: '21:00', venue: 'Atlanta' },
  { phase: 'group', group_name: 'I', team1: 'par', team2: 'nzl', date: '2026-06-16', time: '12:00', venue: 'Kansas City' },
  { phase: 'group', group_name: 'I', team1: 'ned', team2: 'par', date: '2026-06-20', time: '15:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'I', team1: 'uzb', team2: 'nzl', date: '2026-06-20', time: '18:00', venue: 'San Francisco' },
  { phase: 'group', group_name: 'I', team1: 'ned', team2: 'nzl', date: '2026-06-24', time: '21:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'I', team1: 'uzb', team2: 'par', date: '2026-06-24', time: '21:00', venue: 'Seattle' },

  { phase: 'group', group_name: 'J', team1: 'ita', team2: 'den', date: '2026-06-16', time: '15:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'J', team1: 'jor', team2: 'civ', date: '2026-06-16', time: '18:00', venue: 'Philadelphia' },
  { phase: 'group', group_name: 'J', team1: 'ita', team2: 'jor', date: '2026-06-20', time: '21:00', venue: 'Miami' },
  { phase: 'group', group_name: 'J', team1: 'den', team2: 'civ', date: '2026-06-21', time: '12:00', venue: 'Boston' },
  { phase: 'group', group_name: 'J', team1: 'ita', team2: 'civ', date: '2026-06-25', time: '21:00', venue: 'Houston' },
  { phase: 'group', group_name: 'J', team1: 'den', team2: 'jor', date: '2026-06-25', time: '21:00', venue: 'Chicago' },

  { phase: 'group', group_name: 'K', team1: 'bel', team2: 'ksa', date: '2026-06-16', time: '21:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'K', team1: 'arg', team2: 'tun', date: '2026-06-17', time: '12:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'K', team1: 'bel', team2: 'arg', date: '2026-06-21', time: '15:00', venue: 'Los Ángeles' },
  { phase: 'group', group_name: 'K', team1: 'ksa', team2: 'tun', date: '2026-06-21', time: '18:00', venue: 'San Francisco' },
  { phase: 'group', group_name: 'K', team1: 'bel', team2: 'tun', date: '2026-06-25', time: '21:00', venue: 'Miami' },
  { phase: 'group', group_name: 'K', team1: 'arg', team2: 'ksa', date: '2026-06-25', time: '21:00', venue: 'Atlanta' },

  { phase: 'group', group_name: 'L', team1: 'bra', team2: 'sui', date: '2026-06-17', time: '15:00', venue: 'San Francisco' },
  { phase: 'group', group_name: 'L', team1: 'aut', team2: 'egy', date: '2026-06-17', time: '18:00', venue: 'Kansas City' },
  { phase: 'group', group_name: 'L', team1: 'bra', team2: 'aut', date: '2026-06-21', time: '21:00', venue: 'Nueva York' },
  { phase: 'group', group_name: 'L', team1: 'sui', team2: 'egy', date: '2026-06-22', time: '12:00', venue: 'Dallas' },
  { phase: 'group', group_name: 'L', team1: 'bra', team2: 'egy', date: '2026-06-26', time: '21:00', venue: 'Seattle' },
  { phase: 'group', group_name: 'L', team1: 'sui', team2: 'aut', date: '2026-06-26', time: '21:00', venue: 'Houston' },
]

export const KNOCKOUT_ROUNDS = [
  { id: 'r32', name: 'Octavos de Final', slots: 16 },
  { id: 'r16', name: 'Cuartos de Final', slots: 8 },
  { id: 'qf', name: 'Semifinales', slots: 4 },
  { id: 'sf_winner', name: 'Finalistas', slots: 2 },
  { id: 'champion', name: 'Campeón', slots: 1 },
]
