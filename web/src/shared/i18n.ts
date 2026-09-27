/**
 * One language across all five documents, chosen the same way as the theme: the stored choice,
 * or the browser's language on a first visit. Unlike the theme it is also React state, because
 * every label has to re-render in place - a reload would throw away an open form or an edit.
 *
 * Each app owns its catalogs (locales/en.json, locales/es.json) and gets a typed `t` from
 * makeT, so a key that does not exist is a type error rather than a blank label.
 */
import { useCallback, useSyncExternalStore } from "react";

export type Lang = "en" | "es";

export const LANGS: Lang[] = ["en", "es"];

const KEY = "bench.lang";

let lang: Lang = "en";
const listeners = new Set<() => void>();

function apply(next: Lang): void {
  lang = next;
  document.documentElement.lang = next;
  for (const listener of listeners) listener();
}

export function currentLang(): Lang {
  return lang;
}

/** The stored choice, or the browser's language the first time you arrive. */
export function initLang(): void {
  const stored = localStorage.getItem(KEY);
  if (stored === "en" || stored === "es") apply(stored);
  else apply(navigator.language.toLowerCase().startsWith("es") ? "es" : "en");
}

export function setLang(next: Lang): void {
  localStorage.setItem(KEY, next);
  apply(next);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The locale Intl formats with: US English, and neutral Spanish ("1234,50 US$", "26 sept 2026"). */
export function intlLocale(): string {
  return lang === "es" ? "es" : "en-US";
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, currentLang);
}

type Vars = Record<string, string | number>;

/** "notes.count" for a catalog holding "notes.count.one" and "notes.count.other". */
type PluralBase<K> = K extends `${infer B}.${"one" | "other"}` ? B : never;

export function makeT<K extends string>(
  catalogs: Record<Lang, Record<K, string>>,
) {
  type Key = K | PluralBase<K>;
  const catalog = (l: Lang) =>
    catalogs[l] as Record<string, string | undefined>;

  function translate(l: Lang, key: Key, vars?: Vars): string {
    let text = catalog(l)[key];
    // A numeric `count` picks the plural form; Spanish has a "many" that falls back to "other".
    if (text === undefined && typeof vars?.count === "number") {
      const rule = new Intl.PluralRules(l).select(vars.count);
      text = catalog(l)[`${key}.${rule}`] ?? catalog(l)[`${key}.other`];
    }
    if (text === undefined) throw new Error(`No "${key}" in the ${l} catalog`);
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
      name in vars ? String(vars[name]) : whole,
    );
  }

  /** For code outside a component, which reads the language at the moment it is called. */
  const t = (key: Key, vars?: Vars) => translate(lang, key, vars);

  /** For components: re-renders on a switch, and changes identity so memoised labels do too. */
  function useT() {
    const l = useLang();
    return useCallback((key: Key, vars?: Vars) => translate(l, key, vars), [l]);
  }

  return { t, useT };
}
