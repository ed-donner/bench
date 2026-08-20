import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLocale, useT } from "../../shared/useLocale";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import {
  Contact,
  DEAL_STAGES,
  Deal,
  Organization,
  expectedValue,
  sumExpected,
  sumValue,
} from "../types";
import { dealStageLabel } from "../i18n";
import DataTable from "../components/DataTable";
import DealForm from "../components/DealForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { StageChip } from "../components/Chips";
import { formatDate, formatMoney } from "../format";
import { IconDeals, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";

export default function Deals() {
  const { locale } = useLocale();
  const tc = useT("crm");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);
  const navigate = useNavigate();
  const { data, reload } = useFetch<Deal[]>(
    "/api/crm/deals" + query({ q, stage }),
  );
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const { data: contacts } = useFetch<Contact[]>("/api/crm/contacts");
  const deals = useMemo(() => data ?? [], [data]);
  const orgName = useMemo(
    () => new Map((orgs ?? []).map((o) => [o.id, o.name])),
    [orgs],
  );
  const contactName = useMemo(
    () => new Map((contacts ?? []).map((c) => [c.id, c.name])),
    [contacts],
  );

  const columns = useMemo<ColumnDef<Deal>[]>(
    () => [
      {
        accessorKey: "name",
        header: tc("deal"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "organization_id",
        header: tc("organization"),
        cell: (c) =>
          orgName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">{tc("emDash")}</span>
          ),
      },
      {
        accessorKey: "stage",
        header: tc("stage"),
        cell: (c) => <StageChip stage={c.row.original.stage} />,
      },
      {
        accessorKey: "value",
        header: tc("value"),
        cell: (c) => (
          <span className="cell-money">
            {formatMoney(c.getValue<number>(), locale)}
          </span>
        ),
      },
      {
        accessorKey: "probability",
        header: tc("probability"),
        cell: (c) => {
          const p = c.getValue<number>();
          return (
            <span className="prob">
              <span className="prob-bar">
                <span className="prob-fill" style={{ width: `${p}%` }} />
              </span>
              <span className="prob-num">{p}%</span>
            </span>
          );
        },
      },
      {
        id: "expected",
        header: tc("expectedCol"),
        accessorFn: (d) => expectedValue(d),
        cell: (c) => (
          <span className="cell-money">
            {formatMoney(c.getValue<number>(), locale)}
          </span>
        ),
      },
      {
        accessorKey: "close_date",
        header: tc("closeDate"),
        cell: (c) => formatDate(c.getValue<string>(), locale),
      },
      {
        accessorKey: "contact_id",
        header: tc("contact"),
        cell: (c) =>
          contactName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">{tc("emDash")}</span>
          ),
      },
    ],
    [tc, locale, orgName, contactName],
  );

  const remove = async () => {
    if (!deleting) return;
    await api.delete(`/api/crm/deals/${deleting.id}`);
    setDeleting(null);
    reload();
  };

  return (
    <>
      <PageHeader
        icon={<IconDeals size={20} />}
        title={tc("dealsTitle")}
        sub={tc("dealsSub")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {tc("addDeal")}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search-field">
          <IconSearch size={15} />
          <input
            className="search-input"
            type="search"
            placeholder={tc("searchDeals")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          aria-label={tc("filterByStage")}
          value={stage}
          onChange={(e) => setStage(e.target.value)}
        >
          <option value="">{tc("allStages")}</option>
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {dealStageLabel(tc, s)}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        data={deals}
        columns={columns}
        noun="deal"
        rowLabel={(d) => d.name}
        onRowClick={(d) => void navigate(`/deals/${d.id}`)}
        onEdit={(d) => setEditing(d)}
        onDelete={(d) => setDeleting(d)}
        emptyMessage={q || stage ? tc("noDealsMatch") : tc("noDeals")}
        summary={
          <>
            {tc.i("summaryTotalExpected", {
              total: formatMoney(sumValue(deals), locale),
              expected: formatMoney(sumExpected(deals), locale),
            })}
          </>
        }
      />
      {adding && (
        <DealForm
          organizations={orgs ?? []}
          contacts={contacts ?? []}
          onSaved={reload}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <DealForm
          existing={editing}
          organizations={orgs ?? []}
          contacts={contacts ?? []}
          onSaved={reload}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={tc("deleteDeal")}
          message={tc.i("deleteNamedMessage", { name: deleting.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
