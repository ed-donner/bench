import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { format, subDays } from "date-fns";
import People from "./People";
import { api } from "../api";
import { StoreContext, ToastContext } from "../store";
import { person, withLocale } from "../test/helpers";

vi.mock("../api");

// The overdue label counts from the real clock, so the fixture's next_due has to move with it -
// a fixed date here fails one day after it is written.
const twelveDaysAgo = format(subDays(new Date(), 12), "yyyy-MM-dd");

const people = [
  person({ id: 1, name: "Maya Chen", company: "Figma", tags: ["design"] }),
  person({
    id: 2,
    name: "Ben Foster",
    company: "Foster & Co",
    circle: "inner",
    tags: ["university"],
    status: "overdue",
    next_due: twelveDaysAgo,
    last_contacted: "2026-01-27",
  }),
];

const refresh = vi.fn().mockResolvedValue(undefined);

function renderPeople(rows = people) {
  return render(
    withLocale(
      <MemoryRouter>
        <StoreContext.Provider
          value={{
            people: rows,
            tags: ["design", "university"],
            loaded: true,
            refresh,
          }}
        >
          <ToastContext.Provider value={vi.fn()}>
            <People />
          </ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
}

const rowNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("People", () => {
  it("lists everyone with their company and check-in state", () => {
    renderPeople();
    expect(
      screen.getByText("2 people in your Rolodex — showing 2"),
    ).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("12d overdue")).toBeInTheDocument();
  });

  it("narrows the table as you search", async () => {
    renderPeople();
    await userEvent.type(
      screen.getByPlaceholderText(/Search by name/),
      "foster",
    );
    expect(rowNames().join()).toContain("Ben Foster");
    expect(rowNames().join()).not.toContain("Maya Chen");
  });

  it("filters by circle", async () => {
    renderPeople();
    await userEvent.selectOptions(screen.getByLabelText("Circle"), "inner");
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain("Ben Foster");
  });

  it("filters by tag", async () => {
    renderPeople();
    await userEvent.selectOptions(screen.getByLabelText("Tags"), "design");
    expect(rowNames()).toHaveLength(1);
    expect(rowNames()[0]).toContain("Maya Chen");
  });

  it("says so when nobody matches", async () => {
    renderPeople();
    await userEvent.type(
      screen.getByPlaceholderText(/Search by name/),
      "nobody",
    );
    expect(screen.getByText(/No people match/)).toBeInTheDocument();
  });

  it("deletes a person only after confirming, then reloads the list", async () => {
    vi.mocked(api.deletePerson).mockResolvedValue({ ok: true });
    renderPeople();
    // The table sorts by name, so Ben Foster is the first row.
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Delete Ben Foster?" });
    expect(
      within(dialog).getByText(/This removes Ben and everything logged/),
    ).toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete" }),
    );
    expect(api.deletePerson).toHaveBeenCalledWith(2);
  });
});
