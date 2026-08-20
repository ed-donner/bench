import type Database from "better-sqlite3";
import type { SeedLocale } from "./locale.js";

const TABLE = "bench_meta";
const LOCALE_KEY = "seed_locale";
const PRISTINE_KEY = "seed_pristine";

/** One key/value table per app database for seed bookkeeping. */
function ensureMetaTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

function getMeta(db: Database.Database, key: string): string | null {
  ensureMetaTable(db);
  const row = db
    .prepare(`SELECT value FROM ${TABLE} WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

function setMeta(db: Database.Database, key: string, value: string): void {
  ensureMetaTable(db);
  db.prepare(
    `INSERT INTO ${TABLE} (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value);
}

export function markPristine(db: Database.Database, pristine: boolean): void {
  setMeta(db, PRISTINE_KEY, pristine ? "true" : "false");
}

export function isPristine(db: Database.Database): boolean {
  return getMeta(db, PRISTINE_KEY) === "true";
}

export function getSeedLocale(db: Database.Database): SeedLocale {
  const locale = getMeta(db, LOCALE_KEY);
  return locale === "es" ? "es" : "en";
}

export function recordSeed(db: Database.Database, locale: SeedLocale): void {
  ensureMetaTable(db);
  setMeta(db, LOCALE_KEY, locale);
  markPristine(db, true);
}
