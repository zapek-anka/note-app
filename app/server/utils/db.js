import Database from 'better-sqlite3'

const db = new Database('data/app.db')
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (...);
  CREATE TABLE IF NOT EXISTS notes (...);
`)

export default db