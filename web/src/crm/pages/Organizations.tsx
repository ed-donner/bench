import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import { useLocale } from "../../shared/useLocale";
import { Contact, Deal, Organization, isOpen, sumValue } from "../types";
import DataTable from "../components/DataTable";
import OrganizationForm from "../components/OrganizationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatMoney } from "../format";
import { IconOrganizations, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";

interface OrgRow extends Organization {
  contact_count: number;
  open_count: number;
  open_value: number;
}

export default function Organizations() {
  const { t, locale } = useLocale();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState<Organization | null>(null);
  const navigate = useNavigate();
  const { data, reload } = useFetch<Organization[]>(
    "/api/crm/organizations" + query({ q }),
  );
  const { data: contacts } = useFetch<Contact[]>("/api/crm/contacts");
  const { data: deals, reload: reloadDeals } =
    useFetch<Deal[]>("/api/crm/deals");
  const orgs = useMemo(() => data ?? [], [data]);

  /**
   * Derived counts live on the row data, not in an accessorFn: TanStack memoises the core row
   * model on `data` alone, so values read through an accessor would keep the stale zeroes from
   * before the contacts and deals arrived.
   */
  const stats = useMemo(() => {
    const map = new Map<
      number,
      { contacts: number; open: number; value: number }
    >();
    const bump = (
      id: number | null,
      patch: Partial<{ contacts: number; open: number; value: number }>,
    ) => {
      if (id == null) return;
      const row = map.get(id) ?? { contacts: 0, open: 0, value: 0 };
      map.set(id, {
        contacts: row.contacts + (patch.contacts ?? 0),
        open: row.open + (patch.open ?? 0),
        value: row.value + (patch.value ?? 0),
      });
    };
    for (const c of contacts ?? []) bump(c.organization_id, { contacts: 1 });
    for (const d of deals ?? [])
      if (isOpen(d)) bump(d.organization_id, { open: 1, value: d.value });
    return map;
  }, [contacts, deals]);

  const rows = useMemo<OrgRow[]>(
    () =>
      orgs.map((o) => {
        const row = stats.get(o.id);
        return {
          ...o,
          contact_count: row?.contacts ?? 0,
          open_count: row?.open ?? 0,
          open_value: row?.value ?? 0,
        };
      }),
    [orgs, stats],
  );

  const columns = useMemo<ColumnDef<OrgRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("common.name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "website",
        header: t("common.website"),
        cell: (c) => {
          const site = c.getValue<string>();
          return site ? (
            <span className="cell-muted">{site}</span>
          ) : (
            <span className="cell-empty">{t("common.dash")}</span>
          );
        },
      },
      {
        accessorKey: "industry",
        header: t("common.industry"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{t("common.dash")}</span>
          ),
      },
      {
        accessorKey: "contact_count",
        header: t("common.contacts"),
        cell: (c) => <span className="cell-num">{c.getValue<number>()}</span>,
      },
      {
        accessorKey: "open_count",
        header: t("organizations.columnOpenDeals"),
        cell: (c) => <span className="cell-num">{c.getValue<number>()}</span>,
      },
      {
        accessorKey: "open_value",
        header: t("organizations.columnPipeline"),
        cell: (c) => (
          <span className="cell-money">
            {formatMoney(c.getValue<number>(), locale)}
          </span>
        ),
      },
    ],
    [locale, t],
  );

  const remove = async () => {
    if (!deleting) return;
    await api.delete(`/api/crm/organizations/${deleting.id}`);
    setDeleting(null);
    reload();
    reloadDeals();
  };

  const openPipeline = sumValue((deals ?? []).filter(isOpen));

  return (
    <>
      <PageHeader
        icon={<IconOrganizations size={20} />}
        title={t("page.organizations.title")}
        sub={t("page.organizations.subtitle")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {t("organizations.add")}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search-field">
          <IconSearch size={15} />
          <input
            className="search-input"
            type="search"
            placeholder={t("organizations.search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        noun="organization"
        rowLabel={(o) => o.name}
        onRowClick={(o) => void navigate(`/organizations/${o.id}`)}
        onEdit={(o) => setEditing(o)}
        onDelete={(o) => setDeleting(o)}
        emptyMessage={
          q
            ? t("organizations.emptyFiltered", { query: q })
            : t("organizations.empty")
        }
        summary={
          <>
            {t("organizations.openPipeline", {
              amount: formatMoney(openPipeline, locale),
            })}
          </>
        }
      />
      {adding && (
        <OrganizationForm onSaved={reload} onClose={() => setAdding(false)} />
      )}
      {editing && (
        <OrganizationForm
          existing={editing}
          onSaved={reload}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("organizations.deleteTitle")}
          message={t("organizations.deleteMessage", { name: deleting.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
