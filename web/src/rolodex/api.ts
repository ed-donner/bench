import type {
  Circle,
  ConnectionKind,
  ConnectionView,
  Fact,
  Gift,
  GiftKind,
  ImportantDate,
  ImportantDateType,
  Interaction,
  InteractionType,
  NewsItem,
  PersonComputed,
  PersonInput,
  Reminder,
  TimelineEntry,
} from "./types";
import type { UpcomingDate } from "./types";
import { apiHeaders } from "../shared/apiHeaders";

/** Paths are relative to the app's own namespace on the one Bench server. */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/rolodex${path}`, {
    ...options,
    headers: apiHeaders(options?.headers as Record<string, string>),
  });
  if (!res.ok) {
    // The API answers a bad request with { error }, and that message is what the toast shows.
    // Anything else - an empty body, HTML from a proxy - has to still name the status, or the
    // parse failure is all anyone sees.
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface PersonDetail {
  person: PersonComputed;
  interactions: Interaction[];
  dates: ImportantDate[];
  facts: Fact[];
  news: NewsItem[];
  reminders: Reminder[];
  gifts: Gift[];
  connections: ConnectionView[];
}

export interface ToContactRow {
  id: number;
  name: string;
  circle: Circle;
  photo: string | null;
  status: "overdue" | "due_soon";
  last_contacted: string | null;
  next_due: string | null;
  latest_news: { id: number; text: string; date: string } | null;
  overdue_days: number;
}

export interface TodayPayload {
  today: string;
  to_contact: ToContactRow[];
  upcoming_dates: UpcomingDate[];
  reminders: (Reminder & {
    person_name: string;
    overdue: boolean;
    due_today: boolean;
  })[];
  recent: TimelineEntry[];
}

export interface StatsPayload {
  months: { key: string; label: string; count: number }[];
  circles: {
    circle: Circle;
    label: string;
    total: number;
    in_touch: number;
    due_soon: number;
    overdue: number;
    snoozed: number;
    off: number;
  }[];
}

export interface CalendarPayload {
  year: number;
  month: number;
  events: UpcomingDate[];
  upcoming: UpcomingDate[];
}

export interface ImportRow {
  index: number;
  person: {
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    company: string | null;
    city: string | null;
    birthday: string | null;
    notes: string | null;
  };
  duplicate: {
    isDuplicate: boolean;
    duplicateOfId: number | null;
    duplicateOfName: string | null;
    reason: string | null;
  };
}

export interface ImportParsePayload {
  format: "csv" | "vcf";
  headers?: string[];
  raw_rows?: Record<string, string>[];
  suggested_mapping?: Record<string, string>;
  rows: ImportRow[];
  skipped?: number;
}

export const api = {
  listPeople: () => request<PersonComputed[]>("/people"),
  getPerson: (id: number) => request<PersonDetail>(`/people/${id}`),
  createPerson: (input: Partial<PersonInput>) =>
    request<PersonComputed>("/people", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updatePerson: (id: number, patch: Partial<PersonInput>) =>
    request<PersonComputed>(`/people/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deletePerson: (id: number) =>
    request<{ ok: boolean }>(`/people/${id}`, { method: "DELETE" }),

  addInteraction: (
    personId: number,
    type: InteractionType,
    date: string,
    notes: string,
  ) =>
    request<Interaction>(`/people/${personId}/interactions`, {
      method: "POST",
      body: JSON.stringify({ type, date, notes }),
    }),
  deleteInteraction: (id: number) =>
    request<{ ok: boolean }>(`/interactions/${id}`, { method: "DELETE" }),

  addDate: (
    personId: number,
    body: {
      type: ImportantDateType;
      label: string | null;
      month: number;
      day: number;
      year: number | null;
    },
  ) =>
    request<ImportantDate>(`/people/${personId}/dates`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteDate: (id: number) =>
    request<{ ok: boolean }>(`/dates/${id}`, { method: "DELETE" }),

  addFact: (personId: number, text: string) =>
    request<Fact>(`/people/${personId}/facts`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  deleteFact: (id: number) =>
    request<{ ok: boolean }>(`/facts/${id}`, { method: "DELETE" }),

  addNews: (personId: number, text: string, date?: string) =>
    request<NewsItem>(`/people/${personId}/news`, {
      method: "POST",
      body: JSON.stringify({ text, date }),
    }),
  deleteNews: (id: number) =>
    request<{ ok: boolean }>(`/news/${id}`, { method: "DELETE" }),

  addReminder: (personId: number, text: string, dueDate: string) =>
    request<Reminder>(`/people/${personId}/reminders`, {
      method: "POST",
      body: JSON.stringify({ text, due_date: dueDate }),
    }),
  setReminderDone: (id: number, done: boolean) =>
    request<Reminder>(`/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done }),
    }),
  deleteReminder: (id: number) =>
    request<{ ok: boolean }>(`/reminders/${id}`, { method: "DELETE" }),

  addGift: (
    personId: number,
    body: {
      name: string;
      kind: GiftKind;
      occasion: string | null;
      date: string;
    },
  ) =>
    request<Gift>(`/people/${personId}/gifts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateGift: (id: number, patch: Partial<Gift>) =>
    request<Gift>(`/gifts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteGift: (id: number) =>
    request<{ ok: boolean }>(`/gifts/${id}`, { method: "DELETE" }),

  addConnection: (
    personId: number,
    body: {
      other_id: number;
      kind: ConnectionKind;
      a_is_parent?: boolean;
      label?: string | null;
      inverse_label?: string | null;
      note?: string | null;
    },
  ) =>
    request<unknown>(`/people/${personId}/connections`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteConnection: (id: number) =>
    request<{ ok: boolean }>(`/connections/${id}`, { method: "DELETE" }),

  timeline: (personId: number | null, kind: string | null) => {
    const params = new URLSearchParams();
    if (personId != null) params.set("person", String(personId));
    if (kind) params.set("kind", kind);
    const qs = params.toString();
    const suffix = qs ? `?${qs}` : "";
    return request<TimelineEntry[]>(`/timeline${suffix}`);
  },

  calendar: (year: number, month: number) =>
    request<CalendarPayload>(`/calendar?year=${year}&month=${month}`),
  today: () => request<TodayPayload>("/today"),
  stats: () => request<StatsPayload>("/stats"),
  tags: () => request<string[]>("/tags"),

  importParse: (filename: string, content: string) =>
    request<ImportParsePayload>("/import/parse", {
      method: "POST",
      body: JSON.stringify({ filename, content }),
    }),
  importRemap: (
    headers: string[],
    rawRows: Record<string, string>[],
    mapping: Record<string, string>,
  ) =>
    request<{ rows: ImportRow[] }>("/import/remap", {
      method: "POST",
      body: JSON.stringify({ headers, raw_rows: rawRows, mapping }),
    }),
  importApply: (people: ImportRow["person"][]) =>
    request<{ created: { id: number; name: string }[]; skipped: number }>(
      "/import/apply",
      {
        method: "POST",
        body: JSON.stringify({ people }),
      },
    ),
};
