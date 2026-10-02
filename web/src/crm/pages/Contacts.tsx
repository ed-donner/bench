import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import { useLocale } from "../../shared/useLocale";
import {
  CONTACT_STATUSES,
  Contact,
  Organization,
  contactStatusLabel,
} from "../types";
import DataTable from "../components/DataTable";
import ContactForm from "../components/ContactForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { StatusChip } from "../components/Chips";
import { IconContacts, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";

export default function Contacts() {
  const { t } = useLocale();
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
        header: t("common.name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "email",
        header: t("common.email"),
        cell: (c) => (
          <span className="cell-muted">
            {c.getValue<string>() || t("common.dash")}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("common.phone"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{t("common.dash")}</span>
          ),
      },
      {
        accessorKey: "job_title",
        header: t("common.jobTitle"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{t("common.dash")}</span>
          ),
      },
      {
        accessorKey: "organization_id",
        header: t("common.organization"),
        cell: (c) =>
          orgName.get(c.getValue<number>()) ?? (
            <span className="cell-empty">{t("common.dash")}</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: (c) => <StatusChip status={c.row.original.status} />,
      },
    ],
    [orgName, t],
  );

  return (
    <>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={t("page.contacts.title")}
        sub={t("page.contacts.subtitle")}
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
              {contactStatusLabel(s, t)}
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
          q || status ? t("contacts.emptyFiltered") : t("contacts.empty")
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
          message={t("contacts.deleteMessage", { name: deleting.name })}
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
