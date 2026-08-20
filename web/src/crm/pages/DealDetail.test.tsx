import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import DealDetail from "./DealDetail";
import { api } from "../api";
import { formatDate } from "../format";
import {
  activity,
  contact,
  deal,
  org,
  routes,
  renderCrm,
} from "../test/helpers";

vi.mock("../api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const load = (map: Record<string, unknown> = {}) =>
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/deals/1": deal({
        id: 1,
        name: "Platform rollout",
        close_date: "2026-09-30",
      }),
      "/api/crm/organizations": [org({ id: 1, name: "Bluepeak Software" })],
      "/api/crm/contacts": [contact({ id: 1, name: "Dana Whitfield" })],
      "/api/crm/activities": [
        activity({ id: 1, deal_id: 1, description: "Sent the proposal" }),
      ],
      ...map,
    }),
  );

beforeEach(() => {
  load();
  vi.mocked(api.post).mockResolvedValue({});
  vi.mocked(api.delete).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

function show() {
  renderCrm(
    <MemoryRouter initialEntries={["/deals/1"]}>
      <Routes>
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="/deals" element={<h1>Deals list</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const heading = async (name: string) =>
  screen.findByRole("heading", { name, level: 1 });

describe("DealDetail", () => {
  it("shows the deal with its value, stage and close date", async () => {
    show();
    expect(await heading("Platform rollout")).toBeInTheDocument();
    expect(screen.getByText("$40,000 · Bluepeak Software")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText(formatDate("2026-09-30"))).toBeInTheDocument();
  });

  it("links through to the organization and the primary contact", async () => {
    show();
    await heading("Platform rollout");
    expect(
      screen.getByRole("link", { name: "Bluepeak Software" }),
    ).toHaveAttribute("href", "/organizations/1");
    expect(
      screen.getByRole("link", { name: "Dana Whitfield" }),
    ).toHaveAttribute("href", "/contacts/1");
  });

  it("dashes the relations a deal does not have, and the missing close date", async () => {
    load({
      "/api/crm/deals/1": deal({
        id: 1,
        organization_id: null,
        contact_id: null,
        close_date: null,
      }),
    });
    show();
    await heading("Platform rollout");
    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("shows this deal's own activity", async () => {
    show();
    await heading("Platform rollout");
    expect(api.get).toHaveBeenCalledWith("/api/crm/activities?deal_id=1");
    expect(screen.getByText("Sent the proposal")).toBeInTheDocument();
  });

  it("logs an activity against this deal", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Log activity" }),
    );
    await userEvent.type(screen.getByLabelText("Description"), "Chased legal");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith(
      "/api/crm/activities",
      expect.objectContaining({ deal_id: 1, contact_id: null }),
    );
  });

  it("edits the deal, with the organizations and contacts it loaded", async () => {
    show();
    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Platform rollout");
    expect(screen.getByLabelText("Organization")).toHaveValue("1");
    expect(screen.getByLabelText("Primary contact")).toHaveValue("1");
  });

  it("deletes on confirm and goes back to the list", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(api.delete).toHaveBeenCalledWith("/api/crm/deals/1");
    expect(
      await screen.findByRole("heading", { name: "Deals list" }),
    ).toBeInTheDocument();
  });
});
