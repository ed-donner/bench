import type { Repo } from "../db/index.js";
import { addDaysISO } from "../dates.js";
import type { Circle, InteractionType } from "../types.js";

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;

export interface PersonSeed {
  name: string;
  circle: Circle;
  company?: string;
  job_title?: string;
  city: string;
  timezone: string;
  email?: string;
  phone?: string;
  tags: string[];
  lastContactedDaysAgo?: number;
  interactionCount?: number;
  cadence_override_days?: number;
  checkins_off?: boolean;
  snoozed_until?: string;
  how_met?: string;
  met_where?: string;
  met_on?: string;
  notes?: string;
  birthday?: [number, number, number | null];
}

function slugEmail(name: string, domain: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z ]/g, "")
      .trim()
      .replace(/ +/g, ".") +
    "@" +
    domain
  );
}

/** How the seeded history is spread across the kinds of contact: mostly messages and calls. */
const INTERACTION_MIX: [InteractionType, number][] = [
  ["message", 0.3],
  ["call", 0.55],
  ["email", 0.7],
  ["met", 0.92],
  ["other", 1],
];

function pickType(roll: number): InteractionType {
  return (INTERACTION_MIX.find(([, upto]) => roll < upto) ?? ["other", 1])[0];
}

function addInteractions(opts: {
  repo: Repo;
  personId: number;
  person: PersonSeed;
  notePools: Record<InteractionType, string[]>;
  rand: Rand;
  today: string;
}): void {
  const { repo, personId, person: p, notePools, rand, today } = opts;
  if (p.lastContactedDaysAgo == null) return;
  let daysAgo = p.lastContactedDaysAgo;
  const used = new Set<string>();
  for (let i = 0; i < (p.interactionCount ?? 3); i++) {
    const date = addDaysISO(today, -daysAgo);
    if (!used.has(date)) {
      const type = pickType(rand());
      const pool = notePools[type];
      repo.createInteraction(
        personId,
        type,
        date,
        pool[Math.floor(rand() * pool.length)],
      );
      used.add(date);
    }
    daysAgo += 25 + Math.floor(rand() * 55);
  }
}

export function insertPeople(
  repo: Repo,
  people: PersonSeed[],
  notePools: Record<InteractionType, string[]>,
  rand: Rand,
  today: string,
): Map<string, number> {
  const ids = new Map<string, number>();
  for (const p of people) {
    const created = repo.createPerson({
      name: p.name,
      email: p.email ?? slugEmail(p.name, "example.com"),
      phone: p.phone ?? null,
      job_title: p.job_title || null,
      company: p.company || null,
      city: p.city,
      timezone: p.timezone,
      circle: p.circle,
      cadence_override_days: p.cadence_override_days ?? null,
      checkins_off: p.checkins_off === true,
      snoozed_until: p.snoozed_until ?? null,
      how_met: p.how_met ?? null,
      met_where: p.met_where ?? null,
      met_on: p.met_on ?? null,
      notes: p.notes ?? null,
      tags: p.tags,
    });
    ids.set(p.name, created.id);
    addInteractions({
      repo,
      personId: created.id,
      person: p,
      notePools,
      rand,
      today,
    });
    if (p.birthday) {
      const [month, day, year] = p.birthday;
      repo.createDate(created.id, "birthday", null, { month, day, year });
    }
  }
  return ids;
}
