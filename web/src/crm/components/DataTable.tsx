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
import type { MessageKey } from "../../shared/locales/en";
import { IconEdit, IconTrash } from "./Icons";

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

const NOUN_KEYS: Record<
  string,
  { one: MessageKey<"crm">; other: MessageKey<"crm"> }
> = {
  organization: { one: "nounOrganization", other: "nounOrganizations" },
  contact: { one: "nounContact", other: "nounContacts" },
  deal: { one: "nounDeal", other: "nounDeals" },
  record: { one: "nounRecord", other: "nounRecords" },
};

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
  const ts = useT("shared");
  const tc = useT("crm");
  const [sorting, setSorting] = useState<SortingState>([]);
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
  const empty = emptyMessage ?? tc("nothingHereYet");
  const nounKeys = NOUN_KEYS[noun] ?? NOUN_KEYS.record;
  const countLabel = `${data.length} ${tc(data.length === 1 ? nounKeys.one : nounKeys.other)}`;

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
                          aria-label={`${ts("edit")} ${label(row.original)}`}
                          title={ts("edit")}
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
                          aria-label={`${ts("delete")} ${label(row.original)}`}
                          title={ts("delete")}
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
          <span>{countLabel}</span>
          {summary && <span className="table-summary">{summary}</span>}
        </div>
      )}
    </div>
  );
}
