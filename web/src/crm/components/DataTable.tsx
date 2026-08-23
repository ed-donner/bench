import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReactNode, useState } from "react";
import { useT } from "../../shared/useLocale";
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
  noun,
}: Props<T>) {
  const t = useT();
  const [sorting, setSorting] = useState<SortingState>([]);
  const resolvedEmpty = emptyMessage ?? t("shared.common.nothingHereYet");
  const resolvedNoun = noun ?? t("shared.common.record");
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
                          aria-label={t("shared.common.editNamed", {
                            name: label(row.original),
                          })}
                          title={t("shared.common.edit")}
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
                          aria-label={t("shared.common.deleteNamed", {
                            name: label(row.original),
                          })}
                          title={t("shared.common.delete")}
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
      {data.length === 0 && <div className="empty-state">{resolvedEmpty}</div>}
      {data.length > 0 && (
        <div className="table-foot">
          <span>
            {t("crm.tableFoot.count", {
              count: data.length,
              noun: resolvedNoun,
              plural: data.length === 1 ? "" : "s",
            })}
          </span>
          {summary && <span className="table-summary">{summary}</span>}
        </div>
      )}
    </div>
  );
}
