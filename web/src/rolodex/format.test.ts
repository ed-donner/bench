import { describe, expect, it, vi } from "vitest";
import { setLang } from "../shared/i18n";
import { RequestError } from "./requestError";
import {
  avatarColor,
  circleLabel,
  errorMessage,
  interactionLabel,
  statusLabel,
  fmtDate,
  fmtDateShort,
  initials,
  localTimeIn,
  monthShort,
  relativeDays,
  todayISO,
} from "./format";

describe("dates as words", () => {
  it("formats a date, and falls back when there is not one", () => {
    expect(fmtDate("2026-03-15")).toBe("15 Mar 2026");
    expect(fmtDate(null)).toBe("—");
    expect(fmtDate(null, "never")).toBe("never");
    expect(fmtDate("not a date")).toBe("—");
    expect(fmtDateShort("2026-03-15")).toBe("15 Mar");
    expect(fmtDateShort(null)).toBe("—");
  });

  it("says how long ago something was, relative to a given day", () => {
    expect(relativeDays("2026-08-15", "2026-08-15")).toBe("today");
    expect(relativeDays("2026-08-14", "2026-08-15")).toBe("yesterday");
    expect(relativeDays("2026-08-16", "2026-08-15")).toBe("tomorrow");
    expect(relativeDays("2026-08-05", "2026-08-15")).toBe("10 days ago");
    expect(relativeDays("2026-08-25", "2026-08-15")).toBe("in 10 days");
    expect(relativeDays(null)).toBe("never contacted");
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
  it("words a failure by its status, in the page's language", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(errorMessage(new RequestError(404, "Not found"))).toBe(
      "It no longer exists.",
    );
    expect(errorMessage(new RequestError(400, "Invalid year"))).toBe(
      "The server did not accept that.",
    );
    expect(errorMessage(new Error("offline"))).toBe(
      "The request failed — is the server running?",
    );
    setLang("es");
    expect(errorMessage(new RequestError(404, "Not found"))).toBe(
      "Ya no existe.",
    );
  });

  it("keeps the server's own text in the console", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new RequestError(400, "Invalid year");
    errorMessage(error);
    expect(log).toHaveBeenCalledWith(error);
  });
});

describe("in Spanish", () => {
  it("formats dates and relative days", () => {
    setLang("es");
    expect(fmtDate("2026-03-15")).toBe("15 mar 2026");
    expect(monthShort(9)).toBe("sep");
    expect(relativeDays("2026-08-14", "2026-08-15")).toBe("ayer");
    expect(relativeDays("2026-08-05", "2026-08-15")).toBe("hace 10 días");
    expect(relativeDays("2026-08-25", "2026-08-15")).toBe("en 10 días");
    expect(relativeDays("2026-08-16", "2026-08-15")).toBe("mañana");
    expect(relativeDays(null)).toBe("nunca contactado");
  });

  it("names statuses, circles and interactions", () => {
    setLang("es");
    expect(statusLabel("overdue")).toBe("Atrasado");
    expect(circleLabel("inner")).toBe("Íntimo");
    expect(interactionLabel("call")).toBe("Llamada");
  });
});
