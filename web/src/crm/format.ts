/** Display formatting for the money and date values the CRM shows. */

import { intlTag, type Locale } from "../shared/locales";

function localeTag(locale?: Locale): string {
  return intlTag(locale ?? "en");
}

export function formatMoney(value: number, locale?: Locale): string {
  return value.toLocaleString(localeTag(locale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** A plain date is read as local midnight; a timestamp is UTC, which is how SQLite stores it. */
function parse(iso: string): Date {
  return new Date(
    iso.includes("T") || iso.includes(" ")
      ? iso.replace(" ", "T") + "Z"
      : iso + "T00:00:00",
  );
}

/** Rounded to thousands, for the pipeline cards where the exact figure is already above it. */
export function formatMoneyCompact(value: number, locale?: Locale): string {
  if (Math.abs(value) < 1000) return formatMoney(value, locale);
  const thousands = (value / 1000).toFixed(1).replace(/\.0$/, "");
  return `$${thousands}k`;
}

export function formatDate(
  iso: string | null | undefined,
  locale?: Locale,
): string {
  if (!iso) return "—";
  const isTimestamp = iso.includes("T") || iso.includes(" ");
  return parse(iso).toLocaleDateString(localeTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    // SQLite timestamps are UTC; show the UTC calendar date, not local midnight.
    ...(isTimestamp ? { timeZone: "UTC" } : {}),
  });
}

/** Month and day only, for the pipeline cards, where a year would not earn its width. */
export function formatDateShort(
  iso: string | null | undefined,
  locale?: Locale,
  emptyLabel = "No close date",
): string {
  if (!iso) return emptyLabel;
  const isTimestamp = iso.includes("T") || iso.includes(" ");
  return parse(iso).toLocaleDateString(localeTag(locale), {
    month: "short",
    day: "numeric",
    ...(isTimestamp ? { timeZone: "UTC" } : {}),
  });
}

export function formatDateTime(iso: string, locale?: Locale): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleString(localeTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
