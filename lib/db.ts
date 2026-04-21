import Database from 'better-sqlite3'
import path from 'path'
import { GROUP_MATCHES, GROUPS } from './wc2026-data'

const DATA_DIR = process.env.DATA_DIR ?? process.cwd()
const DB_PATH = path.join(DATA_DIR, 'quiniela.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase TEXT NOT NULL,
      group_name TEXT,
      team1 TEXT NOT NULL,
      team2 TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT '18:00',
      venue TEXT NOT NULL DEFAULT '',
      score1 INTEGER,
      score2 INTEGER,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      match_id INTEGER NOT NULL REFERENCES matches(id),
      pred_score1 INTEGER NOT NULL,
      pred_score2 INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS group_picks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      group_name TEXT NOT NULL,
      pos1 TEXT NOT NULL,
      pos2 TEXT NOT NULL,
      pos3 TEXT NOT NULL,
      pos4 TEXT NOT NULL,
      UNIQUE(user_id, group_name)
    );

    CREATE TABLE IF NOT EXISTS bracket_picks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      round TEXT NOT NULL,
      teams TEXT NOT NULL DEFAULT '[]',
      UNIQUE(user_id, round)
    );

    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position INTEGER NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      amount TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  seedMatchesIfNeeded(db)
  seedDefaultSettings(db)
  seedDefaultPrizes(db)
  seedAdminIfNeeded(db)
}

const DATA_VERSION = '3'

function seedMatchesIfNeeded(db: Database.Database) {
  // Check data version — if outdated, wipe group matches and reseed
  const version = (db.prepare("SELECT value FROM settings WHERE key = 'data_version'").get() as { value: string } | undefined)?.value
  if (version === DATA_VERSION) return

  db.prepare("DELETE FROM predictions WHERE match_id IN (SELECT id FROM matches WHERE phase = 'group')").run()
  db.prepare("DELETE FROM group_picks").run()
  db.prepare("DELETE FROM matches WHERE phase = 'group'").run()

  const insert = db.prepare(
    'INSERT INTO matches (phase, group_name, team1, team2, date, time, venue) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const insertMany = db.transaction(() => {
    for (const m of GROUP_MATCHES) {
      insert.run(m.phase, m.group_name, m.team1, m.team2, m.date, m.time, m.venue)
    }
  })
  insertMany()
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('data_version', ?)").run(DATA_VERSION)
}

function seedDefaultSettings(db: Database.Database) {
  const existing = db.prepare("SELECT value FROM settings WHERE key = 'predictions_locked'").get()
  if (!existing) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('predictions_locked', 'false')").run()
    db.prepare("INSERT INTO settings (key, value) VALUES ('tournament_name', 'Quiniela Mundial 2026')").run()
    db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')").run()
    // default password: "admin123"
  }
}

function seedDefaultPrizes(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM prizes').get() as { c: number }).c
  if (count > 0) return
  db.prepare("INSERT INTO prizes (position, description, amount) VALUES (1, '1er Lugar', 'Por definir')").run()
  db.prepare("INSERT INTO prizes (position, description, amount) VALUES (2, '2do Lugar', 'Por definir')").run()
  db.prepare("INSERT INTO prizes (position, description, amount) VALUES (3, '3er Lugar', 'Por definir')").run()
}

function seedAdminIfNeeded(db: Database.Database) {
  const admin = db.prepare("SELECT id FROM users WHERE is_admin = 1").get()
  if (!admin) {
    db.prepare("INSERT INTO users (name, invite_code, is_admin) VALUES ('Admin', 'ADMIN0000', 1)").run()
  }
}

export function getSetting(key: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string) {
  const db = getDb()
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

export function isPredictionsLocked(): boolean {
  return getSetting('predictions_locked') === 'true'
}

export function getGroupStandings(groupId: string): string[] {
  const db = getDb()
  const matches = db.prepare(
    "SELECT * FROM matches WHERE group_name = ? AND status = 'finished'"
  ).all(groupId) as Array<{team1: string, team2: string, score1: number, score2: number}>

  const { GROUPS } = require('./wc2026-data')
  const group = GROUPS.find((g: { id: string }) => g.id === groupId)
  if (!group) return []

  const points: Record<string, { pts: number; gf: number; ga: number }> = {}
  for (const t of group.teams) points[t] = { pts: 0, gf: 0, ga: 0 }

  for (const m of matches) {
    const { team1, team2, score1, score2 } = m
    if (score1 > score2) { points[team1].pts += 3 }
    else if (score1 === score2) { points[team1].pts += 1; points[team2].pts += 1 }
    else { points[team2].pts += 3 }
    points[team1].gf += score1; points[team1].ga += score2
    points[team2].gf += score2; points[team2].ga += score1
  }

  return group.teams.slice().sort((a: string, b: string) => {
    const pa = points[a], pb = points[b]
    if (pb.pts !== pa.pts) return pb.pts - pa.pts
    return (pb.gf - pb.ga) - (pa.gf - pa.ga)
  })
}
