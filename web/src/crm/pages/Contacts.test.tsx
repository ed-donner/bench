import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Contacts from "./Contacts";
import { api } from "../api";
import { renderCrm, contact, org, routes } from "../test/helpers";

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return {
    query: actual.query,
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  };
});

const orgs = [org({ id: 1, name: "Bluepeak Software" })];
const contacts = [
  contact({ id: 1, name: "Dana Whitfield", organization_id: 1 }),
  contact({
    id: 2,
    name: "Sam Reyes",
    email: null,
    phone: null,
    job_title: null,
    organization_id: null,
    status: "customer",
  }),
];

const load = (rows = contacts) =>
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/contacts": rows,
      "/api/crm/organizations": orgs,
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
    <MemoryRouter initialEntries={["/contacts"]}>
      <Routes>
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:id" element={<h1>Detail page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

const rowFor = async (name: string) =>
  (await screen.findByText(name)).closest("tr")!;

describe("Contacts", () => {
  it("lists each contact with its organization and status", async () => {
    show();
    const row = await rowFor("Dana Whitfield");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);

    expect(cells).toEqual([
      "Dana Whitfield",
      "dana@example.com",
      "555-0142",
      "Head of Ops",
      "Bluepeak Software",
      "lead",
      "",
    ]);
  });

  it("dashes the fields a contact has not filled in", async () => {
    show();
    const row = await rowFor("Sam Reyes");
    const cells = within(row)
      .getAllByRole("cell")
      .map((c) => c.textContent);
    expect(cells.slice(1, 5)).toEqual(["—", "—", "—", "—"]);
  });

  it("sends the search and the status filter to the server together", async () => {
    show();
    await screen.findByText("Dana Whitfield");

    await userEvent.type(screen.getByPlaceholderText("Search contacts…"), "da");
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by status"),
      "customer",
    );

    expect(api.get).toHaveBeenCalledWith(
      "/api/crm/contacts?q=da&status=customer",
    );
  });

  it("says the filters are what emptied the list", async () => {
    show();
    await screen.findByText("Dana Whitfield");

    load([]);
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by status"),
      "qualified",
    );
    expect(
      await screen.findByText("No contacts match these filters."),
    ).toBeInTheDocument();
  });

  it("opens the detail page when a row is clicked", async () => {
    show();
    await userEvent.click(await screen.findByText("Sam Reyes"));
    expect(
      screen.getByRole("heading", { name: "Detail page" }),
    ).toBeInTheDocument();
  });

  it("offers the organizations it loaded to the add form", async () => {
    show();
    await screen.findByText("Dana Whitfield");
    await userEvent.click(screen.getByRole("button", { name: "Add contact" }));

    expect(
      within(screen.getByLabelText("Organization")).getByRole("option", {
        name: "Bluepeak Software",
      }),
    ).toBeInTheDocument();
  });

  it("edits the row's own contact", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Edit Sam Reyes" }),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Sam Reyes");
    expect(screen.getByLabelText("Status")).toHaveValue("customer");
  });

  it("deletes only on confirm", async () => {
    show();
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete Dana Whitfield" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.delete).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Delete Dana Whitfield" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(api.delete).toHaveBeenCalledWith("/api/crm/contacts/1");
  });
});
