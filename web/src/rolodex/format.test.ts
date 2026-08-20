import { describe, expect, it } from "vitest";
import {
  avatarColor,
  errorMessage,
  fmtDate,
  fmtDateShort,
  initials,
  localTimeIn,
  monthShort,
  todayISO,
} from "./format";

describe("dates as words", () => {
  it("formats a date, and falls back when there is not one", () => {
    expect(fmtDate("2026-03-15")).toBe("15 Mar 2026");
    expect(fmtDate(null)).toBe("—");
    expect(fmtDate(null, "en", "never")).toBe("never");
    expect(fmtDate("not a date")).toBe("—");
    expect(fmtDateShort("2026-03-15")).toBe("15 Mar");
    expect(fmtDateShort(null)).toBe("—");
  });

  it("formats dates in Spanish when asked", () => {
    expect(fmtDate("2026-03-15", "es")).toMatch(/15 mar/i);
    expect(monthShort(3, "es")).toMatch(/mar/i);
  });

  it("names a month and today", () => {
    expect(monthShort(1)).toBe("Jan");
    expect(monthShort(12)).toBe("Dec");
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reads the clock in someone else's time zone, and nowhere for no zone", () => {
    expect(localTimeIn("Europe/London")).toMatch(/^\d{2}:\d{2}$/);
    expect(localTimeIn(null)).toBeNull();
    expect(localTimeIn("Not/AZone")).toBeNull();
  });
});

describe("avatars", () => {
  it("takes initials from the ends of a name", () => {
    expect(initials("Maya Chen")).toBe("MC");
    expect(initials("Maya Beatrice Chen")).toBe("MC");
    expect(initials("Prince")).toBe("PR");
    expect(initials("   ")).toBe("?");
  });

  it("gives the same person the same colour every time", () => {
    expect(avatarColor("Maya Chen")).toBe(avatarColor("Maya Chen"));
    expect(avatarColor("Maya Chen")).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("errorMessage", () => {
  it("prefers the message of a real error", () => {
    expect(errorMessage(new Error("nope"))).toBe("nope");
    expect(errorMessage("plain")).toBe("plain");
  });
});
