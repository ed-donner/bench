import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import TimelinePage from "./TimelinePage";
import CalendarPage from "./CalendarPage";
import { api } from "../api";
import { StoreContext, ToastContext } from "../store";
import { person, timelineEntry, upcoming, withLocale } from "../test/helpers";

vi.mock("../api");

const maya = person({ id: 1, name: "Maya Chen" });

function renderWithStore(ui: React.ReactElement) {
  return render(
    withLocale(
      <MemoryRouter>
        <StoreContext.Provider
          value={{ people: [maya], tags: [], loaded: true, refresh: vi.fn() }}
        >
          <ToastContext.Provider value={vi.fn()}>{ui}</ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
}

describe("Timeline", () => {
  it("lists what was logged, and counts it", async () => {
    vi.mocked(api.timeline).mockResolvedValue([
      timelineEntry({ id: "i1", text: "Talked about the move" }),
      timelineEntry({
        id: "n1",
        kind: "news",
        interaction_type: null,
        text: "Moved to Berlin",
      }),
    ]);
    renderWithStore(<TimelinePage />);
    expect(
      await screen.findByText("2 entries across everyone, newest first"),
    ).toBeInTheDocument();
    expect(screen.getByText("Talked about the move")).toBeInTheDocument();
    expect(screen.getByText("News recorded")).toBeInTheDocument();
  });

  it("asks the API for one person or one kind when the filters change", async () => {
    vi.mocked(api.timeline).mockResolvedValue([]);
    renderWithStore(<TimelinePage />);
    await screen.findByText(/0 entries/);

    await userEvent.selectOptions(screen.getByLabelText("Person"), "1");
    expect(api.timeline).toHaveBeenLastCalledWith(1, null);

    await userEvent.selectOptions(
      screen.getByLabelText("Interactions"),
      "news",
    );
    expect(api.timeline).toHaveBeenLastCalledWith(1, "news");
  });

  it("says when the filters match nothing", async () => {
    vi.mocked(api.timeline).mockResolvedValue([]);
    renderWithStore(<TimelinePage />);
    expect(
      await screen.findByText("Nothing matches these filters."),
    ).toBeInTheDocument();
  });
});

describe("Calendar", () => {
  it("shows the month's dates and what is coming up", async () => {
    vi.mocked(api.calendar).mockResolvedValue({
      year: 2026,
      month: 8,
      events: [upcoming({ date: "2026-08-21", person_name: "Maya Chen" })],
      upcoming: [upcoming({ date: "2026-08-21", person_name: "Maya Chen" })],
    });
    renderWithStore(<CalendarPage />);
    expect(
      await screen.findByText("Coming up — next 30 days"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Maya Chen").length).toBeGreaterThan(0);
  });

  it("says when a month is quiet", async () => {
    vi.mocked(api.calendar).mockResolvedValue({
      year: 2026,
      month: 8,
      events: [],
      upcoming: [],
    });
    renderWithStore(<CalendarPage />);
    expect(
      await screen.findByText("Nothing in the next 30 days — a quiet month."),
    ).toBeInTheDocument();
  });
});
