import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Circles from "./Circles";
import { StoreContext, ToastContext } from "../store";
import { person, withLocale } from "../test/helpers";

vi.mock("../api");

const people = [
  person({ id: 1, name: "Maya Chen", circle: "inner", status: "overdue" }),
  person({ id: 2, name: "Ben Foster", circle: "inner", status: "in_touch" }),
  person({
    id: 3,
    name: "Ada Lovelace",
    circle: "distant",
    status: "due_soon",
  }),
];

function renderCircles(rows = people) {
  const { container } = render(
    withLocale(
      <MemoryRouter>
        <StoreContext.Provider
          value={{ people: rows, tags: [], loaded: true, refresh: vi.fn() }}
        >
          <ToastContext.Provider value={vi.fn()}>
            <Circles />
          </ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
  // The circle name also appears on every card in the column, so columns are found by their
  // own heading rather than by the first match for the word.
  const column = (name: string) =>
    [...container.querySelectorAll<HTMLElement>(".board-col")].find((c) =>
      c.querySelector(".board-col-title")?.textContent.startsWith(name),
    )!;
  return { container, column };
}

describe("Circles", () => {
  it("gives every circle a column, with its cadence and how many are in it", () => {
    const { container, column } = renderCircles();
    expect(container.querySelectorAll(".board-col")).toHaveLength(4);
    expect(screen.getByText("monthly")).toBeInTheDocument();
    expect(screen.getByText("yearly")).toBeInTheDocument();
    expect(within(column("Inner")).getByText("2")).toBeInTheDocument();
  });

  it("puts the people who need chasing at the top of their column", () => {
    const { column } = renderCircles();
    const names = within(column("Inner"))
      .getAllByText(/Maya Chen|Ben Foster/)
      .map((e) => e.textContent);
    expect(names).toEqual(["Maya Chen", "Ben Foster"]);
  });

  it("counts the overdue people in each column", () => {
    const { column } = renderCircles();
    expect(within(column("Inner")).getByText("1 overdue")).toBeInTheDocument();
  });

  it("invites you to drop someone into an empty circle", () => {
    const { column } = renderCircles([person({ id: 1, circle: "inner" })]);
    expect(
      within(column("Distant")).getByText("Drop someone here"),
    ).toBeInTheDocument();
  });
});
