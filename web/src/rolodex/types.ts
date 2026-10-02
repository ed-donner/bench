export type Circle = "inner" | "close" | "wider" | "distant";
export type InteractionType = "call" | "message" | "email" | "met" | "other";
export type ImportantDateType =
  "birthday" | "anniversary" | "work_anniversary" | "child_birthday" | "other";
export type GiftKind = "idea" | "given" | "received";
export type CheckInStatus =
  "in_touch" | "due_soon" | "overdue" | "snoozed" | "off";
export type ConnectionKind =
  "partner" | "parent_child" | "sibling" | "colleague" | "other";

interface Person {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company: string | null;
  city: string | null;
  timezone: string | null;
  circle: Circle;
  cadence_override_days: number | null;
  checkins_off: boolean;
  snoozed_until: string | null;
  how_met: string | null;
  met_where: string | null;
  met_on: string | null;
  notes: string | null;
  tags: string[];
  photo: string | null;
  created_at: string;
  updated_at: string;
}

interface LatestNews {
  id: number;
  text: string;
  date: string;
}

export interface PersonComputed extends Person {
  last_contacted: string | null;
  next_due: string | null;
  status: CheckInStatus;
  latest_news: LatestNews | null;
}

export interface Interaction {
  id: number;
  person_id: number;
  type: InteractionType;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface ImportantDate {
  id: number;
  person_id: number;
  type: ImportantDateType;
  label: string | null;
  month: number;
  day: number;
  year: number | null;
  created_at: string;
}

export interface Fact {
  id: number;
  person_id: number;
  text: string;
  created_at: string;
}

export interface NewsItem {
  id: number;
  person_id: number;
  text: string;
  date: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  person_id: number;
  text: string;
  due_date: string;
  done: boolean;
  done_at: string | null;
  created_at: string;
}

export interface Gift {
  id: number;
  person_id: number;
  name: string;
  kind: GiftKind;
  occasion: string | null;
  date: string;
  created_at: string;
}

export interface ConnectionView {
  id: number;
  other_id: number;
  other_name: string;
  kind: ConnectionKind;
  description: string;
  note: string | null;
}

export interface TimelineEntry {
  id: string;
  person_id: number;
  person_name: string;
  kind: "interaction" | "news" | "reminder_done";
  interaction_type: InteractionType | null;
  date: string;
  text: string;
}

export type PersonInput = Omit<Person, "id" | "created_at" | "updated_at">;

export const CIRCLES: Circle[] = ["inner", "close", "wider", "distant"];

export const INTERACTION_TYPES: InteractionType[] = [
  "call",
  "message",
  "email",
  "met",
  "other",
];

export const DATE_TYPES: ImportantDateType[] = [
  "birthday",
  "anniversary",
  "work_anniversary",
  "child_birthday",
  "other",
];

/** An annual date resolved to its next occurrence, as the API returns it. */
export interface UpcomingDate extends Pick<
  ImportantDate,
  "id" | "person_id" | "type" | "label" | "month" | "day" | "year"
> {
  person_name: string;
  date: string;
  days_away: number;
  age_turning: number | null;
  milestone: boolean;
}

export interface CircleMeta {
  key: Circle;
  label: string;
  cadenceDays: number;
  cadenceDescription: string;
  blurb: string;
}
