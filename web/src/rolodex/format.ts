import type { CheckInStatus, Circle, InteractionType } from "./types";
import { format, parseISO, isValid, differenceInCalendarDays } from "date-fns";
import { dateLocale, t } from "./strings";
import { RequestError } from "./requestError";

export const statusLabel = (status: CheckInStatus) => t(`status.${status}`);

export const circleLabel = (circle: Circle) => t(`circle.${circle}`);

export const interactionLabel = (type: InteractionType) =>
  t(`interaction.${type}`);

/** What a logged interaction did, as the feeds say it: "Called", "Met up". */
export const interactionVerb = (type: InteractionType) =>
  t(`interaction.${type}.verb`);

export function fmtDate(
  iso: string | null | undefined,
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = parseISO(iso);
  return isValid(d)
    ? format(d, "d MMM yyyy", { locale: dateLocale() })
    : fallback;
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "d MMM", { locale: dateLocale() }) : "—";
}

export function relativeDays(
  iso: string | null | undefined,
  fromToday?: string,
): string {
  if (!iso) return t("relative.never");
  const ref = fromToday ? parseISO(fromToday) : new Date();
  // Positive is the future: the date is that many days after the day we are counting from.
  const diff = differenceInCalendarDays(parseISO(iso), ref);
  if (diff === 0) return t("relative.today");
  if (diff === 1) return t("relative.tomorrow");
  if (diff === -1) return t("relative.yesterday");
  if (diff < 0) return t("relative.ago", { count: -diff });
  return t("relative.in", { count: diff });
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
  return format(new Date(2001, month - 1, 1), "MMM", { locale: dateLocale() });
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * A failed request, in words, for showing in place of the thing that failed to load. The server
 * answers in English, so its own message goes to the console for debugging and the page says
 * what kind of failure it was.
 */
export function errorMessage(e: unknown): string {
  console.error(e);
  if (e instanceof RequestError && e.status === 404) return t("error.notFound");
  if (e instanceof RequestError && e.status === 400)
    return t("error.badRequest");
  return t("error.failed");
}
