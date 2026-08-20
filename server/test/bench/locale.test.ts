import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type express from "express";
import { createApp, type Dbs } from "../../src/app.js";
import { openDb as openCrmDb } from "../../src/crm/db.js";
import { seed as seedCrm } from "../../src/crm/seed/index.js";
import { getSeedLocale, isPristine } from "../../src/bench/meta.js";
import { openDb as openRolodexDb } from "../../src/rolodex/db/index.js";
import { seed as seedRolodex } from "../../src/rolodex/seed/index.js";
import { openDb as openSpaceDb } from "../../src/space/db.js";
import { seed as seedSpace } from "../../src/space/seed/index.js";

function freshDbs(): Dbs {
  const crm = openCrmDb(":memory:");
  const space = openSpaceDb(":memory:");
  const rolodex = openRolodexDb(":memory:");
  seedCrm(crm, "en");
  seedSpace(space, "en");
  seedRolodex(rolodex, "en");
  return { crm, space, rolodex };
}

describe("POST /api/bench/locale", () => {
  let app: express.Express;
  let dbs: Dbs;

  beforeEach(() => {
    dbs = freshDbs();
    app = createApp(dbs);
  });

  it("rejects an invalid locale", async () => {
    const res = await request(app)
      .post("/api/bench/locale")
      .send({ locale: "fr" });
    expect(res.status).toBe(400);
  });

  it("reseeds all databases when every one is still pristine", async () => {
    expect(isPristine(dbs.crm)).toBe(true);

    const res = await request(app)
      .post("/api/bench/locale")
      .send({ locale: "es" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reseeded: true, locale: "es" });
    expect(getSeedLocale(dbs.crm)).toBe("es");

    const org = dbs.crm
      .prepare("SELECT name FROM organizations LIMIT 1")
      .get() as { name: string };
    expect(org.name).toBe("Northwind Logística");
  });

  it("does not reseed after a mutating API call", async () => {
    await request(app)
      .post("/api/crm/organizations")
      .send({ name: "Touch", status: "lead" });

    expect(isPristine(dbs.crm)).toBe(false);

    const res = await request(app)
      .post("/api/bench/locale")
      .send({ locale: "es" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reseeded: false, locale: "en" });

    const org = dbs.crm
      .prepare("SELECT name FROM organizations WHERE name = ?")
      .get("Touch") as { name: string } | undefined;
    expect(org?.name).toBe("Touch");
  });
});

describe("Spanish seeding", () => {
  it("seeds CRM sample data in Spanish", () => {
    const db = openCrmDb(":memory:");
    seedCrm(db, "es");
    const org = db
      .prepare("SELECT name FROM organizations WHERE name LIKE ?")
      .get("Northwind%") as { name: string };
    expect(org.name).toBe("Northwind Logística");
    expect(getSeedLocale(db)).toBe("es");
  });

  it("seeds Space pages with Spanish titles", () => {
    const db = openSpaceDb(":memory:");
    seedSpace(db, "es");
    const home = db
      .prepare("SELECT title FROM pages WHERE title IN ('Inicio', 'Home')")
      .get() as { title: string } | undefined;
    expect(home?.title).toBe("Inicio");
  });

  it("seeds Rolodex interaction notes in Spanish", () => {
    const repo = openRolodexDb(":memory:");
    seedRolodex(repo, "es");
    const note = repo.db
      .prepare("SELECT notes FROM interactions WHERE notes LIKE ? LIMIT 1")
      .get("%teléfono%") as { notes: string } | undefined;
    expect(note?.notes).toMatch(/teléfono/i);
  });
});
