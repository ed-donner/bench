import { describe, expect, it } from "vitest";
import { createT } from "../shared/i18n";
import { rolodexMessages } from "./i18n";
import {
  currentAge,
  dateTypeLabel,
  daysUntil,
  effectiveDay,
  isLeapYear,
  nextOccurrence,
} from "./dates";

const en = createT(rolodexMessages);
const t = (key: string, vars?: Record<string, string | number>) =>
  en("en", key, vars);

const birthday = { month: 3, day: 15, year: 1990 };

describe("next occurrence", () => {
  it("finds this year's date when it is still ahead", () => {
    expect(nextOccurrence(birthday, "2026-01-01").date).toBe("2026-03-15");
  });

  it("rolls into next year once it has passed", () => {
    const occurrence = nextOccurrence(birthday, "2026-06-01");
    expect(occurrence.date).toBe("2027-03-15");
    expect(occurrence.ageTurning).toBe(37);
  });

  it("counts the day itself as still to come", () => {
    expect(nextOccurrence(birthday, "2026-03-15").date).toBe("2026-03-15");
  });

  it("flags a round birthday as a milestone", () => {
    expect(
      nextOccurrence({ ...birthday, year: 1996 }, "2026-01-01").milestone,
    ).toBe(true);
    expect(nextOccurrence(birthday, "2026-01-01").milestone).toBe(false);
  });

  it("has no age to give when the year is unknown", () => {
    const occurrence = nextOccurrence(
      { month: 3, day: 15, year: null },
      "2026-01-01",
    );
    expect(occurrence.ageTurning).toBeNull();
    expect(occurrence.milestone).toBe(false);
  });

  it("celebrates 29 February on the 28th in a common year", () => {
    expect(effectiveDay(2, 29, 2027)).toBe(28);
    expect(effectiveDay(2, 29, 2028)).toBe(29);
    expect(
      nextOccurrence({ month: 2, day: 29, year: 2000 }, "2027-01-01").date,
    ).toBe("2027-02-28");
  });

  it("knows which years are leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe("current age", () => {
  it("counts the birthday only once it has happened this year", () => {
    expect(currentAge(birthday, "2026-03-14")).toBe(35);
    expect(currentAge(birthday, "2026-03-15")).toBe(36);
    expect(
      currentAge({ month: 3, day: 15, year: null }, "2026-03-15"),
    ).toBeNull();
  });
});

describe("daysUntil", () => {
  it("counts forwards and backwards", () => {
    expect(daysUntil("2026-08-21", "2026-08-15")).toBe(6);
    expect(daysUntil("2026-08-15", "2026-08-15")).toBe(0);
    expect(daysUntil("2026-08-10", "2026-08-15")).toBe(-5);
  });
});

describe("dateTypeLabel", () => {
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
