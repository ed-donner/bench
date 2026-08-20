import type { DB } from "../db.js";
import type { SeedLocale } from "../../bench/locale.js";
import { recordSeed } from "../../bench/meta.js";
import { seedEn } from "./en.js";
import { seedEs } from "./es.js";

export function isSeeded(db: DB): boolean {
  const row = db.prepare("SELECT COUNT(*) AS n FROM organizations").get() as {
    n: number;
  };
  return row.n > 0;
}

/** Fills an empty database with realistic sample data. Dates are relative to today. */
export function seed(db: DB, locale: SeedLocale = "en"): void {
  if (locale === "es") seedEs(db);
  else seedEn(db);
  recordSeed(db, locale);
}
