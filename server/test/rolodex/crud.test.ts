import { describe, it, expect, beforeEach } from "vitest";
import { testRepo, makePerson } from "./helpers.js";
import type { ConnectionInput } from "../../src/rolodex/db/connections.js";
import type { Repo } from "../../src/rolodex/db/index.js";

/** A plain colleague connection, spread over with whatever the test is actually about. */
const CONNECTION: ConnectionInput = {
  kind: "colleague",
  a_is_parent: false,
  label: null,
  inverse_label: null,
  note: null,
};

let repo: Repo;
beforeEach(() => {
  repo = testRepo();
});

describe("people CRUD", () => {
  it("creates and reads a person", () => {
    const p = repo.createPerson({
      name: "Ada Lovelace",
      email: "ada@example.com",
      circle: "inner",
      tags: ["maths"],
    });
    expect(p.id).toBeGreaterThan(0);
    const fetched = repo.getPerson(p.id)!;
    expect(fetched.name).toBe("Ada Lovelace");
    expect(fetched.circle).toBe("inner");
    expect(fetched.tags).toEqual(["maths"]);
    expect(fetched.status).toBeDefined();
  });

  it("updates a person", () => {
    const p = makePerson(repo, "Grace Hopper");
    const updated = repo.updatePerson(p.id, {
      company: "US Navy",
      circle: "wider",
      tags: ["computing"],
    })!;
    expect(updated.company).toBe("US Navy");
    expect(updated.circle).toBe("wider");
    expect(updated.tags).toEqual(["computing"]);
    expect(repo.getPerson(p.id)!.name).toBe("Grace Hopper"); // untouched fields stay
  });

  it("deletes a person and cascades", () => {
    const p = makePerson(repo, "Temp Person");
    repo.createInteraction(p.id, "call", "2026-01-01", "x");
    repo.createFact(p.id, "fact");
    const q = makePerson(repo, "Other Person");
    repo.createConnection(p.id, q.id, CONNECTION);
    expect(repo.deletePerson(p.id)).toBe(true);
    expect(repo.getPerson(p.id)).toBeNull();
    expect(repo.listInteractions(p.id)).toHaveLength(0);
    expect(repo.listFacts(p.id)).toHaveLength(0);
    expect(repo.listConnections(q.id)).toHaveLength(0); // no broken connections
    expect(repo.deletePerson(p.id)).toBe(false);
  });

  it("lists people with computed fields", () => {
    const p = makePerson(repo, "With News");
    repo.createInteraction(p.id, "met", "2026-01-15", "lunch");
    repo.createNews(p.id, "Started a new job", "2026-01-10");
    const listed = repo.listPeople().find((x) => x.id === p.id)!;
    expect(listed.last_contacted).toBe("2026-01-15");
    expect(listed.latest_news?.text).toBe("Started a new job");
  });
});

describe("interactions CRUD", () => {
  it("creates, lists newest-first, and deletes", () => {
    const p = makePerson(repo);
    const i1 = repo.createInteraction(p.id, "call", "2025-06-01", "first");
    repo.createInteraction(p.id, "email", "2026-02-01", "second");
    const list = repo.listInteractions(p.id);
    expect(list).toHaveLength(2);
    expect(list[0].notes).toBe("second"); // newest first
    expect(repo.lastContacted(p.id)).toBe("2026-02-01");
    expect(repo.deleteInteraction(i1.id)).toBe(true);
    expect(repo.listInteractions(p.id)).toHaveLength(1);
  });

  it("recalculates last contacted when the newest interaction is deleted", () => {
    const p = makePerson(repo);
    const newest = repo.createInteraction(p.id, "call", "2026-05-01", "newest");
    repo.createInteraction(p.id, "call", "2026-01-01", "older");
    expect(repo.lastContacted(p.id)).toBe("2026-05-01");
    repo.deleteInteraction(newest.id);
    expect(repo.lastContacted(p.id)).toBe("2026-01-01");
  });
});

describe("important dates CRUD", () => {
  it("creates, reads and deletes dates", () => {
    const p = makePerson(repo);
    const d = repo.createDate(p.id, "birthday", null, {
      month: 3,
      day: 15,
      year: 1990,
    });
    repo.createDate(p.id, "anniversary", "Wedding", {
      month: 6,
      day: 14,
      year: 2018,
    });
    const list = repo.listDates(p.id);
    expect(list).toHaveLength(2);
    expect(list.find((x) => x.id === d.id)!.year).toBe(1990);
    expect(repo.listAllDates()).toHaveLength(2);
    repo.deleteDate(d.id);
    expect(repo.listDates(p.id)).toHaveLength(1);
  });
});

describe("facts CRUD", () => {
  it("creates and deletes facts", () => {
    const p = makePerson(repo);
    const f = repo.createFact(p.id, "Allergic to shellfish");
    expect(repo.listFacts(p.id)).toHaveLength(1);
    repo.deleteFact(f.id);
    expect(repo.listFacts(p.id)).toHaveLength(0);
  });
});

describe("news CRUD", () => {
  it("creates, lists newest-first, deletes", () => {
    const p = makePerson(repo);
    repo.createNews(p.id, "older news", "2025-01-01");
    const n2 = repo.createNews(p.id, "newer news", "2026-01-01");
    const list = repo.listNews(p.id);
    expect(list[0].text).toBe("newer news");
    expect(repo.getPerson(p.id)!.latest_news!.text).toBe("newer news");
    repo.deleteNews(n2.id);
    expect(repo.getPerson(p.id)!.latest_news!.text).toBe("older news");
  });
});

describe("reminders CRUD", () => {
  it("creates, toggles done, deletes", () => {
    const p = makePerson(repo);
    const r = repo.createReminder(p.id, "Send birthday card", "2026-09-01");
    expect(r.done).toBe(false);
    const done = repo.setReminderDone(r.id, true)!;
    expect(done.done).toBe(true);
    expect(done.done_at).toBeTruthy();
    const undone = repo.setReminderDone(r.id, false)!;
    expect(undone.done).toBe(false);
    expect(undone.done_at).toBeNull();
    // open reminders only includes not-done
    repo.setReminderDone(r.id, true);
    expect(repo.listOpenReminders()).toHaveLength(0);
    repo.deleteReminder(r.id);
    expect(repo.listReminders(p.id)).toHaveLength(0);
  });
});

describe("gifts CRUD", () => {
  it("creates, updates (e.g. mark given), deletes", () => {
    const p = makePerson(repo);
    const g = repo.createGift(
      p.id,
      "Ceramic bowl set",
      "idea",
      "Birthday",
      "2026-01-01",
    );
    expect(repo.listGifts(p.id)).toHaveLength(1);
    const updated = repo.updateGift(g.id, { kind: "given" })!;
    expect(updated.kind).toBe("given");
    repo.deleteGift(g.id);
    expect(repo.listGifts(p.id)).toHaveLength(0);
  });
});

describe("connections CRUD", () => {
  it("creates connections visible from both sides with correct descriptions", () => {
    const kate = makePerson(repo, "Kate Marsh");
    const sam = makePerson(repo, "Sam Fielding");
    repo.createConnection(kate.id, sam.id, {
      ...CONNECTION,
      kind: "parent_child",
      a_is_parent: true,
    });

    const fromKate = repo.listConnections(kate.id);
    expect(fromKate[0].other_name).toBe("Sam Fielding");
    expect(fromKate[0].description).toBe("Parent of Sam Fielding");
    expect(fromKate[0].role).toBe("parent");

    const fromSam = repo.listConnections(sam.id);
    expect(fromSam[0].other_name).toBe("Kate Marsh");
    expect(fromSam[0].description).toBe("Child of Kate Marsh");
    expect(fromSam[0].role).toBe("child");
  });

  it("deletes a connection from either side", () => {
    const a = makePerson(repo, "A");
    const b = makePerson(repo, "B");
    const c = repo.createConnection(a.id, b.id, {
      ...CONNECTION,
      kind: "partner",
    });
    expect(repo.listConnections(a.id)).toHaveLength(1);
    repo.deleteConnection(c.id);
    expect(repo.listConnections(a.id)).toHaveLength(0);
    expect(repo.listConnections(b.id)).toHaveLength(0);
  });

  it('supports labelled "other" connections readably from both sides', () => {
    const peter = makePerson(repo, "Peter Novak");
    const elena = makePerson(repo, "Elena Petrova");
    repo.createConnection(peter.id, elena.id, {
      ...CONNECTION,
      kind: "other",
      label: "Introduced me to Elena",
      inverse_label: "Introduced me to Peter",
    });
    expect(repo.listConnections(peter.id)[0].description).toBe(
      "Introduced me to Elena",
    );
    expect(repo.listConnections(elena.id)[0].description).toBe(
      "Introduced me to Peter",
    );
    expect(repo.listConnections(elena.id)[0]).toMatchObject({
      role: "other",
      label: "Introduced me to Peter",
    });
  });
});

describe("timeline", () => {
  it("combines interactions, news and completed reminders, newest first", () => {
    const p = makePerson(repo);
    repo.createInteraction(p.id, "call", "2026-03-01", "call notes");
    repo.createNews(p.id, "a news item", "2026-02-01");
    const r = repo.createReminder(p.id, "a reminder", "2026-01-01");
    repo.setReminderDone(r.id, true);
    const entries = repo.timeline(null, null);
    const today = new Date().toISOString().slice(0, 10);
    expect(entries.map((e) => e.date)).toEqual([
      today,
      "2026-03-01",
      "2026-02-01",
    ]);
    expect(repo.timeline(p.id, "interaction")).toHaveLength(1);
    expect(repo.timeline(p.id, "news")).toHaveLength(1);
    expect(repo.timeline(p.id, "reminder_done")).toHaveLength(1);
  });
});

describe("tags", () => {
  it("collects the distinct set of tags", () => {
    makePerson(repo, "One", { tags: ["family", "cycling"] });
    makePerson(repo, "Two", { tags: ["family", "tech"] });
    expect(repo.allTags()).toEqual(["cycling", "family", "tech"]);
  });
});
