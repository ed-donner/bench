import type { Repo } from "../db/index.js";
import { todayISO } from "../dates.js";
import type { SeedLocale } from "../../bench/locale.js";
import { recordSeed } from "../../bench/meta.js";
import { mulberry32 } from "./helpers.js";
import { populateEn } from "./en.js";
import { populateEs } from "./es.js";

function isSeeded(repo: Repo): boolean {
  return repo.personCount() > 0;
}

export function seed(repo: Repo, locale: SeedLocale = "en"): void {
  const rand = mulberry32(20260814);
  const today = todayISO();
  if (locale === "es") populateEs(repo, today, rand);
  else populateEn(repo, today, rand);
  recordSeed(repo.db, locale);
}

export function seedIfEmpty(repo: Repo, locale: SeedLocale = "en"): void {
  if (isSeeded(repo)) return;
  seed(repo, locale);
}
