import { format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { es } from "date-fns/locale/es";
import type { Locale } from "../shared/locale";

function dateFnsLocale(locale: Locale) {
  return locale === "es" ? es : enUS;
}

export function fmtDate(
  iso: string | null | undefined,
  locale: Locale = "en",
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = parseISO(iso);
  return isValid(d)
    ? format(d, "d MMM yyyy", { locale: dateFnsLocale(locale) })
    : fallback;
}

export function fmtDateShort(
  iso: string | null | undefined,
  locale: Locale = "en",
): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d)
    ? format(d, "d MMM", { locale: dateFnsLocale(locale) })
    : "—";
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
  locale: Locale = "en",
): string | null {
  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return null;
  }
}

export function monthShort(month: number, locale: Locale = "en"): string {
  return format(new Date(2001, month - 1, 1), "MMM", {
    locale: dateFnsLocale(locale),
  });
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** The message from a failed request, for showing in place of the thing that failed to load. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
