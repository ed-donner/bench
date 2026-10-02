import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Organizations from "./Organizations";
import { api } from "../api";
import { renderCrm, contact, deal, org, routes } from "../test/helpers";

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return {
    query: actual.query,
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  };
});

const orgs = [
  org({ id: 1, name: "Bluepeak Software" }),
  org({ id: 2, name: "Alderway", website: null, industry: null }),
];
const contacts = [
  contact({ id: 1, organization_id: 1 }),
  contact({ id: 2, organization_id: 1 }),
];
const deals = [
  deal({ id: 1, organization_id: 1, stage: "Proposal", value: 40000 }),
  deal({ id: 2, organization_id: 1, stage: "Won", value: 90000 }),
  deal({ id: 3, organization_id: 2, stage: "New", value: 5000 }),
];

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/organizations": orgs,
      "/api/crm/contacts": contacts,
      "/api/crm/deals": deals,
    }),
  );
  vi.mocked(api.delete).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

function show() {
  renderCrm(
    <MemoryRouter initialEntries={["/organizations"]}>
      <Routes>
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id" element={<h1>Detail page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const rowFor = async (name: string) =>
  (await screen.findByText(name)).closest("tr")!;

describe("Organizations", () => {
  it("lists the organizations with their contacts, open deals and pipeline", async () => {
    show();
    const row = await rowFor("Bluepeak Software");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);

    expect(cells).toEqual([
      "Bluepeak Software",
      "bluepeak.example.com",
      "Software",
      "2",
      "1",
      "$40,000",
      "",
    ]);
  });

  // The counts arrive on a later fetch than the rows, and TanStack memoises its row model on the
  // data alone - so a derived value read through an accessorFn would still show the first zeroes.
  it("counts nothing against an organization with no contacts or open deals", async () => {
    show();
    const row = await rowFor("Alderway");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);
    expect(cells.slice(1, 6)).toEqual(["—", "—", "0", "1", "$5,000"]);
  });

  it("totals the open pipeline across every organization", async () => {
    show();
    expect(
      await screen.findByText("Open pipeline $45,000"),
    ).toBeInTheDocument();
  });

  it("sends the search to the server and says so when nothing matches", async () => {
    show();
    await screen.findByText("Bluepeak Software");

    vi.mocked(api.get).mockImplementation(
      routes({
        "/api/crm/organizations": [],
        "/api/crm/contacts": contacts,
        "/api/crm/deals": deals,
      }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Search organizations…"),
      "zzz",
    );

    expect(
      await screen.findByText("No organizations match “zzz”."),
    ).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/crm/organizations?q=zzz");
  });

  it("opens the detail page when a row is clicked", async () => {
    show();
    await userEvent.click(await screen.findByText("Bluepeak Software"));
    expect(
      screen.getByRole("heading", { name: "Detail page" }),
    ).toBeInTheDocument();
  });

  it("opens the add form, and the edit form on the row's own organization", async () => {
    show();
    await userEvent.click(
      screen.getByRole("button", { name: "Add organization" }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.click(
      await screen.findByRole("button", { name: "Edit Alderway" }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Alderway");
  });

  it("warns what a delete leaves behind, and only deletes on confirm", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete Alderway" }),
    );
    expect(
      screen.getByText(
        "Delete Alderway? Its contacts and deals stay, but lose their link to it.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.delete).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Delete Alderway" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/api/crm/organizations/2");
  });
});
