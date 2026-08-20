import type {
  Fact,
  Gift,
  ImportantDate,
  Interaction,
  NewsItem,
  PersonComputed,
  Reminder,
  TimelineEntry,
  UpcomingDate,
} from "../types";
import type { PersonDetail, TodayPayload, StatsPayload } from "../api";
import type { ReactElement } from "react";
import { createElement } from "react";
import { LocaleProvider } from "../../shared/LocaleContext";

/** Wrap a component tree with LocaleProvider for tests. */
export function withLocale(ui: ReactElement) {
  return createElement(LocaleProvider, null, ui);
}

/** Fixture builders. Every field has a default, so a test names only what it is about. */

export function person(partial: Partial<PersonComputed> = {}): PersonComputed {
  return {
    id: 1,
    name: "Maya Chen",
    email: "maya@example.com",
    phone: "+44 20 7000 0000",
    job_title: "Product Designer",
    company: "Figma",
    city: "London",
    timezone: "Europe/London",
    circle: "close",
    cadence_override_days: null,
    checkins_off: false,
    snoozed_until: null,
    how_met: "University",
    met_where: "Manchester",
    met_on: "2010-09-01",
    notes: null,
    tags: ["design"],
    photo: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    last_contacted: "2026-06-01",
    next_due: "2026-09-01",
    status: "in_touch",
    latest_news: null,
    ...partial,
  };
}

export function interaction(partial: Partial<Interaction> = {}): Interaction {
  return {
    id: 1,
    person_id: 1,
    type: "call",
    date: "2026-06-01",
    notes: "Caught up about the move",
    created_at: "2026-06-01T10:00:00.000Z",
    ...partial,
  };
}

export function importantDate(
  partial: Partial<ImportantDate> = {},
): ImportantDate {
  return {
    id: 1,
    person_id: 1,
    type: "birthday",
    label: null,
    month: 3,
    day: 15,
    year: 1990,
    created_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

export function fact(partial: Partial<Fact> = {}): Fact {
  return {
    id: 1,
    person_id: 1,
    text: "Allergic to shellfish",
    created_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

export function news(partial: Partial<NewsItem> = {}): NewsItem {
  return {
    id: 1,
    person_id: 1,
    text: "Started at Figma",
    date: "2026-05-02",
    created_at: "2026-05-02T00:00:00.000Z",
    ...partial,
  };
}

export function reminder(partial: Partial<Reminder> = {}): Reminder {
  return {
    id: 1,
    person_id: 1,
    text: "Book a table",
    due_date: "2026-08-20",
    done: false,
    done_at: null,
    created_at: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

export function gift(partial: Partial<Gift> = {}): Gift {
  return {
    id: 1,
    person_id: 1,
    name: "Ceramic bowls",
    kind: "idea",
    occasion: "Birthday",
    date: "2026-08-01",
    created_at: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

export function upcoming(partial: Partial<UpcomingDate> = {}): UpcomingDate {
  return {
    id: 1,
    person_id: 1,
    person_name: "Maya Chen",
    type: "birthday",
    label: null,
    month: 8,
    day: 21,
    year: 1991,
    date: "2026-08-21",
    days_away: 6,
    age_turning: 35,
    milestone: false,
    ...partial,
  };
}

export function timelineEntry(
  partial: Partial<TimelineEntry> = {},
): TimelineEntry {
  return {
    id: "interaction-1",
    person_id: 1,
    person_name: "Maya Chen",
    kind: "interaction",
    interaction_type: "call",
    date: "2026-06-01",
    text: "Caught up about the move",
    ...partial,
  };
}

export function detail(partial: Partial<PersonDetail> = {}): PersonDetail {
  return {
    person: person(),
    interactions: [interaction()],
    dates: [importantDate()],
    facts: [fact()],
    news: [news()],
    reminders: [reminder()],
    gifts: [gift()],
    connections: [],
    ...partial,
  };
}

export function today(partial: Partial<TodayPayload> = {}): TodayPayload {
  return {
    today: "2026-08-15",
    to_contact: [],
    upcoming_dates: [],
    reminders: [],
    recent: [],
    ...partial,
  };
}

export function stats(partial: Partial<StatsPayload> = {}): StatsPayload {
  return {
    months: [{ key: "2026-08", label: "Aug 26", count: 3 }],
    circles: [
      {
        circle: "close",
        label: "Close",
        total: 2,
        in_touch: 1,
        due_soon: 0,
        overdue: 1,
        snoozed: 0,
        off: 0,
      },
    ],
    ...partial,
  };
}
