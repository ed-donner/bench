import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Deals from "./Deals";
import { api } from "../api";
import { formatDate } from "../format";
import { renderCrm, contact, deal, org, routes } from "../test/helpers";

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return {
    query: actual.query,
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  };
});

const orgs = [org({ id: 1, name: "Bluepeak Software" })];
const contacts = [contact({ id: 1, name: "Dana Whitfield" })];
const deals = [
  deal({
    id: 1,
    name: "Platform rollout",
    organization_id: 1,
    contact_id: 1,
    stage: "Proposal",
    value: 40000,
    probability: 50,
    close_date: "2026-09-30",
  }),
  deal({
    id: 2,
    name: "Support renewal",
    organization_id: null,
    contact_id: null,
    stage: "New",
    value: 10000,
    probability: 10,
    close_date: null,
  }),
];

const load = (rows = deals) =>
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/deals": rows,
      "/api/crm/organizations": orgs,
      "/api/crm/contacts": contacts,
    }),
  );

beforeEach(() => {
  load();
  vi.mocked(api.delete).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

function show() {
  renderCrm(
    <MemoryRouter initialEntries={["/deals"]}>
      <Routes>
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<h1>Detail page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const rowFor = async (name: string) =>
  (await screen.findByText(name)).closest("tr")!;

describe("Deals", () => {
  it("lists a deal with its organization, contact, figures and close date", async () => {
    show();
    const row = await rowFor("Platform rollout");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);

    expect(cells).toEqual([
      "Platform rollout",
      "Bluepeak Software",
      "Proposal",
      "$40,000",
      "50%",
      "$20,000",
      formatDate("2026-09-30"),
      "Dana Whitfield",
      "",
    ]);
  });

  it("dashes the relations a deal does not have, and the missing close date", async () => {
    show();
    const row = await rowFor("Support renewal");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);
    expect(cells[1]).toBe("—");
    expect(cells[6]).toBe("—");
    expect(cells[7]).toBe("—");
  });

  it("totals value and expected value across the deals shown", async () => {
    show();
    expect(
      await screen.findByText("Total $50,000 · Expected $21,000"),
    ).toBeInTheDocument();
  });

  it("sends the search and the stage filter to the server together", async () => {
    show();
    await screen.findByText("Platform rollout");

    await userEvent.type(screen.getByPlaceholderText("Search deals…"), "roll");
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by stage"),
      "Won",
    );

    expect(api.get).toHaveBeenCalledWith("/api/crm/deals?q=roll&stage=Won");
  });

  it("says the filters are what emptied the list", async () => {
    show();
    await screen.findByText("Platform rollout");

    load([]);
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by stage"),
      "Lost",
    );
    expect(
      await screen.findByText("No deals match these filters."),
    ).toBeInTheDocument();
  });

  it("opens the detail page when a row is clicked", async () => {
    show();
    await userEvent.click(await screen.findByText("Support renewal"));
    expect(
      screen.getByRole("heading", { name: "Detail page" }),
    ).toBeInTheDocument();
  });

  it("offers the organizations and contacts it loaded to the add form", async () => {
    show();
    await screen.findByText("Platform rollout");
    await userEvent.click(screen.getByRole("button", { name: "Add deal" }));

    expect(
      within(screen.getByLabelText("Organization")).getByRole("option", {
        name: "Bluepeak Software",
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Primary contact")).getByRole("option", {
        name: "Dana Whitfield",
      }),
    ).toBeInTheDocument();
  });

  it("edits the row's own deal", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Edit Support renewal" }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Support renewal");
    expect(screen.getByLabelText("Stage")).toHaveValue("New");
  });

  it("deletes only on confirm", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete Platform rollout" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.delete).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Delete Platform rollout" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/api/crm/deals/1");
  });
});
