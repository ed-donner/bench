import { format, parseISO, isValid, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { currentLang, locale, translate } from "../shared/i18n";

/** date-fns takes a locale object rather than a tag; English is its default and needs none. */
export function dateLocale() {
  return currentLang() === "es" ? es : undefined;
}

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

/** Calendar days from `fromToday` to `iso`; positive is the future. */
export function daysFrom(iso: string, fromToday?: string): number {
  const ref = fromToday ? parseISO(fromToday) : new Date();
  return differenceInCalendarDays(parseISO(iso), ref);
}

export function relativeDays(
  iso: string | null | undefined,
  fromToday?: string,
): string {
  if (!iso) return translate("rolodex:relative.never");
  const diff = daysFrom(iso, fromToday);
  if (diff === 0) return translate("rolodex:relative.today");
  if (diff === 1) return translate("rolodex:relative.tomorrow");
  if (diff === -1) return translate("rolodex:relative.yesterday");
  if (diff < 0) return translate("rolodex:relative.daysAgo", { count: -diff });
  return translate("rolodex:relative.inDays", { count: diff });
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
    // 24-hour in both languages: the column is narrow, and an AM/PM suffix would not fit.
    return new Intl.DateTimeFormat(locale(), {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
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

/** The message from a failed request, for showing in place of the thing that failed to load. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
