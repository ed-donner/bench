import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import PersonDetail from "./PersonDetail";
import { api } from "../api";
import { StoreContext, ToastContext } from "../store";
import {
  detail,
  fact,
  gift,
  importantDate,
  person,
  reminder,
  withLocale,
} from "../test/helpers";
import type { PersonDetail as PersonDetailData } from "../api";

vi.mock("../api");

const refresh = vi.fn().mockResolvedValue(undefined);

function renderPerson(data: PersonDetailData = detail()) {
  vi.mocked(api.getPerson).mockResolvedValue(data);
  return render(
    withLocale(
      <MemoryRouter initialEntries={["/people/1"]}>
        <StoreContext.Provider
          value={{ people: [data.person], tags: [], loaded: true, refresh }}
        >
          <ToastContext.Provider value={vi.fn()}>
            <Routes>
              <Route path="/people/:id" element={<PersonDetail />} />
            </Routes>
          </ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
}

const card = (title: string) =>
  screen.getByRole("heading", { name: new RegExp(title) }).closest(".card")!;

describe("a person's page", () => {
  it("introduces them, and says where their check-in stands", async () => {
    renderPerson(
      detail({
        person: person({
          status: "overdue",
          next_due: "2026-04-28",
          circle: "close",
        }),
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Maya Chen" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(
      screen.getByText(/Close circle · check in quarterly/),
    ).toBeInTheDocument();
    expect(screen.getByText(/was due 28 Apr 2026/)).toBeInTheDocument();
  });

  it("shows their whole story in one timeline, newest first", async () => {
    renderPerson(
      detail({
        interactions: [
          {
            id: 1,
            person_id: 1,
            type: "call",
            date: "2026-06-01",
            notes: "Talked about the move",
            created_at: "",
          },
        ],
        news: [
          {
            id: 2,
            person_id: 1,
            text: "Moved to Berlin",
            date: "2026-07-01",
            created_at: "",
          },
        ],
        reminders: [
          reminder({
            id: 3,
            text: "Sent the photos",
            done: true,
            done_at: "2026-05-01",
          }),
        ],
      }),
    );
    await screen.findByRole("heading", { name: "Maya Chen" });
    const feed = within(card("Timeline") as HTMLElement);
    expect(
      feed.getAllByText(/Called|News|Reminder done/).map((e) => e.textContent),
    ).toEqual(["News", "Called", "Reminder done"]);
  });

  it("shows an important date with the age it is bringing", async () => {
    renderPerson(
      detail({ dates: [importantDate({ month: 3, day: 15, year: 1990 })] }),
    );
    await screen.findByRole("heading", { name: "Maya Chen" });
    const dates = within(card("Important dates") as HTMLElement);
    expect(dates.getByText("Birthday")).toBeInTheDocument();
    expect(dates.getByText(/Born\/started 1990/)).toBeInTheDocument();
  });

  it("surfaces gift ideas when the occasion is close", async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    renderPerson(
      detail({
        dates: [
          importantDate({
            month: soon.getMonth() + 1,
            day: soon.getDate(),
            year: 1990,
          }),
        ],
        gifts: [gift({ name: "Ceramic bowls", kind: "idea" })],
      }),
    );
    await screen.findByRole("heading", { name: "Maya Chen" });
    expect(screen.getByText(/Gift ideas: Ceramic bowls/)).toBeInTheDocument();
  });

  it("adds a fact through the quick-add modal and reloads the page", async () => {
    vi.mocked(api.addFact).mockResolvedValue(fact({ text: "Runs marathons" }));
    renderPerson(detail({ facts: [] }));
    await screen.findByRole("heading", { name: "Maya Chen" });

    await userEvent.click(screen.getByRole("button", { name: /Add fact/ }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Fact" }),
      "Runs marathons",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save fact" }));

    expect(api.addFact).toHaveBeenCalledWith(1, "Runs marathons");
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("deletes a fact", async () => {
    vi.mocked(api.deleteFact).mockResolvedValue({ ok: true });
    renderPerson(detail({ facts: [fact({ text: "Allergic to shellfish" })] }));
    await screen.findByRole("heading", { name: "Maya Chen" });

    await userEvent.click(
      screen.getByRole("button", {
        name: "Delete fact: Allergic to shellfish",
      }),
    );
    expect(api.deleteFact).toHaveBeenCalledWith(1);
  });

  it("ticks a reminder done", async () => {
    vi.mocked(api.setReminderDone).mockResolvedValue(reminder({ done: true }));
    renderPerson(detail({ reminders: [reminder({ text: "Book a table" })] }));
    await screen.findByRole("heading", { name: "Maya Chen" });

    await userEvent.click(
      screen.getByRole("button", { name: "Mark done: Book a table" }),
    );
    expect(api.setReminderDone).toHaveBeenCalledWith(1, true);
  });

  it("marks a gift idea as given, dated today", async () => {
    vi.mocked(api.updateGift).mockResolvedValue(gift({ kind: "given" }));
    renderPerson(detail({ gifts: [gift({ kind: "idea" })] }));
    await screen.findByRole("heading", { name: "Maya Chen" });

    await userEvent.click(screen.getByRole("button", { name: "Mark given" }));
    const [giftId, patch] = vi.mocked(api.updateGift).mock.calls[0];
    expect(giftId).toBe(1);
    expect(patch.kind).toBe("given");
    expect(patch.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("says so when the person cannot be loaded", async () => {
    vi.mocked(api.getPerson).mockRejectedValue(new Error("not found"));
    render(
      withLocale(
        <MemoryRouter initialEntries={["/people/99"]}>
          <StoreContext.Provider
            value={{ people: [], tags: [], loaded: true, refresh }}
          >
            <ToastContext.Provider value={vi.fn()}>
              <Routes>
                <Route path="/people/:id" element={<PersonDetail />} />
              </Routes>
            </ToastContext.Provider>
          </StoreContext.Provider>
        </MemoryRouter>,
      ),
    );
    expect(await screen.findByText(/not found/)).toBeInTheDocument();
  });
});
