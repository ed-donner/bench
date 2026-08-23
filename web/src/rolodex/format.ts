import type {
  CheckInStatus,
  Circle,
  InteractionType,
  ImportantDateType,
} from "./types";
import { format, parseISO, isValid, differenceInCalendarDays } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { translate, type MessageKey, type TranslateFn } from "../shared/i18n";
import { currentLocale } from "../shared/locale";

export function dateFnsLocale() {
  return document.documentElement.lang === "es" ? es : enUS;
}

function tr(key: MessageKey, params?: Record<string, string | number>): string {
  return translate(currentLocale(), key, params);
}

const CIRCLE_CADENCE_KEY: Record<
  Circle,
  "monthly" | "quarterly" | "sixMonths" | "yearly"
> = {
  inner: "monthly",
  close: "quarterly",
  wider: "sixMonths",
  distant: "yearly",
};

export function statusLabel(
  status: CheckInStatus,
  t: TranslateFn = tr,
): string {
  return t(`rolodex.status.${status}`);
}

export function circleLabel(circle: Circle, t: TranslateFn = tr): string {
  return t(`rolodex.circle.${circle}`);
}

export function circleCadence(circle: Circle, t: TranslateFn = tr): string {
  return t(`rolodex.circle.cadence.${CIRCLE_CADENCE_KEY[circle]}`);
}

export function circleBlurb(circle: Circle, t: TranslateFn = tr): string {
  return t(`rolodex.circle.${circle}.blurb`);
}

export function interactionLabel(
  type: InteractionType,
  t: TranslateFn = tr,
): string {
  return t(`rolodex.interaction.${type}`);
}

export function interactionVerb(
  type: InteractionType,
  t: TranslateFn = tr,
): string {
  return t(`rolodex.interaction.${type}.verb`);
}

export function dateTypeLabelKey(type: ImportantDateType): MessageKey {
  return `rolodex.dateType.${type}`;
}

export function fmtDate(
  iso: string | null | undefined,
  fallback?: string,
  t: TranslateFn = tr,
): string {
  const dash = fallback ?? t("shared.common.emDash");
  if (!iso) return dash;
  const d = parseISO(iso);
  return isValid(d)
    ? format(d, "d MMM yyyy", { locale: dateFnsLocale() })
    : dash;
}

export function fmtDateShort(
  iso: string | null | undefined,
  t: TranslateFn = tr,
): string {
  if (!iso) return t("shared.common.emDash");
  const d = parseISO(iso);
  return isValid(d)
    ? format(d, "d MMM", { locale: dateFnsLocale() })
    : t("shared.common.emDash");
}

export function relativeDays(
  iso: string | null | undefined,
  fromToday?: string,
  t: TranslateFn = tr,
): string {
  if (!iso) return t("rolodex.time.neverContacted");
  const ref = fromToday ? parseISO(fromToday) : new Date();
  const diff = differenceInCalendarDays(parseISO(iso), ref);
  if (diff === 0) return t("rolodex.time.today");
  if (diff === 1) return t("rolodex.time.tomorrow");
  if (diff === -1) return t("rolodex.time.yesterday");
  if (diff < 0) return t("rolodex.time.daysAgo", { count: -diff });
  return t("rolodex.time.inDays", { count: diff });
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
    const intlLocale =
      document.documentElement.lang === "es" ? "es-ES" : "en-GB";
    return new Intl.DateTimeFormat(intlLocale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return null;
  }
}

export function monthShort(month: number): string {
  return format(new Date(2001, month - 1, 1), "MMM", {
    locale: dateFnsLocale(),
  });
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** The message from a failed request, for showing in place of the thing that failed to load. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
