import type Database from "better-sqlite3";
import type { SeedLocale } from "../../bench/locale.js";
import { recordSeed } from "../../bench/meta.js";
import { Seeder } from "./seeder.js";
import { populateEn } from "./en.js";
import { populateEs } from "./es.js";

function isSeeded(db: Database.Database): boolean {
  const { c } = db.prepare("SELECT COUNT(*) AS c FROM pages").get() as {
    c: number;
  };
  return c > 0;
}

/** Populate a fresh database with the showcase workspace. */
export function seed(db: Database.Database, locale: SeedLocale = "en"): void {
  const s = new Seeder(db);
  if (locale === "es") populateEs(s);
  else populateEn(s);
  recordSeed(db, locale);
}

/** No-op if pages already exist. */
export function seedIfEmpty(
  db: Database.Database,
  locale: SeedLocale = "en",
): void {
  if (isSeeded(db)) return;
  seed(db, locale);
}
