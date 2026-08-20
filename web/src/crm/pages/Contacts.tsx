import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useT } from "../../shared/useLocale";
import { statusLabel } from "../labels";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import { CONTACT_STATUSES, Contact, Organization } from "../types";
import DataTable from "../components/DataTable";
import ContactForm from "../components/ContactForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { StatusChip } from "../components/Chips";
import { IconContacts, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";

export default function Contacts() {
  const t = useT();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);
  const navigate = useNavigate();
  const { data, reload } = useFetch<Contact[]>(
    "/api/crm/contacts" + query({ q, status }),
  );
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const contacts = useMemo(() => data ?? [], [data]);
  const orgName = useMemo(
    () => new Map((orgs ?? []).map((o) => [o.id, o.name])),
    [orgs],
  );

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("shared.common.name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "email",
        header: t("crm.contacts.col.email"),
        cell: (c) => (
          <span className="cell-muted">
            {c.getValue<string>() || t("shared.common.emDash")}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("crm.contacts.col.phone"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{t("shared.common.emDash")}</span>
          ),
      },
      {
        accessorKey: "job_title",
        header: t("crm.contacts.col.jobTitle"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{t("shared.common.emDash")}</span>
          ),
      },
      {
        accessorKey: "organization_id",
        header: t("crm.contacts.col.organization"),
        cell: (c) =>
          orgName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">{t("shared.common.emDash")}</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("crm.contacts.col.status"),
        cell: (c) => <StatusChip status={c.row.original.status} />,
      },
    ],
    [t, orgName],
  );

  return (
    <>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={t("crm.contacts.title")}
        sub={t("crm.contacts.sub")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {t("crm.contacts.add")}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search-field">
          <IconSearch size={15} />
          <input
            className="search-input"
            type="search"
            placeholder={t("crm.contacts.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          aria-label={t("crm.contacts.filterStatusAria")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("crm.contacts.allStatuses")}</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(t, s)}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        data={contacts}
        columns={columns}
        noun={t("crm.contacts.noun")}
        rowLabel={(c) => c.name}
        onRowClick={(c) => void navigate(`/contacts/${c.id}`)}
        onEdit={(c) => setEditing(c)}
        onDelete={(c) => setDeleting(c)}
        emptyMessage={
          q || status
            ? t("crm.contacts.emptyFiltered")
            : t("crm.contacts.empty")
        }
      />
      {adding && (
        <ContactForm
          organizations={orgs ?? []}
          onSaved={reload}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <ContactForm
          existing={editing}
          organizations={orgs ?? []}
          onSaved={reload}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={t("crm.contacts.deleteTitle")}
          message={t("crm.contacts.deleteMessage", { name: deleting.name })}
          onConfirm={() => {
            void api.delete(`/api/crm/contacts/${deleting.id}`).then(() => {
              setDeleting(null);
              reload();
            });
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
