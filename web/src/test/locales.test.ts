/**
 * The two dictionaries have to stay the same shape. This is the test that catches the string
 * somebody added to one language and forgot in the other, which no typecheck can see and which
 * shows up in the UI as a raw key.
 */
import { describe, expect, it } from "vitest";
import navEn from "../shared/locales/en";
import navEs from "../shared/locales/es";
import crmEn from "../crm/locales/en";
import crmEs from "../crm/locales/es";
import spaceEn from "../space/locales/en";
import spaceEs from "../space/locales/es";
import rolodexEn from "../rolodex/locales/en";
import rolodexEs from "../rolodex/locales/es";
import grooveEn from "../groove/locales/en";
import grooveEs from "../groove/locales/es";
import homeEn from "../home/locales/en";
import homeEs from "../home/locales/es";

type Tree = Record<string, unknown>;

/** Every leaf, as a dotted path. Arrays are leaves - the launcher's fact chips are one. */
function paths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const here = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? paths(value as Tree, here)
      : [here];
  });
}

function leaf(tree: Tree, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, key) => (node as Tree)[key], tree);
}

const BUNDLES: [string, Tree, Tree][] = [
  ["nav", navEn, navEs],
  ["crm", crmEn, crmEs],
  ["space", spaceEn, spaceEs],
  ["rolodex", rolodexEn, rolodexEs],
  ["groove", grooveEn, grooveEs],
  ["home", homeEn, homeEs],
];

const alphabetical = (a: string, b: string) => a.localeCompare(b);

const vars = (value: unknown): string =>
  typeof value === "string"
    ? [...value.matchAll(/\{\{(\w+)\}\}/g)]
        .map((m) => m[1])
        .sort(alphabetical)
        .join(",")
    : "";

describe.each(BUNDLES)("%s", (_name, en, es) => {
  it("has the same keys in both languages", () => {
    expect(paths(es).sort(alphabetical)).toEqual(paths(en).sort(alphabetical));
  });

  // Collected rather than asserted one at a time, so a failure names every offending key at once.
  it("has nothing empty and nothing that is not a string", () => {
    const bad = paths(es).filter((path) => {
      const value = leaf(es, path);
      const values = Array.isArray(value) ? (value as unknown[]) : [value];
      return values.some((one) => typeof one !== "string" || !one.trim());
    });
    expect(bad).toEqual([]);
  });

  it("interpolates the same names as the English it replaces", () => {
    const mismatched = paths(en).filter(
      (path) => vars(leaf(es, path)) !== vars(leaf(en, path)),
    );
    expect(mismatched).toEqual([]);
  });
});
