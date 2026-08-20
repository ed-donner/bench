import { describe, expect, it } from "vitest";
import { interpolate, translate } from "../shared/locales";
import type { MessageKey } from "../shared/locales";
import { circleLabel, dateTypeLabel, relativeDays, statusLabel } from "./i18n";

function rolodexT(locale: "en" | "es" = "en") {
  const fn = (key: MessageKey<"rolodex">) => translate(locale, "rolodex", key);
  return Object.assign(fn, {
    i: (key: MessageKey<"rolodex">, vars: Record<string, string | number>) =>
      interpolate(fn(key), vars),
  });
}

describe("relativeDays", () => {
  const t = rolodexT();

  it("says how long ago something was, relative to a given day", () => {
    expect(relativeDays(t, "2026-08-15", "2026-08-15")).toBe("today");
    expect(relativeDays(t, "2026-08-14", "2026-08-15")).toBe("yesterday");
    expect(relativeDays(t, "2026-08-16", "2026-08-15")).toBe("tomorrow");
    expect(relativeDays(t, "2026-08-05", "2026-08-15")).toBe("10 days ago");
    expect(relativeDays(t, "2026-08-25", "2026-08-15")).toBe("in 10 days");
    expect(relativeDays(t, null)).toBe("never contacted");
  });
});

describe("dateTypeLabel", () => {
  const t = rolodexT();

  it("uses the label where the type alone would not say enough", () => {
    expect(dateTypeLabel(t, "birthday", null)).toBe("Birthday");
    expect(dateTypeLabel(t, "other", "Sober anniversary")).toBe(
      "Sober anniversary",
    );
    expect(dateTypeLabel(t, "other", null)).toBe("Important date");
    expect(dateTypeLabel(t, "child_birthday", "Louise")).toBe(
      "Louise's birthday",
    );
    expect(dateTypeLabel(t, "child_birthday", null)).toBe("Child's birthday");
    expect(dateTypeLabel(t, "work_anniversary", null)).toBe("Work anniversary");
  });
});

describe("status and circle labels", () => {
  const t = rolodexT();

  it("maps enum values to English labels", () => {
    expect(statusLabel(t, "overdue")).toBe("Overdue");
    expect(circleLabel(t, "inner")).toBe("Inner");
  });
});
