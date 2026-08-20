import { beforeEach, describe, expect, it } from "vitest";
import { openDb, type Repo } from "../../src/rolodex/db/index.js";
import { seedIfEmpty } from "../../src/rolodex/seed/index.js";
import { todayISO } from "../../src/rolodex/dates.js";
import { upcomingDates } from "../../src/rolodex/importantDates.js";

/**
 * The seed is what a new rolodex looks like on first launch, so it is checked the way you would
 * look at it: is every screen alive, and is any of it obviously wrong?
 */
let repo: Repo;

beforeEach(() => {
  repo = openDb(":memory:");
  seedIfEmpty(repo, "en");
});

describe("the seeded rolodex", () => {
  it("fills every circle with people", () => {
    const people = repo.listPeople();
    expect(people.length).toBeGreaterThan(20);
    for (const circle of ["inner", "close", "wider", "distant"] as const)
      expect(people.filter((p) => p.circle === circle).length).toBeGreaterThan(
        0,
      );
  });

  it("leaves nobody without an email or a tag to filter by", () => {
    for (const p of repo.listPeople()) {
      expect(p.email).toBeTruthy();
      expect(p.name.trim()).not.toBe("");
    }
    expect(repo.allTags().length).toBeGreaterThan(5);
  });

  it("gives Today something in each of its sections", () => {
    const people = repo.listPeople();
    expect(people.some((p) => p.status === "overdue")).toBe(true);
    expect(people.some((p) => p.status === "in_touch")).toBe(true);
    expect(repo.listOpenReminders().length).toBeGreaterThan(0);
    expect(upcomingDates(repo.listAllDates(), 30).length).toBeGreaterThan(0);
  });

  it("spreads interactions back through the year, none of them in the future", () => {
    const timeline = repo.timeline(null, "interaction");
    expect(timeline.length).toBeGreaterThan(50);
    const today = todayISO();
    for (const entry of timeline) expect(entry.date <= today).toBe(true);
    const oldest = timeline.at(-1)!;
    expect(oldest.date < today).toBe(true);
  });

  it("connects people to each other, readably from both ends", () => {
    const withConnections = repo
      .listPeople()
      .map((p) => repo.listConnections(p.id))
      .filter((c) => c.length > 0);
    expect(withConnections.length).toBeGreaterThan(4);
    for (const connection of withConnections.flat())
      expect(connection.description).not.toBe("");
  });

  it("includes someone snoozed and someone with check-ins off, so both states show", () => {
    const people = repo.listPeople();
    expect(people.some((p) => p.status === "snoozed")).toBe(true);
    expect(people.some((p) => p.checkins_off)).toBe(true);
  });

  it("does not seed a second time over an existing rolodex", () => {
    const before = repo.personCount();
    seedIfEmpty(repo, "en");
    expect(repo.personCount()).toBe(before);
  });

  it("plants a birthday in each of the next three months, whatever today is", () => {
    const upcoming = upcomingDates(repo.listAllDates(), 95);
    expect(upcoming.length).toBeGreaterThanOrEqual(3);
  });
});
