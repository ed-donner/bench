export type SeedLocale = "en" | "es";

export function parseSeedLocale(value: unknown): SeedLocale | null {
  return value === "en" || value === "es" ? value : null;
}

export function seedLocaleFromEnv(): SeedLocale {
  return process.env.SEED_LOCALE === "es" ? "es" : "en";
}
