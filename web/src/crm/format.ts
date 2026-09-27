/** Display formatting for the money and date values the CRM shows, in the page's language. */
import { currentLang, intlLocale } from "../shared/i18n";
import { t } from "./strings";

export function formatMoney(value: number): string {
  return value.toLocaleString(intlLocale(), {
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
export function formatMoneyCompact(value: number): string {
  if (Math.abs(value) < 1000) return formatMoney(value);
  const thousands = (value / 1000).toFixed(1).replace(/\.0$/, "");
  return currentLang() === "es"
    ? `${thousands.replace(".", ",")} k US$`
    : `$${thousands}k`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return parse(iso).toLocaleDateString(intlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Month and day only, for the pipeline cards, where a year would not earn its width. */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return t("format.noCloseDate");
  return parse(iso).toLocaleDateString(intlLocale(), {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleString(intlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
