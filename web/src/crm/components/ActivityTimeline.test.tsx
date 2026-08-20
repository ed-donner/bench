import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActivityTimeline from "./ActivityTimeline";
import { api } from "../api";
import { formatDateTime } from "../format";
import { activity, renderCrm } from "../test/helpers";

vi.mock("../api", () => ({ api: { patch: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.patch).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

/** Overdue is judged against today, so the fixtures have to move with it. */
function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const show = (activities = [activity()], onChanged = vi.fn()) => {
  renderCrm(<ActivityTimeline activities={activities} onChanged={onChanged} />);
  return onChanged;
};

describe("ActivityTimeline", () => {
  it("says so when there is nothing yet", () => {
    show([]);
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  it("shows the description, the type and when it happened", () => {
    show([activity({ type: "call", description: "Discovery call" })]);
    expect(screen.getByText("Discovery call")).toBeInTheDocument();
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(
      screen.getByText(formatDateTime("2026-06-02 14:30:00")),
    ).toBeInTheDocument();
  });

  it("only offers the done checkbox to an activity with a follow-up", () => {
    show([activity({ id: 1 }), activity({ id: 2, due_date: dayOffset(7) })]);
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("calls a future follow-up due and a past one overdue", () => {
    show([
      activity({ id: 1, due_date: dayOffset(7) }),
      activity({ id: 2, due_date: dayOffset(-7) }),
    ]);
    expect(screen.getByText(/^Due/)).toBeInTheDocument();
    expect(screen.getByText(/^Overdue:/)).toBeInTheDocument();
  });

  it("does not call a done follow-up overdue however old it is", () => {
    show([activity({ due_date: dayOffset(-400), done: 1 })]);
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("patches the activity and reloads when the checkbox is toggled", async () => {
    const onChanged = show(
      [activity({ id: 9, due_date: dayOffset(7) })],
      vi.fn(),
    );
    await userEvent.click(screen.getByRole("checkbox"));

    expect(api.patch).toHaveBeenCalledWith("/api/crm/activities/9", {
      done: true,
    });
    expect(onChanged).toHaveBeenCalledOnce();
  });
});
