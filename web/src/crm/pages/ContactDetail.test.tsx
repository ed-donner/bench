import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import ContactDetail from "./ContactDetail";
import { api } from "../api";
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
      "/api/crm/contacts/1": contact({ id: 1, name: "Dana Whitfield" }),
      "/api/crm/organizations": [org({ id: 1, name: "Bluepeak Software" })],
      "/api/crm/deals": [deal({ id: 4, name: "Platform rollout" })],
      "/api/crm/activities": [
        activity({ id: 1, description: "Kicked off the pilot" }),
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
    <MemoryRouter initialEntries={["/contacts/1"]}>
      <Routes>
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/contacts" element={<h1>Contacts list</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const heading = async (name: string) =>
  screen.findByRole("heading", { name, level: 1 });

describe("ContactDetail", () => {
  it("shows the contact with its job title and organization", async () => {
    show();
    expect(await heading("Dana Whitfield")).toBeInTheDocument();
    expect(
      screen.getByText("Head of Ops at Bluepeak Software"),
    ).toBeInTheDocument();
    expect(screen.getByText("dana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lead")).toBeInTheDocument();
  });

  it("links through to the organization the contact belongs to", async () => {
    show();
    await heading("Dana Whitfield");
    expect(
      screen.getByRole("link", { name: "Bluepeak Software" }),
    ).toHaveAttribute("href", "/organizations/1");
  });

  it("dashes the facts a contact does not carry, and drops the organization", async () => {
    load({
      "/api/crm/contacts/1": contact({
        id: 1,
        email: null,
        phone: null,
        job_title: null,
        organization_id: null,
      }),
    });
    show();
    await heading("Dana Whitfield");
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(4);
  });

  it("fetches this contact's own deals and activities", async () => {
    show();
    await heading("Dana Whitfield");
    expect(api.get).toHaveBeenCalledWith("/api/crm/deals?contact_id=1");
    expect(api.get).toHaveBeenCalledWith("/api/crm/activities?contact_id=1");
    expect(
      screen.getByRole("link", { name: "Platform rollout" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kicked off the pilot")).toBeInTheDocument();
  });

  it("logs an activity against this contact", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Log activity" }),
    );
    await userEvent.type(
      screen.getByLabelText("Description"),
      "Sent the proposal",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(api.post).toHaveBeenCalledWith(
      "/api/crm/activities",
      expect.objectContaining({ contact_id: 1, deal_id: null }),
    );
  });

  it("edits the contact, with the organizations it loaded to choose from", async () => {
    show();
    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Dana Whitfield");
    expect(
      within(screen.getByLabelText("Organization")).getByRole("option", {
        name: "Bluepeak Software",
      }),
    ).toBeInTheDocument();
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

    expect(api.delete).toHaveBeenCalledWith("/api/crm/contacts/1");
    expect(
      await screen.findByRole("heading", { name: "Contacts list" }),
    ).toBeInTheDocument();
  });
});
