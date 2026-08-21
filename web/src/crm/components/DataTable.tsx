import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReactNode, useState } from "react";
import { useLocale } from "../../shared/useLocale";
import { IconEdit, IconTrash } from "./Icons";

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  /** Names a row for the action buttons, so "Edit Bluepeak Software" reads correctly. */
  rowLabel?: (row: T) => string;
  emptyMessage?: string;
  /** Shown on the right of the footer, e.g. a total. */
  summary?: ReactNode;
  noun?: string;
}

export default function DataTable<T>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  rowLabel,
  emptyMessage,
  summary,
  noun = "record",
}: Props<T>) {
  const { t } = useLocale();
  const [sorting, setSorting] = useState<SortingState>([]);
  const empty = emptyMessage ?? t("common.nothingYet");
  // React Compiler cannot memoize what useReactTable() returns, so the rule flags every call site.
  // There is nothing to change here - it is the library's only API, and Bench does not run the
  // compiler. Kept as a disable rather than switching the rule off, so it still reports a
  // different incompatible library, and so lint tells us when TanStack fixes this.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasActions = Boolean(onEdit ?? onDelete);
  const label = (row: T) => (rowLabel ? rowLabel(row) : "");
  const nounKey = data.length === 1 ? `noun.${noun}` : `noun.${noun}Plural`;

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={sortable ? "sortable" : undefined}
                      aria-sort={dir ? ARIA_SORT[dir] : undefined}
                      onClick={
                        sortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="th-inner">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortable && (
                          <span className={`sort-arrow${dir ? " active" : ""}`}>
                            {dir === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
                {hasActions && <th className="col-actions" />}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? "clickable" : undefined}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {hasActions && (
                  <td className="col-actions">
                    <div className="row-actions">
                      {onEdit && (
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={t("table.editRow", {
                            name: label(row.original),
                          })}
                          title={t("table.edit")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row.original);
                          }}
                        >
                          <IconEdit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          aria-label={t("table.deleteRow", {
                            name: label(row.original),
                          })}
                          title={t("table.delete")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row.original);
                          }}
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && <div className="empty-state">{empty}</div>}
      {data.length > 0 && (
        <div className="table-foot">
          <span>
            {t("table.footer", { count: data.length, noun: t(nounKey) })}
          </span>
          {summary && <span className="table-summary">{summary}</span>}
        </div>
      )}
    </div>
  );
}
