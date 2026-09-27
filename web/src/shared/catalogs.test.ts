/**
 * Every app's English and Spanish catalogs, checked against each other. A key missing from one
 * side is already a type error; this catches the rest - an extra key, a dropped placeholder, an
 * empty value.
 */
import { describe, expect, it } from "vitest";

const files = import.meta.glob<Record<string, string>>("../**/locales/*.json", {
  eager: true,
  import: "default",
});

const apps = [
  ...new Set(Object.keys(files).map((f) => f.replace(/\/locales\/.*/, ""))),
];

const byName = (a: string, b: string) => a.localeCompare(b);

const placeholders = (text: string) =>
  [...text.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(byName);

describe.each(apps)("the %s catalogs", (app) => {
  const en = files[`${app}/locales/en.json`];
  const es = files[`${app}/locales/es.json`];

  it("hold the same keys", () => {
    expect(Object.keys(es).sort(byName)).toEqual(Object.keys(en).sort(byName));
  });

  it("use the same placeholders in both languages", () => {
    const mismatched = Object.keys(en).filter(
      (key) => placeholders(es[key]).join() !== placeholders(en[key]).join(),
    );
    expect(mismatched).toEqual([]);
  });

  it("have no empty values", () => {
    const empty = [...Object.entries(en), ...Object.entries(es)]
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
