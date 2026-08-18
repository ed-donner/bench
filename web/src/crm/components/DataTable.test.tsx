import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "./DataTable";

interface Row {
  name: string;
  value: number;
}

const rows: Row[] = [
  { name: "Bluepeak", value: 30 },
  { name: "Alderway", value: 10 },
  { name: "Crestline", value: 20 },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value" },
];

const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

describe("DataTable", () => {
  it("renders the rows and counts them, pluralising the noun", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="organization"
        emptyMessage="No organizations yet."
      />,
    );
    expect(names()).toEqual(["Bluepeak", "Alderway", "Crestline"]);
    expect(screen.getByText("3 organizations")).toBeInTheDocument();
  });

  it("keeps the count singular for one row", () => {
    render(
      <DataTable
        data={rows.slice(0, 1)}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
      />,
    );
    expect(screen.getByText("1 deal")).toBeInTheDocument();
  });

  it("shows the empty message instead of a footer when there is no data", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
      />,
    );
    expect(screen.getByText("No deals yet.")).toBeInTheDocument();
    expect(screen.queryByText(/deal$/)).not.toBeInTheDocument();
  });

  // TanStack sorts a numeric column largest-first on the first click and a text column A-Z, which
  // is why these two run in opposite directions.
  it("sorts a numeric column, and says which way in aria-sort", async () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
      />,
    );
    const header = screen.getByRole("columnheader", { name: /Value/ });

    await userEvent.click(header);
    expect(names()).toEqual(["Bluepeak", "Crestline", "Alderway"]);
    expect(header).toHaveAttribute("aria-sort", "descending");

    await userEvent.click(header);
    expect(names()).toEqual(["Alderway", "Crestline", "Bluepeak"]);
    expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  it("sorts a text column alphabetically", async () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
      />,
    );
    await userEvent.click(screen.getByRole("columnheader", { name: /Name/ }));
    expect(names()).toEqual(["Alderway", "Bluepeak", "Crestline"]);
  });

  it("opens a row when it is clicked", async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText("Crestline"));
    expect(onRowClick).toHaveBeenCalledWith(rows[2]);
  });

  it("names each action button after its row and keeps the click off the row", async () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
        onRowClick={onRowClick}
        onEdit={onEdit}
        onDelete={onDelete}
        rowLabel={(row) => row.name}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Edit Alderway" }),
    );
    expect(onEdit).toHaveBeenCalledWith(rows[1]);

    await userEvent.click(
      screen.getByRole("button", { name: "Delete Alderway" }),
    );
    expect(onDelete).toHaveBeenCalledWith(rows[1]);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("leaves out the actions column when nothing handles it", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("shows a summary in the footer", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        noun="deal"
        emptyMessage="No deals yet."
        summary="$60,000"
      />,
    );
    expect(screen.getByText("$60,000")).toBeInTheDocument();
  });
});
