import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useT } from "../../shared/useLocale";
import { api, query } from "../api";
import { useFetch } from "../hooks";
import { CONTACT_STATUSES, Contact, Organization } from "../types";
import { contactStatusLabel } from "../i18n";
import DataTable from "../components/DataTable";
import ContactForm from "../components/ContactForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { StatusChip } from "../components/Chips";
import { IconContacts, IconPlus, IconSearch } from "../components/Icons";
import PageHeader from "../components/PageHeader";

export default function Contacts() {
  const ts = useT("shared");
  const tc = useT("crm");
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
        header: ts("name"),
        cell: (c) => <strong>{c.getValue<string>()}</strong>,
      },
      {
        accessorKey: "email",
        header: tc("email"),
        cell: (c) => (
          <span className="cell-muted">
            {c.getValue<string>() || tc("emDash")}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: tc("phone"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{tc("emDash")}</span>
          ),
      },
      {
        accessorKey: "job_title",
        header: tc("jobTitle"),
        cell: (c) =>
          c.getValue<string>() || (
            <span className="cell-empty">{tc("emDash")}</span>
          ),
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
        accessorKey: "status",
        header: ts("status"),
        cell: (c) => <StatusChip status={c.row.original.status} />,
      },
    ],
    [ts, tc, orgName],
  );

  return (
    <>
      <PageHeader
        icon={<IconContacts size={20} />}
        title={tc("contactsTitle")}
        sub={tc("contactsSub")}
      >
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <IconPlus size={16} />
          {tc("addContact")}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search-field">
          <IconSearch size={15} />
          <input
            className="search-input"
            type="search"
            placeholder={tc("searchContacts")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          aria-label={tc("filterByStatus")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{tc("allStatuses")}</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {contactStatusLabel(tc, s)}
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
        emptyMessage={q || status ? tc("noContactsMatch") : tc("noContacts")}
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
          title={tc("deleteContact")}
          message={tc.i("deleteNamedMessage", { name: deleting.name })}
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
