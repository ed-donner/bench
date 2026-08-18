/**
 * Annual dates, resolved in the browser. The server owns the same arithmetic for what it sends
 * back (server/src/rolodex/importantDates.ts); these are here because a person's page resolves
 * their dates locally, without a round trip.
 */
import type { ImportantDate, ImportantDateType } from "./types";
import { translate } from "../shared/i18n";

export interface Occurrence {
  date: string;
  years: number | null;
  ageTurning: number | null;
  milestone: boolean;
}

type AnnualDate = Pick<ImportantDate, "month" | "day" | "year">;

const iso = (d: Date) =>
  `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Whole days from `from` to `date`, both yyyy-mm-dd. Negative when the date has passed. */
export function daysUntil(date: string, from: string): number {
  return Math.round(
    (Date.parse(`${date}T00:00:00`) - Date.parse(`${from}T00:00:00`)) /
      86400000,
  );
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** A 29 February date is celebrated on the 28th in non-leap years. */
export function effectiveDay(month: number, day: number, year: number): number {
  if (month === 2 && day === 29 && !isLeapYear(year)) return 28;
  return day;
}

/** The next occurrence on or after `from`, rolling into next year once this year's has passed. */
export function nextOccurrence(d: AnnualDate, from: string): Occurrence {
  const fromDate = new Date(`${from}T00:00:00`);
  const year = fromDate.getFullYear();
  for (const y of [year, year + 1]) {
    const date = iso(new Date(y, d.month - 1, effectiveDay(d.month, d.day, y)));
    if (date >= from) {
      const ageTurning = d.year == null ? null : y - d.year;
      return {
        date,
        years: ageTurning,
        ageTurning,
        milestone:
          ageTurning != null && ageTurning > 0 && ageTurning % 10 === 0,
      };
    }
  }
  throw new Error(`No occurrence of ${d.month}/${d.day} on or after ${from}`);
}

/** Age as of `today`, for dates with a known year. */
export function currentAge(d: AnnualDate, today: string): number | null {
  if (d.year == null) return null;
  const t = new Date(`${today}T00:00:00`);
  const year = t.getFullYear();
  const thisYear = iso(
    new Date(year, d.month - 1, effectiveDay(d.month, d.day, year)),
  );
  return (thisYear <= today ? year : year - 1) - d.year;
}

export function dateTypeLabel(
  type: ImportantDateType,
  label: string | null,
): string {
  if (type === "other" && label) return label;
  if (type === "child_birthday" && label)
    return translate("rolodex:dateType.childBirthdayOf", { name: label });
  return translate(`rolodex:dateType.${type}`);
}
