import { valueText } from "./valueText";
import type {
  DbRow,
  Filter,
  Property,
  PropertyOption,
  PropertyType,
} from "../api";

export const TITLE_ID = "__title";

export interface OperatorDef {
  op: string;
  needsValue: boolean;
}

/** Operators offered per property type. */
export function operatorsFor(type: PropertyType | "title"): OperatorDef[] {
  switch (type) {
    case "title":
    case "text":
    case "url":
      return [
        { op: "contains", needsValue: true },
        { op: "not_contains", needsValue: true },
      ];
    case "number":
      return [
        { op: "eq", needsValue: true },
        { op: "gt", needsValue: true },
        { op: "lt", needsValue: true },
      ];
    case "select":
      return [
        { op: "is", needsValue: true },
        { op: "is_not", needsValue: true },
      ];
    case "multi_select":
      return [{ op: "has", needsValue: true }];
    case "date":
      return [
        { op: "before", needsValue: true },
        { op: "after", needsValue: true },
      ];
    case "checkbox":
      return [
        { op: "checked", needsValue: false },
        { op: "unchecked", needsValue: false },
      ];
  }
}

function rowValue(row: DbRow, propertyId: string): unknown {
  return propertyId === TITLE_ID ? row.title : row.values[propertyId];
}

const contains = (value: unknown, target: unknown) =>
  typeof target === "string" &&
  valueText(value).toLowerCase().includes(target.toLowerCase());

/** A date cell holds an ISO string; an empty one is "no date" rather than the earliest one. */
const isDate = (value: unknown): value is string =>
  typeof value === "string" && value !== "";

/**
 * One predicate per operator. A stored view config carries its operator as a plain string, so an
 * operator this build does not know falls through to "matches everything" rather than hiding every
 * row - which is why this is a Map rather than a lookup that is always defined.
 */
const OPERATORS = new Map<string, (value: unknown, target: unknown) => boolean>(
  [
    ["contains", contains],
    ["not_contains", (value, target) => !contains(value, target)],
    [
      "eq",
      (value, target) => typeof value === "number" && value === Number(target),
    ],
    [
      "gt",
      (value, target) => typeof value === "number" && value > Number(target),
    ],
    [
      "lt",
      (value, target) => typeof value === "number" && value < Number(target),
    ],
    ["is", (value, target) => value === target],
    ["is_not", (value, target) => value !== target],
    ["has", (value, target) => Array.isArray(value) && value.includes(target)],
    [
      "before",
      (value, target) =>
        isDate(value) && typeof target === "string" && value < target,
    ],
    [
      "after",
      (value, target) =>
        isDate(value) && typeof target === "string" && value > target,
    ],
    ["checked", (value) => Boolean(value)],
    ["unchecked", (value) => !value],
  ],
);

export function matchesFilter(
  row: DbRow,
  filter: Filter,
  properties: Property[],
): boolean {
  if (
    filter.propertyId !== TITLE_ID &&
    !properties.some((p) => p.id === filter.propertyId)
  ) {
    return true; // the filtered property was deleted; ignore the filter rather than hide everything
  }
  const predicate = OPERATORS.get(filter.operator);
  if (!predicate) return true;
  return predicate(rowValue(row, filter.propertyId), filter.value);
}

export function applyFilters(
  rows: DbRow[],
  filters: Filter[],
  properties: Property[],
): DbRow[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((f) => matchesFilter(row, f, properties)),
  );
}

function sortKey(
  row: DbRow,
  propertyId: string,
  properties: Property[],
): string | number {
  const value = rowValue(row, propertyId);
  const prop = properties.find((p) => p.id === propertyId);
  if (value == null)
    return prop?.type === "number" ? Number.NEGATIVE_INFINITY : "";
  switch (prop?.type) {
    case "number":
      return typeof value === "number" ? value : Number.NEGATIVE_INFINITY;
    case "checkbox":
      return value === true ? 1 : 0;
    case "select": {
      const opt = prop.options.find((o) => o.id === value);
      return (opt?.name ?? "").toLowerCase();
    }
    case "multi_select": {
      if (!Array.isArray(value)) return "";
      const names = value
        .map((id) => prop.options.find((o) => o.id === id)?.name ?? "")
        .filter(Boolean)
        .map((n) => n.toLowerCase());
      return [...names].sort((a, b) => a.localeCompare(b)).join(",");
    }
    default:
      return valueText(value).toLowerCase();
  }
}

export function applySort(
  rows: DbRow[],
  sort: { propertyId: string; direction: "asc" | "desc" } | null,
  properties: Property[],
): DbRow[] {
  if (!sort) return rows;
  const dir = sort.direction === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const ka = sortKey(a, sort.propertyId, properties);
    const kb = sortKey(b, sort.propertyId, properties);
    if (ka < kb) return -dir;
    if (ka > kb) return dir;
    return 0;
  });
}

export interface BoardColumn {
  option: PropertyOption | null;
  rows: DbRow[];
}

/** One column per option of the grouping select property, plus a "none" column. */
export function groupRows(
  rows: DbRow[],
  groupProperty: Property,
): BoardColumn[] {
  const columns: BoardColumn[] = [{ option: null, rows: [] }];
  for (const option of groupProperty.options)
    columns.push({ option, rows: [] });
  for (const row of rows) {
    const value = row.values[groupProperty.id];
    const column = columns.find((c) => c.option?.id === value) ?? columns[0];
    column.rows.push(row);
  }
  return columns;
}
