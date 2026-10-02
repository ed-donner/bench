import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Today from "./Today";
import { api } from "../api";
import { StoreContext, ToastContext } from "../store";
import {
  person,
  reminder,
  stats,
  timelineEntry,
  today,
  upcoming,
} from "../test/helpers";
import { withLocale } from "../test/render";

vi.mock("../api");

// recharts measures its parent, and jsdom lays nothing out, so the container hands it a size.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <actual.ResponsiveContainer width={640} height={240}>
        {children as React.ReactElement}
      </actual.ResponsiveContainer>
    ),
  };
});

const maya = person({ id: 1, name: "Maya Chen" });
const refresh = vi.fn().mockResolvedValue(undefined);
const toast = vi.fn();

function renderToday(store = { people: [maya], tags: [], loaded: true }) {
  return render(
    withLocale(
      <MemoryRouter>
        <StoreContext.Provider value={{ ...store, refresh }}>
          <ToastContext.Provider value={toast}>
            <Today />
          </ToastContext.Provider>
        </StoreContext.Provider>
      </MemoryRouter>,
    ),
  );
}

beforeEach(() => {
  vi.mocked(api.stats).mockResolvedValue(stats());
});

describe("Today", () => {
  it("counts what needs attention across the four figures", async () => {
    vi.mocked(api.today).mockResolvedValue(
      today({
        to_contact: [
          {
            id: 1,
            name: "Maya Chen",
            circle: "close",
            photo: null,
            status: "overdue",
            last_contacted: "2026-01-01",
            next_due: "2026-06-01",
            latest_news: null,
            overdue_days: 75,
          },
          {
            id: 2,
            name: "Ben Foster",
            circle: "inner",
            photo: null,
            status: "due_soon",
            last_contacted: "2026-08-01",
            next_due: "2026-08-18",
            latest_news: null,
            overdue_days: 0,
          },
        ],
        upcoming_dates: [upcoming(), upcoming({ id: 2, person_id: 2 })],
        reminders: [
          {
            ...reminder(),
            person_name: "Maya Chen",
            overdue: false,
            due_today: true,
          },
        ],
      }),
    );
    const { container } = renderToday();

    const figures = await waitFor(() => {
      const found = container.querySelectorAll(".stat-num");
      expect(found).toHaveLength(4);
      return found;
    });
    expect([...figures].map((f) => f.textContent)).toEqual([
      "1",
      "1",
      "2",
      "1",
    ]);
  });

  it("puts the most overdue person at the top of the hero, with how late they are", async () => {
    vi.mocked(api.today).mockResolvedValue(
      today({
        to_contact: [
          {
            id: 1,
            name: "Maya Chen",
            circle: "close",
            photo: null,
            status: "overdue",
            last_contacted: null,
            next_due: "2026-06-01",
            latest_news: null,
            overdue_days: 75,
          },
        ],
      }),
    );
    renderToday();
    expect(await screen.findByText("75 days overdue")).toBeInTheDocument();
    expect(screen.getByText(/most overdue: Maya Chen/)).toBeInTheDocument();
    expect(screen.getByText("never contacted")).toBeInTheDocument();
  });

  it("says everyone is in touch when nobody is due", async () => {
    vi.mocked(api.today).mockResolvedValue(today());
    renderToday();
    expect(await screen.findByText(/everyone is in touch/)).toBeInTheDocument();
    expect(screen.getByText(/Nobody needs your attention/)).toBeInTheDocument();
  });

  it("ticks a reminder off, reloads, and says so", async () => {
    vi.mocked(api.today).mockResolvedValue(
      today({
        reminders: [
          {
            ...reminder({ text: "Book a table" }),
            person_name: "Maya Chen",
            overdue: true,
            due_today: false,
          },
        ],
      }),
    );
    vi.mocked(api.setReminderDone).mockResolvedValue(reminder({ done: true }));
    renderToday();

    await userEvent.click(
      await screen.findByRole("button", { name: "Mark done: Book a table" }),
    );
    expect(api.setReminderDone).toHaveBeenCalledWith(1, true);
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Reminder done — nice");
    });
  });

  it("describes each kind of recent activity in words", async () => {
    vi.mocked(api.today).mockResolvedValue(
      today({
        recent: [
          timelineEntry({ id: "i1", interaction_type: "met" }),
          timelineEntry({
            id: "n1",
            kind: "news",
            interaction_type: null,
            text: "Moved to Berlin",
          }),
          timelineEntry({
            id: "r1",
            kind: "reminder_done",
            interaction_type: null,
            text: "Sent the photos",
          }),
        ],
      }),
    );
    const { container } = renderToday();
    await screen.findByText("Moved to Berlin");
    const feed = container.querySelector(".feed")!;
    expect(
      [...feed.querySelectorAll(".feed-type")].map((e) => e.textContent),
    ).toEqual(["Met up", "news recorded", "reminder completed"]);
  });

  it("shows the failure rather than an empty page when the API is down", async () => {
    vi.mocked(api.today).mockRejectedValue(new Error("no server"));
    renderToday();
    expect(await screen.findByText(/no server/)).toBeInTheDocument();
  });

  it("charts what has been logged", async () => {
    vi.mocked(api.today).mockResolvedValue(today());
    const { container } = renderToday();
    await screen.findByText("How you're doing");
    expect(
      within(container).getByText("Interactions logged per month"),
    ).toBeInTheDocument();
    expect(
      within(container).getByText("People per circle, by check-in status"),
    ).toBeInTheDocument();
  });
});
