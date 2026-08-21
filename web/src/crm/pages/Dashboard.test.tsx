import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Dashboard from "./Dashboard";
import { api } from "../api";
import {
  renderCrm,
  activity,
  contact,
  deal,
  org,
  routes,
} from "../test/helpers";

vi.mock("../api", () => ({ api: { get: vi.fn(), patch: vi.fn() } }));

/** The dashboard's windows run from today, so the fixtures have to be placed relative to it. */
function monthOffset(months: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-15`;
}

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const deals = [
  deal({ id: 1, stage: "Proposal", value: 40000, probability: 50 }),
  deal({ id: 2, stage: "New", value: 10000, probability: 10 }),
  deal({
    id: 3,
    name: "Won this month",
    stage: "Won",
    value: 90000,
    probability: 100,
    close_date: monthOffset(0),
  }),
  deal({
    id: 4,
    name: "Lost this month",
    stage: "Lost",
    value: 20000,
    probability: 0,
    close_date: monthOffset(0),
  }),
  deal({
    id: 5,
    name: "Won long ago",
    stage: "Won",
    value: 500000,
    probability: 100,
    close_date: monthOffset(-10),
  }),
];

const activities = [
  activity({ id: 1, description: "Kicked off the pilot", contact_id: 1 }),
  activity({
    id: 2,
    description: "Chase the contract",
    contact_id: null,
    deal_id: 1,
    due_date: dayOffset(-3),
  }),
  activity({
    id: 3,
    description: "Send the deck",
    contact_id: 1,
    due_date: dayOffset(5),
  }),
  activity({
    id: 4,
    description: "Already handled",
    due_date: dayOffset(-9),
    done: 1,
  }),
];

const load = (map: Record<string, unknown> = {}) =>
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/deals": deals,
      "/api/crm/contacts": [contact({ id: 1, name: "Dana Whitfield" })],
      "/api/crm/organizations": [org({ id: 1, name: "Bluepeak Software" })],
      "/api/crm/activities": activities,
      ...map,
    }),
  );

beforeEach(() => {
  load();
  vi.mocked(api.patch).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

const show = () =>
  renderCrm(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

const tile = (label: string): HTMLElement =>
  screen.getByText(label).closest(".stat-tile")!;

const card = (heading: string): HTMLElement =>
  screen.getByRole("heading", { name: heading }).closest(".card")!;

describe("Dashboard", () => {
  it("totals the open pipeline across the tiles", async () => {
    show();
    expect(await screen.findByTestId("dash-total")).toHaveTextContent(
      "$50,000",
    );
    expect(screen.getByTestId("dash-expected")).toHaveTextContent("$21,000");
    expect(tile("Open deals")).toHaveTextContent("2");
  });

  it("counts only the trailing six months in the won tiles", async () => {
    show();
    await screen.findByTestId("dash-total");
    expect(tile("Deals won (6 mo)")).toHaveTextContent("1");
    expect(tile("Revenue won (6 mo)")).toHaveTextContent("$90,000");
  });

  it("says when nothing has closed in the window, rather than drawing an empty donut", async () => {
    load({
      "/api/crm/deals": deals.filter(
        (d) => d.stage !== "Won" && d.stage !== "Lost",
      ),
    });
    show();
    expect(
      await screen.findByText("Nothing has closed in the last six months."),
    ).toBeInTheDocument();
  });

  it("says when no open deal belongs to an organization", async () => {
    load({
      "/api/crm/deals": [deal({ id: 1, organization_id: null })],
      "/api/crm/organizations": [],
    });
    show();
    expect(
      await screen.findByText("No open deals against an organization."),
    ).toBeInTheDocument();
  });

  it("lists recent activity, linking each item to the contact or deal it is about", async () => {
    show();
    await screen.findByTestId("dash-total");
    const feed = card("Recent activity");
    const item = (text: string): HTMLElement =>
      within(feed).getByText(text).closest(".feed-item")!;

    expect(
      within(item("Kicked off the pilot")).getByRole("link", {
        name: "Dana Whitfield",
      }),
    ).toHaveAttribute("href", "/contacts/1");
    expect(
      within(item("Chase the contract")).getByRole("link", {
        name: "Platform rollout",
      }),
    ).toHaveAttribute("href", "/deals/1");
  });

  it("puts overdue follow-ups first and leaves out the ones already done", async () => {
    show();
    await screen.findByTestId("dash-total");
    const tasks = within(card("Follow-ups")).getAllByRole("checkbox");

    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toHaveAccessibleName("Mark done: Chase the contract");
    expect(tasks[1]).toHaveAccessibleName("Mark done: Send the deck");
    expect(
      within(card("Follow-ups")).getByText(/^Overdue:/),
    ).toBeInTheDocument();
  });

  it("says so when nothing is due", async () => {
    load({ "/api/crm/activities": [] });
    show();
    expect(
      await screen.findByText("Nothing due. Nice work."),
    ).toBeInTheDocument();
  });

  it("marks a follow-up done", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("checkbox", {
        name: "Mark done: Chase the contract",
      }),
    );
    expect(api.patch).toHaveBeenCalledWith("/api/crm/activities/2", {
      done: true,
    });
  });
});
