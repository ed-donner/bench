import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import OrganizationDetail from "./OrganizationDetail";
import { api } from "../api";
import { contact, deal, org, routes, renderCrm } from "../test/helpers";

vi.mock("../api", () => ({
  api: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const load = (map: Record<string, unknown>) =>
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/organizations/1": org({ id: 1, name: "Bluepeak Software" }),
      "/api/crm/contacts": [contact({ id: 1, name: "Dana Whitfield" })],
      "/api/crm/deals": [deal({ id: 1, name: "Platform rollout" })],
      ...map,
    }),
  );

beforeEach(() => {
  load({});
  vi.mocked(api.delete).mockResolvedValue(undefined);
  vi.mocked(api.put).mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
});

function show() {
  renderCrm(
    <MemoryRouter initialEntries={["/organizations/1"]}>
      <Routes>
        <Route path="/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/organizations" element={<h1>Organizations list</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const card = (heading: string): HTMLElement =>
  screen.getByRole("heading", { name: heading }).closest(".card")!;

describe("OrganizationDetail", () => {
  it("shows the organization's facts once it has loaded", async () => {
    show();
    expect(
      await screen.findByRole("heading", { name: "Bluepeak Software" }),
    ).toBeInTheDocument();
    expect(
      within(card("Details")).getByText("bluepeak.example.com"),
    ).toBeInTheDocument();
    expect(within(card("Details")).getAllByText("—")).toHaveLength(1);
  });

  it("fetches the contacts and deals of this organization only", async () => {
    show();
    await screen.findByRole("heading", { name: "Bluepeak Software" });
    expect(api.get).toHaveBeenCalledWith("/api/crm/contacts?organization_id=1");
    expect(api.get).toHaveBeenCalledWith("/api/crm/deals?organization_id=1");
  });

  it("counts the related contacts and deals in their headings", async () => {
    show();
    expect(
      await screen.findByRole("heading", { name: "Contacts (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Deals (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Dana Whitfield" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Platform rollout" }),
    ).toBeInTheDocument();
  });

  it("says so when the organization has neither contacts nor deals", async () => {
    load({ "/api/crm/contacts": [], "/api/crm/deals": [] });
    show();
    expect(await screen.findByText("No contacts yet")).toBeInTheDocument();
    expect(screen.getByText("No deals yet")).toBeInTheDocument();
  });

  it("edits the organization it is showing", async () => {
    show();
    await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Bluepeak Software");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(api.put).toHaveBeenCalledWith(
      "/api/crm/organizations/1",
      expect.objectContaining({ name: "Bluepeak Software" }),
    );
  });

  it("deletes on confirm and goes back to the list", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.delete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(api.delete).toHaveBeenCalledWith("/api/crm/organizations/1");
    expect(
      await screen.findByRole("heading", { name: "Organizations list" }),
    ).toBeInTheDocument();
  });
});
