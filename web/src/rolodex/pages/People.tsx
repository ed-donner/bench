import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import { useStore } from "../store";
import { api } from "../api";
import type { PersonComputed } from "../types";
import { filterPeople } from "../search";
import { Avatar } from "../components/Avatar";
import { CircleChip, StatusBadge } from "../components/Chips";
import { EmptyState } from "../components/Modal";
import { PersonForm } from "../components/PersonForm";
import { ImportModal } from "../components/ImportModal";
import {
  checkInDueText,
  checkInOverdueShort,
  fmtDate,
  relativeDays,
} from "../format";
import type { Circle } from "../types";
import { CIRCLES } from "../types";

const col = createColumnHelper<PersonComputed>();

function checkInText(
  t: ReturnType<typeof useLocale>["t"],
  p: PersonComputed,
): string | null {
  if (p.status === "overdue") return checkInOverdueShort(t, p.next_due);
  if (p.status === "due_soon") return checkInDueText(t, p.next_due);
  return null;
}

export default function People() {
  const { t } = useLocale();
  const { people, tags, loaded, refresh } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [circle, setCircle] = useState<Circle | "all">("all");
  const [tag, setTag] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [editing, setEditing] = useState<PersonComputed | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<PersonComputed | null>(null);

  const filtered = useMemo(
    () => filterPeople(people, { query: search, circle, tag }),
    [people, search, circle, tag],
  );

  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: t("people.colPerson"),
        cell: (info) => (
          <div className="person-cell">
            <Avatar name={info.getValue()} photo={info.row.original.photo} />
            <div>
              <div className="name">{info.getValue()}</div>
              <div className="sub">
                {info.row.original.email ?? info.row.original.city ?? "—"}
              </div>
            </div>
          </div>
        ),
      }),
      col.accessor((p) => p.company ?? "", {
        id: "company",
        header: t("people.colCompany"),
        cell: (info) => (
          <div>
            <div>
              {info.row.original.company ?? <span className="muted">—</span>}
            </div>
            <div className="sub small muted">
              {info.row.original.job_title ?? ""}
            </div>
          </div>
        ),
      }),
      col.accessor("circle", {
        header: t("people.colCircle"),
        cell: (info) => <CircleChip circle={info.getValue()} />,
      }),
      col.accessor("last_contacted", {
        header: t("people.colLastContacted"),
        cell: (info) => (
          <div>
            <div>{fmtDate(info.getValue())}</div>
            <div className="sub small muted">
              {relativeDays(t, info.getValue())}
            </div>
          </div>
        ),
      }),
      col.accessor("status", {
        header: t("people.colCheckIn"),
        cell: (info) => {
          const p = info.row.original;
          const when = checkInText(t, p);
          return (
            <div className="row" style={{ gap: 7 }}>
              <StatusBadge status={p.status} />
              {when && <span className="small muted">{when}</span>}
            </div>
          );
        },
      }),
      col.accessor((p) => p.latest_news?.text ?? "", {
        id: "latest_news",
        header: t("people.colLatestNews"),
        cell: (info) =>
          info.row.original.latest_news ? (
            <div>
              <div className="news-cell">
                {info.row.original.latest_news.text}
              </div>
              <div className="sub small muted">
                {relativeDays(t, info.row.original.latest_news.date)}
              </div>
            </div>
          ) : (
            <span className="muted">—</span>
          ),
      }),
      col.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div
            className="cell-actions"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-btn"
              title={t("people.edit")}
              onClick={() => setEditing(info.row.original)}
            >
              <Pencil size={15} />
            </button>
            <button
              className="icon-btn danger"
              title={t("people.delete")}
              onClick={() => setDeleting(info.row.original)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      }),
    ],
    [t],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    await api.deletePerson(deleting.id);
    await refresh();
    setDeleting(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span
              className="icon-sq"
              style={{
                background: "var(--blue-soft)",
                color: "var(--blue-deep)",
              }}
            >
              <Users size={19} />
            </span>
            {t("people.title")}
          </h1>
          <p className="page-desc">
            {loaded
              ? t("people.descLoaded", {
                  total: people.length,
                  shown: filtered.length,
                })
              : t("people.descLoading")}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setImporting(true)}>
            <Upload size={15} /> {t("people.import")}
          </button>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>
            <Plus size={15} /> {t("people.addPerson")}
          </button>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="search-box">
            <Search />
            <input
              placeholder={t("people.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            aria-label={t("people.colCircle")}
            value={circle}
            onChange={(e) => setCircle(e.target.value as Circle | "all")}
          >
            <option value="all">{t("people.allCircles")}</option>
            {CIRCLES.map((c) => (
              <option key={c} value={c}>
                {t(`circle.${c}.label`)}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="all">{t("people.allTags")}</option>
            {tags.map((tagName) => (
              <option key={tagName} value={tagName}>
                {tagName}
              </option>
            ))}
          </select>
          {(search || circle !== "all" || tag !== "all") && (
            <button
              className="btn-ghost btn"
              onClick={() => {
                setSearch("");
                setCircle("all");
                setTag("all");
              }}
            >
              {t("common.clear")}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={22} />}>
            {loaded ? t("people.emptyMatch") : t("people.emptyLoading")}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className={h.column.getCanSort() ? "sortable" : ""}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        <span className="row" style={{ gap: 5 }}>
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext(),
                          )}
                          {h.column.getIsSorted() ? (
                            <ArrowUpDown size={11} />
                          ) : (
                            h.column.getCanSort() && (
                              <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                            )
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="rowlink"
                    tabIndex={0}
                    onClick={() => void navigate(`/people/${row.original.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        void navigate(`/people/${row.original.id}`);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <PersonForm
          existing={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {importing && <ImportModal onClose={() => setImporting(false)} />}

      {deleting && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleting(null);
          }}
        >
          <div
            className="modal modal-confirm"
            role="dialog"
            aria-modal="true"
            aria-label={t("people.deleteTitle", { name: deleting.name })}
          >
            <div className="modal-header">
              <h3>{t("people.deleteTitle", { name: deleting.name })}</h3>
            </div>
            <div className="modal-body">
              <p>
                {t("people.deleteBody", {
                  firstName: deleting.name.split(" ")[0],
                })}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDeleting(null)}>
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => void confirmDelete()}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
