import type {
  CheckInStatus,
  Circle,
  CircleMeta,
  InteractionType,
  ImportantDateType,
} from "./types";
import { format, parseISO, isValid, differenceInCalendarDays } from "date-fns";

import type { Translate } from "../shared/locales";

const CIRCLE_CADENCE_DAYS: Record<Circle, number> = {
  inner: 30,
  close: 91,
  wider: 182,
  distant: 365,
};

export function statusLabel(t: Translate, status: CheckInStatus): string {
  return t(`status.${status}`);
}

export function circleLabel(t: Translate, circle: Circle): string {
  return t(`circle.${circle}.label`);
}

export function circleMeta(t: Translate, circle: Circle): CircleMeta {
  return {
    key: circle,
    label: t(`circle.${circle}.label`),
    cadenceDays: CIRCLE_CADENCE_DAYS[circle],
    cadenceDescription: t(`circle.${circle}.cadence`),
    blurb: t(`circle.${circle}.blurb`),
  };
}

export function interactionMeta(
  t: Translate,
  type: InteractionType,
): { label: string; verb: string } {
  return {
    label: t(`interaction.${type}.label`),
    verb: t(`interaction.${type}.verb`),
  };
}

export function dateTypeLabel(
  t: Translate,
  type: ImportantDateType,
  label: string | null,
): string {
  if (type === "other" && label) return label;
  if (type === "child_birthday" && label)
    return t("dateType.childNamed", { name: label });
  return t(`dateType.${type}`);
}

export function relativeDays(
  t: Translate,
  iso: string | null | undefined,
  fromToday?: string,
): string {
  if (!iso) return t("relative.neverContacted");
  const ref = fromToday ? parseISO(fromToday) : new Date();
  const diff = differenceInCalendarDays(parseISO(iso), ref);
  if (diff === 0) return t("relative.today");
  if (diff === 1) return t("relative.tomorrow");
  if (diff === -1) return t("relative.yesterday");
  if (diff < 0) return t("relative.daysAgo", { days: -diff });
  return t("relative.inDays", { days: diff });
}

/** Table shorthand for an overdue check-in, e.g. "12d overdue". */
export function checkInOverdueShort(
  t: Translate,
  nextDue: string | null,
): string {
  if (!nextDue) return t("relative.neverContacted");
  const ref = new Date();
  const diff = differenceInCalendarDays(parseISO(nextDue), ref);
  if (diff >= 0)
    return t("people.checkInDue", { when: relativeDays(t, nextDue) });
  return t("people.checkInOverdue", { days: -diff });
}

export function checkInDueText(t: Translate, nextDue: string | null): string {
  if (!nextDue) return t("relative.neverContacted");
  return t("people.checkInDue", { when: relativeDays(t, nextDue) });
}

export function fmtDate(
  iso: string | null | undefined,
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = parseISO(iso);
  return isValid(d) ? format(d, "d MMM yyyy") : fallback;
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "d MMM") : "—";
}

const AVATAR_COLORS = [
  "#209dd7",
  "#753991",
  "#d98a00",
  "#217a4b",
  "#cf4436",
  "#0f766e",
  "#5b6ee1",
  "#b1359b",
  "#8a6d1f",
  "#64748b",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function localTimeIn(
  timezone: string | null | undefined,
): string | null {
  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return null;
  }
}

export function monthShort(month: number): string {
  return format(new Date(2001, month - 1, 1), "MMM");
}

export function monthName(t: Translate, month: number): string {
  return t(`month.${month}`);
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** The message from a failed request, for showing in place of the thing that failed to load. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
