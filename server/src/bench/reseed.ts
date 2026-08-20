import type Database from "better-sqlite3";
import type { DB as CrmDb } from "../crm/db.js";
import { seed as seedCrm } from "../crm/seed/index.js";
import type { Repo } from "../rolodex/db/index.js";
import { seed as seedRolodex } from "../rolodex/seed/index.js";
import { seed as seedSpace } from "../space/seed/index.js";
import type { SeedLocale } from "./locale.js";

export interface BenchDbs {
  crm: CrmDb;
  space: Database.Database;
  rolodex: Repo;
}

function wipeCrm(db: CrmDb): void {
  db.exec(`
    DELETE FROM activities;
    DELETE FROM deals;
    DELETE FROM contacts;
    DELETE FROM organizations;
  `);
}

function wipeSpace(db: Database.Database): void {
  db.exec(`
    DELETE FROM row_values;
    DELETE FROM views;
    DELETE FROM property_options;
    DELETE FROM properties;
    DELETE FROM blocks;
    DELETE FROM pages;
  `);
}

function wipeRolodex(repo: Repo): void {
  repo.db.exec(`
    DELETE FROM connections;
    DELETE FROM gifts;
    DELETE FROM reminders;
    DELETE FROM news;
    DELETE FROM facts;
    DELETE FROM important_dates;
    DELETE FROM interactions;
    DELETE FROM people;
  `);
}

/** Drop all seeded rows and repopulate every app database in the requested locale. */
export function wipeAndReseed(dbs: BenchDbs, locale: SeedLocale): void {
  wipeCrm(dbs.crm);
  wipeSpace(dbs.space);
  wipeRolodex(dbs.rolodex);
  seedCrm(dbs.crm, locale);
  seedSpace(dbs.space, locale);
  seedRolodex(dbs.rolodex, locale);
}
