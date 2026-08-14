// backend/src/db.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type DB = Database.Database;

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'taskflow.db');

let instance: DB | null = null;

export function getDb(dbPath?: string): DB {
  const target = dbPath ?? process.env.DB_PATH ?? DEFAULT_DB_PATH;

  if (!instance || (instance as any).open !== true) {
    if (target !== ':memory:') {
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    instance = new Database(target);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');
    initSchema(instance);
  }
  return instance;
}

export function resetDb(dbPath?: string): DB {
  if (instance) {
    try { instance.close(); } catch { /* ignore */ }
    instance = null;
  }
  return getDb(dbPath);
}

function initSchema(db: DB) {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');
  db.exec(schema);

  const { c } = db.prepare('SELECT COUNT(*) AS c FROM boards').get() as { c: number };
  if (c === 0) {
    const seed = fs.readFileSync(path.join(__dirname, '..', 'seed.sql'), 'utf-8');
    db.exec(seed);
  }
}