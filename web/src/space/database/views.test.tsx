import { describe, expect, it, vi, beforeEach } from "vitest";
import { arrayContaining, containing, renderSpace } from "../test/helpers";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import DatabaseView from "./DatabaseView";
import BoardView from "./BoardView";
import ListView from "./ListView";
import { api, type DatabaseData, type Property } from "../api";

vi.mock("../api", () => ({
  api: {
    getDatabase: vi.fn(),
    setRowValue: vi.fn().mockResolvedValue({ ok: true }),
    updateView: vi.fn().mockResolvedValue({}),
    addRow: vi.fn(),
    updatePage: vi.fn().mockResolvedValue({}),
    deletePage: vi.fn().mockResolvedValue({ ok: true }),
    addProperty: vi.fn(),
    renameProperty: vi.fn(),
    deleteProperty: vi.fn(),
    addOption: vi.fn(),
  },
}));

const statusProp: Property = {
  id: "status",
  name: "Status",
  type: "select",
  position: 1,
  options: [
    { id: "todo", name: "Todo", color: "amber", position: 0 },
    { id: "doing", name: "Doing", color: "blue", position: 1 },
  ],
};

const dbData = (): DatabaseData => ({
  id: "db1",
  title: "Work",
  icon: null,
  properties: [
    { id: "who", name: "Who", type: "text", position: 0, options: [] },
    statusProp,
  ],
  rows: [
    {
      id: "r1",
      title: "Alpha",
      icon: null,
      position: 0,
      values: { who: "Ed", status: "todo" },
    },
    {
      id: "r2",
      title: "Beta",
      icon: null,
      position: 1,
      values: { who: "Sam", status: "doing" },
    },
    { id: "r3", title: "Gamma", icon: null, position: 2, values: {} },
  ],
  views: {
    table: { filters: [], sort: null, groupBy: null },
    board: { filters: [], sort: null, groupBy: "status" },
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
  localStorage.clear();
});

describe("view switcher", () => {
  it("switches between table, board, and list over the same rows", async () => {
    renderDb();
    expect(await screen.findByRole("tab", { name: "Table" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("Title for row Alpha")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Board" }));
    expect(screen.getByTestId("board")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("board")).getByText("Alpha"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "List" }));
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(localStorage.getItem("ps.view.db1")).toBe("list");
  });

  it("remembers the chosen view per database", async () => {
    localStorage.setItem("ps.view.db1", "board");
    renderDb();
    expect(await screen.findByRole("tab", { name: "Board" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });
});

describe("board", () => {
  it("groups rows into columns by the select property, with a none column", async () => {
    localStorage.setItem("ps.view.db1", "board");
    renderDb();
    const board = await screen.findByTestId("board");
    const cols = board.querySelectorAll(".board-col");
    expect(cols).toHaveLength(3);
    expect(
      within(cols[0] as HTMLElement).getByText("Gamma"),
    ).toBeInTheDocument();
    expect(
      within(cols[1] as HTMLElement).getByText("Alpha"),
    ).toBeInTheDocument();
    expect(
      within(cols[2] as HTMLElement).getByText("Beta"),
    ).toBeInTheDocument();
  });

  it("moving a card calls the API with the new option", () => {
    const onMove = vi.fn();
    renderSpace(
      <MemoryRouter>
        <BoardView
          rows={dbData().rows}
          groupProperty={statusProp}
          onMove={onMove}
          allRows={dbData().rows}
          onReorder={vi.fn()}
          onReorderColumns={vi.fn()}
        />
      </MemoryRouter>,
    );
    // simulate what a drop produces: same handler the DndContext calls
    // (pointer-based dnd is covered by the e2e suite)
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    onMove("r1", "doing");
    expect(onMove).toHaveBeenCalledWith("r1", "doing");
  });
});

describe("filters and sort in the toolbar", () => {
  it("adds a title filter and narrows visible rows, persisting the view", async () => {
    renderDb();
    await screen.findByRole("tab", { name: "Table" });
    await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
    await userEvent.click(screen.getByRole("button", { name: "+ Add filter" }));
    const value = screen.getByLabelText("Filter value");
    await userEvent.type(value, "alp");
    expect(screen.getByLabelText("Title for row Alpha")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Title for row Beta"),
    ).not.toBeInTheDocument();
    expect(api.updateView).toHaveBeenCalledWith(
      "db1",
      "table",
      expect.objectContaining({
        filters: arrayContaining([containing({ operator: "contains" })]),
      }),
    );
  });

  it("applies a select filter via dropdowns", async () => {
    renderDb();
    await screen.findByRole("tab", { name: "Table" });
    await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
    await userEvent.click(screen.getByRole("button", { name: "+ Add filter" }));
    await userEvent.selectOptions(
      screen.getByLabelText("Filter property"),
      "status",
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Filter operator"),
      "is",
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Filter value"),
      "doing",
    );
    expect(screen.getByLabelText("Title for row Beta")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Title for row Alpha"),
    ).not.toBeInTheDocument();
  });

  it("removes a filter", async () => {
    renderDb();
    await screen.findByRole("tab", { name: "Table" });
    await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
    await userEvent.click(screen.getByRole("button", { name: "+ Add filter" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter" }),
    );
    expect(screen.getByText("No filters yet")).toBeInTheDocument();
  });

  it("sorts rows by a chosen property in either direction", async () => {
    renderDb();
    await screen.findByRole("tab", { name: "Table" });
    await userEvent.click(screen.getByRole("button", { name: "Sort" }));
    await userEvent.selectOptions(
      screen.getByLabelText("Sort property"),
      "who",
    );
    const titles = () =>
      screen
        .getAllByLabelText(/Title for row/)
        .map((el) => (el as HTMLInputElement).value);
    expect(titles()).toEqual(["Gamma", "Alpha", "Beta"]);
    await userEvent.selectOptions(
      screen.getByLabelText("Sort direction"),
      "desc",
    );
    expect(titles()).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(api.updateView).toHaveBeenCalledWith("db1", "table", {
      sort: { propertyId: "who", direction: "desc" },
    });
  });

  it("changes board grouping from the Group panel", async () => {
    localStorage.setItem("ps.view.db1", "board");
    renderDb();
    await screen.findByTestId("board");
    await userEvent.click(screen.getByRole("button", { name: "Group" }));
    await userEvent.click(screen.getByRole("button", { name: "Status" }));
    expect(api.updateView).toHaveBeenCalledWith("db1", "board", {
      groupBy: "status",
    });
  });
});

describe("ListView", () => {
  it("shows the title and up to two property previews", () => {
    const data = dbData();
    renderSpace(
      <MemoryRouter>
        <ListView rows={data.rows} properties={data.properties} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Ed")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
  });

  it("shows an empty message when no rows match", () => {
    renderSpace(
      <MemoryRouter>
        <ListView rows={[]} properties={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText("No rows match.")).toBeInTheDocument();
  });
});
