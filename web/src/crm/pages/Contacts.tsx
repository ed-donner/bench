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
import { useTranslation } from "react-i18next";

export default function Contacts() {
  const { t } = useTranslation("crm");
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
        header: t("field.name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "email",
        header: t("field.email"),
        cell: (c) => (
          <span className="cell-muted">{c.getValue<string>() || "—"}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("field.phone"),
        cell: (c) =>
          c.getValue<string>() || <span className="cell-empty">—</span>,
      },
      {
        accessorKey: "job_title",
        header: t("field.jobTitle"),
        cell: (c) =>
          c.getValue<string>() || <span className="cell-empty">—</span>,
      },
      {
        accessorKey: "organization_id",
        header: t("field.organization"),
        cell: (c) =>
          orgName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("field.status"),
        cell: (c) => <StatusChip status={c.row.original.status} />,
      },
    ],
    [orgName, t],
  );

  return (
    <>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={t("contacts.title")}
        sub={t("contacts.sub")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {t("action.addContact")}
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
          aria-label={t("contacts.filterByStatus")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("contacts.allStatuses")}</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
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
        emptyMessage={q || status ? t("contacts.noMatch") : t("empty.contacts")}
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
          title={t("contacts.confirmTitle")}
          message={t("contacts.confirm", { name: deleting.name })}
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
