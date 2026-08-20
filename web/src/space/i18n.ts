import type { ReactNode } from "react";
import type { MessageKey } from "../shared/locales";
import type { PropertyType, ViewKind } from "./api";
import { BLOCK_ICONS } from "./editor/blockTypes";

export type SpaceT = (key: MessageKey<"space">) => string;

export interface BlockTypeDef {
  type: string;
  label: string;
  keywords: string[];
  icon: ReactNode;
}

const BLOCK_TYPE_KEYS: Record<string, MessageKey<"space">> = {
  paragraph: "blockText",
  heading1: "blockHeading1",
  heading2: "blockHeading2",
  heading3: "blockHeading3",
  bulleted: "blockBulletedList",
  numbered: "blockNumberedList",
  todo: "blockTodo",
  quote: "blockQuote",
  divider: "blockDivider",
  code: "blockCode",
  callout: "blockCallout",
};

const BLOCK_KEYWORDS: Record<string, string[]> = {
  paragraph: ["text", "paragraph", "plain"],
  heading1: ["h1", "heading", "title"],
  heading2: ["h2", "heading", "subtitle"],
  heading3: ["h3", "heading"],
  bulleted: ["bullet", "list", "ul"],
  numbered: ["number", "list", "ol"],
  todo: ["todo", "task", "checkbox"],
  quote: ["quote", "blockquote"],
  divider: ["divider", "hr", "rule", "separator"],
  code: ["code", "snippet", "monospace"],
  callout: ["callout", "info", "note"],
};

const PLACEHOLDER_KEYS: Record<string, MessageKey<"space">> = {
  paragraph: "slashHint",
  heading1: "placeholderHeading1",
  heading2: "placeholderHeading2",
  heading3: "placeholderHeading3",
  bulleted: "placeholderBullet",
  numbered: "placeholderNumbered",
  todo: "placeholderTodo",
  quote: "placeholderQuote",
  code: "placeholderCode",
  callout: "placeholderCallout",
};

const PROPERTY_TYPE_KEYS: Record<PropertyType, MessageKey<"space">> = {
  text: "propertyText",
  number: "propertyNumber",
  select: "propertySelect",
  multi_select: "propertyMultiSelect",
  date: "propertyDate",
  checkbox: "propertyCheckbox",
  url: "propertyUrl",
};

const VIEW_KEYS: Record<ViewKind, MessageKey<"space">> = {
  table: "viewTable",
  board: "viewBoard",
  list: "viewList",
};

const OPERATOR_KEYS: Record<string, MessageKey<"space">> = {
  contains: "operatorContains",
  not_contains: "operatorNotContains",
  eq: "operatorEq",
  gt: "operatorGt",
  lt: "operatorLt",
  is: "operatorIs",
  is_not: "operatorIsNot",
  has: "operatorHas",
  before: "operatorBefore",
  after: "operatorAfter",
  checked: "operatorChecked",
  unchecked: "operatorUnchecked",
};

function blockTypeLabel(type: string, tr: SpaceT): string {
  return tr(BLOCK_TYPE_KEYS[type] ?? "blockParagraph");
}

export function blockPlaceholder(type: string, tr: SpaceT): string {
  return tr(PLACEHOLDER_KEYS[type] ?? "placeholderParagraph");
}

export function propertyTypeLabel(type: PropertyType, tr: SpaceT): string {
  return tr(PROPERTY_TYPE_KEYS[type]);
}

export function viewLabel(kind: ViewKind, tr: SpaceT): string {
  return tr(VIEW_KEYS[kind]);
}

export function operatorLabel(op: string, tr: SpaceT): string {
  if (!(op in OPERATOR_KEYS)) return op;
  return tr(OPERATOR_KEYS[op]);
}

function getBlockTypeDefs(tr: SpaceT): BlockTypeDef[] {
  return Object.keys(BLOCK_TYPE_KEYS).map((type) => ({
    type,
    label: blockTypeLabel(type, tr),
    keywords: BLOCK_KEYWORDS[type] ?? [],
    icon: BLOCK_ICONS[type],
  }));
}

export function filterBlockTypes(query: string, tr: SpaceT): BlockTypeDef[] {
  const defs = getBlockTypeDefs(tr);
  const q = query.trim().toLowerCase();
  if (!q) return defs;
  return defs.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.keywords.some((k) => k.startsWith(q)),
  );
}
