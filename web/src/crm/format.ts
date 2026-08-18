/** Display formatting for the money and date values the CRM shows, in the chosen language. */
import { locale, translate } from "../shared/i18n";

/**
 * narrowSymbol rather than the default: Spanish spells USD as "US$", which makes every figure
 * three characters wider and overflows the pipeline cards and the board's column totals. It
 * changes nothing in English, where "$" is already the default symbol.
 */
export function formatMoney(value: number): string {
  return value.toLocaleString(locale(), {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
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

/**
 * Rounded to thousands, for the pipeline cards where the exact figure is already above it. The
 * pattern comes from the bundle rather than Intl's compact notation, which reads "1,3 mil US$"
 * in Spanish - three times the width of a card that has room for a number and a letter.
 */
export function formatMoneyCompact(value: number): string {
  if (Math.abs(value) < 1000) return formatMoney(value);
  const thousands = (value / 1000).toLocaleString(locale(), {
    maximumFractionDigits: 1,
  });
  return translate("crm:money.compact", { value: thousands });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return parse(iso).toLocaleDateString(locale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Month and day only, for the pipeline cards, where a year would not earn its width. */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return translate("crm:empty.noCloseDate");
  return parse(iso).toLocaleDateString(locale(), {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleString(locale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
