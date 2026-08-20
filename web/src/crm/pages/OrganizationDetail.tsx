import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import { Contact, Deal, Organization } from "../types";
import OrganizationForm from "../components/OrganizationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { ContactList, DealList } from "../components/RelatedLists";
import PageHeader from "../components/PageHeader";
import { IconOrganizations } from "../components/Icons";

function OrganizationFacts({ org }: { org: Organization }) {
  const ts = useT("shared");
  const tc = useT("crm");
  return (
    <dl className="props">
      <dt>{tc("website")}</dt>
      <dd>{org.website || tc("emDash")}</dd>
      <dt>{tc("industry")}</dt>
      <dd>{org.industry || tc("emDash")}</dd>
      <dt>{ts("notes")}</dt>
      <dd>{org.notes || tc("emDash")}</dd>
    </dl>
  );
}

export default function OrganizationDetail() {
  const ts = useT("shared");
  const tc = useT("crm");
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: org, reload } = useFetch<Organization>(
    `/api/crm/organizations/${id}`,
  );
  const { data: contacts } = useFetch<Contact[]>(
    `/api/crm/contacts?organization_id=${id}`,
  );
  const { data: deals } = useFetch<Deal[]>(
    `/api/crm/deals?organization_id=${id}`,
  );

  if (!org) return null;

  async function remove() {
    await api.delete(`/api/crm/organizations/${id}`);
    void navigate("/organizations");
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/organizations">{tc("navOrganizations")}</Link> / {org.name}
      </div>
      <PageHeader
        icon={<IconOrganizations size={20} />}
        title={org.name}
        sub={org.industry || tc("organizationFallback")}
      >
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            {ts("edit")}
          </button>
          <button className="btn btn-danger" onClick={() => setDeleting(true)}>
            {ts("delete")}
          </button>
        </div>
      </PageHeader>
      <div className="detail-grid">
        <div className="card full">
          <h2>{tc("details")}</h2>
          <OrganizationFacts org={org} />
        </div>
        <div className="card">
          <h2>
            {tc("sectionContacts")} ({contacts?.length ?? 0})
          </h2>
          <ContactList contacts={contacts ?? []} />
        </div>
        <div className="card">
          <h2>
            {tc("sectionDeals")} ({deals?.length ?? 0})
          </h2>
          <DealList deals={deals ?? []} />
        </div>
      </div>
      {editing && (
        <OrganizationForm
          existing={org}
          onSaved={reload}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={tc("deleteOrganization")}
          message={tc.i("deleteOrgDetailMessage", { name: org.name })}
          onConfirm={() => void remove()}
          onCancel={() => setDeleting(false)}
        />
      )}
    </>
  );
}
