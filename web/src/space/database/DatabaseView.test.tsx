import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { renderSpace } from "../test/helpers";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import DatabaseView from "./DatabaseView";
import { api, type DatabaseData } from "../api";

vi.mock("../api", () => ({
  api: {
    getDatabase: vi.fn(),
    addProperty: vi.fn(),
    renameProperty: vi.fn().mockResolvedValue({}),
    deleteProperty: vi.fn().mockResolvedValue({ ok: true }),
    addOption: vi.fn(),
    addRow: vi.fn(),
    setRowValue: vi.fn().mockResolvedValue({ ok: true }),
    updatePage: vi.fn().mockResolvedValue({}),
    deletePage: vi.fn().mockResolvedValue({ ok: true }),
    updateView: vi.fn().mockResolvedValue({}),
  },
}));

const dbData = (): DatabaseData => ({
  id: "db1",
  title: "Books",
  icon: "📚",
  properties: [
    { id: "author", name: "Author", type: "text", position: 0, options: [] },
    {
      id: "status",
      name: "Status",
      type: "select",
      position: 1,
      options: [{ id: "s1", name: "Reading", color: "blue", position: 0 }],
    },
  ],
  rows: [
    {
      id: "r1",
      title: "Dune",
      icon: null,
      position: 0,
      values: { author: "Herbert", status: "s1" },
    },
    {
      id: "r2",
      title: "Emma",
      icon: null,
      position: 1,
      values: { author: "Austen" },
    },
  ],
  views: {
    table: { filters: [], sort: null, groupBy: null },
    board: { filters: [], sort: null, groupBy: null },
    list: { filters: [], sort: null, groupBy: null },
  },
});

function renderDb() {
  vi.mocked(api.getDatabase).mockResolvedValue(dbData());
  return renderSpace(
    <MemoryRouter>
      <DatabaseView databaseId="db1" />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DatabaseView table", () => {
  it("renders headers, rows, and values", async () => {
    renderDb();
    expect(await screen.findByDisplayValue("Dune")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Author" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Herbert")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
  });

  it("edits a text cell and saves the value", async () => {
    renderDb();
    const cell = await screen.findByDisplayValue("Austen");
    await userEvent.clear(cell);
    await userEvent.type(cell, "Jane Austen");
    await userEvent.tab();
    expect(api.setRowValue).toHaveBeenCalledWith("r2", "author", "Jane Austen");
  });

  it("adds a row", async () => {
    vi.mocked(api.addRow).mockResolvedValue({
      id: "r3",
      title: "",
      icon: null,
      position: 2,
      values: {},
    });
    renderDb();
    await userEvent.click(
      await screen.findByRole("button", { name: /Add row/ }),
    );
    expect(api.addRow).toHaveBeenCalledWith("db1");
    await waitFor(() =>
      expect(screen.getAllByLabelText(/Title for row/)).toHaveLength(3),
    );
  });

  it("deletes a row", async () => {
    renderDb();
    await screen.findByDisplayValue("Dune");
    await userEvent.click(
      screen.getByRole("button", { name: "Delete row Dune" }),
    );
    expect(api.deletePage).toHaveBeenCalledWith("r1");
    expect(screen.queryByDisplayValue("Dune")).not.toBeInTheDocument();
  });

  it("edits a row title in place", async () => {
    renderDb();
    const title = await screen.findByDisplayValue("Dune");
    await userEvent.type(title, "!");
    expect(api.updatePage).toHaveBeenCalledWith("r1", { title: "Dune!" });
  });

  it("adds a property through the popover", async () => {
    vi.mocked(api.addProperty).mockResolvedValue({
      id: "p9",
      name: "Pages",
      type: "number",
      position: 2,
      options: [],
    });
    renderDb();
    await userEvent.click(
      await screen.findByRole("button", { name: "Add property" }),
    );
    await userEvent.type(screen.getByPlaceholderText("Property name"), "Pages");
    await userEvent.click(screen.getByRole("button", { name: "Number" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Create property" }),
    );
    expect(api.addProperty).toHaveBeenCalledWith("db1", {
      name: "Pages",
      type: "number",
    });
    expect(
      await screen.findByRole("columnheader", { name: "Pages" }),
    ).toBeInTheDocument();
  });

  it("renames a property from the column menu", async () => {
    renderDb();
    await userEvent.click(
      await screen.findByRole("button", { name: "Author" }),
    );
    const input = screen.getByRole("textbox", { name: "Property name" });
    await userEvent.clear(input);
    await userEvent.type(input, "Writer{Enter}");
    expect(api.renameProperty).toHaveBeenCalledWith("author", "Writer");
    expect(
      await screen.findByRole("columnheader", { name: "Writer" }),
    ).toBeInTheDocument();
  });

  it("deletes a property from the column menu", async () => {
    renderDb();
    await userEvent.click(
      await screen.findByRole("button", { name: "Author" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );
    expect(api.deleteProperty).toHaveBeenCalledWith("author");
    expect(
      screen.queryByRole("columnheader", { name: "Author" }),
    ).not.toBeInTheDocument();
  });

  it("creates a select option with an auto color and assigns it", async () => {
    vi.mocked(api.addOption).mockResolvedValue({
      id: "s2",
      name: "Done",
      color: "amber",
      position: 1,
    });
    renderDb();
    await screen.findByDisplayValue("Dune");
    const emmaRow = screen.getByDisplayValue("Austen").closest("tr")!;
    await userEvent.click(
      within(emmaRow).getByRole("button", { name: "Status for Emma" }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Select or create…"),
      "Done{Enter}",
    );
    expect(api.addOption).toHaveBeenCalledWith("status", {
      name: "Done",
      color: "amber",
    });
    await waitFor(() =>
      expect(api.setRowValue).toHaveBeenCalledWith("r2", "status", "s2"),
    );
  });
});
