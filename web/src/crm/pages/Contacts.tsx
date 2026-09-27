import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import { CONTACT_STATUSES, Contact, Organization } from "../types";
import DataTable from "../components/DataTable";
import ContactForm from "../components/ContactForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { StatusChip } from "../components/Chips";
import { IconContacts, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import { statusLabel, useT } from "../strings";

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
        header: t("col.name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "email",
        header: t("col.email"),
        cell: (c) => (
          <span className="cell-muted">{c.getValue<string>() || "—"}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("col.phone"),
        cell: (c) =>
          c.getValue<string>() || <span className="cell-empty">—</span>,
      },
      {
        accessorKey: "job_title",
        header: t("col.jobTitle"),
        cell: (c) =>
          c.getValue<string>() || <span className="cell-empty">—</span>,
      },
      {
        accessorKey: "organization_id",
        header: t("deals.col.organization"),
        cell: (c) =>
          orgName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("col.status"),
        cell: (c) => <StatusChip status={c.row.original.status} />,
      },
    ],
    [orgName, t],
  );

  return (
    <>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={t("nav.contacts")}
        sub={t("contacts.sub")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {t("contacts.add")}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search-field">
          <IconSearch size={15} />
          <input
            className="search-input"
            type="search"
            placeholder={t("contacts.search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          aria-label={t("contacts.filterStatus")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("contacts.allStatuses")}</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        data={contacts}
        columns={columns}
        noun="contact"
        rowLabel={(c) => c.name}
        onRowClick={(c) => void navigate(`/contacts/${c.id}`)}
        onEdit={(c) => setEditing(c)}
        onDelete={(c) => setDeleting(c)}
        emptyMessage={
          q || status ? t("contacts.noMatch") : t("related.noContacts")
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
          title={t("contacts.deleteTitle")}
          message={t("confirm.message", { name: deleting.name })}
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
