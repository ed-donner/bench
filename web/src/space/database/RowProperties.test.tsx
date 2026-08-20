import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderSpace } from "../test/helpers";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { RowBreadcrumb, RowPropsGrid } from "./RowProperties";
import { useRow } from "./useRow";
import { api, type RowData } from "../api";

vi.mock("../api", () => ({
  api: {
    getRow: vi.fn(),
    setRowValue: vi.fn().mockResolvedValue({ ok: true }),
    addOption: vi.fn(),
  },
}));

const rowData = (): RowData => ({
  id: "r1",
  database_id: "db1",
  database_title: "Reading List",
  title: "Dune",
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
  values: { author: "Frank Herbert", status: "s1" },
});

beforeEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const [row, setRow] = useRow("r1");
  if (!row) return <div>loading…</div>;
  return (
    <MemoryRouter>
      <RowBreadcrumb row={row} />
      <RowPropsGrid row={row} onRowChange={setRow} />
    </MemoryRouter>
  );
}

describe("row page properties", () => {
  it("loads the row, shows a breadcrumb to the database, and lists properties", async () => {
    vi.mocked(api.getRow).mockResolvedValue(rowData());
    renderSpace(<Harness />);
    expect(
      await screen.findByRole("link", { name: /Reading List/ }),
    ).toHaveAttribute("href", "/p/db1");
    expect(screen.getByText("Author")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Frank Herbert")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
  });

  it("edits a property value and saves it", async () => {
    vi.mocked(api.getRow).mockResolvedValue(rowData());
    renderSpace(<Harness />);
    const input = await screen.findByDisplayValue("Frank Herbert");
    await userEvent.clear(input);
    await userEvent.type(input, "F. Herbert");
    await userEvent.tab();
    expect(api.setRowValue).toHaveBeenCalledWith("r1", "author", "F. Herbert");
  });

  it("creates a new select option from the row page", async () => {
    vi.mocked(api.getRow).mockResolvedValue(rowData());
    vi.mocked(api.addOption).mockResolvedValue({
      id: "s2",
      name: "Finished",
      color: "amber",
      position: 1,
    });
    renderSpace(<Harness />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Status for Dune" }),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Select or create…"),
      "Finished{Enter}",
    );
    expect(api.addOption).toHaveBeenCalledWith("status", {
      name: "Finished",
      color: "amber",
    });
    await vi.waitFor(() =>
      expect(api.setRowValue).toHaveBeenCalledWith("r1", "status", "s2"),
    );
  });
});
